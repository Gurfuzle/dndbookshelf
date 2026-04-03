#!/usr/bin/env bash
set -euo pipefail

BACKEND_PORT=8024

# ── Free backend port ──────────────────────────────────────────
PID=$(lsof -ti tcp:"$BACKEND_PORT" 2>/dev/null || true)
if [ -n "$PID" ]; then
  echo "▸ Killing process $PID on port $BACKEND_PORT..."
  kill -9 $PID 2>/dev/null || true
  sleep 1
fi

# ── Start backend ──────────────────────────────────────────────
echo "▸ Starting backend on port $BACKEND_PORT..."
cd "$(dirname "$0")"
exec ./gradlew bootRun
