const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Define routes
router.get('/', productController.getAllProducts);

module.exports = router;