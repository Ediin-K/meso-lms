import React from "react";
import Home from "./pages/Home.jsx";
import Header from "./components/ui/Header.jsx";
import Login from "./pages/Login.jsx";
import About from "./pages/About.jsx";
import CourseDetail from "./pages/CourseDetail.jsx";
import LessonDetail from "./pages/LessonDetail.jsx";
import Contact from "./pages/ContactUs.jsx";
import SemesterPage from "./pages/SemesterPage.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import CoursesPage from "./pages/CoursesPage.jsx";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAppPreferences } from "./context/appPreferencesContext.js";
import "swiper/css";
import Notifications from "./pages/Notifications.jsx";
import StudentDashboard from "./components/dashboard/StudentDashboard.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import TeacherDashboard from "./pages/teacher/TeacherDashboard.jsx";
import AssignmentPage from "./pages/AssignmentPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminDashboard from "./components/dashboard/AdminDashboard.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminCourses from "./pages/AdminCourses.jsx";
import AdminCategories from "./pages/AdminCategories.jsx";
import AdminTeachers from "./pages/AdminTeachers.jsx";
import AdminEnrollments from "./pages/AdminEnrollments.jsx";
import AdminCertificates from "./pages/AdminCertificates.jsx";
import AdminReports from "./pages/AdminReports.jsx";
import AdminSchedules from "./pages/AdminSchedules.jsx";
import StudentSchedules from "./pages/StudentSchedules.jsx";
import StudentGroups from "./pages/StudentGroups.jsx";
import AdminGroupApplications from "./pages/AdminGroupApplications.jsx";
import AdminGroups from "./pages/AdminGroups.jsx";
import ConsentBanner from "./components/cookies/ConsentBanner.jsx";
import TeacherLayout from "./layouts/TeacherLayout.jsx";
import TeacherCourses from "./pages/teacher/TeacherCourses.jsx";
import TeacherModules from "./pages/teacher/TeacherModules.jsx";
import TeacherLessons from "./pages/teacher/TeacherLessons.jsx";
import TeacherQuizzes from "./pages/teacher/TeacherQuizzes.jsx";
import TeacherAssignments from "./pages/teacher/TeacherAssignments.jsx";
import TeacherStudents from "./pages/teacher/TeacherStudents.jsx";

function RootRedirect() {
  const { isAuthenticated, role } = useAppPreferences();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "teacher") return <Navigate to="/teacher" replace />;
  if (role === "student") return <Navigate to="/student" replace />;

  return <Home />;
}

function CatchAllRedirect() {
  const { isAuthenticated } = useAppPreferences();
  return <Navigate to={isAuthenticated ? "/" : "/login"} replace />;
}

function AppLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
      <div className="flex min-h-dvh flex-col bg-gradient-to-b from-sky-50 via-[#f0f7fb] to-[#d8e8f2] transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        {!isLoginPage && <Header />}
        <main className="flex flex-col flex-grow">
          <div
            id="main-content"
            className={`flex flex-col flex-grow ${isLoginPage ? "" : "pt-[73px] sm:pt-[81px]"}`}
            tabIndex={-1}
          >
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Navigate to="/login" replace />} />
              <Route path="/signup" element={<Navigate to="/login" replace />} />
              <Route path="/about" element={<About />} />
              <Route
                path="/student/semester/:semesterId"
                element={<SemesterPage />}
              />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/course/:courseId" element={<CourseDetail />} />
              <Route path="/courses/:courseId" element={<CourseDetail />} />
              <Route path="/lesson/:lessonId" element={<LessonDetail />} />
              <Route path="/quiz/:quizId" element={<QuizPage />} />
              <Route
                path="/assignment/:assignmentId"
                element={<AssignmentPage />}
              />
              <Route path="/contact" element={<Contact />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/courses"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminCategories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/teachers"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminTeachers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/enrollments"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminEnrollments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/certificates"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminCertificates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/schedules"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminSchedules />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/groups"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminGroups />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/group-applications"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminGroupApplications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student"
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/schedules"
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentSchedules />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/groups"
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentGroups />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<TeacherDashboard />} />
                <Route path="courses" element={<TeacherCourses />} />
                <Route path="students" element={<TeacherStudents />} />
              </Route>
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />

              <Route path="/home" element={<Home />} />
              <Route path="/unauthorized" element={<div>Nuk ke qasje!</div>} />
              <Route path="*" element={<CatchAllRedirect />} />
            </Routes>
          </div>
        </main>
        {!isLoginPage && <ConsentBanner />}
      </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
