import { useState, useRef, useEffect, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send, Bot, User, Sparkles, Square, Copy, Check, RotateCcw, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

// ── PUT YOUR GEMINI API KEY HERE ───────────────────────────────────────────────
// Get a free key at: https://aistudio.google.com/app/apikey
// This key auto-refreshes from localStorage if the user updates it in the UI
const ENV_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY || "";
const HARDCODED_KEY = ENV_KEY;

function getSavedKey(): string {
  try { return localStorage.getItem("sc_gemini_key") || HARDCODED_KEY; } catch { return HARDCODED_KEY; }
}
function saveKey(k: string) {
  try { localStorage.setItem("sc_gemini_key", k); } catch { }
}

interface GeminiMessage { role: "user" | "model"; parts: [{ text: string }] }
interface DisplayMessage { role: "user" | "assistant"; content: string; typing?: boolean; error?: boolean }

const SUGGESTIONS = [
  "Explain recursion with a code example",
  "What is the difference between TCP and UDP?",
  "How does quicksort work?",
  "Explain the OSI model layers simply",
  "What are SOLID principles in OOP?",
  "Solve: ∫x² dx from 0 to 3",
];

// ── Code block renderer ────────────────────────────────────────────────────────
function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="my-3 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-950 text-zinc-100 text-left">
      <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-900 border-b border-zinc-800">
        <span className="text-[11px] font-mono text-zinc-400">{lang || "code"}</span>
        <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1 text-[11px]">
          {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto font-mono leading-relaxed whitespace-pre"><code>{code}</code></pre>
    </div>
  );
}

function renderContent(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0, m: RegExpExecArray | null, k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={k++}>{formatText(text.slice(last, m.index))}</span>);
    parts.push(<CodeBlock key={k++} lang={m[1]} code={m[2].trim()} />);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<span key={k++}>{formatText(text.slice(last))}</span>);
  return <>{parts}</>;
}

function formatText(text: string): React.ReactNode {
  return text.split('\n').map((line, i, arr) => {
    const inlined = formatInline(line);
    return <span key={i}>{inlined}{i < arr.length - 1 && <br />}</span>;
  });
}

function formatInline(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  const re = /(\*\*(.+?)\*\*|`([^`]+)`|\*(.+?)\*)/g;
  let last = 0, m: RegExpExecArray | null, k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) result.push(<span key={k++}>{text.slice(last, m.index)}</span>);
    if (m[2]) result.push(<strong key={k++} className="font-semibold">{m[2]}</strong>);
    else if (m[3]) result.push(<code key={k++} className="bg-black/10 px-1.5 py-0.5 rounded text-[0.82em] font-mono border border-black/10">{m[3]}</code>);
    else if (m[4]) result.push(<em key={k++}>{m[4]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) result.push(<span key={k++}>{text.slice(last)}</span>);
  return result;
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 h-5 px-1">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }} />
      ))}
    </span>
  );
}

// ── Gemini API call using SDK ──────────────────────────────────────────────────
const SYSTEM_CONTEXT = "You are SmartCampus AI, a brilliant academic assistant for university students. Answer any question on any topic — coding, maths, physics, history, literature, science, etc. Use clear formatting and code blocks. Be concise but thorough.";

async function callGemini(apiKey: string, history: GeminiMessage[]): Promise<string> {
  try {
    if (!apiKey) throw new Error("API_KEY_MISSING");
    
    const genAI = new GoogleGenerativeAI(apiKey);
    let model;
    try {
      model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash-latest",
        systemInstruction: SYSTEM_CONTEXT 
      });
    } catch {
      model = genAI.getGenerativeModel({ 
        model: "gemini-pro",
        systemInstruction: SYSTEM_CONTEXT 
      });
    }

    // Convert our internal history to the SDK chat format
    // Note: Our history already includes user messages. The SDK 'chat' history
    // expects a list of prior exchanges.
    const chat = model.startChat({
      history: history.slice(0, -1).map(msg => ({
        role: msg.role === "model" ? "model" : "user",
        parts: [{ text: msg.parts[0].text }],
      })),
    });

    const latestUserMessage = history[history.length - 1].parts[0].text;
    const result = await chat.sendMessage(latestUserMessage);
    const response = await result.response;
    return response.text();
  } catch (err: any) {
    console.error("Gemini SDK Error:", err);
    if (err.message?.includes("401") || err.message?.includes("403") || err.message?.includes("key")) {
      throw new Error("KEY_EXPIRED");
    }
    throw new Error(err.message || "Failed to generate content");
  }
}

// ── Expired key update banner ──────────────────────────────────────────────────
function KeyExpiredBanner({ onUpdate }: { onUpdate: (k: string) => void }) {
  const [newKey, setNewKey] = useState("");
  return (
    <div className="mx-4 my-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row gap-2 items-start sm:items-center">
      <div className="flex-1">
        <p className="text-xs font-semibold text-amber-800">⏱ API key expired (AQ. tokens last ~1 hour)</p>
        <p className="text-[11px] text-amber-700 mt-0.5">
          Get a permanent key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline font-medium">aistudio.google.com/app/apikey</a> (starts with AIzaSy…)
        </p>
      </div>
      <div className="flex gap-1.5 w-full sm:w-auto">
        <Input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="Paste new key…"
          className="h-8 text-xs flex-1 sm:w-48 font-mono" />
        <Button size="sm" className="h-8 text-xs px-3" onClick={() => newKey.trim() && onUpdate(newKey.trim())} disabled={!newKey.trim()}>
          <RefreshCw className="w-3 h-3 mr-1" /> Update
        </Button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
const AIChatBot = () => {
  const [currentKey, setCurrentKey] = useState<string>(getSavedKey);
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [geminiHistory, setGeminiHistory] = useState<GeminiMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [keyExpired, setKeyExpired] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  const updateKey = (k: string) => {
    saveKey(k);
    setCurrentKey(k);
    setKeyExpired(false);
  };

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");
    setKeyExpired(false);
    abortRef.current = false;

    const newHistory: GeminiMessage[] = [
      ...geminiHistory,
      { role: "user", parts: [{ text: trimmed }] },
    ];

    setDisplayMessages(prev => [
      ...prev,
      { role: "user", content: trimmed },
      { role: "assistant", content: "", typing: true },
    ]);
    setLoading(true);

    try {
      const reply = await callGemini(currentKey, newHistory);
      if (abortRef.current) return;
      setGeminiHistory([...newHistory, { role: "model", parts: [{ text: reply }] }]);
      setDisplayMessages(prev => {
        const msgs = [...prev];
        msgs[msgs.length - 1] = { role: "assistant", content: reply };
        return msgs;
      });
    } catch (err: any) {
      if (abortRef.current) return;
      if (err.message === "KEY_EXPIRED") {
        // Remove the typing bubble, show expired banner instead
        setDisplayMessages(prev => prev.slice(0, -1));
        setKeyExpired(true);
      } else {
        setDisplayMessages(prev => {
          const msgs = [...prev];
          msgs[msgs.length - 1] = {
            role: "assistant",
            content: `⚠️ ${err.message || "Something went wrong. Please try again."}`,
            error: true,
          };
          return msgs;
        });
      }
    } finally {
      setLoading(false);
    }
  }, [currentKey, geminiHistory, loading]);

  const stop = () => {
    abortRef.current = true;
    setLoading(false);
    setDisplayMessages(prev => {
      const msgs = [...prev];
      if (msgs[msgs.length - 1]?.typing) msgs[msgs.length - 1] = { role: "assistant", content: "Stopped." };
      return msgs;
    });
  };

  const reset = () => {
    setDisplayMessages([]); setGeminiHistory([]);
    setInput(""); setKeyExpired(false);
    abortRef.current = false; setLoading(false);
  };

  const isEmpty = displayMessages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] page-container py-0 px-0">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card/60 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-violet-500/10 flex items-center justify-center border border-primary/20">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground leading-tight">SmartCampus AI</h1>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-500" /> Powered by Gemini 1.5 Flash
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground hover:text-foreground gap-1.5 h-8">
          <RotateCcw className="w-3.5 h-3.5" /> New chat
        </Button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/10 border border-primary/20 flex items-center justify-center mb-5">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">How can I help you?</h2>
            <p className="text-muted-foreground text-sm mb-8 max-w-xs">
              Ask me anything — coding, maths, science, history or any academic topic.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="text-left p-3.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-sm text-foreground leading-snug group">
                  <span className="text-primary text-xs font-bold mr-1.5 group-hover:mr-2 transition-all">→</span>{s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {displayMessages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-violet-500/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : msg.error
                    ? "bg-red-50 border border-red-200 text-red-700 rounded-tl-sm"
                    : "bg-card border border-border text-foreground rounded-tl-sm"
                  }`}>
                  {msg.typing ? <TypingDots /> : msg.role === "assistant"
                    ? <div>{renderContent(msg.content)}</div>
                    : msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-foreground" />
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Expired key banner — shows inline, never blocks the chat */}
      {keyExpired && <KeyExpiredBanner onUpdate={updateKey} />}

      {/* Input */}
      <div className="flex-shrink-0 border-t border-border bg-card/60 backdrop-blur-sm px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 bg-background border border-border rounded-2xl px-4 py-2.5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Ask anything… (Enter to send, Shift+Enter for new line)"
              className="flex-1 border-0 shadow-none resize-none bg-transparent focus-visible:ring-0 p-0 text-sm min-h-[24px] max-h-[160px] leading-relaxed"
              rows={1}
              onInput={e => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 160) + "px";
              }}
            />
            {loading ? (
              <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl flex-shrink-0 text-muted-foreground hover:text-destructive" onClick={stop}>
                <Square className="w-4 h-4 fill-current" />
              </Button>
            ) : (
              <Button size="icon" className="h-9 w-9 rounded-xl flex-shrink-0" onClick={() => send(input)} disabled={!input.trim() || loading}>
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            SmartCampus AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChatBot;
