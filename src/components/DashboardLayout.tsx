import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  BookOpen, LogOut, LayoutDashboard, FileQuestion, CalendarCheck, Clock,
  FileText, MessageSquare, QrCode, Users, GraduationCap, ChevronRight,
  MonitorPlay, CreditCard, Bell, BellRing
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications } from "@/contexts/NotificationContext";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { Badge } from "@/components/ui/badge";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const studentNav = [
  { title: "Dashboard", url: "/student", icon: LayoutDashboard },
  { title: "Daily Quiz", url: "/student/quiz", icon: FileQuestion },
  { title: "Attendance", url: "/student/attendance", icon: CalendarCheck },
  { title: "Timetable", url: "/student/timetable", icon: Clock },
  { title: "Assignments", url: "/student/assignments", icon: FileText },
  { title: "AI ChatBot", url: "/student/chat", icon: MessageSquare },
  { title: "Proctored Exam", url: "/student/exam", icon: MonitorPlay },
  { title: "Fee Payment", url: "/student/fees", icon: CreditCard },
  { title: "Consultation", url: "/student/consultation", icon: MessageSquare },
];

const teacherNav = [
  { title: "Dashboard", url: "/teacher", icon: LayoutDashboard },
  { title: "Assignments", url: "/teacher/assignments", icon: FileText },
  { title: "QR Attendance", url: "/teacher/qr-attendance", icon: QrCode },
  { title: "Timetable", url: "/teacher/timetable", icon: Clock },
  { title: "Manage Exams", url: "/teacher/exams", icon: MonitorPlay },
  { title: "Consultation Reqs", url: "/teacher/consultations", icon: MessageSquare },
];

const adminNav = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Manage Students", url: "/admin/students", icon: GraduationCap },
  { title: "Manage Teachers", url: "/admin/teachers", icon: Users },
  { title: "Timetable", url: "/admin/timetable", icon: Clock },
  { title: "Manage Fees", url: "/admin/fees", icon: CreditCard },
  { title: "Broadcast Alerts", url: "/admin/notifications", icon: BellRing },
  { title: "Manage Exams", url: "/admin/exams", icon: MonitorPlay },
];

function AppSidebarContent() {
  const { role, userName, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const navItems = role === "student" ? studentNav : role === "teacher" ? teacherNav : adminNav;
  const roleLabel = role === "student" ? "Student" : role === "teacher" ? "Teacher" : "Admin";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <div className="font-display font-bold text-sm text-sidebar-foreground">SmartCampus</div>
              <div className="text-[10px] text-sidebar-muted">{roleLabel} Portal</div>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-wider">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={`hover:bg-sidebar-accent ${isActive ? "bg-sidebar-accent text-sidebar-primary font-medium" : ""}`}
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                        {!collapsed && isActive && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-3">
          {!collapsed && (
            <div className="mb-3 px-2">
              <div className="text-xs font-medium text-sidebar-foreground truncate">{userName}</div>
              <div className="text-[10px] text-sidebar-muted">{roleLabel}</div>
            </div>
          )}
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            onClick={logout}
            className="w-full text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}


function RightPanel() {
  const { role } = useAuth();
  
  return (
    <aside className="hidden lg:flex w-80 flex-col border-l border-border bg-card p-6 gap-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground opacity-60">Overview</h2>
      </div>

      {role === 'student' && (
        <>
          {/* Attendance Widget */}
          <div className="p-5 rounded-3xl bg-primary/5 border border-primary/10 space-y-3">
             <div className="flex items-center justify-between">
               <div className="p-2 bg-primary/10 rounded-xl">
                 <CalendarCheck className="w-4 h-4 text-primary" />
               </div>
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

          {/* Upcoming Class */}
          <div className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/10 space-y-3">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-amber-500/10 rounded-xl">
                 <Clock className="w-4 h-4 text-amber-500" />
               </div>
               <p className="text-[11px] font-bold text-amber-500 uppercase">Up Next</p>
             </div>
             <div>
               <p className="text-lg font-bold text-foreground">DBMS (Lab 1)</p>
               <p className="text-[11px] text-muted-foreground font-medium">12:00 PM - 01:00 PM</p>
             </div>
          </div>

          {/* Quick Notice */}
          <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-3 shadow-xl shadow-slate-900/10">
             <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-primary" />
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">New Alert</p>
             </div>
             <p className="text-sm font-medium leading-relaxed">Semester registration starts this Monday. Check fee portal.</p>
          </div>
        </>
      )}

      {role === 'teacher' && (
        <>
          <div className="p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 space-y-4">
             <div className="flex items-center gap-3 text-indigo-500">
               <Users className="w-4 h-4" />
               <p className="text-[11px] font-bold uppercase">Class Progress</p>
             </div>
             <div className="space-y-4">
               <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span>Year 1 - CS</span>
                    <span>92%</span>
                  </div>
                  <div className="bg-indigo-500/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full w-[92%]" />
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span>Year 2 - IT</span>
                    <span>78%</span>
                  </div>
                  <div className="bg-indigo-500/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full w-[78%]" />
                  </div>
               </div>
             </div>
          </div>
        </>
      )}

      {role === 'admin' && (
        <>
          <div className="p-5 rounded-3xl bg-slate-100 border border-slate-200 space-y-4">
             <div className="flex items-center gap-3">
                <MonitorPlay className="w-4 h-4 text-slate-500" />
                <p className="text-[11px] font-black uppercase text-slate-500">System Load</p>
             </div>
             <div className="grid grid-cols-2 gap-3">
               <div className="p-3 bg-white rounded-2xl border border-slate-100">
                  <p className="text-xl font-bold">1.2k</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Students</p>
               </div>
               <div className="p-3 bg-white rounded-2xl border border-slate-100">
                  <p className="text-xl font-bold">45</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Teachers</p>
               </div>
             </div>
          </div>
        </>
      )}
    </aside>
  );
}

const DashboardLayout = () => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated || !role) return <Navigate to="/login" replace />;

  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebarContent />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4 sticky top-0 z-10 w-full">
            <SidebarTrigger />
            
            <div className="flex items-center gap-4 ml-auto">
              <VoiceAssistant />
              {role !== 'admin' && ( // Admin broadcasts, others view
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="w-5 h-5 text-gray-600" />
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 rounded-full text-[10px]">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                      <h4 className="font-semibold leading-none mb-3">Notifications</h4>
                      <div className="max-h-80 overflow-y-auto space-y-2">
                        {notifications.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">No notifications.</p>
                        ) : notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            className={`p-3 rounded-lg border text-sm transition-all ${
                              notif.read ? 'bg-gray-50 border-transparent text-gray-500' : 'bg-blue-50/50 border-blue-100 text-gray-900 cursor-pointer shadow-sm hover:shadow'
                            }`}
                            onClick={() => markAsRead(notif.id)}
                          >
                            <p className="font-medium mb-1">{notif.title}</p>
                            <p className="text-xs">{notif.message}</p>
                            <p className="text-[10px] text-gray-400 mt-2">{new Date(notif.date).toLocaleTimeString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-[#F8FAFC]">
            <Outlet />
          </main>
        </div>
        <RightPanel />
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
