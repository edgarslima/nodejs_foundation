# Changelog

## [Unreleased]
- Add JWT-based authentication infrastructure (Argon2id password hashing, RS256 tokens, refresh rotation, password reset tokens).
- Seed admin user from environment configuration.
- Extend Prisma schema with security models and migrations.
- Introduce Next.js auth context, API client, and admin UI shell groundwork.
- Provide Docker Compose stacks for production and hot-reload development (MySQL + Redis + backend + frontend).
- Document backend API, operational how-to guides, and security procedures.
- Configure Codex guardrails to enforce authentication by default and American English naming.