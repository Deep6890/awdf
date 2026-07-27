import React, { useState } from 'react'
import { GitBranch, Eye, EyeOff } from 'lucide-react'
import './Projects.css'

/**
 * Projects Page
 * useState #1 — showDetails: toggles project detail panel (UI visibility)
 */
export default function Projects() {
  const [showDetails, setShowDetails] = useState(null)

  const projects = [
    {
      id: 1,
      title: 'Sentiment Analyser',
      tags: ['Python', 'ML', 'NLP'],
      desc: 'Text classification using Naive Bayes on a movie-review dataset.',
      detail: 'Built with scikit-learn and NLTK. TF-IDF vectorisation, ~88% accuracy on test split.',
      github: 'https://github.com',
    },
    {
      id: 2,
      title: 'Portfolio — Practical 2',
      tags: ['React', 'Router', 'useState'],
      desc: 'Multi-page React app using React Router v6 and useState hooks.',
      detail: 'Demonstrates client-side routing (no page reloads) and controlled form inputs via useState.',
      github: 'https://github.com',
    },
    {
      id: 3,
      title: 'Weather Dashboard',
      tags: ['React', 'API'],
      desc: 'Fetches live weather data from OpenWeatherMap and displays it with a React UI.',
      detail: 'Uses React 18 Fetch API with controlled search input and °C/°F toggle via useState.',
      github: 'https://github.com',
    },
  ]

  return (
    <main className="page-content projects-page" id="projects-page">
      <h1 className="section-heading">Projects</h1>
      <p className="section-subheading">Click <strong>Details</strong> on any card to expand.</p>

      <div className="projects-grid" id="projects-grid">
        {projects.map(p => (
          <article className="project-card card" key={p.id} id={`project-card-${p.id}`}>
            <div className="project-body">
              <div className="project-tags">
                {p.tags.map(t => <span className="project-tag" key={t}>{t}</span>)}
              </div>
              <h2 className="project-title">{p.title}</h2>
              <p className="project-desc">{p.desc}</p>

              {showDetails === p.id && (
                <div className="project-detail-box" id={`project-detail-${p.id}`}>
                  {p.detail}
                </div>
              )}
            </div>

            <div className="project-actions">
              <button
                className="btn-secondary"
                id={`toggle-detail-${p.id}`}
                onClick={() => setShowDetails(prev => prev === p.id ? null : p.id)}
                aria-expanded={showDetails === p.id}
              >
                {showDetails === p.id ? <><EyeOff size={13}/> Hide</> : <><Eye size={13}/> Details</>}
              </button>
              <a href={p.github} target="_blank" rel="noreferrer"
                className="icon-link" id={`github-${p.id}`} aria-label="GitHub">
                <GitBranch size={15} />
              </a>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
