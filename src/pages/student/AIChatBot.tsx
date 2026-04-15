import { useState } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  role: "user" | "bot";
  content: string;
}

const predefinedResponses: Record<string, string> = {
  "study tips": "Here are some effective study tips:\n1. Use the Pomodoro technique (25 min study, 5 min break)\n2. Create mind maps for complex topics\n3. Practice active recall instead of passive reading\n4. Review notes within 24 hours of class",
  "free time": "Great ways to use free time productively:\n• Read supplementary material for upcoming topics\n• Solve previous year question papers\n• Participate in online coding challenges\n• Join study groups with peers",
  "assignment": "For assignment help:\n• Break the assignment into smaller tasks\n• Start with research before writing\n• Use your textbook and class notes as primary sources\n• Proofread before submitting",
  default: "I'm your academic assistant! Try asking about:\n• Study tips\n• How to use free time\n• Assignment help\n• Subject-specific questions",
};

const getResponse = (input: string): string => {
  const lower = input.toLowerCase();
  for (const [key, val] of Object.entries(predefinedResponses)) {
    if (key !== "default" && lower.includes(key)) return val;
  }
  return predefinedResponses.default;
};

const AIChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hello! I'm your academic AI assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const botMsg: Message = { role: "bot", content: getResponse(input) };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <div className="page-container animate-fade-in flex flex-col" style={{ height: "calc(100vh - 3.5rem)" }}>
      <h1 className="section-title mb-4">AI ChatBot</h1>

      <div className="flex-1 bg-card border border-border rounded-xl flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "bot" && (
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-xl px-3.5 py-2.5 text-sm whitespace-pre-line ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              }`}>
                {m.content}
              </div>
              {m.role === "user" && (
                <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-accent-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-border p-3 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask anything about your studies..."
            className="flex-1"
          />
          <Button size="icon" onClick={send} disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChatBot;
