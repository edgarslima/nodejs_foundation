# How to Run the Dev Stack with Docker

1. Copy the root environment sample:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies locally once (enables type-aware tooling inside the containers):
   ```bash
   npm install --prefix backend
   npm install --prefix frontend
   ```
3. Start the hot-reload stack:
   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```
4. Access services:
   - Backend: http://localhost:3010 (Fastify + Prisma, auto-reloads on file change)
   - Frontend: http://localhost:3000 (Next.js dev server with HMR)
   - MySQL: localhost:3310 (credentials: app_user / app_user_password)
   - Redis: localhost:6379

Use `docker compose -f docker-compose.dev.yml down` to stop. Add `-v` to discard MySQL data.