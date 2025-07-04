# IP Blocking Management API Endpoints

This document outlines the backend API endpoints required for the IP blocking management system in the admin dashboard.

## Base URL
All endpoints are prefixed with `/api/admin/`

## Authentication
All endpoints require admin authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <admin_token>
```

## Endpoints

### 1. Get All Blocked IPs
**GET** `/blocked-ips`

Returns a list of all blocked IP addresses with their details.

#### Response Format
```json
{
  "status": 200,
  "message": "Blocked IPs retrieved successfully",
  "data": [
    {
      "ip": "192.168.1.100",
      "reason": "Suspicious activity detected",
      "blockedAt": "2024-01-15T10:30:00Z",
      "expiresAt": "2024-01-16T10:30:00Z",
      "blockedBy": "admin@example.com",
      "isActive": true
    }
  ]
}
```

### 2. Get IP Activity
**GET** `/ip-activity/:ip`

Returns activity logs for a specific IP address.

#### Parameters
- `ip` (path parameter): The IP address to get activity for

#### Response Format
```json
{
  "status": 200,
  "message": "IP activity retrieved successfully",
  "data": {
    "ip": "192.168.1.100",
    "activities": [
      {
        "timestamp": "2024-01-15T10:25:00Z",
        "action": "POST",
        "endpoint": "/api/login",
        "userAgent": "Mozilla/5.0...",
        "status": 401
      }
    ]
  }
}
```

### 3. Get IP Blocking Statistics
**GET** `/ip-blocking-stats`

Returns comprehensive statistics about IP blocking.

#### Response Format
```json
{
  "status": 200,
  "message": "Statistics retrieved successfully",
  "data": {
    "totalBlocked": 150,
    "activeBlocks": 45,
    "expiredBlocks": 105,
    "blockedToday": 12,
    "unblockedToday": 8,
    "topBlockedIPs": [
      {
        "ip": "192.168.1.100",
        "count": 5
      }
    ]
  }
}
```

### 4. Get IP Blocking Configuration
**GET** `/ip-blocking-config`

Returns the current IP blocking configuration settings.

#### Response Format
```json
{
  "status": 200,
  "message": "Configuration retrieved successfully",
  "data": {
    "maxFailedAttempts": 5,
    "blockDuration": 60,
    "enableAutoBlock": true,
    "whitelistIPs": ["192.168.1.1", "10.0.0.1"]
  }
}
```

### 5. Block IP Address
**POST** `/block-ip`

Blocks a specific IP address.

#### Request Body
```json
{
  "ip": "192.168.1.100",
  "reason": "Suspicious activity detected",
  "duration": 60
}
```

#### Response Format
```json
{
  "status": 200,
  "message": "IP blocked successfully",
  "data": {
    "ip": "192.168.1.100",
    "reason": "Suspicious activity detected",
    "blockedAt": "2024-01-15T10:30:00Z",
    "expiresAt": "2024-01-15T11:30:00Z",
    "blockedBy": "admin@example.com",
    "isActive": true
  }
}
```

### 6. Unblock IP Address
**POST** `/unblock-ip/:ip`

Unblocks a specific IP address.

#### Parameters
- `ip` (path parameter): The IP address to unblock

#### Response Format
```json
{
  "status": 200,
  "message": "IP unblocked successfully",
  "data": {
    "ip": "192.168.1.100",
    "unblockedAt": "2024-01-15T10:35:00Z",
    "unblockedBy": "admin@example.com"
  }
}
```

### 7. Bulk Unblock Expired IPs
**POST** `/bulk-unblock-expired`

Automatically unblocks all expired IP addresses.

#### Response Format
```json
{
  "status": 200,
  "message": "Expired IPs unblocked successfully",
  "data": {
    "unblockedCount": 15,
    "unblockedIPs": ["192.168.1.100", "192.168.1.101"]
  }
}
```

## Backend Implementation Example

Here's an example of how to implement these endpoints in Node.js/Express:

```javascript
const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');

// Database models (example with MongoDB/Mongoose)
const BlockedIP = require('../models/BlockedIP');
const IPActivity = require('../models/IPActivity');
const IPConfig = require('../models/IPConfig');

// Get all blocked IPs
router.get('/blocked-ips', isAdmin, async (req, res) => {
  try {
    const blockedIPs = await BlockedIP.find()
      .sort({ blockedAt: -1 })
      .limit(100);
    
    res.json({
      status: 200,
      message: "Blocked IPs retrieved successfully",
      data: blockedIPs
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve blocked IPs",
      error: error.message
    });
  }
});

// Get IP activity
router.get('/ip-activity/:ip', isAdmin, async (req, res) => {
  try {
    const { ip } = req.params;
    const activities = await IPActivity.find({ ip })
      .sort({ timestamp: -1 })
      .limit(50);
    
    res.json({
      status: 200,
      message: "IP activity retrieved successfully",
      data: {
        ip,
        activities
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve IP activity",
      error: error.message
    });
  }
});

// Get IP blocking statistics
router.get('/ip-blocking-stats', isAdmin, async (req, res) => {
  try {
    const totalBlocked = await BlockedIP.countDocuments();
    const activeBlocks = await BlockedIP.countDocuments({ 
      isActive: true,
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
      ]
    });
    const expiredBlocks = await BlockedIP.countDocuments({
      expiresAt: { $lt: new Date() }
    });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const blockedToday = await BlockedIP.countDocuments({
      blockedAt: { $gte: today }
    });
    
    const unblockedToday = await BlockedIP.countDocuments({
      unblockedAt: { $gte: today }
    });
    
    const topBlockedIPs = await BlockedIP.aggregate([
      { $group: { _id: "$ip", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { ip: "$_id", count: 1, _id: 0 } }
    ]);
    
    res.json({
      status: 200,
      message: "Statistics retrieved successfully",
      data: {
        totalBlocked,
        activeBlocks,
        expiredBlocks,
        blockedToday,
        unblockedToday,
        topBlockedIPs
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve statistics",
      error: error.message
    });
  }
});

// Get IP blocking configuration
router.get('/ip-blocking-config', isAdmin, async (req, res) => {
  try {
    const config = await IPConfig.findOne() || {
      maxFailedAttempts: 5,
      blockDuration: 60,
      enableAutoBlock: true,
      whitelistIPs: []
    };
    
    res.json({
      status: 200,
      message: "Configuration retrieved successfully",
      data: config
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve configuration",
      error: error.message
    });
  }
});

// Block IP address
router.post('/block-ip', isAdmin, async (req, res) => {
  try {
    const { ip, reason, duration } = req.body;
    const admin = req.user;
    
    if (!ip || !reason) {
      return res.status(400).json({
        status: 400,
        message: "IP address and reason are required"
      });
    }
    
    const expiresAt = duration ? new Date(Date.now() + duration * 60 * 1000) : null;
    
    const blockedIP = new BlockedIP({
      ip,
      reason,
      blockedAt: new Date(),
      expiresAt,
      blockedBy: admin.email,
      isActive: true
    });
    
    await blockedIP.save();
    
    res.json({
      status: 200,
      message: "IP blocked successfully",
      data: blockedIP
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to block IP",
      error: error.message
    });
  }
});

// Unblock IP address
router.post('/unblock-ip/:ip', isAdmin, async (req, res) => {
  try {
    const { ip } = req.params;
    const admin = req.user;
    
    const blockedIP = await BlockedIP.findOne({ ip, isActive: true });
    if (!blockedIP) {
      return res.status(404).json({
        status: 404,
        message: "IP not found or already unblocked"
      });
    }
    
    blockedIP.isActive = false;
    blockedIP.unblockedAt = new Date();
    blockedIP.unblockedBy = admin.email;
    await blockedIP.save();
    
    res.json({
      status: 200,
      message: "IP unblocked successfully",
      data: {
        ip,
        unblockedAt: blockedIP.unblockedAt,
        unblockedBy: blockedIP.unblockedBy
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to unblock IP",
      error: error.message
    });
  }
});

// Bulk unblock expired IPs
router.post('/bulk-unblock-expired', isAdmin, async (req, res) => {
  try {
    const expiredIPs = await BlockedIP.find({
      isActive: true,
      expiresAt: { $lt: new Date() }
    });
    
    const unblockedIPs = [];
    for (const blockedIP of expiredIPs) {
      blockedIP.isActive = false;
      blockedIP.unblockedAt = new Date();
      blockedIP.unblockedBy = 'system';
      await blockedIP.save();
      unblockedIPs.push(blockedIP.ip);
    }
    
    res.json({
      status: 200,
      message: "Expired IPs unblocked successfully",
      data: {
        unblockedCount: unblockedIPs.length,
        unblockedIPs
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to unblock expired IPs",
      error: error.message
    });
  }
});

module.exports = router;
```

## Database Schema Examples

### BlockedIP Model (MongoDB/Mongoose)
```javascript
const mongoose = require('mongoose');

const blockedIPSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
    index: true
  },
  reason: {
    type: String,
    required: true
  },
  blockedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null
  },
  blockedBy: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  unblockedAt: {
    type: Date,
    default: null
  },
  unblockedBy: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('BlockedIP', blockedIPSchema);
```

### IPActivity Model (MongoDB/Mongoose)
```javascript
const mongoose = require('mongoose');

const ipActivitySchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  action: {
    type: String,
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    default: null
  },
  status: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('IPActivity', ipActivitySchema);
```

### IPConfig Model (MongoDB/Mongoose)
```javascript
const mongoose = require('mongoose');

const ipConfigSchema = new mongoose.Schema({
  maxFailedAttempts: {
    type: Number,
    default: 5
  },
  blockDuration: {
    type: Number,
    default: 60
  },
  enableAutoBlock: {
    type: Boolean,
    default: true
  },
  whitelistIPs: [{
    type: String
  }]
});

module.exports = mongoose.model('IPConfig', ipConfigSchema);
```

## Security Considerations

1. **Rate Limiting**: Implement rate limiting on all endpoints to prevent abuse
2. **Input Validation**: Validate all IP addresses and input parameters
3. **Logging**: Log all IP blocking/unblocking actions for audit purposes
4. **Whitelist**: Maintain a whitelist of trusted IPs that should never be blocked
5. **Monitoring**: Set up alerts for unusual blocking patterns
6. **Backup**: Regularly backup IP blocking data

## Testing

Test the endpoints using curl or Postman:

```bash
# Get blocked IPs
curl -X GET "http://localhost:3334/api/admin/blocked-ips" \
  -H "Authorization: Bearer <admin_token>"

# Block an IP
curl -X POST "http://localhost:3334/api/admin/block-ip" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.1.100", "reason": "Test blocking", "duration": 60}'

# Unblock an IP
curl -X POST "http://localhost:3334/api/admin/unblock-ip/192.168.1.100" \
  -H "Authorization: Bearer <admin_token>"
```

## Notes

- The frontend expects the API to be available at `${process.env.NEXT_PUBLIC_API_PATH}/admin/`
- All timestamps should be in ISO 8601 format
- IP addresses should be validated for proper format
- Consider implementing pagination for large datasets
- Add proper error handling and validation for all endpoints 