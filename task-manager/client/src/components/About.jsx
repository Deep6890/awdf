import './About.css';

/**
 * About Component
 *
 * Props:
 *  - bio  {string} — Short biography text passed from App.jsx.
 *
 * BUG #2: The `tags` prop is declared in the function signature
 * but App.jsx never passes it. The component will render with
 * `tags` as undefined, so the tags section is silently skipped.
 * Fix: pass tags={['ML', 'React', 'Python']} from App.jsx.
 */
function About({ bio, tags }) {
  const defaultBio = 'B.Tech AIML student at CHARUSAT.';

  return (
    <section className="about-section" id="about" aria-labelledby="about-heading">
      <div className="container">
        <span className="section-label">About Me</span>
        <h2 className="about-heading" id="about-heading">Who I Am</h2>
        <p className="about-text">{bio || defaultBio}</p>

        {/* Tags — only renders when tags prop is passed (currently missing from App.jsx) */}
        {tags && tags.length > 0 && (
          <div className="about-tags" aria-label="Interests">
            {tags.map(tag => (
              <span key={tag} className="about-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default About;
