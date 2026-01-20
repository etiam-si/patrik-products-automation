const exportsService = require("../services/exports.service");

exports.getAllExports = async (req, res) => {
    try {
        const data = await exportsService.getAllExports();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getExportById = async (req, res) => {
    try {
        const { id } = req.params;
        const exportData = await exportsService.getExportById(id);
        if (!exportData) {
            return res.status(404).json({ success: false, message: `Export with id ${id} not found.` });
        }
        res.json({ success: true, data: exportData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}