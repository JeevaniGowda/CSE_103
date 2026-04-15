import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { studentTimetable, teachers, getTeacherFreeSlots } from '@/lib/timetableData';

interface FreeSlot {
  teacherId: string;
  teacherName: string;
  day: string;
  dayKey: string;
  period: string;
}

const ConsultationBooking = () => {
  const { userName } = useAuth();
  const { toast } = useToast();
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<FreeSlot | null>(null);
  const [selectedTeacherName, setSelectedTeacherName] = useState<string>(teachers[0].name);
  const [message, setMessage] = useState("");

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const dayKeys = ["mon", "tue", "wed", "thu", "fri"];
  const dayNames: any = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday" };
  const timeSlots = ["9-10", "10-11", "11-12", "12-1"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const saved = localStorage.getItem('consultation_requests');
    if (saved) {
      const allReqs = JSON.parse(saved);
      setMyRequests(allReqs.filter((r: any) => r.studentName === (userName || "Student")));
    }
  };

  const handleRequest = () => {
    if (!selectedSlot || !message) {
      toast({ title: "Message Required", description: "Please describe your doubt.", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    
    setTimeout(() => {
      const newRequest = {
        _id: Math.random().toString(36).substr(2, 9),
        teacherName: selectedSlot.teacherName,
        studentName: userName || "Student",
        message,
        day: selectedSlot.dayKey,
        period: selectedSlot.period,
        status: 'pending',
        timestamp: new Date().toISOString()
      };

      const saved = localStorage.getItem('consultation_requests');
      const allReqs = saved ? JSON.parse(saved) : [];
      allReqs.push(newRequest);
      localStorage.setItem('consultation_requests', JSON.stringify(allReqs));

      setMyRequests(prev => [newRequest, ...prev]);
      toast({ title: "Request Sent", description: "Teacher will review your consultation request." });
      setSelectedSlot(null);
      setMessage("");
      setLoading(false);
    }, 800);
  };

  const teacherFreeSlots = getTeacherFreeSlots(selectedTeacherName);

  return (
    <div className="p-6 space-y-8 animate-fade-in bg-slate-50/30 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Teacher Consultation</h1>
          <p className="text-slate-500 mt-1">Book slots for doubt clearing sessions during teacher's FREE hours</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Section: Timetable View */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl">
            <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between space-y-0 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Available Slots</CardTitle>
                  <CardDescription>Select a teacher to view their free hours</CardDescription>
                </div>
              </div>
              <select
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                value={selectedTeacherName}
                onChange={(e) => setSelectedTeacherName(e.target.value)}
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.name}>
                    Prof. {t.name} ({t.subject})
                  </option>
                ))}
              </select>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-widest text-[10px] border-r border-slate-100">Time</th>
                    {dayLabels.map(day => (
                      <th key={day} className="px-6 py-4 text-center font-bold text-slate-400 uppercase tracking-widest text-[10px]">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-6 font-bold text-slate-600 border-r border-slate-100 whitespace-nowrap bg-slate-50/30">
                        {time}
                      </td>
                      {dayKeys.map(dayKey => {
                        const isFree = teacherFreeSlots.some(s => s.dayKey === dayKey && s.time === time);
                        const isSelected = selectedSlot?.dayKey === dayKey && selectedSlot?.period === time;
                        
                        return (
                          <td key={dayKey} className="p-2 min-w-[140px]">
                            {isFree ? (
                              <Dialog
                                open={isSelected}
                                onOpenChange={(open) => !open && setSelectedSlot(null)}
                              >
                                <DialogTrigger asChild>
                                  <button
                                    onClick={() => setSelectedSlot({
                                      teacherId: teachers.find(t => t.name === selectedTeacherName)?.id || "",
                                      teacherName: selectedTeacherName,
                                      day: dayNames[dayKey],
                                      dayKey: dayKey,
                                      period: time
                                    })}
                                    className="w-full h-full p-4 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 text-emerald-700 hover:bg-emerald-100/60 hover:border-emerald-400 hover:scale-[1.02] transition-all font-bold flex flex-col items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
                                  >
                                    <BookOpen className="w-4 h-4 text-emerald-500" />
                                    <span className="text-[10px] tracking-tighter">AVAILABLE</span>
                                    <span className="text-xs">FREE SLOT</span>
                                  </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] rounded-3xl">
                                  <DialogHeader className="space-y-3">
                                    <DialogTitle className="text-2xl font-bold text-slate-900">Request Consultation</DialogTitle>
                                    <DialogDescription className="text-slate-500 font-medium">
                                      Consultation with <span className="text-primary font-bold">Prof. {selectedTeacherName}</span> on <span className="text-slate-900 font-bold">{dayNames[dayKey]}</span> at <span className="text-slate-900 font-bold">{time}</span>
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-6 mt-6">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">Teacher</p>
                                        <p className="font-bold text-slate-800">{selectedTeacherName}</p>
                                      </div>
                                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">Subject</p>
                                        <p className="font-bold text-slate-800">{teachers.find(t => t.name === selectedTeacherName)?.subject}</p>
                                      </div>
                                    </div>
                                    <div className="space-y-3">
                                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-primary" />
                                        Describe your doubt
                                      </label>
                                      <textarea
                                        placeholder="Briefly explain what you need help with..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all resize-none text-sm font-medium"
                                      />
                                    </div>
                                    <Button 
                                      className="w-full py-7 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.01]" 
                                      onClick={handleRequest} 
                                      disabled={loading}
                                    >
                                      {loading ? "Sending Request..." : "Confirm Booking"}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <div className="p-4 rounded-xl text-center bg-slate-100/50 text-slate-400 border border-slate-100 opacity-60 flex flex-col items-center gap-1">
                                <Clock className="w-4 h-4 opacity-30" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Occupied</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Right Section: My Requests */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 rounded-xl">
                  <MessageSquare className="w-5 h-5 text-amber-600" />
                </div>
                <CardTitle className="text-lg font-bold">My Requests</CardTitle>
              </div>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full">{myRequests.length} Total</span>
            </CardHeader>
            <CardContent className="p-0 max-h-[600px] overflow-y-auto">
              <div className="divide-y divide-slate-100">
                {myRequests.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">No requests sent yet.</p>
                    <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-wider">Book a slot to get started</p>
                  </div>
                )}
                {myRequests.map((req) => (
                  <div key={req._id} className="p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800">Prof. {req.teacherName}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {dayNames[req.day]}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {req.period}</span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        req.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        req.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' : 
                        'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                      }`}>
                        {req.status}
                      </div>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 my-3 shadow-sm italic">
                      <p className="text-xs text-slate-600 leading-relaxed">" {req.message} "</p>
                    </div>
                    {req.reply && (
                      <div className="mt-4 p-4 bg-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Teacher's Reply</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-bold tracking-tight">{req.reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConsultationBooking;
