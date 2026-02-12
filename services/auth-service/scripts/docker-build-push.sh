set -e

cd "$(dirname "$0")/.."

echo "=> Login to Docker hub"
echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin

echo "=> Build production image"
docker build --target production -t "$DOCKERHUB_USERNAME/auth-service:latest" .

echo "=> Push image to Dockerhub"
docker push "$DOCKERHUB_USERNAME/auth-service:latest"