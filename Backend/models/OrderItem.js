const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number,
  price_at_purchase: Number
});

module.exports = mongoose.model('OrderItem', orderItemSchema);
