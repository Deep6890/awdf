import React, { useState } from 'react'
import { ExternalLink, GitBranch, Eye, EyeOff, Tag } from 'lucide-react'
import './Projects.css'

/**
 * Projects Page
 *
 * useState #1 — selectedFilter: active category filter
 * useState #2 — showDetails: toggles detail overlay on a project card
 *               (UI visibility toggle — satisfies the practical requirement)
 */
export default function Projects() {
  // State for category filter
  const [selectedFilter, setSelectedFilter] = useState('All');

  // State to toggle expanded description visibility (UI visibility toggle)
  const [showDetails, setShowDetails] = useState(null); // stores project id or null

  const categories = ['All', 'React', 'Full-Stack', 'Node.js', 'CSS'];

  const projects = [
    {
      id: 1,
      title: 'Brainwave Dashboard',
      category: 'React',
      tags: ['React', 'CSS', 'Chart.js'],
      description: 'An analytics dashboard with real-time data visualizations, dark mode support, and responsive layout.',
      longDesc: 'Built with React 18 and CSS variables. Features include live chart updates via WebSockets, user-customizable widget grid, and complete dark/light theming using CSS custom properties. Achieves 98 Lighthouse performance score.',
      color: '#6366f1',
      year: '2024',
      github: 'https://github.com',
      live: 'https://example.com',
    },
    {
      id: 2,
      title: 'ShopFlow E-commerce',
      category: 'Full-Stack',
      tags: ['Node.js', 'React', 'MongoDB'],
      description: 'A complete e-commerce platform with cart, payments (Stripe), and an admin panel.',
      longDesc: 'Full-stack application with React frontend and Express/Node.js backend. Uses MongoDB for product data, JWT authentication, and integrates Stripe for secure payments. Includes an admin panel for inventory management.',
      color: '#10b981',
      year: '2024',
      github: 'https://github.com',
      live: 'https://example.com',
    },
    {
      id: 3,
      title: 'DevBlog CMS',
      category: 'Full-Stack',
      tags: ['Next.js', 'Markdown', 'Node.js'],
      description: 'A developer blog with Markdown support, syntax highlighting, and a custom CMS.',
      longDesc: 'Server-side rendered blog using Next.js. Markdown files are transformed to HTML with Prism.js syntax highlighting. Includes a headless CMS for managing posts without touching code, with image CDN integration.',
      color: '#f59e0b',
      year: '2023',
      github: 'https://github.com',
      live: 'https://example.com',
    },
    {
      id: 4,
      title: 'AnimateCSS Toolkit',
      category: 'CSS',
      tags: ['CSS', 'Animations', 'npm'],
      description: 'An open-source CSS animation library with 60+ keyframe animations and zero dependencies.',
      longDesc: 'Published as an npm package with 340+ stars. Includes scroll-triggered animations, entrance effects, and attention seekers. Fully customizable via CSS variables. Tree-shakeable to keep bundle sizes small.',
      color: '#ec4899',
      year: '2023',
      github: 'https://github.com',
      live: 'https://example.com',
    },
    {
      id: 5,
      title: 'TaskFlow API',
      category: 'Node.js',
      tags: ['Node.js', 'Express', 'PostgreSQL'],
      description: 'A RESTful task management API with JWT auth, role-based access control, and full CRUD.',
      longDesc: 'Backend REST API built with Express.js and PostgreSQL. Implements JWT refresh token rotation, role-based permission guards, rate limiting, and comprehensive OpenAPI documentation generated with Swagger.',
      color: '#0ea5e9',
      year: '2024',
      github: 'https://github.com',
      live: 'https://example.com',
    },
    {
      id: 6,
      title: 'PortfolioKit',
      category: 'React',
      tags: ['React', 'Vite', 'CSS'],
      description: 'A customisable portfolio starter kit built with React + Vite, just like this one!',
      longDesc: 'A free open-source portfolio template built with React 18, Vite, and vanilla CSS. Features dark/light mode, smooth page transitions via React Router, and a contact form with real-time validation.',
      color: '#8b5cf6',
      year: '2025',
      github: 'https://github.com',
      live: 'https://example.com',
    },
  ];

  const filtered = selectedFilter === 'All'
    ? projects
    : projects.filter(p => p.category === selectedFilter || p.tags.includes(selectedFilter));

  return (
    <main className="page-content projects-page" id="projects-page">

      {/* Page header */}
      <div className="projects-header">
        <div>
          <h1 className="section-heading">Projects</h1>
          <p className="section-subheading">
            A selection of things I've built — click <strong>Details</strong> on any card to expand.
          </p>
        </div>

        {/* Filter tabs — updates selectedFilter state */}
        <div className="filter-tabs" id="filter-tabs" role="tablist" aria-label="Project categories">
          {categories.map(cat => (
            <button
              key={cat}
              role="tab"
              aria-selected={selectedFilter === cat}
              id={`filter-${cat.toLowerCase()}`}
              className={`filter-tab ${selectedFilter === cat ? 'filter-tab--active' : ''}`}
              onClick={() => setSelectedFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects grid */}
      <div className="projects-grid" id="projects-grid">
        {filtered.map(project => (
          <article
            className="project-card card"
            key={project.id}
            id={`project-card-${project.id}`}
            style={{ '--card-accent': project.color }}
          >
            {/* Coloured top bar */}
            <div className="project-color-bar" />

            <div className="project-body">
              {/* Tags row */}
              <div className="project-tags">
                {project.tags.map(tag => (
                  <span className="project-tag" key={tag}>
                    <Tag size={10} /> {tag}
                  </span>
                ))}
                <span className="project-year">{project.year}</span>
              </div>

              <h2 className="project-title">{project.title}</h2>
              <p className="project-desc">{project.description}</p>

              {/* Toggled detail section — useState visibility toggle */}
              {showDetails === project.id && (
                <div className="project-detail-box" id={`project-detail-${project.id}`}>
                  <p>{project.longDesc}</p>
                </div>
              )}
            </div>

            {/* Action row */}
            <div className="project-actions">
              <button
                className="btn-secondary project-detail-btn"
                id={`toggle-detail-${project.id}`}
                onClick={() => setShowDetails(prev => prev === project.id ? null : project.id)}
                aria-expanded={showDetails === project.id}
                aria-controls={`project-detail-${project.id}`}
              >
                {showDetails === project.id
                  ? <><EyeOff size={14} /> Hide</>
                  : <><Eye size={14} /> Details</>
                }
              </button>
              <div className="project-links">
                <a href={project.github} target="_blank" rel="noreferrer"
                  className="icon-link" id={`github-link-${project.id}`} aria-label="GitHub repository">
                  <GitBranch size={16} />
                </a>
                <a href={project.live} target="_blank" rel="noreferrer"
                  className="icon-link" id={`live-link-${project.id}`} aria-label="Live demo">
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="no-results" id="no-results">
          No projects found for <strong>{selectedFilter}</strong>.
        </div>
      )}

    </main>
  )
}
