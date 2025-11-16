#!/bin/bash

# Development environment startup script

echo "Starting development environment..."

# Check if .env files exist
if [ ! -f frontend/.env ]; then
  echo "Warning: frontend/.env file not found"
  echo "Please copy frontend/.env.example to frontend/.env and fill in your configuration"
fi

if [ ! -f backend/.env ]; then
  echo "Warning: backend/.env file not found"
  echo "Please copy backend/.env.example to backend/.env and fill in your configuration"
fi

# Stop existing containers
echo "Stopping existing containers..."
docker compose down

# Build and start development containers
echo "Building and starting development containers..."
docker compose build --no-cache
docker compose up -d

echo ""
echo "Development environment started!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo ""
echo "To view logs: docker compose logs -f"
echo "To stop: docker compose down"
