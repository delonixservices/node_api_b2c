require('dotenv').config();

const expressLoader = require('./loaders/express');
const mongooseLoader = require('./loaders/mongoose');
const redisLoader = require('./loaders/redis');

const express = require('express');
const cors = require('cors');

const app = express();

// Enable all origins for CORS at the top
app.use(cors());

// OR, for more specific CORS configurations, you can use:
app.use(cors({
    origin: '*', // Allows all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
}));

async function startServer() {
    try {
        console.log("\x1b[36m%s\x1b[0m", '🚀 Starting TripBazaar API Server...');
        
        // Load Express middleware and routes
        await expressLoader(app);
        console.log("\x1b[32m%s\x1b[0m", '✅ Express loaded successfully');
        
        // Connect to MongoDB
        await mongooseLoader();
        console.log("\x1b[32m%s\x1b[0m", '✅ MongoDB connected successfully');
        
        // Test Redis connection
        await redisLoader();
        
        console.log("\x1b[32m%s\x1b[0m", '🎉 Server startup completed successfully');
        
    } catch (err) {
        console.error("\x1b[31m%s\x1b[0m", '❌ Server startup failed!');
        console.error('The error was: ', err);
        process.exit(1);
    }
}

startServer();

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception!!!');
    console.error('The error was: ', error);
});

module.exports = app;
