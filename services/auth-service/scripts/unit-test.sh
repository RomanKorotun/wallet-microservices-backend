set -e

cd "$(dirname "$0")/.."

echo "=> Build unit test image"
docker build --target unit -t auth-service:unit .

echo "=> Run unit test in container"
docker run --rm auth-service:unit