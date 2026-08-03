# Practical 2 — State Management and Routing in React

**CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY**  
Faculty of Technology and Engineering  
B.Tech (IT/CE/CSE/AIML) — Advanced Web Development Frameworks (ITUE301)

---

## Overview

This project extends the Practical 1 portfolio application by adding:
- **React Router v6** for multi-page client-side navigation (no full page reloads)
- **`useState`** hooks for reactive UI state management
- A **controlled contact form** with live input capture and character count
- **Dark / Light mode** toggled via `useState`
- A custom **404 Not Found** page

---

## Routes Added

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home.jsx` | Hero, stats, services, skills toggle |
| `/projects` | `Projects.jsx` | Project cards with filter tabs and detail toggle |
| `/contact` | `Contact.jsx` | Controlled form, live character count, help tooltip |
| `*` | `NotFound.jsx` | Custom 404 catch-all |

---

## `useState` Variables

| Location | Variable | Purpose |
|----------|----------|---------|
| `App.jsx` | `darkMode` | Toggles `.dark` / `.light` CSS class on root element |
| `Home.jsx` | `showSkills` | Toggles visibility of the skills section |
| `Projects.jsx` | `selectedFilter` | Active project category filter |
| `Projects.jsx` | `showDetails` | Expands / collapses project detail per card |
| `Contact.jsx` | `formData` | Controlled form inputs (name, email, subject, message) |
| `Contact.jsx` | `showTooltip` | Toggles the help tooltip panel (UI visibility toggle) |
| `Contact.jsx` | `submitted` | Controls success state after form submission |

---

## Architecture

```
main.jsx  ← BrowserRouter wraps App (only once)
App.jsx   ← useState(darkMode), NavBar, Routes/Route definitions
 ├── NavBar.jsx     ← <NavLink> (NOT <a>) for SPA navigation
 ├── Route "/"      → Home.jsx      ← showSkills useState
 ├── Route "/projects" → Projects.jsx ← filter + detail useState
 ├── Route "/contact"  → Contact.jsx  ← controlled form + tooltip useState
 └── Route "*"     → NotFound.jsx   ← custom 404
```

---

## Key Concepts Demonstrated

1. **`BrowserRouter` in `main.jsx`** — wraps `<App />` once, enabling routing context throughout the tree.
2. **`<NavLink>` vs `<a>`** — `NavLink` performs client-side navigation; `<a href>` would cause a full page reload.
3. **Controlled inputs** — `value={state}` + `onChange={setState}` keeps React as the single source of truth.
4. **Conditional rendering** — `{condition && <Component />}` drives tooltip and skill section visibility.
5. **CSS variable theming** — `.dark` / `.light` class on root swaps all colour tokens instantly.

---

## Tech Stack

- React 18 + Vite
- React Router DOM v7
- Lucide React (icons)
- Vanilla CSS with CSS Custom Properties

---

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Commit History

- `feat: Practical 1 — portfolio base with reusable components`
- `feat: Practical 2 — add React Router with 4 routes`
- `feat: Practical 2 — implement useState for dark mode, form, and UI toggles`
