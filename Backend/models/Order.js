const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_number: { type: String, unique: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shipping_address_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },

  payment_method: String,
  payment_status: String,
  order_status: String,

  subtotal: Number,
  shipping_cost: Number,
  total_amount: Number,

  razorpay_order_id: String,
  razorpay_payment_id: String,

  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem' }]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
