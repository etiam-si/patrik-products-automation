const { getDb } = require('../services/db/mongo.service');

const COLLECTION_NAME = 'analytics';

/**
 * Saves a single API log entry to the database.
 * @param {Object} logData - The data object to insert
 */
const saveAnalyticsData = async (logData) => {
    try {
        const db = getDb();
        const collection = db.collection(COLLECTION_NAME);
        
        await collection.insertOne(logData);
        
    } catch (error) {
        // Log locally so we don't crash the app if Mongo is down
        console.error('[Analytics Service] Error saving log:', error);
    }
};

const monitorFunction = async (fn, actionName, metadata = {}) => {
    // 1. Start timer (returns BigInt in nanoseconds)
    const start = process.hrtime.bigint();
    
    let success = true;
    let result;
    let errorDetails = null;

    try {
        result = await fn();
        return result;
    } catch (error) {
        success = false;
        errorDetails = error.message;
        throw error;
    } finally {
        // 2. End timer and calculate difference
        const end = process.hrtime.bigint();
        const durationNs = end - start; // Result is in nanoseconds (BigInt)

        const analyticsData = {
            app: process.env.APP_NAME,
            type: "function",
            action: actionName,
            ts: new Date(), // Keep wall-clock time for "when" it happened
            
            // Metrics
            durationNs: Number(durationNs.toString()),
            
            metadata,
            success,
            error: errorDetails
        };

        // Asynchronously write to the database, but don't block the final return/throw
        saveAnalyticsData(analyticsData);
    }
};

module.exports = {
    saveAnalyticsData,
    monitorFunction
};