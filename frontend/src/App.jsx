import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import CourseCatalog from './pages/CourseCatalog';
import CourseLearning from './pages/CourseLearning';
import Assignments from './pages/Assignments';
import Certificate from './pages/Certificate';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/instructor" element={<InstructorDashboard />} />
        <Route path="/courses" element={<CourseCatalog />} />
        <Route path="/course" element={<CourseLearning />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/certificate" element={<Certificate />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
