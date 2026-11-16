# Practical 11 — Containerization with Docker and Docker Compose (Notes & Viva)

## 1. What Was Built
1. **Server Containerization (`server/Dockerfile`):**
   - Single-stage lightweight container based on `node:22-alpine`.
   - Copies `package*.json` and executes `npm install --omit=dev` for lean production builds.
   - Preserved `.dockerignore` ignoring `node_modules`, `.env`, `dist`, `coverage`, and logs.
   - Pinned to Node 22 (modern LTS) rather than end-of-life Node 18, matching project toolchains.
2. **Client Multi-Stage Build (`client/Dockerfile` & `client/nginx.conf`):**
   - Stage 1 (`build`): Node 22 Alpine builds the React Vite application with `ARG VITE_API_URL=http://localhost:5000`.
   - Stage 2 (`production`): Pure `nginx:alpine` image hosting static assets from `/dist`.
   - Configured `nginx.conf` with `try_files $uri /index.html;` to ensure client-side SPA routing (`/projects`, `/login`) works seamlessly upon browser refresh without 404 errors.
3. **Orchestration (`docker-compose.yml`):**
   - Defined 3 interconnected services on a dedicated bridge network (`app-network`):
     - `mongodb`: Official `mongo:7` image with container healthcheck pinging `mongosh`. Attached to named volume `task-manager-mongo-data` for data persistence across container recycles.
     - `backend`: Built from `./server`, reads environment secrets from `./server/.env`, connects to `mongodb:27017/taskdb` via Docker internal DNS, depends on `mongodb: condition: service_healthy`.
     - `frontend`: Built from `./client`, publishes host port `5173:80`, depends on `backend`.
4. **Resilient Connection Startup (`config/db.js`):**
   - Enhanced MongoDB database connector with 5 automated retry attempts (2s apart) to handle container initialization delays smoothly.

---

## 2. Key Questions (Assignment & PDF Requirements)

### Q1: What is the difference between referencing a service by name vs. `localhost` in Docker?
- Inside a Docker container, `localhost` (127.0.0.1) refers strictly to the container's own internal loopback network interface, **not** the host machine and **not** peer containers.
- When containers are joined to a user-defined Docker bridge network (e.g., `app-network`), Docker runs an embedded DNS server. Services resolve each other by their Compose service name (e.g., the backend connects to `mongodb://mongodb:27017/taskdb`).
- *Note on Frontend:* While backend-to-mongo communication uses internal service names, the browser running on the student's host machine executes client JavaScript; therefore, the frontend's API URL must be `http://localhost:5000` so host browser network requests reach the published host port.

### Q2: What is the difference between `EXPOSE` and `ports` in Docker?
- **`EXPOSE` (Dockerfile instruction):** Serves purely as documentation and metadata between image authors and operators. It indicates that the container process listens on a specific port, but **does not publish or open the port to the host system**.
- **`ports` (docker-compose.yml / `-p` flag):** Explicitly maps and forwards traffic from a host interface port to a container port (`"5000:5000"`). It creates iptables/NAT rules allowing outside traffic on the host machine to reach the containerized service.

### Q3: Why must `node_modules` never be copied into Docker images via `COPY . .`?
1. **OS & CPU Architecture Incompatibility:** Host dependencies may contain native C++ binary addons compiled specifically for Windows x64. If copied into a Linux Alpine container, the native bindings crash with `ELF` header or ABI errors.
2. **Context Bloat & Slow Builds:** Copying hundreds of megabytes of `node_modules` over Docker's build context drastically inflates build times and wastes disk I/O.
3. **Stale Packages:** Local dependencies may be dirty or out of sync with `package.json`. Running `npm install` inside the container guarantees a clean, reproducible dependency tree.
4. **Resolution:** Always list `node_modules` in `.dockerignore`.

---

## 3. Reflection & Troubleshooting (Common Errors & Fixes)

1. **Port 27017 Host Conflict:**
   - *Problem:* Running `docker compose up` while a local `mongod` service or standalone Docker container is already bound to `27017` causes `bind: address already in use`.
   - *Fix:* Stop the conflicting local MongoDB container (`docker stop mongo-dev`) or remap the host port in `docker-compose.yml` to `"27018:27017"`.
2. **SPA Subroute 404 on Page Reload:**
   - *Problem:* Navigating to `/projects` works inside the app, but hitting browser refresh on `http://localhost:5173/projects` yields Nginx 404 Not Found.
   - *Fix:* Added `location / { try_files $uri $uri/ /index.html; }` to `client/nginx.conf` so Nginx rewrites unmatched route paths back to `index.html`, allowing `react-router-dom` to handle the routing client-side.
3. **Stale Image Code After Edits:**
   - *Problem:* Making code changes in `client/` or `server/` does not reflect when running `docker compose up`.
   - *Fix:* Always pass the `--build` flag (`docker compose up --build -d`) to force Docker to rebuild changed layers.

---

## 4. 5 Likely Viva Questions & Concise Answers

### 1. What is the benefit of a multi-stage Docker build for the frontend?
A multi-stage build separates the build environment from the runtime environment. The first stage uses Node.js (~450MB) to compile React/Vite assets; the second stage copies only the static HTML/JS/CSS output into a lightweight Nginx Alpine image (~25MB). The final production image has no Node.js runtime, zero source code, and a tiny attack surface.

### 2. How does Docker Compose ensure MongoDB is ready before the backend starts?
Through a container `healthcheck` in combination with `depends_on`. The `mongodb` service runs `mongosh --eval "db.adminCommand('ping')"` every 5 seconds. The `backend` service specifies `depends_on: mongodb: condition: service_healthy`, which delays backend startup until Mongo successfully responds to the healthcheck ping.

### 3. What is the difference between `docker compose down` and `docker compose down -v`?
- `docker compose down`: Stops and removes running containers and networks, but **preserves named volumes** (`mongo-data`). User tasks and database records remain intact when starting up again.
- `docker compose down -v`: Stops containers and **destroys all attached named volumes**, wiping all database data.

### 4. Why is `ARG VITE_API_URL` required at build time for Vite apps?
Unlike backend servers that read `process.env` dynamically at runtime, Vite bakes client environment variables directly into compiled static JS bundles during `npm run build`. Therefore, `VITE_API_URL` must be passed as a Docker build argument (`ARG`).

### 5. What is the purpose of `.dockerignore`?
`.dockerignore` defines file patterns excluded from the Docker build context before files are sent to the Docker daemon. Excluding `node_modules`, `.git`, `.env`, and test logs accelerates build performance and prevents sensitive configuration files from leaking into image layers.
