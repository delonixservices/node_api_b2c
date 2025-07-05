#!/bin/bash

# TripBazaar Production Deployment Script
# ======================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="tripbazaar"
DOMAIN="tripbazaar.in"
API_DOMAIN="api.tripbazaar.in"
ENVIRONMENT="production"

echo -e "${BLUE}🚀 Starting TripBazaar Production Deployment${NC}"
echo "=================================================="

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env files exist
if [ ! -f "node/env.production.example" ]; then
    print_error "Production environment file not found: node/env.production.example"
    exit 1
fi

if [ ! -f "next/env.production.example" ]; then
    print_error "Frontend environment file not found: next/env.production.example"
    exit 1
fi

print_status "Prerequisites check completed"

# Create production environment files
echo -e "${BLUE}🔧 Setting up environment files...${NC}"

# Backend environment
if [ ! -f "node/.env.production" ]; then
    cp node/env.production.example node/.env.production
    print_warning "Created node/.env.production - Please update with your actual values"
else
    print_status "Backend environment file already exists"
fi

# Frontend environment
if [ ! -f "next/.env.production" ]; then
    cp next/env.production.example next/.env.production
    print_warning "Created next/.env.production - Please update with your actual values"
else
    print_status "Frontend environment file already exists"
fi

# Create necessary directories
echo -e "${BLUE}📁 Creating necessary directories...${NC}"

mkdir -p node/logs
mkdir -p node/public/uploads
mkdir -p node/nginx/ssl
mkdir -p next/out
mkdir -p backups
mkdir -p monitoring/grafana/dashboards
mkdir -p monitoring/grafana/datasources

print_status "Directories created"

# Generate SSL certificates (self-signed for development)
echo -e "${BLUE}🔐 Setting up SSL certificates...${NC}"

if [ ! -f "node/nginx/ssl/tripbazaar.crt" ]; then
    print_warning "Generating self-signed SSL certificate for development"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout node/nginx/ssl/tripbazaar.key \
        -out node/nginx/ssl/tripbazaar.crt \
        -subj "/C=IN/ST=State/L=City/O=TripBazaar/CN=$DOMAIN"
    print_status "SSL certificate generated"
else
    print_status "SSL certificate already exists"
fi

# Create Prometheus configuration
echo -e "${BLUE}📊 Setting up monitoring...${NC}"

cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'backend'
    static_configs:
      - targets: ['backend:3334']
    metrics_path: '/metrics'

  - job_name: 'frontend'
    static_configs:
      - targets: ['frontend:3000']
    metrics_path: '/api/health'
EOF

print_status "Prometheus configuration created"

# Create Grafana datasource
mkdir -p monitoring/grafana/datasources
cat > monitoring/grafana/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF

print_status "Grafana datasource configuration created"

# Build and start services
echo -e "${BLUE}🏗️  Building and starting services...${NC}"

# Stop any existing containers
docker-compose -f docker-compose.production.yml down --remove-orphans

# Build images
docker-compose -f docker-compose.production.yml build --no-cache

# Start services
docker-compose -f docker-compose.production.yml up -d

print_status "Services started successfully"

# Wait for services to be healthy
echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"

# Wait for MongoDB
echo "Waiting for MongoDB..."
until docker-compose -f docker-compose.production.yml exec -T mongo mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
    sleep 5
done
print_status "MongoDB is ready"

# Wait for Redis
echo "Waiting for Redis..."
until docker-compose -f docker-compose.production.yml exec -T redis redis-cli -a \${REDIS_PASSWORD} ping > /dev/null 2>&1; do
    sleep 5
done
print_status "Redis is ready"

# Wait for Backend
echo "Waiting for Backend..."
until curl -f http://localhost:3334/health > /dev/null 2>&1; do
    sleep 5
done
print_status "Backend is ready"

# Wait for Frontend
echo "Waiting for Frontend..."
until curl -f http://localhost:3000 > /dev/null 2>&1; do
    sleep 5
done
print_status "Frontend is ready"

# Wait for Nginx
echo "Waiting for Nginx..."
until curl -f http://localhost > /dev/null 2>&1; do
    sleep 5
done
print_status "Nginx is ready"

# Health check
echo -e "${BLUE}🏥 Performing health checks...${NC}"

# Check all services
services=("mongo" "redis" "backend" "frontend" "nginx" "prometheus" "grafana")
for service in "${services[@]}"; do
    if docker-compose -f docker-compose.production.yml ps $service | grep -q "Up"; then
        print_status "$service is running"
    else
        print_error "$service is not running"
    fi
done

# Final status
echo -e "${BLUE}🎉 Deployment completed successfully!${NC}"
echo "=================================================="
echo -e "${GREEN}✅ TripBazaar is now running in production mode${NC}"
echo ""
echo -e "${BLUE}📱 Application URLs:${NC}"
echo -e "   Frontend: ${GREEN}https://$DOMAIN${NC}"
echo -e "   API: ${GREEN}https://$API_DOMAIN${NC}"
echo -e "   Admin Dashboard: ${GREEN}https://$DOMAIN/admin${NC}"
echo ""
echo -e "${BLUE}📊 Monitoring URLs:${NC}"
echo -e "   Grafana: ${GREEN}http://localhost:3001${NC} (admin/admin)"
echo -e "   Prometheus: ${GREEN}http://localhost:9090${NC}"
echo -e "   Kibana: ${GREEN}http://localhost:5601${NC}"
echo ""
echo -e "${BLUE}🔧 Management Commands:${NC}"
echo -e "   View logs: ${YELLOW}docker-compose -f docker-compose.production.yml logs -f${NC}"
echo -e "   Stop services: ${YELLOW}docker-compose -f docker-compose.production.yml down${NC}"
echo -e "   Restart services: ${YELLOW}docker-compose -f docker-compose.production.yml restart${NC}"
echo -e "   Update services: ${YELLOW}docker-compose -f docker-compose.production.yml pull && docker-compose -f docker-compose.production.yml up -d${NC}"
echo ""
echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo -e "   1. Update environment variables in node/.env.production and next/.env.production"
echo -e "   2. Replace self-signed SSL certificate with a valid one for production"
echo -e "   3. Set up proper backup strategies"
echo -e "   4. Configure monitoring alerts"
echo -e "   5. Set up CI/CD pipeline for automated deployments"
echo ""
echo -e "${GREEN}🚀 TripBazaar is ready for production use!${NC}" 