const setupPnvProductSyncJob = require('./pnv/pnvProductsSync');
const { pnvProductSyncJob } = require('./pnv/pnvProductsSync.job');




const initJobs = async () => {
    console.log('--- Running setup jobs ---');
    pnvProductSyncJob()
    // Setup cron job for PNV products sync job
    setupPnvProductSyncJob();

};

module.exports = initJobs;