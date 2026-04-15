import DashboardCard from "@/components/DashboardCard";
import { FileText, QrCode, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const TeacherDashboard = () => {
  const { userName } = useAuth();

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-6">
        <h1 className="section-title">Welcome, {userName}!</h1>
        <p className="text-muted-foreground text-sm mt-1">Teacher dashboard</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title="Assignments" description="Manage and track student assignments" icon={FileText} to="/teacher/assignments" primary />
        <DashboardCard title="QR Attendance" description="Generate QR codes for attendance" icon={QrCode} to="/teacher/qr-attendance" />
        <DashboardCard title="Timetable" description="View your weekly schedule" icon={Clock} to="/teacher/timetable" />
      </div>
    </div>
  );
};

export default TeacherDashboard;
