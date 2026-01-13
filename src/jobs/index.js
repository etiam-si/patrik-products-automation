const setupProductDownloadJob = require('./pnv/downloadProducts');
const { downloadProducts } = require('../services/pnv/downloadProducts.service');



const initJobs = () => {
    console.log('--- Running setup jobs ---');
    downloadProducts();

    console.log('--- Initializing all background jobs ---');
    setupProductDownloadJob();

};

module.exports = initJobs;