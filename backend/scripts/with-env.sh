#!/usr/bin/env bash
# Automatically loads backend/.env into environment and executes the given command
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$(cd "$SCRIPT_DIR/.." && pwd)/.env"

if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

if [ $# -eq 0 ]; then
  echo "Usage: $0 <command> [args...]"
  echo "Example: $0 curl -s -X POST https://integrate.api.nvidia.com/v1/chat/completions -H \"Authorization: Bearer \$NVIDIA_API_KEY\""
  exit 1
fi

exec "$@"
