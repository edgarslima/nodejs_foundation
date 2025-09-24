# Database Service

Containerized MySQL service exposed on host port `3310` for local backend connectivity and external tools like MySQL Workbench.

## Configuration

Copy the example environment file and adjust as needed:

```bash
cp .env.example .env
```

Environment variables:

- `MYSQL_HOST_PORT`: Host port that maps to container port 3306 (default `3310`).
- `MYSQL_ROOT_PASSWORD`: Root user password (default `root_001`).
- `MYSQL_DATABASE`: Default database created on first startup (default `base_default`).
- `MYSQL_USER`: Additional application user created automatically.
- `MYSQL_PASSWORD`: Password for the application user.

All variables can be overridden at runtime or via Docker Compose profiles.

## Usage

```bash
docker compose --env-file .env up -d
```

This command builds the custom MySQL image (required for per-service Dockerfile) and starts the container. The data directory persists via the named volume `mysql_data`.

### Stopping

```bash
docker compose down
```

Pass `--volumes` to remove the MySQL data volume if you need a clean state.

## Connectivity

- **Backend service:** point the connection string to `mysql://app_user:app_user_password@localhost:3310/base_default` (adjust values to match your `.env`).
- **External tools:** connect using host `localhost`, port `3310`, and root credentials (`root` user with the configured password).

Ensure the backend container joins the same Docker network created by this Compose file or share a higher-level `docker-compose.yml` that orchestrates both services.
