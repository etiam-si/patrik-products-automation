const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { pipeline } = require('stream/promises'); 
const { syncProductsToDb } = require('./syncProductsToDb.service');

/**
 * Creates the authentication cookie string required for PNV API requests.
 * @returns {string} The authentication cookie.
 * @throws {Error} If PNV_USER or PNV_PASS environment variables are not set.
 */
const getAuthCookie = () => {
    const user = process.env.PNV_USER;
    const pass = process.env.PNV_PASS;
    const group = process.env.PNV_GROUP;
    const userId = process.env.PNV_USER_ID;


    if (!user || !pass || !group || !userId) {
        throw new Error('PNV_USER, PNV_PASS, PNV_GROUP, and PNV_USER_ID must be set in the environment variables.');
    }

    // SECURITY: SHA1 is a weak hashing algorithm and is not recommended for new applications.
    // This is likely required for compatibility with the target legacy system.
    const passHash = crypto.createHash('sha1').update(pass).digest('hex');
    return `pnv_cms_2_user=${user}; pnv_cms_2_pass=${passHash}; pnv_cms_2_group=${group}; pnv_cms_2_user_id=${userId}`;
};

/**
 * Fetches the download link for the products export from the PNV API.
 * @param {string} cookie - The authentication cookie.
 * @returns {Promise<string>} The relative URL path to the download file.
 * @throws {Error} If the request fails or the download link is not found in the response.
 */
const fetchDownloadLink = async (cookie) => {
    const exportUrl = process.env.PNV_EXPORT_PRODUCTS_URL;
    if (!exportUrl) {
        throw new Error('PNV_EXPORT_PRODUCTS_URL must be set in the environment variables.');
    }

    try {
        const response = await axios.post(exportUrl, new URLSearchParams(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Accept-Language': 'en-US,en;q=0.7',
                'X-Requested-With': 'XMLHttpRequest',
                'Cookie': cookie,
            }
        });
        const downloadLink = response.data.download_link;
        if (!downloadLink) {
            throw new Error(`'download_link' not found in API response. Response data: ${JSON.stringify(response.data)}`);
        }
        return downloadLink;
    } catch (error) {
        console.error('Error fetching download link:', error.message);
        throw error; // Re-throw to be handled by the caller
    }
};

/**
 * Downloads a file from a given URL and saves it to a specified path.
 * @param {string} fileUrl - The full URL of the file to download.
 * @param {string} savePath - The local file path to save the downloaded file.
 * @param {string} cookie - The authentication cookie.
 * @returns {Promise<void>}
 * @throws {Error} If the file download or save operation fails.
 */
const downloadFile = async (fileUrl, savePath, cookie) => {
    console.log(`Downloading file from: ${fileUrl}`);
    const writer = require('fs').createWriteStream(savePath); // Use standard fs for createWriteStream

    const response = await axios.get(fileUrl, {
        headers: { 'Cookie': cookie },
        responseType: 'stream',
    });

    await pipeline(response.data, writer);
    console.log(`File successfully downloaded and saved to: ${savePath}`);
};

/**
 * Main service function to download the PNV products export file.
 */
const downloadProducts = async () => {
    try {
        const baseUrl = process.env.PNV_BASE_URL;
        if (!baseUrl) {
            throw new Error('PNV_BASE_URL must be set in the environment variables.');
        }

        const cookie = getAuthCookie();
        const downloadLink = await fetchDownloadLink(cookie);

        const fileUrl = `${baseUrl}/${downloadLink}`;
        const fileName = 'products.csv';

        // Default path is now relative to the project root (`/data`), not the `src` directory.
        // Set DATA_PATH=data in your .env file for this to work from the root.
        const saveDir = path.resolve(process.env.DATA_PATH || path.join(__dirname, '..', '..', '..', 'data'), 'pnv');
        const savePath = path.join(saveDir, fileName);

        await fs.mkdir(saveDir, { recursive: true });
        await downloadFile(fileUrl, savePath, cookie);

        console.log('Processing downloaded products.csv into JSON format...');
        await syncProductsToDb();
    } catch (error) {
        console.error('Failed to complete product download process:', error.message);
        // Depending on application needs, you might want to re-throw the error
        // throw error;
    }
};

module.exports = { downloadProducts };