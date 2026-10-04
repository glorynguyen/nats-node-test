#!/bin/sh
set -eu

cd "$(dirname "$0")"

port="${PORT:-8000}"
url="http://localhost:${port}/"
log_file="${TMPDIR:-/tmp}/nats-node-test-serve-html.log"

if ! command -v docker >/dev/null 2>&1; then
  printf 'Docker is not installed or is not available on PATH.\n' >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  printf 'Docker is installed but unavailable. Start Docker Desktop and try again.\n' >&2
  exit 1
fi

container_status="$(docker container inspect --format '{{.State.Status}}' nats-server 2>/dev/null || true)"
case "$container_status" in
  running)
    printf 'NATS container is already running.\n'
    ;;
  "")
    docker run -d --name nats-server \
      -p 4222:4222 -p 8222:8222 -p 8080:8080 \
      -v "$(pwd)/nats.conf:/nats.conf" \
      nats:latest -c /nats.conf >/dev/null
    ;;
  *)
    docker start nats-server >/dev/null
    printf 'Started the existing NATS container.\n'
    ;;
esac

if curl --silent --fail "$url" >/dev/null; then
  open "$url"
  printf 'Opened %s\n' "$url"
  exit 0
fi

nohup env PORT="$port" npm start >"$log_file" 2>&1 </dev/null &

attempt=0
while [ "$attempt" -lt 30 ]; do
  if curl --silent --fail "$url" >/dev/null; then
    open "$url"
    printf 'Opened %s\n' "$url"
    exit 0
  fi

  attempt=$((attempt + 1))
  sleep 1
done

printf 'The website did not start. Check %s for details.\n' "$log_file" >&2
exit 1