const { splitStringByBackslash, transformToBoolean } = require('../../services/pnv/productMapping.service');
const { getCategoryNameForProductCode } = require('../../services/ai/trisCategoryIdentification.service');


module.exports = {
    productMapping: [
        { csvHeader: 'Code', jsonKey: 'code' },
        { csvHeader: 'EAN koda', jsonKey: 'ean_code' },
        { csvHeader: 'Product name', jsonKey: 'product_name' },
        { csvHeader: 'Žeton', jsonKey: 'token' },
        { csvHeader: 'Kratek opis', jsonKey: 'short_description' },
        { csvHeader: 'Podroben opis', jsonKey: 'detailed_description' },
        { csvHeader: 'Kategorije', jsonKey: 'categories', transform: splitStringByBackslash },
        { jsonKey: 'images', csvHeaders: ['Prikazna slika', 'Dodatna fotografija 1', 'Dodatna fotografija 2', 'Dodatna fotografija 3', 'Dodatna fotografija 4', 'Dodatna fotografija 5', 'Dodatna fotografija 6', 'Dodatna fotografija 7', 'Dodatna fotografija 8'] },
        { csvHeader: 'Objavljeno', jsonKey: 'published', transform: transformToBoolean },
        { csvHeader: 'Arhivirano', jsonKey: 'archived', transform: transformToBoolean },
        { csvHeader: 'Košarica', jsonKey: 'cart', transform: transformToBoolean },
        { csvHeader: 'Mission', jsonKey: "mission", transform: transformToBoolean },
        { csvHeader: 'New', jsonKey: 'new', transform: transformToBoolean },
        { csvHeader: 'Priporočamo', jsonKey: 'recomended', transform: transformToBoolean },
        // This mapping generates a new field by calling an async function.
        // It doesn't use a csvHeader, but the transform function gets the whole product row.
        {
            jsonKey: 'tris_category_name',
            transform: (value, product) => getCategoryNameForProductCode(product['Code'])
        },
    ]
}