const { getDb } = require('./db/mongo.service');

/**
 * Fetches all products from the database.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of product documents.
 */
const getAllProducts = async () => {
    try {
        const db = getDb();
        // Fetches all documents from the 'products' collection.
        return await db.collection('products').find({}).toArray();
    } catch (error) {
        console.error('Error fetching products from database:', error);
        throw new Error('Product data is not available.');
    }
};

/**
 * Fetches a single product from the database by its code, either in the main code
 * or in any child product's code.
 * @param {string} code - The code of the product to find.
 * @returns {Promise<Object|null>} A promise that resolves with the product document or null if not found.
 */
const getProductByCode = async (code) => {
    try {
        const db = getDb();

        // First, try to find by main product code
        let product = await db.collection('products').findOne(
            { code },
        );

        if (product) return product;

        // If not found, try to find by child product code
        product = await db.collection('products').findOne(
            { "child_products.code": code });

        return product; // could be null if still not found
    } catch (error) {
        console.error(`Error fetching product with code ${code} from database:`, error);
        throw new Error(`An error occurred while fetching product with code ${code}.`);
    }
};

/**
 * Generates a TSV string from the products data.
 * @param {string} exportId - The export identifier to get the category for (e.g., 'tris').
 * @returns {Promise<string>} A promise that resolves with the TSV content.
 */
const generateProductsTsv = async (exportId) => {
    if (!exportId) {
        throw new Error('exportId is required to generate the TSV.');
    }
    const products = await getAllProducts();
    const header = 'Naziv\tKategorija\n';
    const tsvRows = products.map(p => {
        // Find the category that matches the requested exportId
        const categoryInfo = p.categories?.find(cat => cat.exportId === exportId);
        const categoryName = categoryInfo ? categoryInfo.categoryName : '';
        return `${p.product_name}\t${categoryName}`;
    });
    return header + tsvRows.join('\n');
};

module.exports = { getAllProducts, getProductByCode, generateProductsTsv };