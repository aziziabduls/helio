#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT/backend"
FRONTEND_DIR="$ROOT/frontend"

[ -f "$BACKEND_DIR/.env" ] || cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
[ -f "$FRONTEND_DIR/.env" ] || cp "$FRONTEND_DIR/.env.example" "$FRONTEND_DIR/.env"

[ -d "$BACKEND_DIR/node_modules" ] || npm --prefix "$BACKEND_DIR" install
[ -d "$FRONTEND_DIR/node_modules" ] || npm --prefix "$FRONTEND_DIR" install

# shortcut: assumes Docker container postgres17 when Docker is used, adjust if using another container or host Postgres
if command -v docker >/dev/null 2>&1 && docker ps -a --format '{{.Names}}' | grep -qx postgres17; then
  docker start postgres17 >/dev/null
  until docker exec postgres17 pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
  docker exec postgres17 psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='luma_db'" | grep -qx 1 \
    || docker exec postgres17 psql -U postgres -c "CREATE DATABASE luma_db;"
fi

[ -d "$BACKEND_DIR/node_modules/.prisma/client" ] || npm --prefix "$BACKEND_DIR" run prisma:generate
(cd "$BACKEND_DIR" && ./node_modules/.bin/prisma db push --skip-generate)

# Seed only on an empty database so local dev data is preserved across restarts
if (cd "$BACKEND_DIR" && node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.user.count().then(c => process.exit(c === 0 ? 0 : 1)).finally(() => p.\$disconnect())"); then
  npm --prefix "$BACKEND_DIR" run prisma:seed
fi

cleanup() {
  trap - INT TERM EXIT
  kill "${BACKEND_PID:-}" "${FRONTEND_PID:-}" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

npm --prefix "$BACKEND_DIR" run dev &
BACKEND_PID=$!

npm --prefix "$FRONTEND_DIR" run dev &
FRONTEND_PID=$!

wait
