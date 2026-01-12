const express = require('express');
const router = express.Router();
const productController = require('../controllers/exampleController');

// Define routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

module.exports = router;