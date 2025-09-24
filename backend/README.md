# Backend Service

This Fastify + Prisma service exposes a health check and a full CRUD API for managing channels and their categories. It targets a MySQL database (default port `3310`) and runs on HTTP port `3010` by default.

## Prerequisites

- Node.js 20+
- npm 10+
- Docker (recommended for running the MySQL container defined in `../database`)

## Environment Variables

Copy the example configuration and adjust as needed:

```bash
cp .env.example .env
```

`DATABASE_URL` must point to a reachable MySQL instance. By default it targets the database container exposed on `localhost:3310` with `root/root_001` credentials and database `base_default`.

Optional variables:
- `PORT`: HTTP port (defaults to `3010`).
- `HOST`: Listen address (defaults to `0.0.0.0`).
- `LOG_LEVEL`: Fastify logger level (defaults to `info`).

## Installation & Database Setup

Install dependencies and generate the Prisma client:

```bash
npm install
npm run prisma:generate
```

Run MySQL (from the repository root):

```bash
cd ../database
cp .env.example .env # adjust if needed
docker compose --env-file .env up -d
```

Apply migrations to create the `Channel`, `Category`, and `ChannelCategory` tables:

```bash
cd ../backend
npm run prisma:migrate
```

## Development

```bash
npm run dev
```

The service listens on `http://localhost:3010`. Override with `PORT` env variable if required.

## Testing

```bash
# ensure the MySQL container from ../database is running
npm test
```

The Vitest suite exercises the health route and a full channel CRUD lifecycle against the database, cleaning up test data automatically.

## Type Checking & Build

```bash
npm run typecheck
npm run build
```

## Docker Usage

Build and run the backend container:

```bash
docker build -t backend-service .
docker run --rm -p 3010:3010 --env-file .env backend-service
```

Verify the health endpoint:

```bash
curl http://localhost:3010/health
```

## API Reference

### Health

`GET /health`
- **Description:** Service availability check.
- **Response:** `{ "status": "ok" }`

### Channel CRUD

All channel payloads store encrypted publish tokens as base64 strings. Categories are referenced by their UUIDs from the `Category` table.

`GET /api/channel`
- Optional query parameters:
  - `search`: partial match against `name` or `channelCode`.
  - `isActive`: `true` or `false` filter.
  - `categoryId`: only return channels linked to the given category.
- **Response:** Array of channel objects (see schema below).

`GET /api/channel/{id}`
- Fetches a specific channel by its UUID.

`GET /api/channel/code/{channelCode}`
- Fetches a channel by its unique `channelCode`.

`POST /api/channel`
- **Body:**
  ```json
  {
    "channelCode": "unique-code",
    "name": "Channel Name",
    "description": "Optional",
    "publishToken": {
      "cipher": "base64-encoded-ciphertext",
      "iv": "base64-encoded-iv",
      "tag": "base64-encoded-tag"
    },
    "lastPublishAt": "2025-09-23T20:00:00.000Z",
    "isActive": true,
    "createdByUserId": "optional-user-id",
    "updatedByUserId": "optional-user-id",
    "categoryIds": ["category-uuid"]
  }
  ```
- **Response:** `201 Created` with the persisted channel (publish token still in base64 form) and linked categories.

`PUT /api/channel/{id}`
- Partial updates allowed. Fields set to `null` clear nullable columns (e.g., `description`, `lastPublishAt`).
- `categoryIds` replaces existing relations; send an empty array to remove all links.

`DELETE /api/channel/{id}`
- Removes the channel and its channel-category relations.
- **Response:** `204 No Content`.

### Channel Response Schema

```json
{
  "id": "uuid",
  "channelCode": "unique-code",
  "name": "Channel Name",
  "description": "Optional description or null",
  "publishToken": {
    "cipher": "base64",
    "iv": "base64",
    "tag": "base64"
  },
  "lastPublishAt": "2025-09-23T20:00:00.000Z",
  "isActive": true,
  "createdAt": "2025-09-23T19:59:00.000Z",
  "updatedAt": "2025-09-23T19:59:00.000Z",
  "createdByUserId": "uuid-or-null",
  "updatedByUserId": "uuid-or-null",
  "categories": [
    {
      "id": "category-uuid",
      "name": "Education",
      "youtubeCategoryId": 27
    }
  ]
}
```

## Database Schema

Prisma models backing the API:

- `Channel`: stores channel metadata, encrypted publish token fragments, and auditing fields.
- `Category`: catalog of categories (`name` unique, optional YouTube mapping).
- `ChannelCategory`: join table enforcing the many-to-many relationship with composite primary key and foreign keys.

The generated migration (`prisma/migrations/.../migration.sql`) also includes helpful indexes on `Channel.name` and `Channel.isActive`.