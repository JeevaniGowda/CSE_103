import DashboardCard from "@/components/DashboardCard";
import { GraduationCap, Users, CalendarDays, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const AdminDashboard = () => {
  const { userName, token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const generateTimetable = async () => {
    setLoading(true);
    // Simulate generation delay
    setTimeout(() => {
      setLoading(false);
      toast({ 
        title: "Generation Successful", 
        description: "Year 1 - CS timetable has been synchronized for all users." 
      });
    }, 1500);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Admin Panel</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome, {userName}</p>
        </div>
        <Button 
          onClick={generateTimetable} 
          disabled={loading}
          variant="outline"
          className="bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CalendarDays className="w-4 h-4 mr-2" />
          )}
          Generate All Timetables
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title="Manage Students" description="Add, view, and remove students" icon={GraduationCap} to="/admin/students" primary />
        <DashboardCard title="Manage Teachers" description="Add, view, and remove teachers" icon={Users} to="/admin/teachers" />
      </div>
    </div>
  );
};

export default AdminDashboard;
