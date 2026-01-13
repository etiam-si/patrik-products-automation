const cron = require('node-cron');
const { downloadProducts } = require('../../services/pnv/downloadProducts.service');

// Schedule to run
const setupProductDownloadJob = () => {
    cron.schedule(process.env.PRODUCTS_DOWNLOAD_SCHEDULE, async () => {
        console.log('--- Starting scheduled product download ---');
        await downloadProducts();
        console.log('--- Product download complete ---');
    });
};

module.exports = setupProductDownloadJob;