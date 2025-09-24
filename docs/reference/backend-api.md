# Backend API Reference

Base URL: `http://localhost:3010`

All routes use JSON and require `Authorization: Bearer <accessToken>` unless marked as public.

## Authentication

### POST /auth/register *(public, rate limited)*
- Body: `{ "email": string, "password": string }`
- Response: `201 Created` with `{ "id": string, "email": string }`

### POST /auth/login *(public, rate limited)*
- Body: `{ "email": string, "password": string }`
- Response: `{ "accessToken": string, "user": { id, email, role } }`
- Side effect: sets `refresh_token` httpOnly cookie.

### POST /auth/refresh *(public, certificate via cookie)*
- Reads `refresh_token` cookie, rotates refresh tokens.
- Response: `{ "accessToken": string, "user": { ... } }`

### POST /auth/logout *(auth required)*
- Clears refresh cookie and revokes the active token.
- Response: `204 No Content`

### GET /auth/me *(auth required)*
- Response: `{ id, email, role, lastLoginAt }`

### POST /auth/forgot-password *(public, rate limited)*
- Body: `{ "email": string }`
- Response: `202 Accepted`

### POST /auth/reset-password *(public, rate limited)*
- Body: `{ "token": string, "password": string }`
- Response: `204 No Content`

## Health

### GET /api/health *(public)*
- Response: `{ "status": "ok" }`

## Profile

### GET /api/profile *(auth required)*
- Response: `{ id, email, role, lastLoginAt }`

## Channels *(auth required by default)*
- `GET /api/channel` – list channels with optional filters.
- `POST /api/channel` – create channel.
- `GET /api/channel/:id` – fetch channel.
- `GET /api/channel/code/:channelCode` – lookup by code.
- `PUT /api/channel/:id` – update channel.
- `DELETE /api/channel/:id` – delete channel.

Channels endpoints expect/return the schemas documented earlier in the project (status, encrypted token fields, category array).