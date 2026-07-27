import './Header.css';

/**
 * Header Component
 *
 * Props:
 *  - name       {string} — Student name displayed in nav and hero.
 *  - themeColor {string} — CSS color applied to the decorative bar (inline style prop).
 *  - roll       {string} — Roll number shown as a badge.
 */
function Header({ name, themeColor, roll }) {
  return (
    <>
      {/* Sticky Navigation Bar */}
      <nav className="header-nav" aria-label="Primary navigation">
        <div className="container nav-inner">
          <span className="nav-brand">{name || 'Portfolio'}</span>
          <ul className="nav-links" role="list">
            <li><a href="#about"    className="nav-link">About</a></li>
            <li><a href="#skills"   className="nav-link">Skills</a></li>
            <li><a href="#projects" className="nav-link">Projects</a></li>
            <li><a href="#contact"  className="nav-link">Contact</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="header-hero" id="home">
        <div className="container">
          <span className="hero-badge">{roll || '24AIML018'} · B.Tech AIML</span>

          <h1 className="hero-title">
            {name || 'Deep Kayastha'}
          </h1>

          {/* Decorative bar — themeColor prop applied as inline style */}
          <span
            className="hero-bar"
            style={{ background: themeColor || '#7b4f2e' }}
            aria-hidden="true"
          />

          <p className="hero-subtitle">
            AI & Machine Learning Student · CHARUSAT
          </p>

          <a href="#about" className="btn-primary">Explore ↓</a>
        </div>
      </header>
    </>
  );
}

export default Header;
