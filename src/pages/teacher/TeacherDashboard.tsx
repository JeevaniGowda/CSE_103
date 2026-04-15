import DashboardCard from "@/components/DashboardCard";
import { FileText, QrCode, Clock, MonitorPlay, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const TeacherDashboard = () => {
  const { userName } = useAuth();

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-8">
        <h1 className="section-title text-3xl font-black">Welcome, {userName}! 🎓</h1>
        <p className="text-muted-foreground text-sm mt-2">Manage your classes and students</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard 
          title="Assignments" 
          description="Manage and track student assignments" 
          icon={FileText} 
          to="assignments" 
          primary 
        />
        <DashboardCard 
          title="QR Attendance" 
          description="Generate QR codes for attendance" 
          icon={QrCode} 
          to="qr-attendance" 
        />
        <DashboardCard 
          title="Timetable" 
          description="View your weekly teaching schedule" 
          icon={Clock} 
          to="timetable" 
        />
        <DashboardCard 
          title="Manage Exams" 
          description="Schedule and monitor examinations" 
          icon={MonitorPlay} 
          to="exams" 
        />
        <DashboardCard 
          title="Consultation Reqs" 
          description="View and respond to student requests" 
          icon={MessageSquare} 
          to="consultations" 
        />
      </div>
    </div>
  );
};

export default TeacherDashboard;
