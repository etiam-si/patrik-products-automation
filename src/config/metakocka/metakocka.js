const isProduction = process.env.NODE_ENV === 'production';

const baseApiUrl = isProduction
    ? 'https://main.metakocka.si/rest/eshop/v1/json/'
    : 'https://devmainsi.metakocka.si/rest/eshop/v1/json/';

module.exports = {
    baseApiUrl,
    secretKey: process.env.METAKOCKA_KEY,
    companyId: process.env.METAKOCKA_ID,
    warehouse: {
        api: {
            warehouseStock: "/warehouse_stock"
        },
        t4aMainWarehouseId: "626700000004",
    },
};