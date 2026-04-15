import React, { useState, useEffect } from "react";
import { FileText, Users, Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  due: string;
  submittedUsers: string[];
}

const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "", due: "" });

  useEffect(() => {
    const saved = localStorage.getItem("assignments");
    if (saved) {
      setAssignments(JSON.parse(saved));
    }
  }, []);

  const saveAssignments = (newAssignments: Assignment[]) => {
    setAssignments(newAssignments);
    localStorage.setItem("assignments", JSON.stringify(newAssignments));
  };

  const createAssignment = () => {
    if (!form.title || !form.subject || !form.due) return;
    const newAssignments = [
      ...assignments,
      { id: Date.now().toString(), title: form.title, subject: form.subject, due: form.due, submittedUsers: [] }
    ];
    saveAssignments(newAssignments);
    setForm({ title: "", subject: "", due: "" });
    setOpen(false);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">Assignment Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Create Assignment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <Input placeholder="Assignment Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              <Input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} />
              <Button className="w-full" onClick={createAssignment}>Publish Assignment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {assignments.length === 0 && <p className="text-gray-500 text-sm">No assignments created yet.</p>}
        {assignments.map((a) => (
          <div key={a.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-foreground">{a.title}</div>
              <div className="text-xs text-muted-foreground">{a.subject} · Due: {new Date(a.due).toLocaleDateString()}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                {a.submittedUsers.length} Submitted
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherAssignments;
