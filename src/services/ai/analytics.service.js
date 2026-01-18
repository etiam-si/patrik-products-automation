const { getDb } = require('../db/mongo.service');

/**
 * Logs AI token usage to the 'aiAnalytics' collection in MongoDB.
 *
 * This function is designed to be a non-critical, "fire-and-forget" operation.
 * If it fails, it will log an error to the console but will not throw an exception,
 * ensuring that the primary application flow is not interrupted.
 *
 * @param {string} operationId - A unique identifier for the operation that used the AI (e.g., 'tris-categorization', 'product-description-generation').
 * @param {object} usageMetadata - The usage metadata object from the AI response.
 * @param {number} usageMetadata.promptTokenCount - The number of tokens in the prompt.
 * @param {number} usageMetadata.candidatesTokenCount - The number of tokens in the generated candidates.
 * @param {number} usageMetadata.totalTokenCount - The total number of tokens used.
 * @param {string} modelName - The name of the AI model used for the operation.
 * @returns {Promise<void>} A promise that resolves when the logging is attempted.
 */
async function logAiUsage(operationId, usageMetadata, modelName) {
    if (!usageMetadata) {
        console.warn('logAiUsage called without usageMetadata. Skipping analytics log.');
        return;
    }

    try {
        const db = getDb();
        await db.collection('aiAnalytics').insertOne({
            exportId: operationId, // Renamed for consistency with previous implementation
            model: modelName,
            input_tokens: usageMetadata.promptTokenCount,
            output_tokens: usageMetadata.candidatesTokenCount,
            total_tokens: usageMetadata.totalTokenCount,
            ts: new Date() // Provides a timestamp with millisecond precision
        });
    } catch (error) {
        console.error(`Failed to log AI analytics for operationId "${operationId}":`, error);
    }
}

module.exports = { logAiUsage };
