const express = require('express');
const app = express();
const path = require('path');
const logger = require('./middleware/logger');
const apiAnalyticsLogger = require('./middleware/analytics');
const exportRoutes = require('./routes/export');

const initJobs = require("./jobs")


app.use(express.json());
app.use(logger);
app.use(apiAnalyticsLogger);
app.set('trust proxy', true);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/api/export', exportRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('Automation API is running...');
});

module.exports = { app, initJobs };