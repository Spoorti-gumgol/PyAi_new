import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import { AuthProvider } from "./AuthContext";
import { ProgressProvider } from "./context/ProgressContext";

import ProtectedRoute from "./components/ProtectedRoute";
import { Navbar } from "./components/Navbar";

import { Home } from "./pages/Home";
import { Evaluation } from "./pages/Evaluation";
import { Result } from "./pages/Result";
import { Courses } from "./pages/Courses";
import { CourseDetail } from "./pages/CourseDetail";
import { LessonPage } from "./pages/LessonPage";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { Signup } from "./pages/Signup";
import { Login } from "./pages/Login";
import { useAuth } from "./AuthContext";
import { Landing } from "./pages/Landing";
import UnitsPage from "./pages/UnitsPage";
import TestPage from "./pages/TestPage";

import { supabase } from "./supabase";

function AppContent() {
  const location = useLocation();
  const hideNavbarRoutes = ["/signup", "/login"];

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase.from("users").select("*");
      console.log("DATA:", data);
      console.log("ERROR:", error);
    }
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}

      <main className="flex-1">
        <Routes>

          {/* Public */}
          <Route path="/"          element={<Landing />} />
          <Route path="/signup"    element={<Signup />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/evaluation" element={<Evaluation />} />
          <Route path="/result"    element={<Result />} />

          {/* Protected */}
          <Route path="/courses" element={
            <ProtectedRoute><Courses /></ProtectedRoute>
          }/>

          <Route path="/course/:courseId" element={
            <ProtectedRoute><CourseDetail /></ProtectedRoute>
          }/>

          {/* ✅ Units page — handles adventure path inline */}
          <Route path="/course/:courseId/units" element={
            <ProtectedRoute><UnitsPage /></ProtectedRoute>
          }/>

          <Route path="/lesson/:lessonId" element={
            <ProtectedRoute><LessonPage /></ProtectedRoute>
          }/>

          {/* ✅ Only ONE test route — with :testId param */}
          <Route path="/test/:testId" element={
            <ProtectedRoute><TestPage /></ProtectedRoute>
          }/>

          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          }/>

          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          }/>

        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ProgressProvider>
          <AppContent />
        </ProgressProvider>
      </Router>
    </AuthProvider>
  );
}