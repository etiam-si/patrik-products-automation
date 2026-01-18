const cron = require('node-cron');
const { downloadProducts } = require('../../services/pnv/downloadProducts.service');
const { identifyProductCategories } = require('../../services/ai/categoryIdentification.service');

// Schedule to run
const setupProductDownloadJob = () => {
    cron.schedule(process.env.PRODUCTS_DOWNLOAD_SCHEDULE, async () => {
        console.log('--- Starting scheduled product download ---');
        await downloadProducts();
        console.log('--- Product download complete ---');

        const exportIdForCategorization = process.env.CATEGORIZATION_EXPORT_ID || '696a45517b6f46ec7c01a540';
        console.log('--- Starting product category identification ---');
        await identifyProductCategories(exportIdForCategorization);
        console.log('--- Product category identification complete ---');
    });
};

module.exports = setupProductDownloadJob;