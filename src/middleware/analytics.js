const analyticsService = require('../services/analytics.service');

const apiAnalyticsLogger = (req, res, next) => {
    // // 1. Filter: Only track API calls
    if (!req.originalUrl.startsWith('/api')) {
        return next();
    }

    // 2. Start Timer (High Precision)
    const start = process.hrtime.bigint();

    // 3. Listen for response to finish
    res.on('finish', () => {
        // Calculate duration in nanoseconds
        const end = process.hrtime.bigint();
        const duration = end - start;

        const analyticsData = {
            // --- Context & Metadata ---
            app: process.env.APP_NAME,
            type: "api",
            ts: new Date(),

            // --- Request Details ---
            method: req.method,
            url: req.originalUrl,
            query: req.query,
            ip: req.ip,
            userAgent: req.headers['user-agent'],

            // --- Performance & Metrics ---
            statusCode: res.statusCode,
            durationNs: Number(duration), // Safe to cast (up to ~104 days)
            reqSize: Number(req.get('content-length') || 0),
            resSize: Number(res.get('content-length') || 0),
        };

        // 4. Send to Service (Fire and Forget)
        analyticsService.saveAnalyticsData(analyticsData);
    });

    next();
};

module.exports = apiAnalyticsLogger;