import React, { useState, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  BookOpen, LogOut, LayoutDashboard, FileQuestion, CalendarCheck, Clock,
  FileText, MessageSquare, QrCode, Users, GraduationCap, ChevronRight,
  MonitorPlay, CreditCard, Bell, BellRing, Menu, X
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications } from "@/contexts/NotificationContext";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNav } from "@/contexts/NavContext";

// ── Student pages ─────────────────────────────────────────────────────────────
import StudentDashboard from "@/pages/student/StudentDashboard";
import QuizPage from "@/pages/student/QuizPage";
import StudentAttendance from "@/pages/student/StudentAttendance";
import StudentAssignments from "@/pages/student/StudentAssignments";
import AIChatBot from "@/pages/student/AIChatBot";
import ProctoredExam from "@/pages/student/ProctoredExam";
import FeePayment from "@/pages/student/FeePayment";
import ConsultationBooking from "@/pages/student/ConsultationBooking";

// ── Teacher pages ─────────────────────────────────────────────────────────────
import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import TeacherAssignments from "@/pages/teacher/TeacherAssignments";
import QRAttendance from "@/pages/teacher/QRAttendance";
import ConsultationRequests from "@/pages/teacher/ConsultationRequests";

// ── Admin pages ───────────────────────────────────────────────────────────────
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ManageStudents from "@/pages/admin/ManageStudents";
import ManageTeachers from "@/pages/admin/ManageTeachers";
import ManageFees from "@/pages/admin/ManageFees";
import CreateNotification from "@/pages/admin/CreateNotification";

// ── Shared pages ──────────────────────────────────────────────────────────────
import Timetable from "@/pages/shared/Timetable";
import ManageExams from "@/pages/shared/ManageExams";

// ── Nav definitions ───────────────────────────────────────────────────────────
type NavItem = { id: string; title: string; icon: React.ElementType; component: React.ComponentType };

const studentNav: NavItem[] = [
  { id: "dashboard",    title: "Dashboard",      icon: LayoutDashboard, component: StudentDashboard },
  { id: "quiz",         title: "Daily Quiz",     icon: FileQuestion,    component: QuizPage },
  { id: "attendance",   title: "Attendance",     icon: CalendarCheck,   component: StudentAttendance },
  { id: "timetable",    title: "Timetable",      icon: Clock,           component: Timetable },
  { id: "assignments",  title: "Assignments",    icon: FileText,        component: StudentAssignments },
  { id: "chat",         title: "AI ChatBot",     icon: MessageSquare,   component: AIChatBot },
  { id: "exam",         title: "Proctored Exam", icon: MonitorPlay,     component: ProctoredExam },
  { id: "fees",         title: "Fee Payment",    icon: CreditCard,      component: FeePayment },
  { id: "consultation", title: "Consultation",   icon: MessageSquare,   component: ConsultationBooking },
];

const teacherNav: NavItem[] = [
  { id: "dashboard",     title: "Dashboard",          icon: LayoutDashboard, component: TeacherDashboard },
  { id: "assignments",   title: "Assignments",        icon: FileText,        component: TeacherAssignments },
  { id: "qr-attendance", title: "QR Attendance",      icon: QrCode,          component: QRAttendance },
  { id: "timetable",     title: "Timetable",          icon: Clock,           component: Timetable },
  { id: "exams",         title: "Manage Exams",       icon: MonitorPlay,     component: ManageExams },
  { id: "consultations", title: "Consultation Reqs",  icon: MessageSquare,   component: ConsultationRequests },
];

const adminNav: NavItem[] = [
  { id: "dashboard",     title: "Dashboard",       icon: LayoutDashboard, component: AdminDashboard },
  { id: "students",      title: "Manage Students", icon: GraduationCap,   component: ManageStudents },
  { id: "teachers",      title: "Manage Teachers", icon: Users,           component: ManageTeachers },
  { id: "timetable",     title: "Timetable",       icon: Clock,           component: Timetable },
  { id: "fees",          title: "Manage Fees",     icon: CreditCard,      component: ManageFees },
  { id: "notifications", title: "Broadcast Alerts",icon: BellRing,        component: CreateNotification },
  { id: "exams",         title: "Manage Exams",    icon: MonitorPlay,     component: ManageExams },
];

// ── Right overview panel ──────────────────────────────────────────────────────
function RightPanel({ role }: { role: string }) {
  return (
    <aside className="hidden lg:flex w-72 flex-col border-l border-border bg-card p-5 gap-5 animate-fade-in flex-shrink-0">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Overview</h2>
      </div>

      {role === "student" && (
        <>
          <div className="p-5 rounded-3xl bg-primary/5 border border-primary/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-primary/10 rounded-xl"><CalendarCheck className="w-4 h-4 text-primary" /></div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+2% this week</span>
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">85%</p>
              <p className="text-[11px] font-bold text-muted-foreground uppercase">Average Attendance</p>
            </div>
            <div className="w-full bg-primary/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[85%]" />
            </div>
          </div>
          <div className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-xl"><Clock className="w-4 h-4 text-amber-500" /></div>
              <p className="text-[11px] font-bold text-amber-500 uppercase">Up Next</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">DBMS (Lab 1)</p>
              <p className="text-[11px] text-muted-foreground font-medium">12:00 PM - 01:00 PM</p>
            </div>
          </div>
          <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-3 shadow-xl shadow-slate-900/10">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">New Alert</p>
            </div>
            <p className="text-sm font-medium leading-relaxed">Semester registration starts this Monday. Check fee portal.</p>
          </div>
        </>
      )}

      {role === "teacher" && (
        <div className="p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 space-y-4">
          <div className="flex items-center gap-3 text-indigo-500">
            <Users className="w-4 h-4" />
            <p className="text-[11px] font-bold uppercase">Class Progress</p>
          </div>
          {[["Year 1 - CS", "92%", 92], ["Year 2 - IT", "78%", 78]].map(([cls, pct, w]) => (
            <div key={cls as string}>
              <div className="flex justify-between text-[11px] font-bold mb-1">
                <span>{cls}</span><span>{pct}</span>
              </div>
              <div className="bg-indigo-500/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full" style={{ width: `${w}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {role === "admin" && (
        <div className="p-5 rounded-3xl bg-slate-100 border border-slate-200 space-y-4">
          <div className="flex items-center gap-3">
            <MonitorPlay className="w-4 h-4 text-slate-500" />
            <p className="text-[11px] font-black uppercase text-slate-500">System Load</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[["1.2k", "Students"], ["45", "Teachers"]].map(([val, lbl]) => (
              <div key={lbl} className="p-3 bg-white rounded-2xl border border-slate-100">
                <p className="text-xl font-bold">{val}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">{lbl}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

// ── Main DashboardLayout ───────────────────────────────────────────────────────
const DashboardLayout = () => {
  const { isAuthenticated, role, userName, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { activeId, handleNav: doNav } = useNav();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  if (!isAuthenticated || !role) return <Navigate to="/login" replace />;

  const navItems = role === "student" ? studentNav : role === "teacher" ? teacherNav : adminNav;
  const roleLabel = role === "student" ? "Student" : role === "teacher" ? "Teacher" : "Admin";
  const activeItem = navItems.find(n => n.id === activeId) || navItems[0];
  const ActivePage = activeItem.component;

  const handleNav = useCallback((id: string) => {
    doNav(id);
    setSidebarOpen(prev => {
      // Auto-close sidebar on mobile
      if (window.innerWidth < 768) return false;
      return prev;
    });
  }, [doNav]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex w-full bg-[#F8FAFC]">
      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside
        className={`
          flex-shrink-0 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-56" : "w-16"}
          h-screen sticky top-0 z-20
        `}
      >
        {/* Logo */}
        <div className={`p-4 flex items-center gap-2.5 border-b border-sidebar-border h-14`}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div className="font-bold text-sm truncate">SmartCampus</div>
              <div className="text-[10px] text-sidebar-foreground/50">{roleLabel} Portal</div>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {!sidebarOpen && (
            <p className="text-[9px] font-bold uppercase tracking-widest text-sidebar-foreground/30 px-2 pt-1 pb-2">
              Nav
            </p>
          )}
          {sidebarOpen && (
            <p className="text-[9px] font-bold uppercase tracking-widest text-sidebar-foreground/40 px-3 pt-1 pb-2">
              Navigation
            </p>
          )}
          {navItems.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                title={!sidebarOpen ? item.title : undefined}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm
                  ${isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }
                `}
              >
                <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 truncate">{item.title}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className={`mt-auto border-t border-sidebar-border p-3 ${sidebarOpen ? "" : "flex justify-center"}`}>
          {sidebarOpen ? (
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                {userName?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium truncate">{userName}</div>
                <div className="text-[10px] text-sidebar-foreground/50">{roleLabel}</div>
              </div>
            </div>
          ) : null}
          <button
            onClick={handleLogout}
            title="Logout"
            className={`
              flex items-center gap-2 text-sidebar-foreground/50 hover:text-destructive
              transition-colors text-xs rounded-lg px-2 py-1.5 hover:bg-destructive/5 w-full
              ${sidebarOpen ? "" : "justify-center"}
            `}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <VoiceAssistant />
            {role !== "admin" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 rounded-full text-[10px]">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <h4 className="font-semibold text-sm mb-3">Notifications</h4>
                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No notifications.</p>
                    ) : notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`p-3 rounded-lg border text-sm cursor-pointer transition-all
                          ${n.read ? "bg-secondary border-transparent text-muted-foreground" : "bg-blue-50/50 border-blue-100 text-foreground shadow-sm hover:shadow"}`}
                      >
                        <p className="font-medium mb-0.5">{n.title}</p>
                        <p className="text-xs">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1.5">{new Date(n.date).toLocaleTimeString()}</p>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </header>

        {/* Page content — swaps without unmounting layout */}
        <main className="flex-1 overflow-auto flex">
          <div className="flex-1 min-w-0">
            <ActivePage key={activeId} />
          </div>
          <RightPanel role={role} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
