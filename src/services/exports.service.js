const { getDb } = require('../services/db/mongo.service');
const { ObjectId } = require('mongodb');

/**
 * Retrieves all documents from the 'exports' collection.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of export documents.
 */
const getAllExports = async () => {
    const db = getDb();
    // This assumes you have a collection named 'exports'.
    return db.collection('exports').find({}).toArray();
};

/**
 * Retrieves all documents from the 'exports' collection where AI categorization is enabled.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of export documents.
 */
const getAiEnabledExports = async () => {
    const db = getDb();
    // Find all exports that are enabled for AI categorization.
    return db.collection('exports').find({ aiCategorizationEnabled: true }).toArray();
};

/**
 * Retrieves an export document by its ID.
 * @param {string} id - The ID of the export document to retrieve.
 * @returns {Promise<Object|null>} A promise that resolves to the export document, or null if not found.
 */
const getExportById = async (id) => {
    const db = getDb();
    // Ensure the ID is a valid ObjectId before querying
    if (!ObjectId.isValid(id)) {
        console.warn(`Invalid ID format for getExportById: ${id}`);
        return null;
    }
    return db.collection('exports').findOne({ _id: new ObjectId(id) });
};

module.exports = { getAllExports, getAiEnabledExports, getExportById };
