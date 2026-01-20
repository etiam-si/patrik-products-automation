const categoriesService = require('../services/categories.service');

/**
 * Handles the request to retrieve all categories.
 */
exports.getAllCategories = async (req, res) => {
    try {
        const data = await categoriesService.getAllCategories();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Handles the request to retrieve categories for a specific export ID.
 */
exports.getCategoriesByExportId = async (req, res) => {
    try {
        const { exportId } = req.params;
        const data = await categoriesService.getCategoriesByExportId(exportId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
