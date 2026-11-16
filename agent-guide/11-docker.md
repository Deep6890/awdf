# Practical 11 — Containerization with Docker and Docker Compose

**Goal:** `docker compose up --build` starts frontend, backend, MongoDB with no manual steps.

## Files to create (all under `task-manager/`)
```
server/Dockerfile      server/.dockerignore
client/Dockerfile      client/.dockerignore     client/nginx.conf
docker-compose.yml     .env.example (compose-level)
```
`.dockerignore` (both): `node_modules`, `.env`, `.env.*` (but not `.env.example`), `dist`, `coverage`, `.git`, `*.log`.

## server/Dockerfile
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```
(Use `npm install` not `npm ci` unless a lockfile is guaranteed present. Pin the node major to what the student's project uses; the PDF's `node:18` is end-of-life — note the deviation.)

## client/Dockerfile — multi-stage (supplementary)
```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```
`nginx.conf`: `listen 80; root /usr/share/nginx/html; location / { try_files $uri /index.html; }` (SPA fallback so `/projects` refresh works).
Important: `VITE_*` values are baked in **at build time**, and the browser (on the host) calls the backend via `http://localhost:5000`, not via the Docker service name.

## docker-compose.yml
Three services on a bridge network `app-network`:
- `mongodb`: `image: mongo:7`, `ports: ["27017:27017"]`, `volumes: [mongo-data:/data/db]` (named volume — supplementary), `healthcheck` using `mongosh --eval "db.adminCommand('ping')"`.
- `backend`: `build: ./server`, `ports: ["5000:5000"]`, `env_file: ./server/.env` (secrets), `environment:` overrides: `MONGO_URI=mongodb://mongodb:27017/taskdb`, `CLIENT_ORIGIN=http://localhost:5173`, `depends_on: mongodb: condition: service_healthy`.
- `frontend`: `build: { context: ./client, args: { VITE_API_URL: http://localhost:5000 } }`, `ports: ["5173:80"]`, `depends_on: [backend]`.
- `volumes: mongo-data:`; `networks: app-network: driver: bridge`.
Make the server robust to start order: `config/db.js` retries the initial connection a few times (e.g. 5 tries, 2 s apart) before exiting.
If `server/.env` doesn't exist the compose run must fail with a clear README instruction, so document "copy `.env.example` to `.env`" in the README. Do not bake secrets into images.

## Verify (if Docker is available)
- `docker compose config` is valid.
- `docker compose up --build -d` → `docker ps` shows 3 healthy/running containers.
- `curl http://localhost:5000/health` → ok; open `http://localhost:5173`; register, login, create a task.
- `docker compose down` then `up` again → task still present (named volume). `docker compose down -v` wipes data (document it).
- Rebuild after Dockerfile change needs `--build`.
If Docker isn't installed in your environment: validate YAML/Dockerfile syntax by inspection, and add to `MANUAL_TASKS.md` that the student must run the stack and screenshot `docker ps`.

## Key Questions → NOTES.md
Service name vs `localhost` (localhost inside a container is that container itself; Compose DNS resolves service names on the shared network); `EXPOSE` (documentation/metadata only) vs `ports` (actual host↔container publishing); why not copy `node_modules` (host OS/arch-specific native modules, huge context, slow builds, stale deps — install inside the image; `.dockerignore`).

## Troubleshooting notes to include in NOTES (Reflection)
Port 27017 already in use by a local mongod → change host side e.g. `"27018:27017"`; port 5173/5000 in use → stop the dev servers; stale image → `--build`.

## Evidence (MANUAL_TASKS)
`docker ps` screenshot, browser screenshot of the app at `localhost:5173`, persistence test screenshot.

## Commit
`build(p11): add Dockerfiles and docker-compose for the full stack`
