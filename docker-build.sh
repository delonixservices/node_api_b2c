#!/bin/bash

# Docker Build and Push Script for B2C API
# Usage: ./docker-build.sh [username] [tag]

set -e

# Default values
DOCKER_USERNAME=${1:-"your-dockerhub-username"}
IMAGE_NAME="b2c-api"
TAG=${2:-"latest"}

echo "🐳 Building Docker image for B2C API..."
echo "Username: $DOCKER_USERNAME"
echo "Image: $IMAGE_NAME"
echo "Tag: $TAG"

# Build the Docker image
echo "📦 Building image..."
docker build -t $IMAGE_NAME .

# Tag the image for Docker Hub
echo "🏷️  Tagging image..."
docker tag $IMAGE_NAME $DOCKER_USERNAME/$IMAGE_NAME:$TAG

# Login to Docker Hub (will prompt for credentials)
echo "🔐 Logging in to Docker Hub..."
docker login

# Push to Docker Hub
echo "⬆️  Pushing to Docker Hub..."
docker push $DOCKER_USERNAME/$IMAGE_NAME:$TAG

echo "✅ Successfully pushed $DOCKER_USERNAME/$IMAGE_NAME:$TAG to Docker Hub!"

# Optional: Clean up local images
read -p "🧹 Do you want to remove local images? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removing local images..."
    docker rmi $IMAGE_NAME
    docker rmi $DOCKER_USERNAME/$IMAGE_NAME:$TAG
    echo "✅ Local images removed!"
fi

echo "🎉 Done! Your image is now available on Docker Hub."
echo "To pull and run: docker run -p 3334:3334 $DOCKER_USERNAME/$IMAGE_NAME:$TAG" 