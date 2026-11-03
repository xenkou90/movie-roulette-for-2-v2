#!/usr/bin/env bash
# Deploys the latest main on the server: pull, install, build, reload, check.
# Run on the server from anywhere: /var/www/whatshouldwewatch/deploy/deploy.sh

set -eo pipefail

cd "$(dirname "$0")/.."

# nvm is a shell function, so it has to be loaded into this script.
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
# shellcheck source=/dev/null
. "$NVM_DIR/nvm.sh"

set -u

echo "==> Pulling the latest code"
git pull --ff-only

echo "==> Installing dependencies on Node $(cat .nvmrc)"
nvm use >/dev/null
npm ci

echo "==> Building"
npm run build

echo "==> Reloading the app"
nvm use default >/dev/null
pm2 reload ecosystem.config.cjs
pm2 save

echo "==> Checking health"
for _ in $(seq 1 10); do
  if curl --silent --fail http://127.0.0.1:3001/health >/dev/null; then
    echo "==> Deployed $(git rev-parse --short HEAD)"
    exit 0
  fi
  sleep 1
done

echo "!! The server did not become healthy. Check: pm2 logs movie-roulette" >&2
exit 1
