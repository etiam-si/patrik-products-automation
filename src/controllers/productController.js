const fs = require('fs/promises');
const path = require('path');

/**
 * Retrieves the path to the products.json file.
 * It constructs the path relative to the project root, assuming a 'data' directory.
 * @returns {string} The absolute path to products.json.
 */
const getProductsFilePath = () => {
    // This logic should be consistent with where productsToJson.service.js saves the file.
    const dataDir = process.env.DATA_PATH || path.join(__dirname, '..', '..', 'data');
    return path.resolve(dataDir, 'pnv', 'products.json');
};

/**
 * Reads and parses the products.json file.
 * @returns {Promise<Array<Object>>} A promise that resolves with the array of product data.
 */
const getProductsData = async () => {
    const filePath = getProductsFilePath();
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If the file doesn't exist or is unreadable, throw an error.
        console.error(`Error reading or parsing products file at ${filePath}:`, error);
        throw new Error('Product data is not available.');
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const data = await getProductsData();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProductsAsTsv = async (req, res) => {
    try {
        const products = await getProductsData();

        const header = 'Naziv\tKategorija\n';
        // Map only parent products to TSV rows, excluding child products.
        const tsvRows = products.map(p => 
            `${p.product_name}\t${p.tris_category_name || ''}`
        );
        const tsv = header + tsvRows.join('\n');

        res.header('Content-Type', 'text/tab-separated-values');
        res.header('Content-Disposition', 'attachment; filename="products.tsv"');
        res.send(tsv);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};