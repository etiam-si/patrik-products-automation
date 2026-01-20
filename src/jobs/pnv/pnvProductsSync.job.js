const { runPnvProductSync } = require('../../services/pnv/pnvProductsSync.service');
const { identifyProductCategories } = require('../../services/ai/categoryIdentification.service');
const { monitorFunction } = require('../../services/analytics.service');
const { getAiEnabledExports } = require("../../services/exports/exports.service");




const pnvProductSyncJob = async () => {

    // await monitorFunction(
    //     () => runPnvProductSync(),
    //     'runPnvProductSync'
    // );

    // const exportIdForCategorization = process.env.CATEGORIZATION_EXPORT_ID || '696a45517b6f46ec7c01a540';

    const aiEnabledExports = await getAiEnabledExports();

    for (const _export of aiEnabledExports) {
        // Identify product categories
        await monitorFunction(
            () => identifyProductCategories(_export._id.toString()),
            'identifyProductCategories'
        );
    }
}

module.exports = {
    pnvProductSyncJob
}