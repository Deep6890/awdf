import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { BookOpen, Sun, Moon } from 'lucide-react'
import './NavBar.css'

/**
 * NavBar — top navigation bar with React Router <Link> components.
 * Uses <NavLink> (not <a href>) to avoid full page reloads (SPA routing).
 *
 * Props:
 *  darkMode   {boolean} — current theme state
 *  setDarkMode {function} — toggle handler from App's useState
 */
export default function NavBar({ darkMode, setDarkMode }) {
  return (
    <header className="navbar" id="navbar">
      {/* Brand / Logo */}
      <Link to="/" className="navbar-brand" id="navbar-brand-link">
        <div className="navbar-logo">
          <BookOpen size={18} />
        </div>
        <span className="navbar-title">Deep Kayastha</span>
      </Link>

      {/* Navigation links — using <NavLink> so active class is applied automatically */}
      <nav className="navbar-links" aria-label="Main navigation">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
          id="nav-home"
        >
          Home
        </NavLink>
        <NavLink
          to="/projects"
          className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
          id="nav-projects"
        >
          Projects
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
          id="nav-contact"
        >
          Contact
        </NavLink>
      </nav>

      {/* Dark / Light mode toggle — driven by useState in App.jsx */}
      <button
        className="theme-toggle"
        id="theme-toggle-btn"
        onClick={() => setDarkMode(prev => !prev)}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        title={darkMode ? 'Light mode' : 'Dark mode'}
      >
        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </header>
  )
}
