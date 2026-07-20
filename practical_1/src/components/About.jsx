import './About.css';

/**
 * About Component
 *
 * Props:
 *  - bio     {string}  – Short biography text.
 *  - emoji   {string}  – Avatar emoji representation.
 *  - tags    {Array}   – Highlight interest tags e.g. ['React', 'TypeScript'].
 */
function About({ bio, emoji, tags }) {
  const defaultBio = `I'm a second-year B.Tech student majoring in Information Technology at
  Charotar University of Science and Technology (CHARUSAT). I love turning ideas into
  beautiful, performant web applications and I'm always exploring new technologies
  to expand my toolkit.`;

  const defaultTags = ['React', 'JavaScript', 'Node.js', 'Python', 'Git'];

  return (
    <section className="about-section" id="about" aria-labelledby="about-heading">
      <div className="container">

        {/* ── Visual / Avatar Column ── */}
        <div className="about-visual" aria-hidden="true">
          <div className="about-avatar-ring">
            <div className="about-avatar-inner">
              {emoji || '🎓'}
            </div>
          </div>

          {/* Floating availability badge */}
          <div className="about-badge-floating">
            <span className="about-badge-floating-dot" />
            Available for Internships
          </div>
        </div>

        {/* ── Text / Content Column ── */}
        <div className="about-content">
          <span className="section-label">About Me</span>

          <h2 className="about-heading" id="about-heading">
            Turning{' '}
            <span className="gradient-text">Ideas</span>{' '}
            into Reality
          </h2>

          <p className="about-text">{bio || defaultBio}</p>

          {/* Stats Row */}
          <div className="about-stats" role="list" aria-label="Key stats">
            <div className="about-stat" role="listitem">
              <span className="stat-number">15+</span>
              <span className="stat-label">Projects Built</span>
            </div>
            <div className="about-stat" role="listitem">
              <span className="stat-number">3+</span>
              <span className="stat-label">Years Coding</span>
            </div>
            <div className="about-stat" role="listitem">
              <span className="stat-number">5★</span>
              <span className="stat-label">Avg. Course Rating</span>
            </div>
          </div>

          {/* Interest / highlight tags */}
          <div className="about-tags" aria-label="Interests and skills">
            {(tags || defaultTags).map((tag) => (
              <span key={tag} className="about-tag">{tag}</span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default About;
