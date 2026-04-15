import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Calendar, Clock, User, Check, X, Send, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const ConsultationRequests = () => {
  const { userName } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [replyMessage, setReplyMessage] = useState<{[key: string]: string}>({});

  const dayNames: any = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday" };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    const saved = localStorage.getItem('consultation_requests');
    if (saved) {
      const allReqs = JSON.parse(saved);
      // In a real app, we'd filter by teacher ID. For demo, we filter by teacher name matching userName
      setRequests(allReqs.filter((r: any) => r.teacherName === (userName || "Ravi")));
    }
  };

  const handleAction = (id: string, status: 'accepted' | 'rejected') => {
    const reply = replyMessage[id];
    if (status === 'accepted' && !reply) {
      toast({ title: "Reply Required", description: "Please provide a brief reply message (e.g., room number or link).", variant: "destructive" });
      return;
    }

    const saved = localStorage.getItem('consultation_requests');
    if (saved) {
      const allReqs = JSON.parse(saved);
      const updatedReqs = allReqs.map((r: any) => {
        if (r._id === id) {
          return { ...r, status, reply };
        }
        return r;
      });
      localStorage.setItem('consultation_requests', JSON.stringify(updatedReqs));
      
      toast({ title: `Consultation ${status}`, description: `Request has been marked as ${status}.` });
      fetchRequests();
    }
  };

  return (
    <div className="p-6 space-y-8 animate-fade-in bg-slate-50/30 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Consultation Requests</h1>
          <p className="text-slate-500 mt-1">Manage incoming requests from students during your FREE hours</p>
        </div>
        <Button variant="outline" onClick={fetchRequests} size="sm" className="gap-2 rounded-xl border-slate-200">
          <Send className="w-4 h-4 text-primary" /> Refresh List
        </Button>
      </div>

      <div className="grid gap-6">
        {requests.length === 0 && (
          <div className="text-center py-24 bg-white border border-dashed border-slate-200 rounded-3xl shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-slate-500 font-bold text-lg">No incoming consultation requests.</p>
            <p className="text-slate-400 text-sm mt-1">When students book your free hours, they will appear here.</p>
          </div>
        )}
        {requests.map((req) => (
          <Card key={req._id} className={`border-slate-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all ${req.status === 'pending' ? 'ring-2 ring-primary/10' : ''}`}>
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
                <div className="flex-1 p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{req.studentName}</h3>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary/60" /> {dayNames[req.day]}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary/60" /> {req.period}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 relative">
                    <div className="absolute top-3 left-3 opacity-10">
                      <MessageSquare className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed italic relative z-10">
                      " {req.message} "
                    </p>
                  </div>
                </div>

                <div className="md:w-80 p-6 bg-slate-50/50 flex flex-col justify-center gap-4">
                  {req.status === 'pending' ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Response</label>
                        <Input 
                          placeholder="Meet in Lab 2 / Zoom Link..." 
                          value={replyMessage[req._id] || ""} 
                          onChange={(e) => setReplyMessage({...replyMessage, [req._id]: e.target.value})}
                          className="bg-white border-slate-200 rounded-xl h-12 text-sm font-medium px-4"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11 text-xs font-bold shadow-lg shadow-emerald-600/10" onClick={() => handleAction(req._id, 'accepted')}>
                          <Check className="w-4 h-4" /> ACCEPT
                        </Button>
                        <Button className="flex-1 gap-2 rounded-xl h-11 text-xs font-bold" variant="outline" onClick={() => handleAction(req._id, 'rejected')}>
                          <X className="w-4 h-4" /> REJECT
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center space-y-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        req.status === 'accepted' ? 'bg-emerald-100' : 'bg-red-100'
                      }`}>
                         {req.status === 'accepted' ? <Check className="w-5 h-5 text-emerald-600" /> : <X className="w-5 h-5 text-red-600" />}
                      </div>
                      <div className="space-y-1">
                        <div className={`text-xs font-black uppercase tracking-[0.2em] ${
                          req.status === 'accepted' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {req.status}
                        </div>
                        {req.reply && (
                          <p className="text-xs text-slate-500 font-bold italic bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-sm mt-2">
                            "{req.reply}"
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ConsultationRequests;
