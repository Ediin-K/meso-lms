import React from "react";
import Home from "./pages/Home.jsx";
import Header from "./components/ui/Header.jsx";
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import About from './pages/About.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import LessonDetail from './pages/LessonDetail.jsx';
import Contact from './pages/ContactUs.jsx';
import SemesterPage from './pages/SemesterPage.jsx';
import QuizPage from './pages/QuizPage.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'swiper/css';
import Notifications from "./pages/Notifications.jsx";
import StudentDashboard from "./components/dashboard/StudentDashboard.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import TeacherDashboard from "./components/dashboard/TeacherDashboard.jsx";
import AssignmentPage from './pages/AssignmentPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminDashboard from './components/dashboard/AdminDashboard.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminCourses from './pages/AdminCourses.jsx';
import AdminCategories from './pages/AdminCategories.jsx';
import AdminEnrollments from './pages/AdminEnrollments.jsx';
import AdminCertificates from './pages/AdminCertificates.jsx';
import AdminReports from './pages/AdminReports.jsx';
import CookieBanner from './components/cookies/CookieBanner.jsx';




function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-dvh flex-col bg-gradient-to-b from-sky-50 via-[#f0f7fb] to-[#d8e8f2] transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Header />
        <main className="flex flex-col flex-grow">
          <div
            id="main-content"
            className="flex flex-col flex-grow pt-[73px] sm:pt-[81px]"
            tabIndex={-1}
          >
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
              <Route path="/student/semester/:semesterId" element={<SemesterPage />} />
              <Route path="/course/:courseId" element={<CourseDetail />} />
              <Route path="/lesson/:lessonId" element={<LessonDetail />} />
              <Route path="/quiz/:quizId" element={<QuizPage />} />
              <Route path="/assignment/:assignmentId" element={<AssignmentPage />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminUsers />
                </ProtectedRoute>
              } />
              <Route path="/admin/courses" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminCourses />
                </ProtectedRoute>
              } />
              <Route path="/admin/categories" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminCategories />
                </ProtectedRoute>
              } />
              <Route path="/admin/enrollments" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminEnrollments />
                </ProtectedRoute>
              } />
              <Route path="/admin/certificates" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminCertificates />
                </ProtectedRoute>
              } />
              <Route path="/admin/reports" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminReports />
                </ProtectedRoute>
              } />
              <Route path="/student" element={<ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>} />
              <Route path="/teacher" element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />

              <Route path="/" element={<Home />} />
              <Route path="/unauthorized" element={<div>Nuk ke qasje!</div>} />
            </Routes>
          </div>
        </main>
        <CookieBanner />
      </div>
    </BrowserRouter>
  );
}

export default App;