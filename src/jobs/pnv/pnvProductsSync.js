const cron = require('node-cron');
const { pnvProductSyncJob } = require("./pnvProductsSync.job");


// Schedule to run
const setupPnvProductSyncJob = () => {
    cron.schedule(process.env.PRODUCTS_DOWNLOAD_SCHEDULE, async () => {
        pnvProductSyncJob();
    });
};

module.exports = setupPnvProductSyncJob;