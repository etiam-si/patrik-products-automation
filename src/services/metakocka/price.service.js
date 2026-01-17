const axios = require("axios");
const { baseApiUrl, products, secretKey, companyId, pricelist: activePricelistConfig } = require("../../config/metakocka/metakocka");

/**
 * Fetches the pricelist for a specific product from the Metakocka API.
 * @param {string} code - The product code to fetch the pricelist for.
 * @returns {Promise<Array<{title: string, valid_from: string, price: number, vat: number}>>} A promise that resolves to an array of pricelist objects.
 */
async function getProductPricelist(code) {
    try {
        const response = await axios.post(baseApiUrl + products.api.productList, {
            secret_key: secretKey,
            company_id: companyId,
            code: code,
            return_pricelist: "true",
        });

        const productList = response.data.product_list || [];
        if (productList.length === 0) {
            return [];
        }

        const product = productList[0];
        const allPricelists = product.pricelist || [];

        // Filter for active pricelists and then map to the desired structure.
        return allPricelists
            .filter(item => activePricelistConfig.active.includes(item.title))
            .map(item => {
                const priceDef = item.price_def || {};
                return {
                    name: item.title,
                    valid_from: new Date(
                        item.valid_from.replace(
                            /^(\d{4}-\d{2}-\d{2})([+-]\d{2}:\d{2})$/,
                            "$1T00:00:00$2"
                        )
                    ),
                    price: priceDef.price ? parseFloat(priceDef.price.replace(',', '.')) : 0,
                    vat: priceDef.tax_desc ? parseInt(priceDef.tax_desc, 10) : 0,
                };
            });
    } catch (error) {
        console.error(`Error fetching pricelist for product code ${code}:`, error.message);
        throw error;
    }
}

module.exports = { getProductPricelist };
