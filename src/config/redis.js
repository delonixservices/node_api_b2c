// PEREVIOUS CODE -- COMMENTED OUT
// BY ANKIT
// module.exports = {
//   redisAuth: process.env.REDIS_AUTH
// }

// -- NEW

// module.exports = {

//   redisHost: process.env.REDIS_HOST || 'localhost',
//   redisPort: process.env.REDIS_PORT || 6379,
//   redisPassword: process.env.REDIS_PASSWORD || null
// }


// host: 'localhost', // or your Redis server IP
//   port: 6379,        // or your custom port
//   password: 'yourpassword', // if Redis requires a password


// redisAuth.js

// Load environment variables from .env file (if you're using dotenv)
require('dotenv').config();

// Fetch Redis authentication details from environment variables
const redisAuth = process.env.REDIS_AUTH;
// const redisHost = process.env.REDIS_HOST || 'localhost';
// const redisPort = process.env.REDIS_PORT || 6379;

// Export the configuration
module.exports = {
    redisAuth,
    
};

// Redis configuration for Redis v4+ client
require('dotenv').config();

const redis = require('redis');

// Redis connection configuration
const redisConfig = {
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    connectTimeout: 10000,
    commandTimeout: 5000
  },
  // Explicitly disable authentication for local development
  password: null
};

console.log('Redis config:', {
  host: redisConfig.socket.host,
  port: redisConfig.socket.port,
  hasPassword: !!redisConfig.password
});

// Create and configure Redis client
let redisClient = null;

const createRedisClient = async () => {
  try {
    if (redisClient && redisClient.isOpen) {
      return redisClient;
    }

    console.log('Creating Redis client with config:', redisConfig);
    redisClient = redis.createClient(redisConfig);
    
    // Handle connection events
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
      // Don't throw here, just log the error
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });

    redisClient.on('ready', () => {
      console.log('Redis Client Ready');
    });

    redisClient.on('end', () => {
      console.log('Redis Client Disconnected');
    });

    redisClient.on('reconnecting', () => {
      console.log('Redis Client Reconnecting...');
    });

    // Connect to Redis with timeout
    const connectPromise = redisClient.connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Redis connection timeout')), 10000);
    });

    await Promise.race([connectPromise, timeoutPromise]);
    
    return redisClient;
  } catch (error) {
    console.error('Failed to create Redis client:', error);
    // Return null instead of throwing to allow graceful degradation
    return null;
  }
};

const getRedisClient = async () => {
  try {
    if (!redisClient || !redisClient.isOpen) {
      redisClient = await createRedisClient();
    }
    return redisClient;
  } catch (error) {
    console.error('Error getting Redis client:', error);
    return null;
  }
};

const closeRedisClient = async () => {
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.quit();
      redisClient = null;
    }
  } catch (error) {
    console.error('Error closing Redis client:', error);
  }
};

module.exports = {
  redisConfig,
  createRedisClient,
  getRedisClient,
  closeRedisClient
};
