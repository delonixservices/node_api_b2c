const app = require('./src/app');
const { closeRedisClient } = require('./src/config/redis');
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3334;

const server = app.listen(port, host, (err) => {
    if (err)
        console.log(err);
    else
        console.log(`\x1b[32m%s\x1b[0m`, `🌐 Server running on http://${host}:${port}`);
});

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
    console.log(`\x1b[33m%s\x1b[0m`, `\n⚠️  Received ${signal}. Starting graceful shutdown...`);
    
    try {
        // Close Redis connection
        await closeRedisClient();
        console.log("\x1b[32m%s\x1b[0m", '✅ Redis connection closed');
        
        // Close server
        server.close(() => {
            console.log("\x1b[32m%s\x1b[0m", '✅ HTTP server closed');
            console.log("\x1b[32m%s\x1b[0m", '🎉 Graceful shutdown completed');
            process.exit(0);
        });
        
        // Force close after 10 seconds
        setTimeout(() => {
            console.error("\x1b[31m%s\x1b[0m", '❌ Could not close connections in time, forcefully shutting down');
            process.exit(1);
        }, 10000);
        
    } catch (error) {
        console.error("\x1b[31m%s\x1b[0m", '❌ Error during graceful shutdown:', error);
        process.exit(1);
    }
};

// Handle different shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (error, promise) => {
    console.error("\x1b[31m%s\x1b[0m", '❌ Unhandled Promise Rejection:');
    console.error('Promise:', promise);
    console.error('Error:', error);
    // Don't exit the process, just log the error
});