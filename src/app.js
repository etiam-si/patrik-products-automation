const express = require('express');
const app = express();
const path = require('path');
const logger = require('./middleware/logger');
const analyticsLogger = require('./middleware/analytics');
const exampleRoutes = require('./routes/exampleRoutes');
const productRoutes = require('./routes/productRoutes');

const initJobs = require("./jobs")


app.use(express.json());
app.use(logger);
app.use(analyticsLogger);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/api/example', exampleRoutes);
app.use('/api/product', productRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('Automation API is running...');
});

module.exports = { app, initJobs };