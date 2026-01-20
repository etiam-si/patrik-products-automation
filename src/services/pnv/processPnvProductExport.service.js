const { productMapping } = require("../../config/pnv/products")
const { parse } = require('csv-parse');
const { getProductPricelist } = require("../metakocka/price.service");
const { getWarehouseStock, getProductStockAmount } = require("../metakocka/warehouse.service");
const { monitorFunction } = require('../analytics.service');
const fs = require('fs');
const { getDb } = require('../db/mongo.service');
const path = require('path');

/**
 * Reads and parses the products.csv file.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of product objects.
 */
const parseProductsCsv = () => {
    return new Promise((resolve, reject) => {
        const pnvDataDir = path.resolve(process.env.DATA_PATH || path.join(__dirname, '..', '..', '..', 'data'), 'pnv');
        const csvFilePath = path.join(pnvDataDir, "products.csv");

        if (!fs.existsSync(csvFilePath)) {
            return reject(new Error(`CSV file not found at: ${csvFilePath}`));
        }

        const products = [];
        const parser = parse({
            columns: true,
            delimiter: ';',
            trim: true,
            bom: true,
        });

        const stream = fs.createReadStream(csvFilePath);
        stream.pipe(parser);

        parser.on('data', (row) => {
            products.push(row);
        });

        parser.on('end', () => {
            resolve(products);
        });

        parser.on('error', (err) => {
            reject(err);
        });
    });
};

/**
 * Maps a single product object from its CSV structure to a JSON object based on the provided mapping.
 * @param {Object} product - The product object from the parsed CSV.
 * @param {Array<Object>} columnMapping - The mapping configuration for transformations.
 * @param {Map<string, {code: string, amount: number, count_code: string, mk_id: string}>} warehouseStock - The Map of stock items.
 * @returns {Promise<Object>} A promise that resolves to the mapped product as a JSON object.
 */
const mapProduct = async (product, columnMapping, warehouseStock) => {
    const productJson = {};
    for (const mapping of columnMapping) {
        // Handle direct mapping: one csvHeader to one jsonKey
        if (mapping.csvHeader) {
            const { csvHeader, jsonKey, transform } = mapping;
            const value = product[csvHeader];

            if (transform && typeof transform === 'function') {
                // Pass the specific value and the entire product row to the transform function.
                // Await the result in case the transform is async.
                productJson[jsonKey] = await transform(value, product);
            } else {
                productJson[jsonKey] = value;
            }
        }
        // Handle array mapping: multiple csvHeaders to one jsonKey as an array
        else if (mapping.csvHeaders) {
            const { csvHeaders, jsonKey, transform } = mapping;
            const values = csvHeaders
                .map(header => product[header])
                .filter(value => value !== undefined && value !== ''); // Filter out empty/undefined values

            if (transform && typeof transform === 'function') {
                productJson[jsonKey] = await transform(values, product);
            } else {
                productJson[jsonKey] = values;
            }
        }
        // Handle generated fields: no csvHeader, just a transform to create a value
        else if (mapping.jsonKey && mapping.transform) {
            const { jsonKey, transform } = mapping;
            // The first argument is `undefined` as there's no source CSV value.
            // The transform function relies on the second argument, the full product row.
            productJson[jsonKey] = await transform(undefined, product);
        }
    }

    // Add stock amount from the warehouse service
    productJson.stock_amount = await monitorFunction(
        () => getProductStockAmount(warehouseStock, product.Code),
        'getProductStockAmount'
    );

    // Add pricelist from the price service
    productJson.pricelist = await monitorFunction(
        () => getProductPricelist(product.Code),
        'getProductPricelist',
        { code: product.Code }
    );

    return productJson;
};

/**
 * Main function to parse products and structure them into a parent-child hierarchy.
 * It returns an array of parent products, each containing an array of its child products.
 * The resulting data is then saved to the 'products' collection in MongoDB.
 * @param {Array<Object>} [columnMapping=productMapping] - An array of objects specifying the mapping.
 */
const processPnvProductExport = async (columnMapping = productMapping) => {
    try {
        if (!columnMapping || !Array.isArray(columnMapping) || columnMapping.length === 0) {
            throw new Error('A valid columnMapping array must be provided to processPnvProductExport.');
        }

        // console.log('Fetching warehouse stock from Metakocka...');
        const warehouseStock = await monitorFunction(
            () => getWarehouseStock(),
            'getWarehouseStock'
        );

        const allProducts = await parseProductsCsv();
        const parentProductCodeColumn = 'Koda nadprodukta';
        const productCodeColumn = 'Code';

        // Group all child products by their parent's code
        const childrenByParentCode = {};
        for (const product of allProducts) {
            const parentCode = product[parentProductCodeColumn];
            if (parentCode) {
                if (!childrenByParentCode[parentCode]) {
                    childrenByParentCode[parentCode] = [];
                }
                childrenByParentCode[parentCode].push(await mapProduct(product, columnMapping, warehouseStock));
            }
        }

        // Find parent products and attach their children
        const parentProductsData = [];
        for (const product of allProducts) {
            // Process only products that are not children themselves.
            if (!product[parentProductCodeColumn]) {
                const mappedProduct = await mapProduct(product, columnMapping, warehouseStock);
                // Attach children if any exist for this product.
                mappedProduct.child_products = childrenByParentCode[product[productCodeColumn]] || [];
                parentProductsData.push(mappedProduct);
            }
        }

        console.log('Syncing products to MongoDB...');
        const db = getDb();
        const productsCollection = db.collection('products');

        const allIncomingCodes = new Set(parentProductsData.map(p => p.code));

        // Mark products not in the latest sync as inactive
        const updateResult = await productsCollection.updateMany(
            { code: { $nin: Array.from(allIncomingCodes) }, active: { $ne: false } },
            { $set: { active: false, updatedAt: new Date() } }
        );

        if (updateResult.modifiedCount > 0) {
            console.log(`Marked ${updateResult.modifiedCount} products as inactive.`);
        }

        // Prepare bulk operations for upserting products
        if (parentProductsData.length > 0) {
            const bulkOps = parentProductsData.map(product => ({
                updateOne: {
                    filter: { code: product.code },
                    update: {
                        $set: { ...product, active: true, updatedAt: new Date() },
                        $setOnInsert: { createdAt: new Date() }
                    },
                    upsert: true
                }
            }));

            const bulkResult = await productsCollection.bulkWrite(bulkOps);
            console.log(`Successfully synced products to MongoDB.`);
            console.log(`- ${bulkResult.nUpserted} products created.`);
            console.log(`- ${bulkResult.nModified} products updated.`);
        } else {
            console.log('No products to sync.');
        }

        return parentProductsData;

    } catch (error) {
        console.error("Error processing products to JSON:", error);
        // Re-throwing the error is good practice if the caller needs to handle it
        throw error;
    }
};

module.exports = { processPnvProductExport };