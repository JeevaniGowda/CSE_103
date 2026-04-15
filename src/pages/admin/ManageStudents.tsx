import { useState, useEffect } from "react";
import { Plus, Trash2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

interface Student {
  _id: string;
  name: string;
  email: string;
  department?: string;
}

const ManageStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", department: "" });
  const { token } = useAuth();

  const fetchStudents = () => {
    if (!token) return;
    fetch("http://localhost:5000/api/admin/students", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStudents(data);
      })
      .catch(err => console.error("Error fetching students", err));
  };

  useEffect(() => {
    fetchStudents();
  }, [token]);

  const addStudent = async () => {
    if (!form.name || !form.email) return;
    
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Set a default password '1234' for manually added users via Admin panel
        body: JSON.stringify({ name: form.name, email: form.email, password: "1234", role: "student" })
      });
      
      if (response.ok) {
        fetchStudents(); // Reload from DB to get real MongoDB _id
        setForm({ name: "", email: "", department: "" });
        setOpen(false);
      } else {
        console.error("Failed to add student:", await response.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        fetchStudents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">Manage Students</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Student</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <Input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              <Button className="w-full" onClick={addStudent}>Add Student</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Department</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="border-b border-border last:border-0">
                <td className="p-3 text-foreground flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-3.5 h-3.5 text-primary" />
                  </div>
                  {s.name}
                </td>
                <td className="p-3 text-muted-foreground">{s.email}</td>
                <td className="p-3 text-foreground">{s.department}</td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => deleteStudent(s._id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageStudents;
