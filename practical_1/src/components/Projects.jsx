import './Projects.css';

/**
 * Projects Component  (Post-Lab / Supplementary deliverable)
 *
 * Props:
 *  - projects {Array} – Array of project objects:
 *                       [{ title, description, tags, emoji, link }]
 *
 * When no prop is passed the component renders 3 hardcoded demo projects
 * (satisfying the "hardcoded list of 3 projects" requirement).
 */
function Projects({ projects }) {
  const defaultProjects = [
    {
      emoji:       '🛒',
      title:       'ShopCart – E-Commerce UI',
      description: 'A responsive product listing and shopping cart built with React, featuring dynamic filtering, cart management, and a clean checkout flow.',
      tags:        ['React', 'CSS', 'useState'],
      link:        '#',
      bannerColor: 'linear-gradient(135deg, #6c63ff22, #a29bfe33)',
    },
    {
      emoji:       '🌤️',
      title:       'WeatherNow – Live Dashboard',
      description: 'Real-time weather application that fetches data from the OpenWeather API and presents it with animated weather icons and a 5-day forecast.',
      tags:        ['JavaScript', 'REST API', 'Fetch'],
      link:        '#',
      bannerColor: 'linear-gradient(135deg, #00cec922, #55efc422)',
    },
    {
      emoji:       '📝',
      title:       'TaskBoard – Kanban Planner',
      description: 'A drag-and-drop task management board inspired by Trello, featuring column management, local-storage persistence, and priority labelling.',
      tags:        ['React', 'DnD', 'LocalStorage'],
      link:        '#',
      bannerColor: 'linear-gradient(135deg, #fd79a822, #fdcfe822)',
    },
  ];

  const items = projects || defaultProjects;

  return (
    <section className="projects-section" id="projects" aria-labelledby="projects-heading">
      <div className="container">

        {/* ── Section Header ── */}
        <div className="projects-header">
          <span className="section-label">What I've Built</span>
          <h2 className="projects-heading" id="projects-heading">
            Featured <span className="gradient-text">Projects</span>
          </h2>
        </div>

        {/* ── Project Cards ── */}
        <ul className="projects-grid" role="list" aria-label="Projects">
          {items.map((project) => (
            <li key={project.title} className="project-card">
              {/* Coloured banner */}
              <div
                className="project-card-banner"
                style={{ background: project.bannerColor || 'var(--clr-bg-card)' }}
                aria-hidden="true"
              >
                {project.emoji}
              </div>

              <div className="project-card-body">
                <h3 className="project-card-title">{project.title}</h3>
                <p className="project-card-desc">{project.description}</p>

                {/* Tech tags */}
                <ul className="project-card-tags" role="list" aria-label="Technologies used">
                  {project.tags.map((tag) => (
                    <li key={tag} className="project-tag">{tag}</li>
                  ))}
                </ul>

                <a
                  href={project.link || '#'}
                  className="project-card-link"
                  aria-label={`View ${project.title} project`}
                >
                  View Project →
                </a>
              </div>
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}

export default Projects;
