#!/bin/sh
set -e

wait_for_db() {
  HOST="${DB_HOST:-db}"
  PG_PORT="${DB_PORT:-5432}"
  USER="${DB_USER:-postgres}"
  NAME="${DB_NAME:-app_db}"
  MAX_ATTEMPTS="${MAX_ATTEMPTS:-60}"
  SLEEP_SECS="${SLEEP_SECS:-1}"

  echo "[entrypoint] Waiting for PostgreSQL ${HOST}:${PG_PORT} (db=${NAME}, user=${USER})..."
  ATTEMPT=0
  until pg_isready -h "$HOST" -p "$PG_PORT" -U "$USER" -d "$NAME" >/dev/null 2>&1; do
    ATTEMPT=$((ATTEMPT + 1))
    if [ "$ATTEMPT" -ge "$MAX_ATTEMPTS" ]; then
      echo "[entrypoint] Database is not ready after ${MAX_ATTEMPTS} attempts. Exiting." >&2
      exit 1
    fi
    sleep "$SLEEP_SECS"
  done
  echo "[entrypoint] PostgreSQL is ready."
}

run_migrations() {
  if [ "${RUN_MIGRATIONS:-true}" = "false" ]; then
    echo "[entrypoint] Skipping migrations (RUN_MIGRATIONS=false)."
    return 0
  fi
  echo "[entrypoint] Running migrations..."
  npm run migrate
  if [ "${RUN_SEEDS:-true}" = "true" ]; then
    echo "[entrypoint] Running seeds..."
    npm run seed || echo "[entrypoint] No seeds to apply or seeds failed. Continuing..."
  else
    echo "[entrypoint] Skipping seeds (RUN_SEEDS=false)."
  fi
}

# Main
wait_for_db
run_migrations

exec "$@"