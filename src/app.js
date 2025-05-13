require('dotenv').config();

const expressLoader = require('./loaders/express');
const mongooseLoader = require('./loaders/mongoose');

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
        await expressLoader(app);
        await mongooseLoader();
    } catch (err) {
        console.error("\x1b[31m%s\x1b[0m", 'Uncaught exception!');
        console.error('The error was: ', err);
    }
}

startServer();

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception!!!');
    console.error('The error was: ', error);
});

module.exports = app;
