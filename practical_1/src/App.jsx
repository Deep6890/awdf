import './index.css';
import Header   from './components/Header';
import About    from './components/About';
import Skills   from './components/Skills';
import Projects from './components/Projects';
import Footer   from './components/Footer';

/*
 * Student data passed as props to child components.
 * Demonstrates one-directional data flow (App → child).
 */
const STUDENT_NAME  = 'Deep Kayastha';
const STUDENT_EMAIL = '24aiml018@charusat.edu.in';
const STUDENT_ROLL  = '24AIML018';

/*
 * Props:
 *  - skillList passed to Skills (array rendered dynamically)
 *  - themeColor passed to Header (inline style prop — supplementary req.)
 */
const SKILL_LIST = ['Python', 'Machine Learning', 'React', 'JavaScript', 'SQL', 'C++', 'Git'];

const THEME_COLOR = '#7b4f2e';   /* brown — applied as inline style to Header bar */

/**
 * App — Root component
 *
 * BUG #1: Projects component is imported but NOT composed into the return.
 * The component exists, but it will never appear on screen.
 * Fix: add <Projects /> between <Skills /> and <Footer />.
 */
function App() {
  return (
    <>
      {/* 1. Header — receives name and themeColor props */}
      <Header name={STUDENT_NAME} themeColor={THEME_COLOR} roll={STUDENT_ROLL} />

      {/* 2. About — receives bio prop */}
      <About
        bio="B.Tech AIML student at CHARUSAT, interested in machine
             learning, data analysis, and building clean web applications with React."
      />

      {/* 3. Skills — receives skillList prop (array, rendered dynamically) */}
      <Skills skillList={SKILL_LIST} />

      {/* BUG #1: <Projects /> is missing here — component never renders */}
      {/* Fix: uncomment the line below */}
      {/* <Projects /> */}

      {/* 4. Footer — receives name and email props */}
      <Footer name={STUDENT_NAME} email={STUDENT_EMAIL} />
    </>
  );
}

export default App;
