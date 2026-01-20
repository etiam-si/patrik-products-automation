const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');

// GET /api/categories - Retrieves all categories
router.get('/', categoriesController.getAllCategories);

// GET /api/categories/by-export/:exportId - Retrieves categories for a specific export ID
router.get('/by-export/:exportId', categoriesController.getCategoriesByExportId);

module.exports = router;