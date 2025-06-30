# IP Blocking and Rate Limiting System

This document describes the IP blocking and rate limiting functionality implemented in the B2C API.

## Overview

The system provides comprehensive IP address tracking, rate limiting, and blocking capabilities to protect the API from abuse, DDoS attacks, and suspicious activities.

## Features

### 1. IP Address Tracking
- Records all API requests with client IP addresses
- Stores IP information in the History collection
- Supports multiple IP detection methods (X-Forwarded-For, X-Real-IP, etc.)

### 2. Rate Limiting
- Configurable rate limits (default: 100 requests per 15 minutes)
- Tracks consecutive failures and suspicious patterns
- Automatic blocking after repeated violations

### 3. IP Blocking
- Manual blocking by administrators
- Automatic blocking based on rate limit violations
- Temporary and permanent blocking options
- Block expiration management

### 4. Admin Management
- View all blocked IPs with filtering and pagination
- View IP activity history and statistics
- Manual block/unblock operations
- Bulk operations for expired blocks

## Configuration

### Rate Limiting Settings
```javascript
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000,        // 15 minutes
  maxRequests: 100,                 // Max requests per window
  blockDuration: 60 * 60 * 1000,   // 1 hour block duration
  consecutiveFailures: 5,           // Block after 5 consecutive failures
  failureWindowMs: 5 * 60 * 1000   // 5 minutes window for failures
};
```

### Block Reasons
- `rate_limit`: Auto-blocked due to rate limit violations
- `suspicious_activity`: Manual block for suspicious behavior
- `manual_block`: Manual block by administrator
- `ddos_attack`: Blocked due to DDoS detection

## Database Models

### History Model
```javascript
{
  request: {
    method: String,
    body: Object,
    remoteAddress: String,
    ip: String,           // NEW: Client IP address
    startTime: Date
  },
  response: {
    body: Object,
    statusCode: String,
    responseTime: Number
  },
  date: Date,
  url: String
}
```

### BlockedIP Model
```javascript
{
  ip: String,                    // IP address
  reason: String,                // Block reason
  blockedBy: String,             // 'system' or 'admin'
  adminId: ObjectId,             // Admin who blocked (if manual)
  blockedAt: Date,               // When blocked
  expiresAt: Date,               // Expiration (null = permanent)
  isActive: Boolean,             // Active status
  hitCount: Number,              // Attempts after blocking
  lastHitAt: Date,               // Last attempt
  notes: String                  // Additional notes
}
```

## API Endpoints

### Admin Endpoints

#### Get All Blocked IPs
```
GET /api/admin/blocked-ips?page=1&limit=20&status=active&search=192.168
```

#### Get IP Activity
```
GET /api/admin/ip-activity/:ip?page=1&limit=50&days=7
```

#### Get IP Blocking Statistics
```
GET /api/admin/ip-blocking-stats?days=30
```

#### Block IP
```
POST /api/admin/block-ip
{
  "ip": "192.168.1.100",
  "reason": "suspicious_activity",
  "duration": 60,        // minutes (optional, null = permanent)
  "notes": "Manual block due to suspicious behavior"
}
```

#### Unblock IP
```
POST /api/admin/unblock-ip/:ip
```

#### Bulk Unblock Expired
```
POST /api/admin/bulk-unblock-expired
```

#### Get Configuration
```
GET /api/admin/ip-blocking-config
```

## Middleware

### IP Rate Limiting Middleware
- Applied globally to all routes except admin routes
- Checks for existing blocks before processing requests
- Tracks request counts and failure patterns
- Automatically blocks IPs that exceed limits

### API History Middleware
- Records all API requests with IP addresses
- Enhanced to use centralized IP detection
- Stores comprehensive request/response data

## Usage Examples

### Manual IP Blocking
```javascript
// Block an IP for 1 hour
const response = await fetch('/api/admin/block-ip', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <admin-token>'
  },
  body: JSON.stringify({
    ip: '192.168.1.100',
    reason: 'suspicious_activity',
    duration: 60,
    notes: 'Multiple failed login attempts'
  })
});
```

### View IP Activity
```javascript
// Get activity for specific IP
const response = await fetch('/api/admin/ip-activity/192.168.1.100?days=7', {
  headers: {
    'Authorization': 'Bearer <admin-token>'
  }
});
```

## Migration

### Running IP History Migration
If you have existing history records without IP addresses, run the migration script:

```bash
cd node_api_b2c
node migrate-ip-history.js
```

This will:
- Find all history records without IP addresses
- Update them with IP information from remoteAddress field
- Set 'unknown' for records without IP information

## Monitoring and Alerts

### Logging
The system logs important events:
- Rate limit violations
- IP blocking/unblocking actions
- Suspicious activity patterns
- System errors

### Statistics
Track blocking effectiveness:
- Total blocked IPs
- Currently active blocks
- Block reasons distribution
- Top blocked IPs by hit count

## Security Considerations

1. **IP Spoofing**: The system uses multiple IP detection methods and trusts proxy headers only when properly configured
2. **False Positives**: Admins can manually unblock IPs and adjust rate limits
3. **Performance**: Rate limiting uses Redis for fast lookups and minimal database impact
4. **Scalability**: The system gracefully degrades when Redis is unavailable

## Troubleshooting

### Common Issues

1. **IP Not Detected**: Check if `trust proxy` is set correctly in Express
2. **Rate Limiting Not Working**: Verify Redis connection and configuration
3. **Blocks Not Applied**: Check if middleware is loaded in correct order

### Debug Mode
Enable detailed logging by setting environment variable:
```bash
DEBUG=ip-blocking:*
```

## Future Enhancements

1. **Geolocation Blocking**: Block IPs by country/region
2. **Whitelist Support**: Allow specific IPs to bypass rate limits
3. **Advanced Analytics**: Machine learning for threat detection
4. **Integration**: Webhook notifications for security events 