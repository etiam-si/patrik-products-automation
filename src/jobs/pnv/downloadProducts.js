const cron = require('node-cron');
const { downloadProducts } = require('../../services/pnv/downloadProducts.service');
const { identifyProductsTrisCategories } = require('../../services/ai/trisCategoryIdentification.service');


// Schedule to run
const setupProductDownloadJob = () => {
    cron.schedule(process.env.PRODUCTS_DOWNLOAD_SCHEDULE, async () => {
        console.log('--- Starting scheduled product download ---');
        await downloadProducts();
        console.log('--- Product download complete ---');
        console.log('--- Starting product category identification ---');
        await identifyProductsTrisCategories();
        console.log('--- Product category identification complete ---');
    });
};

module.exports = setupProductDownloadJob;