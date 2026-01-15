const axios = require("axios");
const { baseApiUrl, warehouse, secretKey, companyId } = require("../../config/metakocka/metakocka");

/**
 * Fetches all stock for a given warehouse from the Metakocka API.
 * It handles pagination by making multiple requests until all stock is retrieved.
 * @param {string} [warehouseId=warehouse.t4aMainWarehouseId] - The ID of the warehouse to get stock for. Defaults to the main T4A warehouse.
 * @returns {Promise<Array<{code: string, amount: number, count_code: string, mk_id: string}>>} A promise that resolves to an array of simplified stock items.
 */
async function getWarehouseStock(warehouseId = warehouse.t4aMainWarehouseId) {
    const limit = 1000;
    let offset = 0;
    let allStock = [];
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

        // Map over the stock list to extract only the desired properties
        const simplifiedStock = stockList.map(({ code, amount, count_code, mk_id }) => ({
            code,
            amount,
            count_code,
            mk_id,
        }));
        allStock.push(...simplifiedStock);
        offset += limit;
    }

    return allStock;
}

/**
 * Finds the stock information for a specific product code within a given stock list.
 * @param {Array<{code: string, amount: number, count_code: string, mk_id: string}>} warehouseStock - The array of stock items to search through.
 * @param {string} code - The product code to find.
 * @returns {{code: string, amount: number, count_code: string, mk_id: string}|undefined} The stock item object if found, otherwise undefined.
 */
function getProductStock(warehouseStock, code) {
    return warehouseStock.find(stockItem => stockItem.code === code);
}


module.exports = { getWarehouseStock, getProductStock };
