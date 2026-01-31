const Product = require('../models/Product');

exports.getAll = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category_id')
      .populate('occasions')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

exports.getById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category_id')
      .populate('occasions');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
};

exports.create = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    const populated = await Product.findById(product._id)
      .populate('category_id')
      .populate('occasions');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: error.message || 'Error creating product' });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('category_id')
      .populate('occasions');
    
    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ message: error.message || 'Error updating product' });
  }
};

exports.remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
};
