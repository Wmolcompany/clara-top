#!/bin/bash

# Clara Zen - Deploy Script for VPS KVM 2
# This script automates the deployment process

set -e

echo "🚀 Starting Clara Zen deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs/nginx logs/api logs/php nginx/ssl

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from .env.example..."
    cp .env.example .env
    print_warning "Please edit .env file with your configuration before continuing."
    read -p "Press enter to continue after editing .env file..."
fi

# Pull latest images
print_status "Pulling latest Docker images..."
docker-compose pull

# Build and start services
print_status "Building and starting services..."
docker-compose up -d --build

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check if services are running
print_status "Checking service status..."
docker-compose ps

# Run database migrations (if needed)
print_status "Running database setup..."
docker-compose exec -T db mysql -u root -p${DB_ROOT_PASSWORD} clarazen < infra/init-db.sql || true

# Show logs
print_status "Showing recent logs..."
docker-compose logs --tail=50

# Final status
print_status "Deployment completed!"
print_status "Services should be available at:"
echo "  - Frontend: http://localhost"
echo "  - API: http://localhost/api"
echo "  - API Docs: http://localhost/api/docs"
echo "  - Portainer: http://localhost:9000"

print_warning "Don't forget to:"
echo "  1. Configure your domain DNS to point to this server"
echo "  2. Set up SSL certificates for HTTPS"
echo "  3. Configure firewall rules"
echo "  4. Set up backup procedures"
echo "  5. Monitor logs regularly"

print_status "To view logs: docker-compose logs -f [service_name]"
print_status "To restart services: docker-compose restart"
print_status "To stop services: docker-compose down"