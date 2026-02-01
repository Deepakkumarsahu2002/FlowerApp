const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  images: {type: [String],required: true,},
description: String,
  in_stock: { type: Boolean, default: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  occasions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Occasion' }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
