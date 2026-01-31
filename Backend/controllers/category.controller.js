const Category = require('../models/Categories');
const Occasion = require('../models/Occasion');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

exports.getAllOccasions = async (req, res) => {
  try {
    const occasions = await Occasion.find().sort({ name: 1 });
    res.json(occasions);
  } catch (error) {
    console.error('Error fetching occasions:', error);
    res.status(500).json({ message: 'Error fetching occasions' });
  }
};
