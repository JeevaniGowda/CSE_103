import DashboardCard from "@/components/DashboardCard";
import { GraduationCap, Users, Clock, CreditCard, BellRing, MonitorPlay, CalendarDays, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const AdminDashboard = () => {
  const { userName } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const generateTimetable = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ 
        title: "Generation Successful", 
        description: "All timetables have been synchronized for the semester." 
      });
    }, 1500);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="section-title text-3xl font-black text-slate-900">Admin Control Center ⚡</h1>
          <p className="text-muted-foreground text-sm mt-1">System wide management and controls</p>
        </div>
        <Button 
          onClick={generateTimetable} 
          disabled={loading}
          variant="outline"
          className="bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary h-11 px-6 rounded-xl font-bold"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CalendarDays className="w-4 h-4 mr-2" />
          )}
          Generate All Timetables
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard 
          title="Manage Students" 
          description="Enrolment, details and records" 
          icon={GraduationCap} 
          to="students" 
          primary 
        />
        <DashboardCard 
          title="Manage Teachers" 
          description="Staff recruitment and assignments" 
          icon={Users} 
          to="teachers" 
        />
        <DashboardCard 
          title="Timetable" 
          description="View and adjust schedules" 
          icon={Clock} 
          to="timetable" 
        />
        <DashboardCard 
          title="Manage Fees" 
          description="Financial records and tracking" 
          icon={CreditCard} 
          to="fees" 
        />
        <DashboardCard 
          title="Broadcast Alerts" 
          description="Send emergency notifications" 
          icon={BellRing} 
          to="notifications" 
        />
        <DashboardCard 
          title="Manage Exams" 
          description="Final testing and evaluations" 
          icon={MonitorPlay} 
          to="exams" 
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
