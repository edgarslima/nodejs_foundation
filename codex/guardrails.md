# Codex Guardrails

- Enforce American English for all identifiers, strings, documentation, and commit messages. Refactor legacy names to American English whenever touched.
- All new backend routes must require `fastify.authenticate` by default. Only the explicitly allowed public routes should opt out inside the route registration.
- Frontend route protection must rely on Next.js Middleware that checks for the `refresh_token` cookie and redirects unauthenticated users to `/login?next=...`. Always preserve the `next` parameter through the sign-in flow.
- Follow Clean Architecture boundaries and keep domain logic decoupled from transport/infrastructure concerns.