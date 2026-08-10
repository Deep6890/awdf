import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'

// Importing all pages
import Home from './pages/Home'
import Projects from './pages/Projects'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import TaskManager from './pages/TaskManager'

// Importing NavBar
import NavBar from './components/navbar/NavBar'

// Importing global styles
import './Styles/reset.css'
import './Styles/variables.css'
import './Styles/global.css'

// The main App component — routes are defined here
// BrowserRouter wraps this in main.jsx (only once)
export default function App() {
  // Dark/light mode toggle — second useState variable (supplementary requirement)
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`app-root ${darkMode ? 'dark' : 'light'}`}>
      {/* Background Texture for Glassmorphism */}
      <div className="bg-texture"></div>

      {/* Navigation bar present on all pages */}
      <NavBar darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Route definitions — no full page reloads */}
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contact"  element={<Contact />} />
        <Route path="/tasks"    element={<TaskManager />} />
        {/* 404 catch-all route */}
        <Route path="*"         element={<NotFound />} />
      </Routes>
    </div>
  )
}
