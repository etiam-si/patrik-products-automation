const Example = require('../models/exampleModel');

exports.getAllProducts = (req, res) => {
    const data = Example.findAll();
    res.json({ success: true, data });
};

exports.getProductById = (req, res) => {
    const product = Example.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json({ success: true, data: product });
};