#!/usr/bin/env bash
# Start RabbitMQ + every Kit Vault service with one command:
#   ./dev.sh
# Backends only:
#   ./dev.sh --no-web
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

WITH_WEB=1
for arg in "$@"; do
  case "$arg" in
    --no-web) WITH_WEB=0 ;;
    -h|--help)
      echo "Usage: ./dev.sh [--no-web]"
      exit 0
      ;;
  esac
done

PIDS=()

stop_port() {
  local port="$1"
  local pids
  pids="$(lsof -ti tcp:"$port" 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    echo "Freeing port $port"
    # shellcheck disable=SC2086
    kill $pids 2>/dev/null || true
    sleep 0.3
  fi
}

wait_for() {
  local name="$1"
  local seconds="$2"
  shift 2
  local i
  for ((i = 0; i < seconds; i++)); do
    if "$@" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  echo "Timed out waiting for $name."
  return 1
}

ensure_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is not installed. Install Docker Desktop, then run ./dev.sh again."
    exit 1
  fi

  if docker info >/dev/null 2>&1; then
    return 0
  fi

  if [[ "$(uname -s)" == "Darwin" ]]; then
    echo "Starting Docker Desktop…"
    open -a Docker
  else
    echo "Start the Docker daemon, then run ./dev.sh again."
    exit 1
  fi

  echo "Waiting for Docker…"
  wait_for "Docker" 90 docker info
}

cleanup() {
  echo
  echo "Stopping services…"
  if ((${#PIDS[@]})); then
    kill "${PIDS[@]}" 2>/dev/null || true
    wait "${PIDS[@]}" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

ensure_docker

echo "Starting RabbitMQ, Redis, and Mailpit…"
docker compose up -d
echo "Waiting for RabbitMQ on :5672…"
wait_for "RabbitMQ" 60 bash -c 'nc -z 127.0.0.1 5672'
echo "Waiting for Redis on :6379…"
wait_for "Redis" 30 bash -c 'nc -z 127.0.0.1 6379'
echo "Waiting for Mailpit on :1025…"
wait_for "Mailpit" 30 bash -c 'nc -z 127.0.0.1 1025'

for port in 5025 5026 5027 5028 5029 5030 5031 5032 5033 5034; do
  stop_port "$port"
done
if [[ "$WITH_WEB" == "1" ]]; then
  stop_port 3000
fi

echo "Building solution…"
dotnet build "$ROOT/buy-that-fotball-dress.slnx" -v q

start_dotnet() {
  local name="$1"
  local project="$2"
  echo "→ $name"
  dotnet run --no-build --project "$ROOT/$project" --launch-profile http &
  PIDS+=("$!")
}

start_dotnet "AuctionService  :5025" "src/AuctionService/AuctionService.csproj"
start_dotnet "SearchService   :5026" "src/SearchService/SearchService.csproj"
start_dotnet "GatewayService  :5027" "src/GatewayService/GatewayService.csproj"
start_dotnet "IdentityService :5028" "src/IdentityService/IdentityService.csproj"
start_dotnet "BidService      :5029" "src/BidService/BidService.csproj"
start_dotnet "Notifications   :5030" "src/NotificationService/NotificationService.csproj"
start_dotnet "Settlement      :5031" "src/SettlementService/SettlementService.csproj"
start_dotnet "Email           :5032" "src/EmailService/EmailService.csproj"
start_dotnet "Admin           :5033" "src/AdminService/AdminService.csproj"
start_dotnet "Payment         :5034" "src/PaymentService/PaymentService.csproj"

if [[ "$WITH_WEB" == "1" ]]; then
  echo "→ web             :3000"
  (cd "$ROOT/web" && npm run dev) &
  PIDS+=("$!")
fi

cat <<EOF

Kit Vault is up. Ctrl+C stops everything.

  Web      http://localhost:3000
  Gateway  http://localhost:5027
  Auction  http://localhost:5025
  Search   http://localhost:5026
  Identity http://localhost:5028
  Bids     http://localhost:5029
  Live     http://localhost:5030  (SignalR /hubs/notifications)
  Desk     http://localhost:5031
  Mail     http://localhost:5032
  Office   http://localhost:5033
  Till     http://localhost:5034
  Redis    localhost:6379
  RabbitMQ http://localhost:15672  (guest/guest)
  Mailpit  http://localhost:8025   (letters)

EOF

wait
