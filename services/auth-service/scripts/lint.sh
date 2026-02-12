set -e

cd "$(dirname "$0")/.."

echo "=> Build lint image"
docker build --target lint -t auth-service:lint .

echo "=> Run lint in container"
docker run --rm auth-service:lint