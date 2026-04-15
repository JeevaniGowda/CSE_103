import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import QuizPage from "./pages/student/QuizPage";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentAssignments from "./pages/student/StudentAssignments";
import AIChatBot from "./pages/student/AIChatBot";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherAssignments from "./pages/teacher/TeacherAssignments";
import QRAttendance from "./pages/teacher/QRAttendance";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageTeachers from "./pages/admin/ManageTeachers";
import Timetable from "./pages/shared/Timetable";
import ManageExams from "./pages/shared/ManageExams";
import NotFound from "./pages/NotFound";

import ProctoredExam from "./pages/student/ProctoredExam";
import ConsultationBooking from "./pages/student/ConsultationBooking";
import ConsultationRequests from "./pages/teacher/ConsultationRequests";
import FeePayment from "./pages/student/FeePayment";
import ManageFees from "./pages/admin/ManageFees";
import CreateNotification from "./pages/admin/CreateNotification";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Student Routes */}
            <Route path="/student" element={<DashboardLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="quiz" element={<QuizPage />} />
              <Route path="attendance" element={<StudentAttendance />} />
              <Route path="timetable" element={<Timetable />} />
              <Route path="assignments" element={<StudentAssignments />} />
              <Route path="chat" element={<AIChatBot />} />
              <Route path="exam" element={<ProctoredExam />} />
              <Route path="fees" element={<FeePayment />} />
              <Route path="consultation" element={<ConsultationBooking />} />
            </Route>

            {/* Teacher Routes */}
            <Route path="/teacher" element={<DashboardLayout />}>
              <Route index element={<TeacherDashboard />} />
              <Route path="assignments" element={<TeacherAssignments />} />
              <Route path="qr-attendance" element={<QRAttendance />} />
              <Route path="timetable" element={<Timetable />} />
              <Route path="exams" element={<ManageExams />} />
              <Route path="consultations" element={<ConsultationRequests />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<ManageStudents />} />
              <Route path="teachers" element={<ManageTeachers />} />
              <Route path="fees" element={<ManageFees />} />
              <Route path="notifications" element={<CreateNotification />} />
              <Route path="exams" element={<ManageExams />} />
              <Route path="timetable" element={<Timetable />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
