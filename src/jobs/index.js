const setupProductDownloadJob = require('./pnv/downloadProducts');
const { downloadProducts } = require('../services/pnv/downloadProducts.service');
const {identifyProductsTrisCategories} = require('../services/ai/trisCategoryIdentification.service');



const initJobs = async () => {
    console.log('--- Running setup jobs ---');
    await downloadProducts();
    await identifyProductsTrisCategories();

    console.log('--- Initializing all background jobs ---');
    setupProductDownloadJob();

};

module.exports = initJobs;