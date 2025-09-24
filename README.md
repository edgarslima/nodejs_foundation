# NodeJS Foundation Stack

Monorepo containing a Fastify + Prisma backend and a Next.js App Router frontend. Authentication uses Argon2id password hashing, RS256 JWT access tokens, rotating refresh tokens (httpOnly cookie), and password reset tokens with hashed storage.

## Prerequisites

- Docker Desktop 4.30+
- Node.js 20+ (optional for local commands outside containers)

## Quick Start (Docker dev stack)

```bash
cp .env.example .env
npm install --prefix backend
npm install --prefix frontend

# Launch hot-reload dev environment
docker compose -f docker-compose.dev.yml up --build
```

Services:
- Backend: http://localhost:3010
- Frontend: http://localhost:3000
- MySQL: localhost:3310
- Redis: localhost:6379

### Production-style build

```bash
# Build and run production containers
./backend/node_modules/.bin/prisma migrate deploy --schema ./backend/prisma/schema.prisma
npm run build --prefix backend
npm run build --prefix frontend

docker compose up --build -d
```

## Environment Variables & Keys

Key variables defined in `.env.example`:

| Variable | Description |
| --- | --- |
| `ACCESS_TOKEN_TTL` | Access token lifetime (default `15m`) |
| `REFRESH_TOKEN_TTL` | Refresh token lifetime (default `7d`) |
| `PASSWORD_PEPPER` | Additional secret appended before hashing passwords |
| `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` | RSA PEM key material used for RS256 JWT signing |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded admin credentials |

### Generate RSA keys

```bash
openssl genrsa -out jwt-private.pem 4096
openssl rsa -in jwt-private.pem -pubout -out jwt-public.pem
```

Copy the PEM contents into `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` (mind newline escaping when using `.env`).

## Security Notes

- Passwords hashed with Argon2id (memoryCost 19456, timeCost 2, hashLength 32) + configurable pepper.
- Access tokens use RS256 and are short-lived; refresh tokens are stored hashed and rotated to prevent replay.
- Refresh tokens issued via httpOnly, secure cookies; never stored in localStorage.
- Reset-password tokens are base64url for users, SHA-256 hashed server-side, single-use, 20 minute TTL.
- Login, register, forgot/reset endpoints are rate limited and login attempts are recorded.

## API Usage Examples

```bash
API=http://localhost:3010

# Register
curl -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Str0ngPass!"}'

# Login
ACCESS=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"ChangeMe123!"}' | jq -r .accessToken)

# Access protected route
curl "$API/api/profile" -H "Authorization: Bearer $ACCESS"

# Refresh (cookie handled automatically when run in browser; CLI example shown)
curl -X POST "$API/auth/refresh" --cookie "refresh_token=<cookie>"

# Forgot password
curl -X POST "$API/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Reset password
curl -X POST "$API/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{"token":"<reset-token>","password":"NewStr0ngPass!"}'
```

## Documentation Index

- [Backend API reference](docs/reference/backend-api.md)
- How-to guides:
  - [Run dev stack with Docker](docs/how-to/run-dev-with-docker.md)
  - [Rotate JWT keys](docs/how-to/rotate-jwt-keys.md)
  - [Password reset flow](docs/how-to/reset-password-flow.md)

## Acceptance Checklist

- Admin account seeded from env values and able to authenticate.
- Register → Login → Access `/api/profile` → Refresh → Logout all succeed.
- Password reset tokens single-use and stored hashed.
- Rate limiting active on auth endpoints; login attempts recorded.
- Middleware redirects unauthenticated users to `/login?next=...`.
- ESLint, tests, and builds pass for both backend and frontend.