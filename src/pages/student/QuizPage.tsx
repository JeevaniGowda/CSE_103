import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, Brain, Sparkles, RotateCcw, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const QUESTION_TIME = 60;

interface Question {
  q: string;
  options: string[];
  answer: number;
}

type QuizPhase = "loading" | "intro" | "quiz" | "results";

// Built-in fallback — always available even without server
const STATIC_QUESTIONS: Question[] = [
  { q: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], answer: 1 },
  { q: "Which data structure uses FIFO?", options: ["Stack", "Queue", "Tree", "Graph"], answer: 1 },
  { q: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "None"], answer: 0 },
  { q: "What does CSS stand for?", options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "None"], answer: 1 },
  { q: "Which keyword declares a constant in JavaScript?", options: ["var", "let", "const", "static"], answer: 2 },
  { q: "What is 2^10?", options: ["512", "1024", "2048", "256"], answer: 1 },
  { q: "Who invented the World Wide Web?", options: ["Bill Gates", "Steve Jobs", "Tim Berners-Lee", "Mark Zuckerberg"], answer: 2 },
  { q: "What is the default port for HTTP?", options: ["21", "443", "80", "8080"], answer: 2 },
  { q: "What does SQL stand for?", options: ["Structured Query Language", "Simple Query Language", "Standard Query Logic", "Sequential Query Language"], answer: 0 },
  { q: "What is the binary of decimal 10?", options: ["1010", "1100", "1001", "1110"], answer: 0 },
  { q: "What does RAM stand for?", options: ["Read Access Memory", "Random Access Memory", "Run Access Memory", "Rapid Access Memory"], answer: 1 },
  { q: "Which company developed Java?", options: ["Microsoft", "Apple", "Sun Microsystems", "Google"], answer: 2 },
  { q: "What is the SI unit of electric current?", options: ["Volt", "Watt", "Ampere", "Ohm"], answer: 2 },
  { q: "What does API stand for?", options: ["Application Programming Interface", "Applied Program Integration", "Application Process Interface", "Auto Programming Interface"], answer: 0 },
  { q: "What is the derivative of x²?", options: ["x", "2x", "x²", "2x²"], answer: 1 },
  { q: "Which data structure uses LIFO?", options: ["Queue", "Array", "Stack", "Linked List"], answer: 2 },
  { q: "What does DNS stand for?", options: ["Domain Name System", "Data Network Service", "Digital Name Server", "Domain Network System"], answer: 0 },
  { q: "Which gas do plants primarily absorb?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], answer: 2 },
  { q: "What is the speed of light approximately?", options: ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"], answer: 1 },
  { q: "Which OSI layer handles routing?", options: ["Transport", "Network", "Data Link", "Session"], answer: 1 },
  { q: "Which element has atomic number 1?", options: ["Helium", "Hydrogen", "Lithium", "Carbon"], answer: 1 },
  { q: "What is Pi to 2 decimal places?", options: ["3.12", "3.14", "3.16", "3.18"], answer: 1 },
  { q: "Which protocol is used for secure communication?", options: ["HTTP", "FTP", "HTTPS", "SMTP"], answer: 2 },
  { q: "Which number system uses base 16?", options: ["Binary", "Octal", "Decimal", "Hexadecimal"], answer: 3 },
  { q: "What is the largest organ in the human body?", options: ["Heart", "Liver", "Skin", "Brain"], answer: 2 },
  { q: "Which language is primarily used for Android?", options: ["Swift", "Kotlin", "C#", "Ruby"], answer: 1 },
  { q: "Which sorting has best average case complexity?", options: ["Bubble Sort", "Quick Sort", "Selection Sort", "Insertion Sort"], answer: 1 },
  { q: "What does OOP stand for?", options: ["Open Object Programming", "Object Oriented Programming", "Optional Object Process", "Object Output Protocol"], answer: 1 },
  { q: "What is the chemical formula for water?", options: ["H2O", "CO2", "NaCl", "O2"], answer: 0 },
  { q: "What is the chemical symbol for Sodium?", options: ["So", "Sd", "Na", "Sm"], answer: 2 },
];

// Shuffle array deterministically using a seed
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const QuizPage = () => {
  const { token } = useAuth();

  const [phase, setPhase] = useState<QuizPhase>("loading");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [aiSource, setAiSource] = useState<"gemini" | "fallback">("fallback");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [selectedNow, setSelectedNow] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load questions ──────────────────────────────────────────────────────────
  const loadQuiz = useCallback(async () => {
    setPhase("loading");
    setCurrentQ(0);
    setSelectedNow(null);
    setShowFeedback(false);

    let loaded: Question[] = [];
    let source: "gemini" | "fallback" = "fallback";

    try {
      // 3-second timeout so the UI doesn't hang if server is down
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch("http://localhost:5000/api/quiz/generate", {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.questions) && data.questions.length >= 10) {
          loaded = data.questions.slice(0, 30);
          source = data.source === "gemini" ? "gemini" : "fallback";
        }
      }
    } catch {
      // Server not available — use static questions
    }

    // Always fall back to static if we don't have enough questions
    if (loaded.length < 10) {
      loaded = seededShuffle(STATIC_QUESTIONS, Date.now());
      source = "fallback";
    }

    setQuestions(loaded);
    setAnswers(Array(loaded.length).fill(null));
    setAiSource(source);
    setPhase("intro");
  }, [token]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  // ── Per-question timer ──────────────────────────────────────────────────────
  const advanceQuestion = useCallback(() => {
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedNow(null);
      setCurrentQ((prev) => {
        const next = prev + 1;
        if (next >= questions.length) {
          setPhase("results");
          return prev;
        }
        setTimeLeft(QUESTION_TIME);
        return next;
      });
    }, 1400);
  }, [questions.length]);

  useEffect(() => {
    if (phase !== "quiz") return;
    setTimeLeft(QUESTION_TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          advanceQuestion();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [phase, currentQ, advanceQuestion]);

  const selectAnswer = (idx: number) => {
    if (showFeedback || answers[currentQ] !== null) return;
    clearInterval(timerRef.current!);
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQ] = idx;
      return next;
    });
    setSelectedNow(idx);
    advanceQuestion();
  };

  const startQuiz = () => {
    setCurrentQ(0);
    setAnswers(Array(questions.length).fill(null));
    setSelectedNow(null);
    setShowFeedback(false);
    setPhase("quiz");
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const score = answers.reduce(
    (acc, a, i) => acc + (a !== null && questions[i] && a === questions[i].answer ? 1 : 0),
    0
  );
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const timerPct = (timeLeft / QUESTION_TIME) * 100;
  const timerColor = timeLeft > 20 ? "#22c55e" : timeLeft > 10 ? "#f59e0b" : "#ef4444";
  const question = questions[currentQ];

  // ── LOADING ──────────────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="page-container animate-fade-in flex flex-col items-center justify-center min-h-[70vh]">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <Brain className="absolute inset-0 m-auto w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Preparing Your Quiz…</h2>
        <p className="text-muted-foreground text-sm flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary" /> Loading AI-generated questions
        </p>
      </div>
    );
  }

  // ── INTRO ─────────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="page-container animate-fade-in flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
          <Brain className="w-10 h-10 text-primary" />
        </div>
        <div className="text-center mb-8 max-w-md">
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
              {aiSource === "gemini" ? "AI-Generated by Gemini" : "Curated Questions"}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Daily AI Quiz</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {questions.length} questions · 1 minute per question · auto-advances when time's up
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-sm">
          {[
            { label: "Questions", value: `${questions.length}` },
            { label: "Per Question", value: "60s" },
            { label: "Total Time", value: `${questions.length}m` },
          ].map((item) => (
            <div key={item.label} className="bg-card border border-border rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-primary">{item.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>

        <Button size="lg" onClick={startQuiz} className="px-10">
          Start Quiz <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    );
  }

  // ── RESULTS ───────────────────────────────────────────────────────────────────
  if (phase === "results") {
    const grade =
      percentage >= 90 ? { label: "Excellent! 🎉", color: "text-green-600", bg: "bg-green-50 border-green-200" }
      : percentage >= 70 ? { label: "Good Job! 👍", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" }
      : percentage >= 50 ? { label: "Keep Practising 💪", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" }
      : { label: "Need More Study 📚", color: "text-red-600", bg: "bg-red-50 border-red-200" };

    return (
      <div className="page-container animate-fade-in max-w-2xl mx-auto">
        <div className={`rounded-2xl p-8 text-center mb-6 border ${grade.bg}`}>
          <div className="text-6xl font-black text-foreground mb-1">{percentage}%</div>
          <div className={`text-xl font-bold mb-1 ${grade.color}`}>{grade.label}</div>
          <p className="text-muted-foreground text-sm">
            {score} correct out of {questions.length} questions
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 mb-6 space-y-3 max-h-[50vh] overflow-y-auto">
          <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide px-1">Review Answers</h3>
          {questions.map((q, i) => {
            const userAnswer = answers[i];
            const isCorrect = userAnswer === q.answer;
            const skipped = userAnswer === null;
            return (
              <div
                key={i}
                className={`rounded-xl p-3.5 border ${
                  isCorrect ? "border-green-200 bg-green-50/60" : "border-red-200 bg-red-50/60"
                }`}
              >
                <div className="flex items-start gap-2 mb-1">
                  {isCorrect
                    ? <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    : <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />}
                  <p className="text-sm font-medium text-foreground leading-snug">{q.q}</p>
                </div>
                <div className="pl-6 space-y-0.5 text-xs">
                  {skipped && <p className="text-amber-600 font-medium">⏱ Time's up — skipped</p>}
                  {!isCorrect && !skipped && (
                    <p className="text-red-600">Your answer: <strong>{q.options[userAnswer!]}</strong></p>
                  )}
                  <p className="text-green-700">Correct: <strong>{q.options[q.answer]}</strong></p>
                </div>
              </div>
            );
          })}
        </div>

        <Button onClick={loadQuiz} className="w-full">
          <RotateCcw className="w-4 h-4 mr-2" /> Generate New Quiz
        </Button>
      </div>
    );
  }

  // ── QUIZ ──────────────────────────────────────────────────────────────────────
  if (!question) return null;

  return (
    <div className="page-container animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="section-title">Daily AI Quiz</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Sparkles className="w-3 h-3 text-amber-500" />
            {aiSource === "gemini" ? "Powered by Gemini AI" : "Curated Questions"}
          </p>
        </div>

        {/* Circular countdown timer */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="5" />
            <circle
              cx="32" cy="32" r="28"
              fill="none"
              stroke={timerColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - timerPct / 100)}`}
              style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-sm font-bold" style={{ color: timerColor }}>{timeLeft}</span>
          </div>
        </div>
      </div>

      {/* Progress bar (colored dots) */}
      <div className="flex gap-1 mb-5 flex-wrap">
        {questions.map((q, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{
              backgroundColor:
                answers[i] !== null
                  ? answers[i] === q.answer ? "#22c55e" : "#f87171"
                  : i === currentQ ? "hsl(var(--primary))" : "hsl(var(--border))",
            }}
          />
        ))}
      </div>

      {/* Question card */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2 py-1 rounded-md">
            Q{currentQ + 1} / {questions.length}
          </span>
          {timeLeft <= 10 && !showFeedback && (
            <span className="text-xs font-bold text-red-500 flex items-center gap-1 animate-pulse">
              <Clock className="w-3 h-3" /> Hurry up!
            </span>
          )}
        </div>
        <h2 className="text-lg font-semibold text-foreground leading-snug">{question.q}</h2>
      </div>

      {/* Options */}
      <div className="grid gap-3">
        {question.options.map((opt, i) => {
          const isSelected = selectedNow === i || answers[currentQ] === i;
          const isCorrectAnswer = i === question.answer;
          const answered = answers[currentQ] !== null || showFeedback;

          let borderCls = "border-border hover:border-primary/40 hover:bg-secondary/50 text-foreground cursor-pointer active:scale-[0.99]";
          if (answered) {
            if (isCorrectAnswer) borderCls = "border-green-400 bg-green-50 text-green-800 cursor-default";
            else if (isSelected) borderCls = "border-red-400 bg-red-50 text-red-700 cursor-default";
            else borderCls = "border-border text-muted-foreground opacity-50 cursor-default";
          }

          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => selectAnswer(i)}
              className={`w-full p-4 rounded-xl border-2 text-left text-sm font-medium transition-all flex items-center gap-3 ${borderCls}`}
            >
              <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg bg-secondary text-xs font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
              {answered && isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
              {answered && isSelected && !isCorrectAnswer && <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuizPage;
