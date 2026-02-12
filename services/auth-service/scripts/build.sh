set -e

cd "$(dirname "$0")/.."

echo "=> Build project image"
docker build --target build -t auth-service:build .
