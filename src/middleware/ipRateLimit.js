const { getRedisClient } = require('../config/redis');
const BlockedIP = require('../models/BlockedIP');
const logger = require('../config/logger');

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) : 9999999, // Set to unlimited (9999999)
  blockDuration: 60 * 60 * 1000, // 1 hour block duration
  consecutiveFailures: process.env.RATE_LIMIT_CONSECUTIVE_FAILURES ? parseInt(process.env.RATE_LIMIT_CONSECUTIVE_FAILURES) : 10, // Configurable via env var
  failureWindowMs: 5 * 60 * 1000 // 5 minutes window for failures
};

// Check if rate limiting is enabled
const isRateLimitEnabled = () => {
  return process.env.DISABLE_RATE_LIMIT !== 'true';
};

// Get client IP address
const getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         'unknown';
};

// Rate limiting middleware
const ipRateLimit = async (req, res, next) => {
  try {
    const clientIP = getClientIP(req);
    
    // Skip rate limiting for admin routes
    if (req.originalUrl.includes('/api/admin')) {
      req.clientIP = clientIP;
      return next();
    }

    // Skip rate limiting in development mode
    if (process.env.NODE_ENV === 'development') {
      req.clientIP = clientIP;
      return next();
    }

    // Skip rate limiting if disabled via environment variable
    if (!isRateLimitEnabled()) {
      req.clientIP = clientIP;
      return next();
    }

    // Check if IP is already blocked
    const blockedIP = await BlockedIP.findActiveBlock(clientIP);
    if (blockedIP) {
      // Update hit count and last hit time
      blockedIP.hitCount += 1;
      blockedIP.lastHitAt = new Date();
      await blockedIP.save();

      logger.warn(`Blocked IP ${clientIP} attempted to access ${req.originalUrl}`);
      
      return res.status(403).json({
        error: 'Access denied',
        message: 'Your IP address has been blocked due to suspicious activity',
        blockedAt: blockedIP.blockedAt,
        reason: blockedIP.reason,
        expiresAt: blockedIP.expiresAt
      });
    }

    // Get Redis client for rate limiting
    const redisClient = await getRedisClient();
    if (!redisClient) {
      // If Redis is not available, continue without rate limiting
      req.clientIP = clientIP;
      return next();
    }

    const now = Date.now();
    const windowStart = now - RATE_LIMIT_CONFIG.windowMs;
    const failureWindowStart = now - RATE_LIMIT_CONFIG.failureWindowMs;

    // Create Redis keys
    const requestKey = `rate_limit:${clientIP}:requests`;
    const failureKey = `rate_limit:${clientIP}:failures`;

    // Get current request count
    const requests = await redisClient.zRangeByScore(requestKey, windowStart, '+inf');
    const currentRequests = requests.length;

    // Check if rate limit exceeded
    if (currentRequests >= RATE_LIMIT_CONFIG.maxRequests) {
      logger.warn(`Rate limit exceeded for IP ${clientIP}: ${currentRequests} requests in ${RATE_LIMIT_CONFIG.windowMs}ms`);
      
      // Check consecutive failures
      const failures = await redisClient.zRangeByScore(failureKey, failureWindowStart, '+inf');
      const consecutiveFailures = failures.length;

      if (consecutiveFailures >= RATE_LIMIT_CONFIG.consecutiveFailures) {
        // Block the IP
        const blockedIP = new BlockedIP({
          ip: clientIP,
          reason: 'rate_limit',
          blockedBy: 'system',
          expiresAt: new Date(now + RATE_LIMIT_CONFIG.blockDuration),
          notes: `Auto-blocked due to ${consecutiveFailures} consecutive rate limit violations`
        });

        await blockedIP.save();
        logger.warn(`IP ${clientIP} auto-blocked due to rate limit violations`);

        return res.status(403).json({
          error: 'Access denied',
          message: 'Your IP address has been temporarily blocked due to excessive requests',
          blockedAt: blockedIP.blockedAt,
          expiresAt: blockedIP.expiresAt
        });
      }

      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil(RATE_LIMIT_CONFIG.windowMs / 1000)
      });
    }

    // Add current request to Redis
    await redisClient.zAdd(requestKey, { score: now, value: now.toString() });
    await redisClient.expire(requestKey, Math.ceil(RATE_LIMIT_CONFIG.windowMs / 1000));

    // Store client IP in request object for later use
    req.clientIP = clientIP;

    // Add response status tracking
    const originalSend = res.send;
    res.send = function(data) {
      const statusCode = res.statusCode;
      
      // Track failed requests (4xx and 5xx status codes)
      if (statusCode >= 400) {
        redisClient.zAdd(failureKey, { score: now, value: now.toString() });
        redisClient.expire(failureKey, Math.ceil(RATE_LIMIT_CONFIG.failureWindowMs / 1000));
      }

      originalSend.call(this, data);
    };

    next();
  } catch (error) {
    logger.error(`Error in IP rate limiting: ${error.message}`);
    // Continue without rate limiting if there's an error
    req.clientIP = getClientIP(req);
    next();
  }
};

// Manual IP blocking middleware (for admin use)
const blockIP = async (req, res, next) => {
  try {
    const { ip, reason, duration, notes } = req.body;
    
    if (!ip || !reason) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'IP address and reason are required'
      });
    }

    // Check if IP is already blocked
    const existingBlock = await BlockedIP.findOne({ ip });
    if (existingBlock && existingBlock.isCurrentlyBlocked()) {
      return res.status(409).json({
        error: 'IP already blocked',
        message: 'This IP address is already blocked'
      });
    }

    // Calculate expiration time
    const expiresAt = duration ? new Date(Date.now() + duration * 60 * 1000) : null;

    const blockedIP = new BlockedIP({
      ip,
      reason,
      blockedBy: 'admin',
      adminId: req.admin._id,
      expiresAt,
      notes: notes || ''
    });

    await blockedIP.save();
    
    logger.info(`IP ${ip} manually blocked by admin ${req.admin._id} for reason: ${reason}`);

    res.status(200).json({
      message: 'IP blocked successfully',
      data: blockedIP
    });
  } catch (error) {
    logger.error(`Error blocking IP: ${error.message}`);
    next(error);
  }
};

// Unblock IP middleware
const unblockIP = async (req, res, next) => {
  try {
    const { ip } = req.params;
    
    const blockedIP = await BlockedIP.findOne({ ip });
    if (!blockedIP) {
      return res.status(404).json({
        error: 'IP not found',
        message: 'This IP address is not currently blocked'
      });
    }

    blockedIP.isActive = false;
    await blockedIP.save();
    
    logger.info(`IP ${ip} unblocked by admin ${req.admin._id}`);

    res.status(200).json({
      message: 'IP unblocked successfully',
      data: blockedIP
    });
  } catch (error) {
    logger.error(`Error unblocking IP: ${error.message}`);
    next(error);
  }
};

module.exports = {
  ipRateLimit,
  blockIP,
  unblockIP,
  getClientIP
}; 