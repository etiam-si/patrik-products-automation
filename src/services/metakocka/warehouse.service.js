const axios = require("axios");
const { baseApiUrl, warehouse, secretKey, companyId } = require("../../config/metakocka/metakocka");

/**
 * Fetches all stock for a given warehouse from the Metakocka API.
 * It handles pagination by making multiple requests until all stock is retrieved.
 * The stock is returned as a Map for efficient O(1) lookups by product code.
 * @param {string} [warehouseId=warehouse.t4aMainWarehouseId] - The ID of the warehouse to get stock for. Defaults to the main T4A warehouse.
 * @returns {Promise<Map<string, {code: string, amount: number, count_code: string, mk_id: string}>>} A promise that resolves to a Map of stock items, with product codes as keys.
 */
async function getWarehouseStock(warehouseId = warehouse.t4aMainWarehouseId) {
    const limit = 1000;
    let offset = 0;
    const allStock = new Map();
    while (true) {
        const response = await axios.post(baseApiUrl + warehouse.api.warehouseStock, {
            secret_key: secretKey,
            company_id: companyId,
            wh_id_list: warehouseId,
            limit: limit.toString(),
            offset: offset.toString(),
        });

        const stockList = response.data.stock_list || [];

        if (stockList.length === 0) {
            break;
        }

        // Add each stock item to the Map, keyed by product code for fast lookups.
        for (const { code, amount, count_code, mk_id } of stockList) {
            allStock.set(code, { code, amount, count_code, mk_id });
        }
        offset += limit;
    }

    return allStock;
}

/**
 * Finds the stock information for a specific product code within a given stock list.
 * @param {Map<string, {code: string, amount: number, count_code: string, mk_id: string}>} warehouseStock - The Map of stock items to search through.
 * @param {string} code - The product code to find.
 * @returns {{code: string, amount: number, count_code: string, mk_id: string}|undefined} The stock item object if found, otherwise undefined.
 */
function getProductStock(warehouseStock, code) {
    return warehouseStock.get(code);
}

/**
 * Finds the stock amount for a specific product code.
 * @param {Map<string, {code: string, amount: number, count_code: string, mk_id: string}>} warehouseStock - The Map of stock items to search through.
 * @param {string} code - The product code to find.
 * @returns {number} The stock amount if the product is found, otherwise 0.
 */
function getProductStockAmount(warehouseStock, code) {
    const productStock = getProductStock(warehouseStock, code);
    return productStock ? Number(productStock.amount) : 0;
}

module.exports = { getWarehouseStock, getProductStock, getProductStockAmount };
