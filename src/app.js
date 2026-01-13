const express = require('express');
const app = express();
const logger = require('./middleware/logger');
const exampleRoutes = require('./routes/exampleRoutes');
const productRoutes = require('./routes/productRoutes');
require('dotenv').config();

const initJobs = require("./jobs")

// Start all scheduled tasks
initJobs();

// Global Middleware
app.use(express.json());
app.use(logger); 

// Routes
app.use('/api/example', exampleRoutes);
app.use('/api/products', productRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('Automation API is running...');
});

module.exports = app;