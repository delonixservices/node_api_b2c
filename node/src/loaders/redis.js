const { getRedisClient, closeRedisClient } = require('../config/redis');
const logger = require('../config/logger');

const redisLoader = async () => {
    try {
        console.log("\x1b[36m%s\x1b[0m", 'Connecting to Redis...');
        
        const client = await getRedisClient();
        
        if (!client) {
            console.log("\x1b[33m%s\x1b[0m", '⚠️  Redis connection failed - continuing without Redis cache');
            logger.warn('Redis connection failed - application will continue without caching');
            return;
        }

        if (client.isOpen) {
            // Test Redis connection with a simple ping
            try {
                const pong = await client.ping();
                if (pong === 'PONG') {
                    console.log("\x1b[32m%s\x1b[0m", '✅ Redis connection established successfully');
                    logger.info('Redis connection established successfully');
                    
                    // Test basic operations
                    await client.set('health-check', 'ok');
                    const healthStatus = await client.get('health-check');
                    await client.del('health-check');
                    
                    if (healthStatus === 'ok') {
                        console.log("\x1b[32m%s\x1b[0m", '✅ Redis read/write operations working correctly');
                        logger.info('Redis read/write operations verified');
                    } else {
                        console.log("\x1b[33m%s\x1b[0m", '⚠️  Redis read/write test failed');
                        logger.warn('Redis read/write test failed');
                    }
                } else {
                    console.log("\x1b[33m%s\x1b[0m", '⚠️  Redis ping failed - continuing without Redis cache');
                    logger.warn('Redis ping failed - continuing without Redis cache');
                }
            } catch (pingError) {
                console.log("\x1b[33m%s\x1b[0m", `⚠️  Redis health check failed: ${pingError.message}`);
                logger.warn(`Redis health check failed: ${pingError.message}`);
            }
        } else {
            console.log("\x1b[33m%s\x1b[0m", '⚠️  Redis client not open - continuing without Redis cache');
            logger.warn('Redis client not open - continuing without Redis cache');
        }
        
    } catch (error) {
        console.log("\x1b[33m%s\x1b[0m", `⚠️  Redis connection error: ${error.message}`);
        console.log("\x1b[33m%s\x1b[0m", '⚠️  Application will continue without Redis caching');
        logger.warn(`Redis connection error: ${error.message} - continuing without Redis cache`);
    }
};

module.exports = redisLoader; 