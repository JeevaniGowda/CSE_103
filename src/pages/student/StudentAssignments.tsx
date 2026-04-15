import React, { useState, useEffect } from "react";
import { FileText, Clock, CheckCircle2, Upload, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface Assignment {
  id: string;
  title: string;
  subject: string;
  due: string;
  submittedUsers: string[];
}

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const { userName } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("assignments");
    if (saved) {
      setAssignments(JSON.parse(saved));
    }
  }, []);

  const handleFileUpload = (aId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    // Simulate upload
    toast({ title: "Uploading...", description: "Please wait while your document is being uploaded." });
    setTimeout(() => {
      const updated = assignments.map((a) => {
        if (a.id === aId && !a.submittedUsers.includes(userName)) {
          return { ...a, submittedUsers: [...a.submittedUsers, userName] };
        }
        return a;
      });
      setAssignments(updated);
      localStorage.setItem("assignments", JSON.stringify(updated));
      toast({ title: "Submitted", description: "Your soft copy has been submitted successfully." });
    }, 1000);
  };

  const getStatus = (a: Assignment) => {
    if (a.submittedUsers.includes(userName)) {
      return { label: "Submitted", color: "bg-success/10 text-success border-success", icon: <CheckCircle2 className="w-4 h-4 text-success" /> };
    }
    
    const now = new Date();
    const due = new Date(a.due);
    now.setHours(0, 0, 0, 0); // compare dates only
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { label: "Not Submitted (Overdue)", color: "bg-destructive/10 text-destructive border-destructive", icon: <XCircle className="w-4 h-4 text-destructive" /> };
    } else if (diffDays <= 2) {
      return { label: "Hurry up!", color: "bg-warning/10 text-warning border-warning", icon: <AlertCircle className="w-4 h-4 text-warning" /> };
    }
    return { label: "Pending", color: "bg-primary/10 text-primary border-primary", icon: <Clock className="w-4 h-4 text-primary" /> };
  };

  return (
    <div className="page-container animate-fade-in">
      <h1 className="section-title mb-6">Course Assignments</h1>

      <div className="grid gap-4">
        {assignments.length === 0 && <p className="text-gray-500 text-sm">No assignments have been posted yet.</p>}
        {assignments.map((a) => {
          const status = getStatus(a);
          const isSubmitted = a.submittedUsers.includes(userName);
          
          return (
            <div key={a.id} className="bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${status.color.split(' ')[0]}`}>
                  <FileText className={`w-6 h-6 ${status.color.split(' ')[1]}`} />
                </div>
                <div>
                  <div className="font-semibold text-base text-foreground">{a.title}</div>
                  <div className="text-sm text-muted-foreground">{a.subject}</div>
                </div>
              </div>
              
              <div className="flex flex-col md:items-end gap-2">
                <div className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full border ${status.color}`}>
                  {status.icon}
                  {status.label}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Due: {new Date(a.due).toLocaleDateString()}
                </div>
                
                {!isSubmitted && (
                  <div className="mt-2 relative">
                    <Button variant="outline" size="sm" className="w-full">
                      <Upload className="w-4 h-4 mr-2" /> Upload Soft Copy
                    </Button>
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      onChange={(e) => handleFileUpload(a.id, e)}
                      accept=".pdf,.doc,.docx,.zip"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentAssignments;
