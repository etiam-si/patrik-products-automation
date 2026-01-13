const express = require('express');
const app = express();
const path = require('path');
const logger = require('./middleware/logger');
const exampleRoutes = require('./routes/exampleRoutes');
const productRoutes = require('./routes/productRoutes');

const initJobs = require("./jobs")

// Start all scheduled tasks
initJobs();

// Global Middleware
app.use(express.json());
app.use(logger); 

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/api/example', exampleRoutes);
app.use('/api/product', productRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('Automation API is running...');
});

module.exports = app;