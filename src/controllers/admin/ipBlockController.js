const BlockedIP = require('../../models/BlockedIP');
const History = require('../../models/History');
const logger = require('../../config/logger');

// Get all blocked IPs
exports.getAllBlockedIPs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status = 'active', search = '' } = req.query;
    
    const query = {};
    
    // Filter by status
    if (status === 'active') {
      query.isActive = true;
      query.$or = [
        { expiresAt: null }, // Permanent blocks
        { expiresAt: { $gt: new Date() } } // Not expired
      ];
    } else if (status === 'expired') {
      query.isActive = true;
      query.expiresAt = { $lt: new Date() };
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Search by IP
    if (search) {
      query.ip = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    
    const blockedIPs = await BlockedIP.find(query)
      .populate('adminId', 'email name')
      .sort({ blockedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BlockedIP.countDocuments(query);

    res.status(200).json({
      message: 'Blocked IPs retrieved successfully',
      data: {
        blockedIPs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error(`Error getting blocked IPs: ${error.message}`);
    next(error);
  }
};

// Get IP activity history
exports.getIPActivity = async (req, res, next) => {
  try {
    const { ip } = req.params;
    const { page = 1, limit = 50, days = 7 } = req.query;

    if (!ip) {
      return res.status(400).json({
        error: 'IP address is required'
      });
    }

    const skip = (page - 1) * limit;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    // Get IP activity from history
    const activity = await History.find({
      'request.ip': ip,
      'date': { $gte: daysAgo }
    })
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select('request.method request.body url response.statusCode response.responseTime date');

    const total = await History.countDocuments({
      'request.ip': ip,
      'date': { $gte: daysAgo }
    });

    // Get blocked IP info
    const blockedIP = await BlockedIP.findOne({ ip });

    // Calculate statistics
    const stats = await History.aggregate([
      {
        $match: {
          'request.ip': ip,
          'date': { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          avgResponseTime: { $avg: '$response.responseTime' },
          errorCount: {
            $sum: {
              $cond: [
                { $gte: ['$response.statusCode', 400] },
                1,
                0
              ]
            }
          },
          uniqueEndpoints: { $addToSet: '$url' }
        }
      }
    ]);

    const statistics = stats[0] || {
      totalRequests: 0,
      avgResponseTime: 0,
      errorCount: 0,
      uniqueEndpoints: []
    };

    res.status(200).json({
      message: 'IP activity retrieved successfully',
      data: {
        ip,
        activity,
        blockedIP,
        statistics: {
          ...statistics,
          uniqueEndpoints: statistics.uniqueEndpoints.length
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error(`Error getting IP activity: ${error.message}`);
    next(error);
  }
};

// Get IP blocking statistics
exports.getIPBlockingStats = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    // Get blocking statistics
    const stats = await BlockedIP.aggregate([
      {
        $match: {
          blockedAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            reason: '$reason',
            blockedBy: '$blockedBy'
          },
          count: { $sum: 1 },
          avgHitCount: { $avg: '$hitCount' }
        }
      }
    ]);

    // Get total counts
    const totalBlocked = await BlockedIP.countDocuments({
      blockedAt: { $gte: daysAgo }
    });

    const currentlyBlocked = await BlockedIP.countDocuments({
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    // Get recent blocks
    const recentBlocks = await BlockedIP.find({
      blockedAt: { $gte: daysAgo }
    })
    .sort({ blockedAt: -1 })
    .limit(10)
    .populate('adminId', 'email name');

    // Get top blocked IPs by hit count
    const topBlockedIPs = await BlockedIP.find({
      isActive: true,
      hitCount: { $gt: 0 }
    })
    .sort({ hitCount: -1 })
    .limit(10)
    .select('ip hitCount lastHitAt reason blockedAt');

    res.status(200).json({
      message: 'IP blocking statistics retrieved successfully',
      data: {
        summary: {
          totalBlocked,
          currentlyBlocked,
          period: `${days} days`
        },
        stats,
        recentBlocks,
        topBlockedIPs
      }
    });
  } catch (error) {
    logger.error(`Error getting IP blocking stats: ${error.message}`);
    next(error);
  }
};

// Bulk unblock expired IPs
exports.bulkUnblockExpired = async (req, res, next) => {
  try {
    const result = await BlockedIP.updateMany(
      {
        isActive: true,
        expiresAt: { $lt: new Date() }
      },
      {
        $set: { isActive: false }
      }
    );

    logger.info(`Bulk unblocked ${result.modifiedCount} expired IPs`);

    res.status(200).json({
      message: 'Expired IPs unblocked successfully',
      data: {
        unblockedCount: result.modifiedCount
      }
    });
  } catch (error) {
    logger.error(`Error bulk unblocking expired IPs: ${error.message}`);
    next(error);
  }
};

// Get IP blocking configuration
exports.getIPBlockingConfig = async (req, res, next) => {
  try {
    // This would typically come from a config model or environment variables
    const config = {
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100,
        blockDuration: 60 * 60 * 1000, // 1 hour
        consecutiveFailures: 5,
        failureWindowMs: 5 * 60 * 1000 // 5 minutes
      },
      autoBlock: {
        enabled: true,
        maxConsecutiveFailures: 5,
        blockDuration: 60 * 60 * 1000 // 1 hour
      }
    };

    res.status(200).json({
      message: 'IP blocking configuration retrieved successfully',
      data: config
    });
  } catch (error) {
    logger.error(`Error getting IP blocking config: ${error.message}`);
    next(error);
  }
}; 