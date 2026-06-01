import React, { lazy, Suspense } from "react";
import Header from "./components/ui/Header.jsx";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAppPreferences } from "./context/appPreferencesContext.js";
import "swiper/css";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ConsentBanner from "./components/cookies/ConsentBanner.jsx";

const Home = lazy(() => import("./pages/Home.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const CourseDetail = lazy(() => import("./pages/CourseDetail.jsx"));
const LessonDetail = lazy(() => import("./pages/LessonDetail.jsx"));
const Contact = lazy(() => import("./pages/ContactUs.jsx"));
const SemesterPage = lazy(() => import("./pages/SemesterPage.jsx"));
const QuizPage = lazy(() => import("./pages/QuizPage.jsx"));
const QuizListPage = lazy(() => import("./pages/QuizListPage.jsx"));
const CoursesPage = lazy(() => import("./pages/CoursesPage.jsx"));
const Notifications = lazy(() => import("./pages/Notifications.jsx"));
const StudentDashboard = lazy(() => import("./components/dashboard/StudentDashboard.jsx"));
const TeacherDashboard = lazy(() => import("./pages/teacher/TeacherDashboard.jsx"));
const AssignmentPage = lazy(() => import("./pages/AssignmentPage.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));
const CertificateVerify = lazy(() => import("./pages/CertificateVerify.jsx"));
const AdminDashboard = lazy(() => import("./components/dashboard/AdminDashboard.jsx"));
const AdminUsers = lazy(() => import("./pages/AdminUsers.jsx"));
const AdminCourses = lazy(() => import("./pages/AdminCourses.jsx"));
const AdminCategories = lazy(() => import("./pages/AdminCategories.jsx"));
const AdminTeachers = lazy(() => import("./pages/AdminTeachers.jsx"));
const AdminEnrollments = lazy(() => import("./pages/AdminEnrollments.jsx"));
const AdminCertificates = lazy(() => import("./pages/AdminCertificates.jsx"));
const AdminReports = lazy(() => import("./pages/AdminReports.jsx"));
const AdminSchedules = lazy(() => import("./pages/AdminSchedules.jsx"));
const StudentSchedules = lazy(() => import("./pages/StudentSchedules.jsx"));
const StudentGroups = lazy(() => import("./pages/StudentGroups.jsx"));
const StudentProfilePage = lazy(() => import("./pages/student/StudentProfilePage.jsx"));
const AdminGroupApplications = lazy(() => import("./pages/AdminGroupApplications.jsx"));
const AdminGroups = lazy(() => import("./pages/AdminGroups.jsx"));
const TeacherLayout = lazy(() => import("./layouts/TeacherLayout.jsx"));
const TeacherCourses = lazy(() => import("./pages/teacher/TeacherCourses.jsx"));
const TeacherModules = lazy(() => import("./pages/teacher/TeacherModules.jsx"));
const TeacherLessons = lazy(() => import("./pages/teacher/TeacherLessons.jsx"));
const TeacherQuizzes = lazy(() => import("./pages/teacher/TeacherQuizzes.jsx"));
const TeacherStudents = lazy(() => import("./pages/teacher/TeacherStudents.jsx"));
const ProfessorGradesPage = lazy(() => import("./pages/teacher/ProfessorGradesPage.jsx"));
const StudentGradesPage = lazy(() => import("./pages/student/StudentGradesPage.jsx"));

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

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm font-semibold text-slate-500 dark:text-slate-400">
      Duke ngarkuar...
    </div>
  );
}

function AppLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isQuizPage = /\/quiz\/\d+/.test(location.pathname);

  return (
      <div className="flex min-h-dvh flex-col bg-gradient-to-b from-sky-50 via-[#f0f7fb] to-[#d8e8f2] transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        {!isLoginPage && !isQuizPage && <Header />}
        <main className="flex flex-col flex-grow">
          <div
            id="main-content"
            className={`flex flex-col flex-grow ${isLoginPage || isQuizPage ? "" : "pt-[73px] sm:pt-[81px]"}`}
            tabIndex={-1}
          >
            <Suspense fallback={<PageFallback />}>
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
              <Route
                path="/course/:courseId/quiz/:quizId"
                element={
                  <ProtectedRoute requiredRole="student">
                    <QuizPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/:quizId"
                element={
                  <ProtectedRoute requiredRole="student">
                    <QuizPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assignment/:assignmentId"
                element={
                  <ProtectedRoute requiredRole="student">
                    <AssignmentPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/contact" element={<Contact />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/certificate/:kodiUnik" element={<CertificateVerify />} />
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
                path="/student/profile"
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/quizzes"
                element={
                  <ProtectedRoute requiredRole="student">
                    <QuizListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/grades"
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentGradesPage />
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
                <Route path="modules" element={<TeacherModules />} />
                <Route path="modules/:courseId" element={<TeacherModules />} />
                <Route path="lessons" element={<TeacherLessons />} />
                <Route path="quizzes" element={<TeacherQuizzes />} />
                <Route path="students" element={<TeacherStudents />} />
                <Route path="grades" element={<ProfessorGradesPage />} />
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
            </Suspense>
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
