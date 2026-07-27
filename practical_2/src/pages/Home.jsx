import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import './Home.css'

/**
 * Home Page
 * useState #1 — showSkills: toggles skill list visibility
 */
export default function Home() {
  const [showSkills, setShowSkills] = useState(true)

  const skills = ['Python', 'Machine Learning', 'React', 'SQL', 'C++']

  return (
    <main className="page-content home-page" id="home-page">

      {/* Hero */}
      <section className="hero-section" id="hero">
        <span className="badge">B.Tech AIML · 24AIML018</span>
        <h1 className="hero-heading">Deep <span className="accent-text">Kayastha</span></h1>
        <p className="hero-sub">AI & Machine Learning Student, CHARUSAT</p>
        <div className="hero-actions">
          {/* BUG #1: <a> tag used instead of <Link> — causes full page reload */}
          <a href="/projects" className="btn-primary" id="hero-cta-projects">View Projects</a>
          <Link to="/contact" className="btn-secondary" id="hero-cta-contact">Contact</Link>
        </div>
      </section>

      {/* Skills toggle */}
      <section className="skills-section" id="skills-section">
        <div className="skills-header">
          <h2 className="section-heading">Skills</h2>
          <button
            className={`toggle-btn ${showSkills ? 'toggle-btn--open' : ''}`}
            id="toggle-skills-btn"
            onClick={() => setShowSkills(prev => !prev)}
            aria-expanded={showSkills}
          >
            {showSkills ? 'Hide' : 'Show'} <ChevronDown size={14} className="toggle-chevron" />
          </button>
        </div>

        {showSkills && (
          <ul className="skills-list" id="skills-grid">
            {skills.map(s => <li key={s} className="skill-item">{s}</li>)}
          </ul>
        )}
      </section>

    </main>
  )
}
