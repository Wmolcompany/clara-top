#!/bin/bash

# Clara Zen - Deploy Script for VPS KVM 2
# This script automates the deployment process with affiliate system

set -e

echo "🚀 Starting Clara Zen deployment with affiliate system..."

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
mkdir -p logs/nginx logs/api logs/php nginx/ssl apps/api/templates

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from .env.example..."
    cp .env.example .env
    print_warning "Please edit .env file with your configuration before continuing."
    read -p "Press enter to continue after editing .env file..."
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
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

# Run database migrations
print_status "Running database migrations..."
docker-compose exec -T db mysql -u root -p${DB_ROOT_PASSWORD} -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import database schema
if [ -f "infra/migrations/001_affiliate_system.sql" ]; then
    print_status "Importing affiliate system schema..."
    docker-compose exec -T db mysql -u root -p${DB_ROOT_PASSWORD} ${DB_NAME} < infra/migrations/001_affiliate_system.sql
fi

# Create admin user if not exists
print_status "Setting up admin user..."
docker-compose exec -T db mysql -u root -p${DB_ROOT_PASSWORD} ${DB_NAME} -e "
INSERT IGNORE INTO users (name, email, password, role, plan, status, email_verified) 
VALUES ('Admin', 'admin@clarazen.com.br', '\$2b\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'premium', 'active', 1);
"

# Setup cron job for commission release
print_status "Setting up cron jobs..."
docker-compose exec api sh -c "echo '0 0 * * * curl -X POST http://localhost:4000/api/affiliates/release-commissions' | crontab -"

# Show logs
print_status "Showing recent logs..."
docker-compose logs --tail=50

# Final status
print_status "Deployment completed!"
print_status "Services should be available at:"
echo "  - Frontend: http://localhost:3000"
echo "  - API: http://localhost:4000"
echo "  - API Docs: http://localhost:4000/api/docs"
echo "  - Portainer: http://localhost:9000"
echo "  - Admin Panel: http://localhost:3000/admin/dashboard"
echo "  - Affiliate Panel: http://localhost:3000/affiliate/dashboard"

print_warning "Default admin credentials:"
echo "  - Email: admin@clarazen.com.br"
echo "  - Password: password123"

print_warning "Don't forget to:"
echo "  1. Configure your domain DNS to point to this server"
echo "  2. Set up SSL certificates for HTTPS"
echo "  3. Configure Stripe keys in admin panel"
echo "  4. Set up OpenAI API key"
echo "  5. Configure SMTP settings"
echo "  6. Set up backup procedures"
echo "  7. Monitor logs regularly"

print_status "To view logs: docker-compose logs -f [service_name]"
print_status "To restart services: docker-compose restart"
print_status "To stop services: docker-compose down"

# Create dist folder for Apache deployment
print_status "Creating dist folder for Apache deployment..."
mkdir -p dist

# Copy PHP files to dist
print_status "Copying PHP files to dist..."
cp -r project/* dist/
cp .htaccess dist/
cp -r infra dist/

# Create Apache virtual host configuration
print_status "Creating Apache virtual host configuration..."
cat > dist/clara-zen.conf << 'EOF'
<VirtualHost *:80>
    ServerName clarazen.com.br
    ServerAlias www.clarazen.com.br
    DocumentRoot /var/www/html/clara-zen
    
    <Directory /var/www/html/clara-zen>
        AllowOverride All
        Require all granted
    </Directory>
    
    # Security headers
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    
    # Compression
    LoadModule deflate_module modules/mod_deflate.so
    <Location />
        SetOutputFilter DEFLATE
        SetEnvIfNoCase Request_URI \
            \.(?:gif|jpe?g|png)$ no-gzip dont-vary
        SetEnvIfNoCase Request_URI \
            \.(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary
    </Location>
    
    ErrorLog ${APACHE_LOG_DIR}/clara-zen_error.log
    CustomLog ${APACHE_LOG_DIR}/clara-zen_access.log combined
</VirtualHost>
EOF

print_status "Apache configuration created at dist/clara-zen.conf"
print_status "Upload the dist/ folder to your web server and configure the virtual host."

echo ""
print_status "🎉 Clara Zen deployment completed successfully!"
print_status "Your SaaS platform with affiliate system is ready to use!"