const express = require('express');
const router = express.Router();

const exampleRoutes = require('../exampleRoutes');
const productRoutes = require('../productRoutes');
const exportsRoutes = require('../exportsRoutes');
const categoriesRoutes = require('../categoriesRoutes');

router.use('/example', exampleRoutes);
router.use('/product', productRoutes);
router.use('/exports', exportsRoutes);
router.use('/categories', categoriesRoutes);

module.exports = router;
