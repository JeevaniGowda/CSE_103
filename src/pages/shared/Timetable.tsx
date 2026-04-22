import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, Calendar, Info, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

import { studentTimetable, getTeacherSchedule } from "@/lib/timetableData";

const Timetable = () => {
  const { role, userName } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateTimetable();
  }, []);

  const generateTimetable = () => {
    setLoading(true);
    
    // Simulate small generation delay
    setTimeout(() => {
      if (role === "teacher") {
        // Construct a full 5-day table for the teacher
        const teacherViewData = {
          days: studentTimetable.days.map(dayObj => ({
            day: dayObj.day,
            periods: dayObj.periods.map(p => {
              const isTeaching = p.teacher?.toLowerCase() === userName?.toLowerCase();
              return isTeaching ? p : { time: p.time, subject: "FREE", teacher: null };
            })
          }))
        };
        setData(teacherViewData);
      } else {
        setData(studentTimetable);
      }
      setLoading(false);
    }, 800);
  };

  if (loading || !data) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCcw className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse font-medium">Processing Faculty Schedules...</p>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            {role === "teacher" ? "Teaching Schedule 👨‍🏫" : "Class Timetable 📅"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {role === "teacher" 
              ? `Personalized teaching schedule for Prof. ${userName || "Lecturer"}` 
              : `Class: ${studentTimetable.className} - Semester Schedule`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={generateTimetable} className="gap-2 bg-white border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold">
          <RefreshCcw className="w-4 h-4" /> Regenerate
        </Button>
      </div>

      <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-6 text-left font-bold text-slate-400 uppercase tracking-widest text-[10px] border-b border-border w-40">Day</th>
                {studentTimetable.days[0].periods.map((p, i) => (
                  <th key={i} className="p-6 text-center font-bold text-slate-400 uppercase tracking-widest text-[10px] border-b border-border">
                    <div className="flex flex-col items-center gap-1">
                      <Clock className="w-4 h-4 text-primary/60" />
                      <span>{p.time}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.days.map((dayObj: any, dayIdx: number) => (
                <tr key={dayIdx} className="hover:bg-muted/30 transition-colors">
                  <td className="p-6 font-black text-slate-700 border-b border-border bg-slate-50/30">{dayObj.day}</td>
                  {dayObj.periods.map((period: any, pIdx: number) => {
                    const isFree = period.subject === "FREE";
                    
                    return (
                      <td key={pIdx} className={`p-4 border-b border-border text-center`}>
                        <div className={`p-4 rounded-3xl border transition-all h-full min-h-[100px] flex flex-col justify-center gap-1 ${
                          isFree 
                            ? 'bg-emerald-50/40 border-dashed border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300' 
                            : 'bg-primary/5 border-primary/10 border-solid hover:bg-primary/10 hover:border-primary/25 shadow-sm'
                        }`}>
                          <p className={`text-sm font-black ${isFree ? 'text-emerald-700' : 'text-primary'}`}>
                            {isFree ? (role === "teacher" ? "CONSULTATION" : "FREE HOUR") : period.subject}
                          </p>
                          
                          {role === "teacher" ? (
                            isFree ? (
                              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter mt-1 opacity-70">
                                Open for Doubts
                              </p>
                            ) : (
                              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">
                                {studentTimetable.className}
                              </p>
                            )
                          ) : (
                            !isFree && (
                              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">
                                {period.teacher}
                              </p>
                            )
                          )}
                          
                          {role === "teacher" && isFree && (
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="p-0 h-auto text-[10px] font-black uppercase text-emerald-800 hover:text-emerald-900 mt-2 tracking-widest"
                              onClick={() => window.dispatchEvent(new CustomEvent('nav-change', { detail: 'consultations' }))}
                            >
                              View Reqs →
                            </Button>
                          )}
                          
                          {role === "student" && isFree && (
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="p-0 h-auto text-[10px] font-black uppercase text-emerald-800 hover:text-emerald-900 mt-2 tracking-widest"
                              onClick={() => window.dispatchEvent(new CustomEvent('nav-change', { detail: 'consultation' }))}
                            >
                              Book Now →
                            </Button>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Timetable;
