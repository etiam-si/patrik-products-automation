const express = require('express');
const app = express();
const logger = require('./middleware/logger');
const exampleRoutes = require('./routes/exampleRoutes');

// Global Middleware
app.use(express.json());
app.use(logger); 

// Routes
app.use('/api/example', exampleRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('Automation API is running...');
});

module.exports = app;