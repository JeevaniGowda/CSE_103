import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { BookOpen, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (isRegistering && !name.trim()) return;
    
    setLoading(true);
    try {
      const url = isRegistering ? "http://localhost:5000/api/register" : "http://localhost:5000/api/login";
      const bodyParams = isRegistering ? { name, email, password, role } : { email, password };

      const response = await fetch(url, {
        method: "POST",
        headers: {
           "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyParams)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }
      
      if (isRegistering) {
        toast({ title: "Registration Successful", description: "You can now log in." });
        setIsRegistering(false);
        setPassword("");
      } else {
        login(data.token, data.user.role, data.user.name, data.user.id, data.user.email, data.user.className);
        navigate(`/${data.user.role}`);
      }
    } catch (err: any) {
      toast({
        title: "Authentication Error",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-display text-foreground">SmartCampus</h1>
          <p className="text-muted-foreground mt-1">Curriculum, Activity & Attendance</p>
        </div>

        <form onSubmit={handleAuth} className="bg-card rounded-2xl border border-border p-6 space-y-5 shadow-sm transition-shadow">
          {isRegistering && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Username</label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11"
                required={isRegistering}
              />
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Email Address</label>
            <Input
              type="email"
              placeholder="user@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
              required
            />
          </div>
          
          {isRegistering && (
             <div>
               <label className="text-sm font-medium text-foreground mb-1.5 block">Select Role</label>
               <select 
                  className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                 <option value="student">Student</option>
                 <option value="teacher">Teacher</option>
                 <option value="admin">Admin</option>
               </select>
             </div>
          )}

          <Button type="submit" className="w-full h-11 font-semibold" disabled={loading || !email.trim() || !password.trim()}>
            {isRegistering ? <UserPlus className="w-4 h-4 mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
            {loading ? "Processing..." : (isRegistering ? "Create Account" : "Sign In")}
          </Button>
          
          <div className="text-center mt-4">
             <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-sm text-primary hover:underline font-medium">
               {isRegistering ? "Already have an account? Sign In" : "Need an account? Register here"}
             </button>
          </div>
          
          {!isRegistering && (
            <p className="text-xs text-center text-gray-500 mt-4">
              Demo Logins: admin@gmail.com | student1@gmail.com | teacher1@gmail.com (Password: 1234)
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
