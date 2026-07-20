import './App.css';
import Header   from './components/Header';
import About    from './components/About';
import Skills   from './components/Skills';
import Projects from './components/Projects';
import Footer   from './components/Footer';

/* ============================================================
   STUDENT DATA  – Edit these values to personalise the portfolio
   ============================================================ */
const STUDENT_NAME   = 'Alex Johnson';
const STUDENT_EMAIL  = 'alex.johnson@charusat.edu.in';
const STUDENT_GITHUB = 'alexjohnson';

/**
 * Skills array passed as a prop to the Skills component.
 * Demonstrates the "pass an array of skills as a prop" requirement.
 */
const SKILL_LIST = [
  'React', 'Vite', 'JavaScript (ES6+)', 'HTML5', 'CSS3',
  'Node.js', 'Express', 'Python', 'MySQL', 'Git', 'Figma',
];

/**
 * Theme color passed as a prop to the Header.
 * Demonstrates the "add a theme color prop" supplementary requirement.
 */
const THEME_COLOR = 'linear-gradient(135deg, #6c63ff 0%, #fd79a8 100%)';

/**
 * App – Root component
 *
 * Composes all four required components (Header, About, Skills, Footer)
 * plus the supplementary Projects component into a single-page layout.
 * Props are passed from here down to child components (one-directional data flow).
 */
function App() {
  return (
    <>
      {/* ── 1. Header ── receives name prop + themeColor prop ── */}
      <Header
        name={STUDENT_NAME}
        themeColor={THEME_COLOR}
      />

      {/* ── 2. About ── receives bio and tags props ── */}
      <About
        bio="I'm a passionate B.Tech IT student at CHARUSAT, fascinated by how code
             can transform ideas into interactive experiences. I love working with
             React and modern JavaScript, and I'm always eager to collaborate on
             meaningful projects."
        emoji="🧑‍💻"
        tags={['React', 'JavaScript', 'Node.js', 'Python', 'Open Source']}
      />

      {/* ── 3. Skills ── receives skillList prop (array) ── */}
      <Skills skillList={SKILL_LIST} />

      {/* ── 4. Projects ── supplementary component (post-lab deliverable) ── */}
      <Projects />

      {/* ── 5. Footer ── receives name, email, and github props ── */}
      <Footer
        name={STUDENT_NAME}
        email={STUDENT_EMAIL}
        github={STUDENT_GITHUB}
      />
    </>
  );
}

export default App;
