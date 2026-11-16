import './Skills.css';

/**
 * Skills Component
 *
 * Props:
 *  - skillList {Array} — Array of skill name strings passed from App.jsx.
 *                        e.g. ['Python', 'React', 'SQL']
 *
 * Renders each skill as a pill. Falls back to a default list if no prop given.
 */
function Skills({ skillList }) {
  const fallback = ['Python', 'React', 'JavaScript', 'SQL', 'Git'];
  const skills = skillList || fallback;

  return (
    <section className="skills-section" id="skills" aria-labelledby="skills-heading">
      <div className="container">
        <span className="section-label">What I Know</span>
        <h2 className="skills-heading" id="skills-heading">Skills</h2>

        <ul className="skills-list" role="list" aria-label="Skills">
          {skills.map(s => (
            <li key={s} className="skill-pill">{s}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Skills;
