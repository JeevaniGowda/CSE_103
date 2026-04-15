import { useState, useEffect } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

interface Teacher {
  _id: string;
  name: string;
  email: string;
  subject?: string;
}

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "" });
  const { token } = useAuth();

  const fetchTeachers = () => {
    if (!token) return;
    fetch("http://localhost:5000/api/admin/teachers", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTeachers(data);
      })
      .catch(err => console.error("Error fetching teachers", err));
  };

  useEffect(() => {
    fetchTeachers();
  }, [token]);

  const addTeacher = async () => {
    if (!form.name || !form.email) return;
    
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: form.name, 
          email: form.email, 
          password: "1234", 
          role: "teacher", 
          subject: form.subject,
          className: undefined 
        })
      });
      
      if (response.ok) {
        fetchTeachers(); // Reload from DB to get real MongoDB _id
        setForm({ name: "", email: "", subject: "" });
        setOpen(false);
      } else {
        console.error("Failed to add teacher:", await response.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTeacher = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        fetchTeachers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">Manage Teachers</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Teacher</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <Input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              <Button className="w-full" onClick={addTeacher}>Add Teacher</Button>
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
              <th className="text-left p-3 font-medium text-muted-foreground">Subject</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t._id} className="border-b border-border last:border-0">
                <td className="p-3 text-foreground flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-3.5 h-3.5 text-accent" />
                  </div>
                  {t.name}
                </td>
                <td className="p-3 text-muted-foreground">{t.email}</td>
                <td className="p-3 text-foreground">{t.subject}</td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => deleteTeacher(t._id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
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

export default ManageTeachers;
