set -e

cd "$(dirname "$0")/.."

echo "=> Build CD image"
docker build --target deploy -t auth-service:cd .

echo "=> Run CD image in container (prisma migrations)"
docker run --rm -e DATABASE_URL="$DATABASE_URL" auth-service:cd