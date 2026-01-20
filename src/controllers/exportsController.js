const exportsService = require("../services/exports/exports.service");

exports.getAllExports = async (req, res) => {
    try {
        const data = await exportsService.getAllExports();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}