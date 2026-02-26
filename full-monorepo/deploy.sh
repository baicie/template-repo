#!/bin/bash

# Ensure we are in the root directory
cd "$(dirname "$0")"

echo "Deploying Full Monorepo..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running."
  exit 1
fi

# Build and start services
echo "Building and starting services with Docker Compose..."
docker-compose up -d --build

echo "Deployment complete!"
echo "Web App running at http://localhost:8080"
echo "Backend running at http://localhost:3001"
