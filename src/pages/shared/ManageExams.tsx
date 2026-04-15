import React, { useState, useEffect } from "react";
import { Plus, MonitorPlay, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export interface Exam {
  id: string;
  title: string;
  duration: number; // in minutes
  mcq: {
    question: string;
    options: string[];
    answer: number;
  };
  coding: {
    question: string;
    sampleInput: string;
    sampleOutput: string;
  };
}

export interface ExamSubmission {
  id: string;
  examId: string;
  examTitle: string;
  studentName: string;
  mcqAnswer: number;
  codeProvided: string;
  durationTaken: number;
  warnings: number;
}

const ManageExams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [open, setOpen] = useState(false);
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [viewingExamId, setViewingExamId] = useState<string | null>(null);
  
  // Basic form state
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(60);
  const [mcqQ, setMcqQ] = useState("");
  const [mcqOptions, setMcqOptions] = useState("Option 1, Option 2, Option 3, Option 4");
  const [codingQ, setCodingQ] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("proctored_exams");
    if (saved) {
      setExams(JSON.parse(saved));
    }
    const subs = localStorage.getItem("exam_submissions");
    if (subs) {
      setSubmissions(JSON.parse(subs));
    }
  }, []);

  const createExam = () => {
    if (!title || !mcqQ || !codingQ) return;
    
    const newExam: Exam = {
      id: Date.now().toString(),
      title,
      duration: duration * 60, // convert back to seconds for student view
      mcq: {
        question: mcqQ,
        options: mcqOptions.split(",").map(s => s.trim()),
        answer: 0
      },
      coding: {
        question: codingQ,
        sampleInput: "n = 5",
        sampleOutput: "5"
      }
    };
    
    const updated = [...exams, newExam];
    setExams(updated);
    localStorage.setItem("proctored_exams", JSON.stringify(updated));
    setOpen(false);
    // Reset
    setTitle("");
    setMcqQ("");
    setCodingQ("");
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">Manage Proctored Exams</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Create Exam</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Proctored Exam</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2 max-h-[70vh] overflow-y-auto px-1">
              <div>
                <label className="text-xs font-semibold">Exam Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Final Assessment" />
              </div>
              <div>
                <label className="text-xs font-semibold">Duration (Minutes)</label>
                <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
              </div>
              
              <div className="pt-2 border-t text-sm font-semibold text-primary">MCQ Section</div>
              <div>
                <label className="text-xs font-semibold">Question</label>
                <Input value={mcqQ} onChange={(e) => setMcqQ(e.target.value)} placeholder="What is 2+2?" />
              </div>
              <div>
                <label className="text-xs font-semibold">Options (Comma separated)</label>
                <Input value={mcqOptions} onChange={(e) => setMcqOptions(e.target.value)} />
              </div>

              <div className="pt-2 border-t text-sm font-semibold text-primary">Coding Section</div>
              <div>
                <label className="text-xs font-semibold">Problem Statement</label>
                <Textarea value={codingQ} onChange={(e) => setCodingQ(e.target.value)} placeholder="Write a program to..." rows={3} />
              </div>

              <Button className="w-full mt-4" onClick={createExam}>Publish Exam</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {exams.length === 0 && <p className="text-gray-500 text-sm">No exams created yet.</p>}
        {exams.map((exam) => (
          <div key={exam.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MonitorPlay className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-foreground">{exam.title}</div>
              <div className="text-xs text-muted-foreground">{Math.round(exam.duration / 60)} Minutes · Proctored</div>
            </div>
            <div className="text-right flex-shrink-0 flex items-center gap-3">
              <Button size="sm" variant="outline" onClick={() => setViewingExamId(exam.id)}>
                View Submissions
              </Button>
              <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                {submissions.filter(s => s.examId === exam.id).length}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!viewingExamId} onOpenChange={(open) => !open && setViewingExamId(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Exam Submissions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {submissions.filter(s => s.examId === viewingExamId).length === 0 ? (
              <p className="text-gray-500">No students have submitted this exam yet.</p>
            ) : (
              submissions.filter(s => s.examId === viewingExamId).map(sub => (
                <div key={sub.id} className="border rounded-lg p-4 bg-gray-50/50 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg">{sub.studentName}</h4>
                      <p className="text-sm text-muted-foreground">Time taken: {Math.round(sub.durationTaken / 60)} minutes</p>
                    </div>
                    {sub.warnings >= 3 ? (
                      <span className="bg-destructive/10 text-destructive px-2 py-1 rounded text-xs font-bold ring-1 ring-destructive/20">Auto-Submitted (AI Violations: {sub.warnings})</span>
                    ) : (
                      <span className="bg-warning/10 text-warning px-2 py-1 rounded text-xs font-bold ring-1 ring-warning/20">AI Violations: {sub.warnings}</span>
                    )}
                  </div>
                  
                  <div className="pt-2 border-t mt-2">
                    <div className="text-sm font-semibold mb-1">Selected MCQ Option Index: <span className="font-normal border rounded px-2 py-0.5 bg-white">{sub.mcqAnswer}</span></div>
                    <div className="text-sm font-semibold mb-1 mt-3">Submitted Code:</div>
                    <pre className="bg-[#1e1e1e] text-blue-300 p-3 rounded-md text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                      {sub.codeProvided}
                    </pre>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageExams;
