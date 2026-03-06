set -e

cd "$(dirname "$0")/.."

echo "=> Build and start E2E containers"
docker compose -f docker-compose.e2e.yml up --build -d

echo "=> Show logs for auth-service"
docker compose -f docker-compose.e2e.yml logs -f auth-service

echo "=> Stop and remove containers, volumes"
docker compose -f docker-compose.e2e.yml down -v
