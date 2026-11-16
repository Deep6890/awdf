import './Footer.css';

/**
 * Footer Component
 *
 * Props:
 *  - name  {string} — Student name for copyright line.
 *  - email {string} — Contact email address.
 */
function Footer({ name, email }) {
  const year        = new Date().getFullYear();
  const displayName = name  || 'Deep Kayastha';
  const displayMail = email || '24aiml018@charusat.edu.in';

  return (
    <footer className="footer" id="contact" aria-label="Site footer">
      <div className="container footer-inner">
        <p className="footer-copy">
          © {year} <strong>{displayName}</strong> · B.Tech AIML · 24AIML018
        </p>
        <a href={`mailto:${displayMail}`} className="footer-email">
          {displayMail}
        </a>
      </div>
    </footer>
  );
}

export default Footer;
