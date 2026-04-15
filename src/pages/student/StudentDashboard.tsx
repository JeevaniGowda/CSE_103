import DashboardCard from "@/components/DashboardCard";
import { FileQuestion, CalendarCheck, Clock, FileText, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const StudentDashboard = () => {
  const { userName } = useAuth();

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-6">
        <h1 className="section-title">Welcome back, {userName}!</h1>
        <p className="text-muted-foreground text-sm mt-1">Your student dashboard overview</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title="Daily Quiz" description="Test your knowledge with today's quiz" icon={FileQuestion} to="/student/quiz" primary />
        <DashboardCard title="Attendance" description="View your attendance history" icon={CalendarCheck} to="/student/attendance" />
        <DashboardCard title="Timetable" description="Check your weekly schedule" icon={Clock} to="/student/timetable" />
        <DashboardCard title="Assignments" description="View and submit assignments" icon={FileText} to="/student/assignments" />
        <DashboardCard title="AI ChatBot" description="Get instant academic support" icon={MessageSquare} to="/student/chat" />
      </div>
    </div>
  );
};

export default StudentDashboard;
