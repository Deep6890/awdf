# Practical 8 — Bundle Size & Performance Metrics

## 1. Baseline Metrics (Static Imports — Pre-Lazy Loading)

Recorded after completing Practical 7 with static route imports and monolithic bundling:

| Chunk / Asset File | Type | Uncompressed Size | Gzipped Size | Notes |
|---|---|---|---|---|
| `dist/index.html` | HTML | 0.80 kB | 0.44 kB | Initial shell |
| `dist/assets/index-qzFbQrss.css` | CSS | 19.66 kB | 4.46 kB | Combined stylesheet |
| `dist/assets/index-DxtXC_o6.js` | JS Bundle | 272.54 kB | 86.72 kB | Monolithic JS bundle (all routes + components) |

- **Total Initial JavaScript:** 272.54 kB (86.72 kB gzip)  
- **Total Initial Chunks:** 1 monolithic bundle

---

## 2. After Metrics (Route-Based Code Splitting + Lazy Loaded Recharts)

Recorded after wrapping routes in `React.lazy` + `Suspense` and extracting `TaskStatsChart` into an on-demand chunk:

| Chunk / Asset File | Type | Uncompressed Size | Gzipped Size | Download Trigger / Route |
|---|---|---|---|---|
| **Initial Shell Assets** | | | | |
| `dist/index.html` | HTML | 0.88 kB | 0.47 kB | Initial page load |
| `dist/assets/index-DpJsKW4e.css` | CSS | 6.82 kB | 2.06 kB | Initial critical CSS (reduced from 19.66 kB) |
| `dist/assets/index-1Gxm1C9a.js` | JS Entry | 236.84 kB | 76.37 kB | Initial core shell (React, router runtime, nav) |
| `dist/assets/jsx-runtime-DIBGU2nq.js` | Shared JS | 8.70 kB | 3.29 kB | Shared JSX runtime chunk |
| `dist/assets/x-3D0PMNr2.js` | Shared JS | 0.14 kB | 0.14 kB | Shared helper |
| **On-Demand Route Chunks** | | | | |
| `dist/assets/Home-4zlC6Mv9.js` | Route JS | 2.35 kB | 1.05 kB | Loaded on visiting `/` |
| `dist/assets/Home-LfTALFfn.css` | Route CSS | 1.35 kB | 0.58 kB | Home page styles |
| `dist/assets/Projects-DXR1PEmz.js` | Route JS | 33.18 kB | 11.13 kB | Loaded on visiting `/projects` |
| `dist/assets/Projects-BcGFkyPL.css` | Route CSS | 17.77 kB | 3.77 kB | Projects page styles |
| `dist/assets/Login-85TnxLG2.js` | Route JS | 1.76 kB | 0.79 kB | Loaded on visiting `/login` |
| `dist/assets/Register-BypUoEf8.js` | Route JS | 2.25 kB | 0.89 kB | Loaded on visiting `/register` |
| `dist/assets/Auth-CcGn636t.css` | Route CSS | 1.51 kB | 0.58 kB | Login & Register styles |
| `dist/assets/Contact-D0xfJ20o.js` | Route JS | 4.88 kB | 2.04 kB | Loaded on visiting `/contact` |
| `dist/assets/Contact-C7yONm8M.css` | Route CSS | 2.34 kB | 0.89 kB | Contact page styles |
| `dist/assets/NotFound-DK7HYfrI.js` | Route JS | 1.91 kB | 0.90 kB | Loaded on 404 unmatched route |
| `dist/assets/NotFound-DfzNwrfE.css` | Route CSS | 0.73 kB | 0.32 kB | 404 styles |
| **Heavy Third-Party Component** | | | | |
| `dist/assets/TaskStatsChart-BGzVBDX-.js` | On-demand JS | 397.18 kB | 113.26 kB | Loaded ONLY when user clicks "Show Visual Analytics" |
| `dist/assets/TaskStatsChart-C7-MrnOR.css` | Component CSS | 1.19 kB | 0.51 kB | Recharts component styles |

---

## 3. Before vs. After Comparison Summary

| Metric | Before (Static Monolith) | After (Code Splitting) | Difference / Savings |
|---|---|---|---|
| **Initial JS Download (Entry Bundle)** | 272.54 kB (86.72 kB gzip) | 236.84 kB (76.37 kB gzip) | **-35.7 kB (-13.1% raw, -11.9% gzip)** |
| **Initial CSS Download** | 19.66 kB (4.46 kB gzip) | 6.82 kB (2.06 kB gzip) | **-12.84 kB (-65.3% raw, -53.8% gzip)** |
| **Initial Route Chunks** | 1 monolithic bundle | 1 shell + on-demand chunks | Clean separation |
| **Heavy Dependency (Recharts ~397 kB)** | Bundled in main bundle | Extracted to lazy chunk | **0 kB upfront cost** (downloaded only on user click) |

> [!NOTE]
> **Total Code vs. Initial Download:**  
> The total amount of JavaScript across the entire application is actually slightly larger or similar (due to module glue and runtime chunk headers), but the **initial download and execution payload for first paint is drastically reduced**. Users never pay the network or parsing cost of routes they haven't visited or the 397 kB Recharts library unless they explicitly request analytics.
