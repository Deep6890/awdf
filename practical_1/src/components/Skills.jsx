import './Skills.css';

/**
 * Skills Component
 *
 * Props:
 *  - skillList      {Array}  – Plain array of skill name strings (required by practical).
 *                              e.g. ['React', 'JavaScript', 'CSS']
 *  - skillCategories {Array} – Optional richer array of category objects for card view:
 *                              [{ icon, title, items: [{ name, level }] }]
 *
 * Rendering strategy:
 *  • If skillCategories are provided → render enhanced category cards with progress bars.
 *  • Additionally, skillList is always rendered as a pill list beneath the cards.
 */
function Skills({ skillList, skillCategories }) {
  const defaultCategories = [
    {
      icon: '⚛️',
      title: 'Frontend',
      items: [
        { name: 'React',       level: 80 },
        { name: 'JavaScript',  level: 85 },
        { name: 'HTML & CSS',  level: 90 },
      ],
    },
    {
      icon: '🛠️',
      title: 'Backend',
      items: [
        { name: 'Node.js',     level: 65 },
        { name: 'Express.js',  level: 60 },
        { name: 'Python',      level: 70 },
      ],
    },
    {
      icon: '🗄️',
      title: 'Database & Tools',
      items: [
        { name: 'MySQL',       level: 60 },
        { name: 'Git & GitHub',level: 80 },
        { name: 'VS Code',     level: 95 },
      ],
    },
  ];

  const categories = skillCategories || defaultCategories;

  // Fallback plain list if no skillList prop given
  const pills = skillList || [
    'React', 'Vite', 'JavaScript', 'HTML5', 'CSS3',
    'Node.js', 'Python', 'Git', 'MySQL', 'Figma',
  ];

  return (
    <section className="skills-section" id="skills" aria-labelledby="skills-heading">
      <div className="container">

        {/* ── Section Header ── */}
        <div className="skills-header">
          <span className="section-label">What I Know</span>
          <h2 className="skills-heading" id="skills-heading">
            My <span className="gradient-text">Tech Stack</span>
          </h2>
          <p className="skills-subtext">
            A curated set of technologies I use to build modern web applications.
          </p>
        </div>

        {/* ── Category Cards with Progress Bars ── */}
        <ul className="skills-grid" role="list" aria-label="Skill categories">
          {categories.map((cat) => (
            <li key={cat.title} className="skill-category-card">
              <span className="skill-category-icon" aria-hidden="true">
                {cat.icon}
              </span>
              <h3 className="skill-category-title">{cat.title}</h3>

              <ul className="skill-items-list" role="list">
                {cat.items.map((item) => (
                  <li key={item.name} className="skill-item">
                    <div className="skill-item-label">
                      <span>{item.name}</span>
                      <span className="skill-item-pct">{item.level}%</span>
                    </div>
                    <div
                      className="skill-bar-track"
                      role="progressbar"
                      aria-valuenow={item.level}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${item.name} proficiency`}
                    >
                      <div
                        className="skill-bar-fill"
                        style={{ width: `${item.level}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        {/* ── Flat Pill List – rendered from skillList prop ── */}
        <div className="skills-pill-section">
          <span className="skills-pill-label">Also familiar with</span>
          <ul className="skills-pill-list" role="list" aria-label="Additional skills">
            {pills.map((s) => (
              <li key={s} className="skill-pill">{s}</li>
            ))}
          </ul>
        </div>

      </div>
    </section>
  );
}

export default Skills;
