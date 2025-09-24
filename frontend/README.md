# Frontend Service

Next.js App Router frontend with TypeScript, Tailwind CSS, ESLint, and Turbopack. The application now exposes a dedicated admin area inspired by TailAdmin while remaining fully componentised for future growth.

## Prerequisites

- Node.js 20+
- npm 10+
- Docker (for containerized runs)

## Environment Setup

Copy the example file and tune variables as required:

```bash
cp .env.example .env
```

Available variables:

- `NEXT_PUBLIC_API_BASE_URL` – REST entrypoint consumed by the UI (default `http://localhost:3010`).
- `ADMIN_UI_USE_CDN` – when `true`, the admin layout loads Tailwind Play CDN for instant style tweaks; when `false`, the local PostCSS build is used.
- `ADMIN_GUARD_BYPASS` – optional dev escape hatch. Keep `false` to enforce the JWT guard.

## Scripts

```bash
npm install        # install dependencies
npm run dev        # start Next.js in development mode (Turbopack)
npm run lint       # run ESLint checks
npm run build      # create an optimized production build
npm run start      # serve the production build (requires `npm run build`)
```

## Admin Area Overview

- `/admin` – dashboard with metric cards and recent activity table.
- `/admin/channels` – channel catalogue with filters, pagination controls, and quick links.
- `/admin/channels/new` – creation form scaffold (metadata + security fields).
- `/admin/channels/[id]` – editable detail view placeholder.

Shared UI primitives live under `src/components/admin/*` (sidebar, topbar, breadcrumbs, table, forms). Navigation entries are defined in `src/config/adminNav.tsx` and consumed by the layout shell.

### Tailwind CDN switch

The admin layout conditionally injects the Tailwind Play CDN script and inline config whenever `ADMIN_UI_USE_CDN=true`. This is ideal for quick prototyping. Production builds should flip the flag to `false` so the regular Tailwind pipeline handles purging and bundling (`src/app/globals.css` remains the source of truth).

### JWT guard middleware

`src/middleware.ts` protects every `/admin` route. Access is granted when either:

1. An `admin_token` cookie is present, or
2. A `Bearer <token>` Authorization header is supplied.

Without a token, users are redirected to `/login`, which provides a temporary form that stores a demo token in `document.cookie`. Replace this flow with the real authentication service when available.

Set `ADMIN_GUARD_BYPASS=true` in `.env` only if you need to disable the guard during local debugging.

## Project Structure Highlights

- `src/app/layout.tsx` – global HTML/body wrapper + shared fonts.
- `src/app/(admin)/admin/*` – admin layout, dashboard, channel routes.
- `src/app/login/page.tsx` – temporary helper for initializing the admin session cookie.
- `src/components/admin/*` – reusable building blocks (button, form fields, table, shell components).
- `src/lib/` – utility helpers (`cn`, admin UI env helpers).

## Docker

Build and run the production image:

```bash
docker build -t frontend-app .
docker run --rm -p 3000:3000 --env-file .env frontend-app
```

The container uses Next.js standalone output and serves on port `3000`.

## Next Steps

- Wire the admin pages to real backend APIs for channel CRUD.
- Replace the placeholder login with the production authentication flow.
- Add integration tests (e.g., Playwright) for admin-critical journeys.