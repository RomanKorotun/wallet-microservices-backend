set -e

cd "$(dirname "$0")/.."

echo "=> Build production image"
docker build --target build -t auth-service:build .
