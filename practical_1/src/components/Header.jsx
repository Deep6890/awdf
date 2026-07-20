import './Header.css';

/**
 * Header Component
 *
 * Props:
 *  - name       {string}  – The student's display name shown in the hero section.
 *  - themeColor {string}  – A CSS color / gradient string applied to the decorative bar
 *                           and the brand logo. Demonstrates the "theme color" prop requirement.
 *  - navLinks   {Array}   – Optional array of { label, href } objects for the nav bar.
 */
function Header({ name, themeColor, navLinks }) {
  const defaultLinks = [
    { label: 'About',    href: '#about' },
    { label: 'Skills',   href: '#skills' },
    { label: 'Projects', href: '#projects' },
    { label: 'Contact',  href: '#contact' },
  ];

  const links = navLinks || defaultLinks;

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* ── Sticky Navigation Bar ── */}
      <nav className="header-nav" aria-label="Primary navigation">
        <div className="container">
          <span
            className="nav-brand"
            style={{ backgroundImage: themeColor || undefined }}
          >
            {name || 'Portfolio'}
          </span>

          <ul className="nav-links" role="list">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="nav-link"
                  onClick={(e) => handleNavClick(e, link.href)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <header className="header-hero" id="home">
        <div className="container">
          {/* Status badge */}
          <p className="hero-badge">
            <span className="hero-badge-dot" />
            Open to Opportunities
          </p>

          {/* Main heading – name passed as prop */}
          <h1 className="hero-title">
            Hi, I&apos;m{' '}
            <span className="gradient-text">
              {name || 'Your Name'}
            </span>
          </h1>

          {/* Decorative theme-color bar – demonstrates inline style prop */}
          <span
            className="hero-theme-bar"
            style={{ background: themeColor || 'var(--grad-primary)' }}
            aria-hidden="true"
          />

          <p className="hero-subtitle">
            A passionate developer crafting modern, responsive web experiences
            using React, Vite, and JavaScript.
          </p>

          <a href="#about" className="hero-cta" onClick={(e) => handleNavClick(e, '#about')}>
            Explore My Work ↓
          </a>
        </div>
      </header>
    </>
  );
}

export default Header;
