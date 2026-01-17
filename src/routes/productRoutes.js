const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /api/products - Retrieves all products
router.get('/', productController.getAllProducts);
router.get('/tsv', productController.getProductsAsTsv);

// GET /api/products/by-code/:code - Retrieves a single product by its code
router.get('/:code', productController.getProductByCode);

module.exports = router;