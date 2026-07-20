import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Code2, Layers, Zap, ArrowRight,
  GitBranch, Globe, Mail, ChevronDown
} from 'lucide-react'
import './Home.css'


/**
 * Home Page
 *
 * useState #1 — showSkills: toggles visibility of the Skills section
 * (demonstrates UI visibility toggle as required by the practical)
 */
export default function Home() {
  // useState for toggling skills section visibility
  const [showSkills, setShowSkills] = useState(true);

  const skills = [
    { name: 'React',       level: 90, color: '#61dafb' },
    { name: 'JavaScript',  level: 85, color: '#f7df1e' },
    { name: 'Node.js',     level: 78, color: '#68a063' },
    { name: 'CSS / SCSS',  level: 88, color: '#264de4' },
    { name: 'TypeScript',  level: 72, color: '#3178c6' },
    { name: 'REST APIs',   level: 80, color: '#6366f1' },
  ];

  return (
    <main className="page-content home-page" id="home-page">

      {/* ── Hero Section ── */}
      <section className="hero-section" id="hero">
        <div className="hero-badge badge">👋 Welcome to my Portfolio</div>

        <h1 className="hero-heading">
          Hi, I'm <span className="gradient-text">Alex Patel</span>
          <br />Full-Stack Developer
        </h1>

        <p className="hero-subtext">
          I design and build beautiful, performant web applications using
          modern frameworks like React, Node.js, and more. Passionate about
          clean code and great user experiences.
        </p>

        <div className="hero-actions">
          <Link to="/projects" className="btn-primary" id="hero-cta-projects">
            View Projects <ArrowRight size={16} />
          </Link>
          <Link to="/contact" className="btn-secondary" id="hero-cta-contact">
            Get in Touch
          </Link>
        </div>

        {/* Social links */}
        <div className="hero-socials">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="social-icon" id="social-github" aria-label="GitHub">
            <GitBranch size={20} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-icon" id="social-linkedin" aria-label="LinkedIn">
            <Globe size={20} />
          </a>
          <a href="mailto:alex@example.com" className="social-icon" id="social-email" aria-label="Email">
            <Mail size={20} />
          </a>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="stats-strip" id="stats-section">
        {[
          { label: 'Projects Completed', value: '24+' },
          { label: 'Years Experience',   value: '3+'  },
          { label: 'Happy Clients',      value: '18'  },
          { label: 'GitHub Stars',       value: '340' },
        ].map((s) => (
          <div className="stat-card card" key={s.label} id={`stat-${s.label.toLowerCase().replace(/ /g, '-')}`}>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── What I Do ── */}
      <section className="services-section" id="services-section">
        <h2 className="section-heading">What I Do</h2>
        <p className="section-subheading">Services I offer to build your digital presence</p>

        <div className="services-grid">
          {[
            {
              icon: <Code2 size={28} />,
              title: 'Frontend Development',
              desc:  'Pixel-perfect UIs with React, accessible, responsive, and fast.',
              color: '#6366f1',
            },
            {
              icon: <Layers size={28} />,
              title: 'Backend & APIs',
              desc:  'Robust REST APIs with Node.js, Express, and PostgreSQL / MongoDB.',
              color: '#10b981',
            },
            {
              icon: <Zap size={28} />,
              title: 'Performance & SEO',
              desc:  'Core Web Vitals optimization and search-engine-ready markup.',
              color: '#f59e0b',
            },
          ].map((s) => (
            <div className="service-card card" key={s.title} id={`service-${s.title.toLowerCase().replace(/ /g, '-')}`}>
              <div className="service-icon" style={{ color: s.color, background: `${s.color}18` }}>
                {s.icon}
              </div>
              <h3 className="service-title">{s.title}</h3>
              <p className="service-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Skills Section with Toggle (useState) ── */}
      <section className="skills-section" id="skills-section">
        <div className="skills-header">
          <div>
            <h2 className="section-heading">Skills</h2>
            <p className="section-subheading">My technical skill set</p>
          </div>

          {/* useState toggle button — shows/hides skill bars */}
          <button
            className={`toggle-btn ${showSkills ? 'toggle-btn--open' : ''}`}
            id="toggle-skills-btn"
            onClick={() => setShowSkills(prev => !prev)}
            aria-expanded={showSkills}
            aria-controls="skills-grid"
          >
            <span>{showSkills ? 'Hide Skills' : 'Show Skills'}</span>
            <ChevronDown size={16} className="toggle-chevron" />
          </button>
        </div>

        {/* Conditional render driven by useState */}
        {showSkills && (
          <div className="skills-grid" id="skills-grid">
            {skills.map((skill) => (
              <div className="skill-item" key={skill.name} id={`skill-${skill.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                <div className="skill-meta">
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-pct">{skill.level}%</span>
                </div>
                <div className="skill-bar-bg">
                  <div
                    className="skill-bar-fill"
                    style={{ width: `${skill.level}%`, background: skill.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </main>
  )
}
