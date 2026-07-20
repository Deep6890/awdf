import './Footer.css';

/**
 * Footer Component
 *
 * Props:
 *  - name    {string} – Student name shown in copyright.
 *  - email   {string} – Contact email address.
 *  - github  {string} – GitHub profile URL or username.
 *  - year    {number} – Copyright year (defaults to current year).
 */
function Footer({ name, email, github, year }) {
  const currentYear = year || new Date().getFullYear();
  const displayName = name  || 'Your Name';
  const displayEmail  = email  || 'student@charusat.edu.in';
  const githubUrl  = github ? (github.startsWith('http') ? github : `https://github.com/${github}`) : '#';

  const navSections = [
    { label: 'About',    href: '#about'    },
    { label: 'Skills',   href: '#skills'   },
    { label: 'Projects', href: '#projects' },
  ];

  const handleClick = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="footer" id="contact" aria-label="Site footer">
      <div className="container">

        {/* ── 3-Column Grid ── */}
        <div className="footer-grid">

          {/* Brand Column */}
          <div className="footer-brand">
            <span className="footer-logo">{displayName}</span>
            <p className="footer-tagline">
              Building thoughtful digital experiences one component at a time.
              Open to internships, collaborations, and new challenges.
            </p>

            {/* Social Icons */}
            <div className="footer-socials" aria-label="Social links">
              <a href={githubUrl} className="social-icon" aria-label="GitHub" target="_blank" rel="noreferrer">
                🐙
              </a>
              <a href={`mailto:${displayEmail}`} className="social-icon" aria-label="Email">
                ✉️
              </a>
              <a href="#" className="social-icon" aria-label="LinkedIn">
                💼
              </a>
            </div>
          </div>

          {/* Quick Nav Column */}
          <nav aria-label="Footer navigation">
            <h3 className="footer-col-title">Navigate</h3>
            <ul className="footer-links" role="list">
              {navSections.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    className="footer-link"
                    onClick={(e) => handleClick(e, s.href)}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact Column */}
          <address style={{ fontStyle: 'normal' }}>
            <h3 className="footer-col-title">Contact</h3>
            <a href={`mailto:${displayEmail}`} className="footer-contact-item">
              <span className="contact-icon" aria-hidden="true">📧</span>
              {displayEmail}
            </a>
            <div className="footer-contact-item">
              <span className="contact-icon" aria-hidden="true">📍</span>
              CHARUSAT, Anand, Gujarat
            </div>
            <div className="footer-contact-item">
              <span className="contact-icon" aria-hidden="true">🎓</span>
              B.Tech IT · Semester 3
            </div>
          </address>

        </div>

        {/* ── Bottom Bar ── */}
        <div className="footer-bottom">
          <p className="footer-copy">
            © {currentYear} <span>{displayName}</span>. All rights reserved.
          </p>
          <p className="footer-built-with">
            Built with <em>♥</em> using React + Vite
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
