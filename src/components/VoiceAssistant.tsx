import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useNav } from '@/contexts/NavContext';

const STUDENT_COMMANDS: Record<string, string> = {
  'dashboard': 'dashboard',
  'attendance': 'attendance',
  'assignments': 'assignments',
  'exams': 'exam',
  'proctored exam': 'exam',
  'fees': 'fees',
  'payment': 'fees',
  'ai assistant': 'chat',
  'chatbot': 'chat',
  'timetable': 'timetable',
  'consultation': 'consultation',
};

const TEACHER_COMMANDS: Record<string, string> = {
  'dashboard': 'dashboard',
  'assignments': 'assignments',
  'qr attendance': 'qr-attendance',
  'attendance': 'qr-attendance',
  'timetable': 'timetable',
  'exams': 'exams',
  'manage exams': 'exams',
  'consultations': 'consultations',
  'requests': 'consultations',
};

const ADMIN_COMMANDS: Record<string, string> = {
  'dashboard': 'dashboard',
  'students': 'students',
  'teachers': 'teachers',
  'fees': 'fees',
  'alerts': 'notifications',
  'notifications': 'notifications',
  'exams': 'exams',
};

export const VoiceAssistant = () => {
  const { role, logout } = useAuth();
  const { handleNav } = useNav();
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState("");
  const [feedback, setFeedback] = useState("");
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const getRoleCommands = () => {
    const base = { 'logout': 'logout' };
    if (role === 'student') return { ...base, ...STUDENT_COMMANDS };
    if (role === 'teacher') return { ...base, ...TEACHER_COMMANDS };
    if (role === 'admin') return { ...base, ...ADMIN_COMMANDS };
    return base;
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        setLastCommand(transcript);

        const currentCommands = getRoleCommands();
        let found = false;

        for (const [cmd, targetId] of Object.entries(currentCommands)) {
          if (transcript.includes(cmd)) {
            const displayCmd = cmd.charAt(0).toUpperCase() + cmd.slice(1);

            if (cmd === 'logout') {
              setFeedback("Logging out...");
              speak("Logging out. Goodbye!");
              setTimeout(() => {
                logout();
                navigate('/login');
              }, 1000);
            } else {
              setFeedback(`Opening ${displayCmd}...`);
              speak(`Opening ${displayCmd}`);
              toast({ title: "Command Recognized", description: `Opening ${displayCmd}` });

              setTimeout(() => {
                // IMPORTANT: In DashboardLayout, navigation is handled via the handleNav hook
                // instead of URL paths. This switches the internal ActivePage component.
                handleNav(targetId);
                setIsListening(false);
                setFeedback("");
              }, 1000);
            }

            found = true;
            break;
          }
        }

        if (!found) {
          setFeedback("Command not found");
          speak("Command not recognized. Please try again.");
          toast({ title: "Command Not Found", description: `"${transcript}" not recognized.`, variant: "destructive" });
          setTimeout(() => {
            setIsListening(false);
            setFeedback("");
          }, 2000);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        setFeedback("Error listening");
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [navigate, role, handleNav, logout]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setLastCommand("");
      setFeedback("Listening...");
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.warn("Recognition already started");
      }
    }
  };

  if (!isSupported) return null;

  return (
    <div className="flex items-center gap-3">
      {isListening && (
        <div className="flex flex-col items-end animate-in fade-in slide-in-from-right-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary animate-pulse whitespace-nowrap">
            {feedback || "Speak now..."}
          </span>
          {lastCommand && (
            <span className="text-xs text-slate-500 italic max-w-[150px] truncate group">
              "{lastCommand}"
            </span>
          )}
        </div>
      )}

      <div className="relative">
        {isListening && (
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleListen}
          className={cn(
            "rounded-full w-10 h-10 shadow-md transition-all duration-300 relative z-10 border-slate-200",
            isListening
              ? "bg-primary text-primary-foreground scale-110 border-primary"
              : "bg-white text-slate-600 hover:bg-slate-50 hover:text-primary hover:border-primary/50"
          )}
          title={isListening ? "Stop Listening" : "Start Voice Navigation"}
        >
          {isListening ? (
            <Mic className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5 opacity-70" />
          )}
        </Button>
      </div>
    </div>
  );
};

