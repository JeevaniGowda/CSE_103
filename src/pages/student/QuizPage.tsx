import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, RotateCcw } from "lucide-react";

const allQuestions = [
  { q: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], answer: 1 },
  { q: "Which data structure uses FIFO?", options: ["Stack", "Queue", "Tree", "Graph"], answer: 1 },
  { q: "HTML stands for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "None"], answer: 0 },
  { q: "Which planet is closest to the Sun?", options: ["Venus", "Earth", "Mercury", "Mars"], answer: 2 },
  { q: "What does CSS stand for?", options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Colorful Style Sheets"], answer: 1 },
  { q: "Which keyword declares a constant in JavaScript?", options: ["var", "let", "const", "static"], answer: 2 },
  { q: "What is 2^10?", options: ["512", "1024", "2048", "256"], answer: 1 },
  { q: "Who invented the World Wide Web?", options: ["Bill Gates", "Steve Jobs", "Tim Berners-Lee", "Mark Zuckerberg"], answer: 2 },
  { q: "Which sorting algorithm has the best average case?", options: ["Bubble Sort", "Quick Sort", "Selection Sort", "Insertion Sort"], answer: 1 },
  { q: "What is the chemical symbol for water?", options: ["H2O", "CO2", "NaCl", "O2"], answer: 0 },
  { q: "What is the default port for HTTP?", options: ["21", "443", "80", "8080"], answer: 2 },
  { q: "Which protocol is used for secure communication?", options: ["HTTP", "FTP", "HTTPS", "SMTP"], answer: 2 },
  { q: "What does SQL stand for?", options: ["Structured Query Language", "Simple Query Language", "Standard Query Logic", "Sequential Query Language"], answer: 0 },
  { q: "Which of these is NOT a programming language?", options: ["Python", "Java", "HTML", "C++"], answer: 2 },
  { q: "What is the binary of decimal 10?", options: ["1010", "1100", "1001", "1110"], answer: 0 },
  { q: "Which gas do plants absorb from the atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], answer: 2 },
  { q: "What is the speed of light approximately?", options: ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"], answer: 1 },
  { q: "Which layer of OSI model handles routing?", options: ["Transport", "Network", "Data Link", "Session"], answer: 1 },
  { q: "What does RAM stand for?", options: ["Read Access Memory", "Random Access Memory", "Run Access Memory", "Rapid Access Memory"], answer: 1 },
  { q: "Which company developed Java?", options: ["Microsoft", "Apple", "Sun Microsystems", "Google"], answer: 2 },
  { q: "What is the SI unit of electric current?", options: ["Volt", "Watt", "Ampere", "Ohm"], answer: 2 },
  { q: "Which number system uses base 16?", options: ["Binary", "Octal", "Decimal", "Hexadecimal"], answer: 3 },
  { q: "What does API stand for?", options: ["Application Programming Interface", "Applied Program Integration", "Application Process Interface", "Auto Programming Interface"], answer: 0 },
  { q: "Which element has the atomic number 1?", options: ["Helium", "Hydrogen", "Lithium", "Carbon"], answer: 1 },
  { q: "What is the derivative of x²?", options: ["x", "2x", "x²", "2x²"], answer: 1 },
  { q: "Which data structure uses LIFO?", options: ["Queue", "Array", "Stack", "Linked List"], answer: 2 },
  { q: "What does DNS stand for?", options: ["Domain Name System", "Data Network Service", "Digital Name Server", "Domain Network System"], answer: 0 },
  { q: "What is the largest organ in the human body?", options: ["Heart", "Liver", "Skin", "Brain"], answer: 2 },
  { q: "Which language is primarily used for Android development?", options: ["Swift", "Kotlin", "C#", "Ruby"], answer: 1 },
  { q: "What is the value of Pi to 2 decimal places?", options: ["3.12", "3.14", "3.16", "3.18"], answer: 1 },
];

// Deterministic shuffle using a seed
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const shuffled = [...arr];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRotationSeed(): number {
  const now = Date.now();
  return Math.floor(now / (30 * 60 * 1000)); // Changes every 30 minutes
}

function getTimeUntilNextRotation(): number {
  const now = Date.now();
  const interval = 30 * 60 * 1000;
  return Math.ceil((interval - (now % interval)) / 1000);
}

const QuizPage = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(30).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => getTimeUntilNextRotation());
  const [seed, setSeed] = useState(() => getRotationSeed());

  const questions = useMemo(() => seededShuffle(allQuestions, seed), [seed]);

  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      const newSeed = getRotationSeed();
      if (newSeed !== seed) {
        setSeed(newSeed);
        setAnswers(Array(30).fill(null));
        setCurrentQ(0);
        setSelected(null);
        setSubmitted(false);
      }
      setTimeLeft(getTimeUntilNextRotation());
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted, seed]);

  useEffect(() => {
    if (timeLeft === 0 && !submitted) setSubmitted(true);
  }, [timeLeft, submitted]);

  const selectOption = (idx: number) => {
    if (submitted) return;
    setSelected(idx);
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
  };

  const score = answers.reduce((acc, a, i) => acc + (a === questions[i].answer ? 1 : 0), 0);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const question = questions[currentQ];

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Daily Quiz</h1>
          <p className="text-muted-foreground text-sm mt-1">30 questions · Refreshes every 30 minutes</p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="font-mono text-sm font-semibold text-foreground">{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</span>
        </div>
      </div>

      {submitted ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center animate-slide-up">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground mb-2">Quiz Complete!</h2>
          <p className="text-lg text-muted-foreground">Score: <span className="font-bold text-foreground">{score}/{questions.length}</span></p>
          <p className="text-sm text-muted-foreground mt-2">Next quiz in {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-6">
          {/* Progress */}
          <div className="flex items-center gap-1 mb-4 flex-wrap">
            {questions.map((_, i) => (
              <div key={i} className={`h-1.5 w-2 rounded-full transition-colors cursor-pointer ${
                answers[i] !== null ? "bg-primary" : i === currentQ ? "bg-primary/30" : "bg-border"
              }`} onClick={() => { setCurrentQ(i); setSelected(answers[i]); }} />
            ))}
          </div>

          <div className="text-xs text-muted-foreground mb-2">Question {currentQ + 1} of {questions.length}</div>
          <h2 className="text-lg font-semibold text-foreground mb-5">{question.q}</h2>

          <div className="grid gap-2.5">
            {question.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => selectOption(i)}
                className={`p-3.5 rounded-xl border-2 text-left text-sm font-medium transition-all ${
                  answers[currentQ] === i
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border hover:border-primary/30 text-foreground"
                }`}
              >
                <span className="mr-3 inline-flex w-6 h-6 items-center justify-center rounded-md bg-secondary text-xs font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" disabled={currentQ === 0} onClick={() => { setCurrentQ(currentQ - 1); setSelected(answers[currentQ - 1]); }}>
              Previous
            </Button>
            {currentQ < questions.length - 1 ? (
              <Button onClick={() => { setCurrentQ(currentQ + 1); setSelected(answers[currentQ + 1]); }}>Next</Button>
            ) : (
              <Button onClick={() => setSubmitted(true)}>Submit Quiz</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
