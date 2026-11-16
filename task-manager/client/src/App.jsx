import { useState, useEffect, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import NavBar from './components/NavBar';
import Footer from './components/Footer';
import PageLoader from './components/PageLoader';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { lazyWithMinDelay } from './utils/lazyWithDelay';

import './Styles/reset.css';
import './Styles/variables.css';
import './Styles/global.css';

// Route-based code splitting with guaranteed minimum delay (300ms) to avoid flicker
const Home = lazyWithMinDelay(() => import('./pages/Home'), 300);
const Projects = lazyWithMinDelay(() => import('./pages/Projects'), 300);
const Contact = lazyWithMinDelay(() => import('./pages/Contact'), 300);
const Login = lazyWithMinDelay(() => import('./pages/Login'), 300);
const Register = lazyWithMinDelay(() => import('./pages/Register'), 300);
const NotFound = lazyWithMinDelay(() => import('./pages/NotFound'), 300);

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <AuthProvider>
      <div className={`app-root ${darkMode ? 'dark' : 'light'}`}>
        <div className="bg-texture"></div>
        <NavBar darkMode={darkMode} setDarkMode={setDarkMode} />
        <div className="main-content-layout">
          {/* Wrap only the Routes block in Suspense so NavBar and Footer remain persistent */}
          <Suspense fallback={<PageLoader message="Loading page..." />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <Projects />
                  </ProtectedRoute>
                }
              />
              <Route path="/tasks" element={<Navigate to="/projects" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
}
