import { Link, NavLink } from 'react-router-dom';
import { BookOpen, Sun, Moon, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './NavBar.css';

export default function NavBar({ darkMode, setDarkMode }) {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="navbar" id="navbar">
      {/* Brand / Logo */}
      <Link to="/" className="navbar-brand" id="navbar-brand-link">
        <div className="navbar-logo">
          <BookOpen size={18} />
        </div>
        <span className="navbar-title">Deep Kayastha</span>
      </Link>

      {/* Navigation links */}
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
          Task Manager
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
          id="nav-contact"
        >
          Contact
        </NavLink>

        {isAuthenticated ? (
          <div className="auth-user-section">
            <span className="user-badge" title={user?.email}>
              <User size={14} />
              <span className="user-email-text">{user?.email}</span>
            </span>
            <button
              type="button"
              className="btn-logout"
              onClick={logout}
              title="Logout"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        ) : (
          <div className="auth-links-section">
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link--active' : ''}`
              }
              id="nav-login"
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link--active' : ''}`
              }
              id="nav-register"
            >
              Register
            </NavLink>
          </div>
        )}
      </nav>

      {/* Dark / Light mode toggle */}
      <button
        type="button"
        className="theme-toggle"
        id="theme-toggle-btn"
        onClick={() => setDarkMode((prev) => !prev)}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        title={darkMode ? 'Light mode' : 'Dark mode'}
      >
        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </header>
  );
}
