#!/bin/bash

# Build script for Lab Interpretation Docker image

set -e

echo "Building Lab Interpretation Docker image..."

# Get the project root directory (parent of docker directory)
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

cd "$PROJECT_ROOT"

# Build the Docker image
docker build \
  -f docker/lab-interpretation/Dockerfile \
  -t lab-interpretation:latest \
  -t lab-interpretation:$(date +%Y%m%d-%H%M%S) \
  .

echo "Build complete!"
echo ""
echo "To run the container:"
echo "  docker run -d -p 8080:80 --name lab-interpretation lab-interpretation:latest"

