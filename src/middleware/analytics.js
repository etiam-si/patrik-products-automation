const { getDb } = require('../services/db/mongo.service');

const analyticsLogger = async (req, res, next) => {
    // We only want to log API calls, not static file requests
    const start = process.hrtime.bigint();
    if (req.originalUrl.startsWith('/api')) {
        res.on('finish', async () => {
            const duration = process.hrtime.bigint() - start;
            try {
                const db = getDb();
                const analyticsCollection = db.collection('analytics');

                const analyticsData = {
                    app: process.env.APP_NAME,
                    method: req.method,
                    url: req.originalUrl,
                    ip: req.ip,
                    userAgent: req.headers['user-agent'],
                    ts: new Date(),
                    responseTime: Number(duration), // Store nanoseconds as a Number
                    statusCode: res.statusCode,
                };
                await analyticsCollection.insertOne(analyticsData);
            } catch (error) {
                console.error('Error saving analytics data:', error);
            }
        });
    }
    next();
};

module.exports = analyticsLogger;
