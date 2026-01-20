const { getDb } = require('../services/db/mongo.service');

/**
 * Retrieves all categories from the 'categories' collection.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of category documents.
 */
const getAllCategories = async () => {
    const db = getDb();
    return db.collection('categories').find({}).toArray();
};

/**
 * Retrieves all category documents for a specific export ID.
 * @param {string} exportId - The ID of the export to retrieve categories for.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of category documents.
 */
const getCategoriesByExportId = async (exportId) => {
    const db = getDb();
    return db.collection('categories').find({ exportId: exportId }).toArray();
};

module.exports = { getAllCategories, getCategoriesByExportId };
