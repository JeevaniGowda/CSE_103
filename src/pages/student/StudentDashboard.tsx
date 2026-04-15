import DashboardCard from "@/components/DashboardCard";
import { 
  FileQuestion, CalendarCheck, Clock, FileText, 
  MessageSquare, MonitorPlay, CreditCard, Sparkles 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const StudentDashboard = () => {
  const { userName } = useAuth();

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-8">
        <h1 className="section-title text-3xl font-black">Welcome back, {userName}! 👋</h1>
        <p className="text-muted-foreground text-sm mt-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          What would you like to do today?
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard 
          title="Daily Quiz" 
          description="Test your knowledge with today's quiz" 
          icon={FileQuestion} 
          to="quiz" 
          primary 
        />
        <DashboardCard 
          title="Attendance" 
          description="View your attendance history" 
          icon={CalendarCheck} 
          to="attendance" 
        />
        <DashboardCard 
          title="Timetable" 
          description="Check your weekly schedule" 
          icon={Clock} 
          to="timetable" 
        />
        <DashboardCard 
          title="Assignments" 
          description="View and submit assignments" 
          icon={FileText} 
          to="assignments" 
        />
        <DashboardCard 
          title="AI ChatBot" 
          description="Get instant academic support" 
          icon={MessageSquare} 
          to="chat" 
        />
        <DashboardCard 
          title="Proctored Exam" 
          description="Take your scheduled examinations" 
          icon={MonitorPlay} 
          to="exam" 
        />
        <DashboardCard 
          title="Fee Payment" 
          description="Manage and pay your tuition fees" 
          icon={CreditCard} 
          to="fees" 
        />
        <DashboardCard 
          title="Consultation" 
          description="Book a session with your teacher" 
          icon={MessageSquare} 
          to="consultation" 
        />
      </div>
    </div>
  );
};

export default StudentDashboard;
