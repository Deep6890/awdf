import './Projects.css';

/**
 * Projects Component  (Post-lab / supplementary deliverable)
 *
 * Props:
 *  - projects {Array} — Optional array of project objects.
 *
 * Renders 3 hardcoded AIML-relevant projects by default.
 */
function Projects({ projects }) {
  const defaultProjects = [
    {
      title:  'Sentiment Analyser',
      desc:   'Text classification using Naive Bayes on a movie-review dataset.',
      tags:   ['Python', 'ML', 'NLP'],
    },
    {
      title:  'Student Grade Predictor',
      desc:   'Predicts final grades from mid-semester scores using linear regression.',
      tags:   ['Python', 'Pandas', 'sklearn'],
    },
    {
      title:  'Portfolio — Practical 1',
      desc:   'This single-page portfolio built with React + Vite using reusable components.',
      tags:   ['React', 'Vite', 'Props'],
    },
  ];

  const items = projects || defaultProjects;

  return (
    <section className="projects-section" id="projects" aria-labelledby="projects-heading">
      <div className="container">
        <span className="section-label">What I've Built</span>
        <h2 className="projects-heading" id="projects-heading">Projects</h2>

        <ul className="projects-grid" role="list">
          {items.map(p => (
            <li key={p.title} className="project-card card">
              <h3 className="project-title">{p.title}</h3>
              <p className="project-desc">{p.desc}</p>
              <div className="project-tags">
                {p.tags.map(t => <span key={t} className="project-tag">{t}</span>)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Projects;
