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
        // Match current teacher by name
        const mySchedule = getTeacherSchedule(userName || "Ravi");
        setData(mySchedule);
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Timetable</h1>
          <p className="text-muted-foreground mt-1">
            {role === "teacher" 
              ? `Personalized teaching schedule for Prof. ${userName || "Lecturer"}` 
              : `Class: ${studentTimetable.className} - Semester Schedule`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={generateTimetable} className="gap-2">
          <RefreshCcw className="w-4 h-4" /> Regenerate
        </Button>
      </div>

      {role === "teacher" ? (
        // --- Teacher View ---
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.length > 0 ? (
            data.map((item: any, i: number) => (
              <div key={i} className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{item.day}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest opacity-60">Subject</span>
                    <span className="text-sm font-bold text-foreground bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">{item.subject}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest opacity-60">Handled for</span>
                    <span className="text-sm text-foreground font-medium">{item.className}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-12 bg-muted/20 border border-border border-dashed rounded-3xl text-center">
              <p className="text-muted-foreground">No classes assigned for this teacher currently.</p>
            </div>
          )}
        </div>
      ) : (
        // --- Student View ---
        <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/5">
                  <th className="p-6 text-left font-bold text-foreground border-b border-border w-40">Day</th>
                  {studentTimetable.days[0].periods.map((p, i) => (
                    <th key={i} className="p-6 text-center font-bold text-foreground border-b border-border">
                      <div className="flex flex-col items-center gap-1">
                        <Clock className="w-4 h-4 text-primary opacity-60" />
                        <span>{p.time}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.days.map((dayObj: any, dayIdx: number) => (
                  <tr key={dayIdx} className="hover:bg-muted/30 transition-colors">
                    <td className="p-6 font-bold text-foreground border-b border-border bg-muted/10">{dayObj.day}</td>
                    {dayObj.periods.map((period: any, pIdx: number) => {
                      const isFree = period.subject === "FREE";
                      return (
                        <td key={pIdx} className={`p-4 border-b border-border text-center`}>
                          <div className={`p-4 rounded-2xl border transition-all ${
                            isFree 
                              ? 'bg-secondary/30 border-dashed border-muted-foreground/20' 
                              : 'bg-primary/5 border-primary/10 border-solid hover:bg-primary/10'
                          }`}>
                            <p className={`text-sm font-black mb-1 ${isFree ? 'text-muted-foreground italic' : 'text-primary'}`}>
                              {period.subject}
                            </p>
                            {!isFree && (
                              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">
                                {period.teacher}
                              </p>
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
      )}
      
    </div>
  );
};

export default Timetable;
