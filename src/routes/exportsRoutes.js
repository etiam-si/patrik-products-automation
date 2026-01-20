const express = require('express');
const router = express.Router();
const exportsController = require('../controllers/exportsController');

// GET /api/products - Retrieves all products
router.get('/', exportsController.getAllExports);

module.exports = router;