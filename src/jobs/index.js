const setupProductDownloadJob = require('./pnv/downloadProducts');
const { downloadProducts } = require('../services/pnv/downloadProducts.service');
const { identifyProductCategories } = require('../services/ai/categoryIdentification.service');



const initJobs = async () => {
    console.log('--- Running setup jobs ---');
    await downloadProducts();

    const exportIdForCategorization = process.env.CATEGORIZATION_EXPORT_ID || '696a45517b6f46ec7c01a540';
    console.log('--- Starting product category identification ---');
    await identifyProductCategories(exportIdForCategorization);
    console.log('--- Product category identification complete ---');

    console.log('--- Initializing all background jobs ---');
    setupProductDownloadJob();

};

module.exports = initJobs;