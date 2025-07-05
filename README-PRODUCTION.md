# TripBazaar Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the TripBazaar B2C travel booking application to production. The application consists of a Next.js frontend and Node.js backend with MongoDB and Redis.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx (SSL)   │    │   Next.js App   │    │   Node.js API   │
│   Port: 80,443  │    │   Port: 3000    │    │   Port: 3334    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
         │   MongoDB       │    │   Redis Cache   │    │   Monitoring    │
         │   Port: 27017   │    │   Port: 6379    │    │   Prometheus    │
         └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 20GB free space
- **CPU**: 2+ cores recommended

### Software Requirements
- Docker 20.10+
- Docker Compose 2.0+
- Git
- OpenSSL (for SSL certificate generation)

### Domain Configuration
- Domain: `tripbazaar.in`
- API Subdomain: `api.tripbazaar.in`
- SSL certificates for both domains

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd b2c

# Make deployment script executable
chmod +x deploy-production.sh

# Run the deployment script
./deploy-production.sh
```

### 2. Manual Setup (Alternative)

If you prefer manual setup, follow these steps:

```bash
# 1. Create environment files
cp node/env.production.example node/.env.production
cp next/env.production.example next/.env.production

# 2. Update environment variables
nano node/.env.production
nano next/.env.production

# 3. Create directories
mkdir -p node/logs node/public/uploads node/nginx/ssl next/out backups

# 4. Generate SSL certificates
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout node/nginx/ssl/tripbazaar.key \
    -out node/nginx/ssl/tripbazaar.crt \
    -subj "/C=IN/ST=State/L=City/O=TripBazaar/CN=tripbazaar.in"

# 5. Start services
docker-compose -f docker-compose.production.yml up -d
```

## Environment Configuration

### Backend Environment Variables (`node/.env.production`)

```bash
# Application Configuration
NODE_ENV=production
PORT=3334
HOST=0.0.0.0

# Database Configuration
DB_CONNECTION_STRING=mongodb://mongo:27017/b2capi
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_mongo_password_here

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_redis_password_here

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here_minimum_32_characters

# External API Configuration
HOTEL_APIURL=https://api.hotels.com/v1
HOTEL_APIAUTH=your_hotel_api_auth_key_here
FLIGHT_APIURL=https://api.flights.com/v1
AUTHAPI=your_auth_api_key_here

# Payment Gateway Configuration (CCAvenue)
MERCHANT_ID=your_ccavenue_merchant_id
ACCESS_CODE=your_ccavenue_access_code
WORKING_KEY=your_ccavenue_working_key
PAYMENT_URL=https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key_here

# Client Configuration
CLIENT_HOST=tripbazaar.in
CLIENT_PORT=443
PROTOCOL=https
APP_HOST=api.tripbazaar.in
```

### Frontend Environment Variables (`next/.env.production`)

```bash
# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=TripBazaar
NEXT_PUBLIC_API_BASE_URL=https://api.tripbazaar.in

# Analytics and Monitoring
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here

# SEO Configuration
NEXT_PUBLIC_SITE_URL=https://tripbazaar.in
NEXT_PUBLIC_SITE_NAME=TripBazaar
NEXT_PUBLIC_SITE_DESCRIPTION=Your trusted travel partner for flights, hotels, and holiday packages

# Contact Information
NEXT_PUBLIC_CONTACT_PHONE=+91 98765 43210
NEXT_PUBLIC_CONTACT_EMAIL=support@tripbazaar.in
```

## SSL Certificate Setup

### Option 1: Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt update
sudo apt install certbot

# Generate certificates
sudo certbot certonly --standalone -d tripbazaar.in -d www.tripbazaar.in -d api.tripbazaar.in

# Copy certificates to nginx directory
sudo cp /etc/letsencrypt/live/tripbazaar.in/fullchain.pem node/nginx/ssl/tripbazaar.crt
sudo cp /etc/letsencrypt/live/tripbazaar.in/privkey.pem node/nginx/ssl/tripbazaar.key

# Set proper permissions
sudo chown $USER:$USER node/nginx/ssl/tripbazaar.*
```

### Option 2: Commercial SSL Certificate

1. Purchase SSL certificate from your provider
2. Download the certificate files
3. Place them in `node/nginx/ssl/` directory
4. Update nginx configuration if needed

## Database Setup

### MongoDB Initialization

Create `node/mongo-init/init.js`:

```javascript
db = db.getSiblingDB('b2capi');

// Create collections
db.createCollection('users');
db.createCollection('hotels');
db.createCollection('flights');
db.createCollection('transactions');
db.createCollection('admin');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.hotels.createIndex({ "hotelId": 1 });
db.flights.createIndex({ "flightNumber": 1 });
db.transactions.createIndex({ "transactionId": 1 }, { unique: true });

// Create admin user
db.admin.insertOne({
    username: "admin",
    email: "admin@tripbazaar.in",
    password: "$2b$10$your_hashed_password_here",
    role: "super_admin",
    createdAt: new Date(),
    isActive: true
});
```

## Monitoring Setup

### Prometheus Configuration

The deployment script creates a basic Prometheus configuration. For advanced monitoring:

1. Edit `monitoring/prometheus.yml`
2. Add custom metrics endpoints
3. Configure alerting rules

### Grafana Dashboards

1. Access Grafana at `http://your-server:3001`
2. Default credentials: `admin/admin`
3. Import dashboards for:
   - Node.js application metrics
   - MongoDB metrics
   - Redis metrics
   - Nginx access logs

## Backup Strategy

### Automated Backups

The deployment includes an automated backup service that:
- Creates daily MongoDB backups
- Stores backups in `./backups/` directory
- Maintains backup history

### Manual Backup

```bash
# Create manual backup
docker-compose -f docker-compose.production.yml exec mongo mongodump --out /backups/manual_$(date +%Y%m%d_%H%M%S)

# Restore from backup
docker-compose -f docker-compose.production.yml exec mongo mongorestore /backups/backup_name/
```

## Security Considerations

### 1. Environment Variables
- Never commit `.env.production` files to version control
- Use strong, unique passwords for all services
- Rotate secrets regularly

### 2. Network Security
- Configure firewall rules
- Use VPN for admin access
- Implement rate limiting

### 3. SSL/TLS
- Use valid SSL certificates
- Configure HSTS headers
- Enable HTTP/2

### 4. Database Security
- Use strong MongoDB passwords
- Enable authentication
- Restrict network access

## Performance Optimization

### 1. Nginx Configuration
- Enable gzip compression
- Configure caching headers
- Optimize worker processes

### 2. Application Optimization
- Enable Next.js optimizations
- Configure Redis caching
- Optimize database queries

### 3. Monitoring
- Set up performance alerts
- Monitor resource usage
- Track response times

## Troubleshooting

### Common Issues

#### 1. Services Not Starting
```bash
# Check service status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs [service-name]
```

#### 2. Database Connection Issues
```bash
# Check MongoDB status
docker-compose -f docker-compose.production.yml exec mongo mongosh --eval "db.adminCommand('ping')"

# Check Redis status
docker-compose -f docker-compose.production.yml exec redis redis-cli ping
```

#### 3. SSL Certificate Issues
```bash
# Test SSL configuration
openssl s_client -connect tripbazaar.in:443 -servername tripbazaar.in

# Check nginx configuration
docker-compose -f docker-compose.production.yml exec nginx nginx -t
```

### Log Locations

- **Application logs**: `node/logs/`
- **Nginx logs**: `node/logs/nginx/`
- **Docker logs**: `docker-compose -f docker-compose.production.yml logs`

## Maintenance

### Regular Tasks

1. **Daily**
   - Check service health
   - Monitor error logs
   - Verify backup completion

2. **Weekly**
   - Review performance metrics
   - Update security patches
   - Clean old logs

3. **Monthly**
   - Update dependencies
   - Review SSL certificate expiration
   - Performance optimization review

### Update Process

```bash
# 1. Pull latest changes
git pull origin main

# 2. Update environment files if needed
# 3. Rebuild and restart services
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d

# 4. Verify deployment
./deploy-production.sh
```

## Support

For technical support:
- Email: support@tripbazaar.in
- Phone: +91 98765 43210
- Documentation: [TripBazaar Docs](https://docs.tripbazaar.in)

## License

This deployment guide is part of the TripBazaar application and is licensed under the same terms as the main application.

---

**Note**: This guide assumes a Linux-based production environment. For Windows or macOS deployments, some commands may need to be adjusted. 