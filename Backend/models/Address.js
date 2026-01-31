const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  street: String,
  city: String,
  state: String,
  pincode: String,
  country: { type: String, default: 'India' },
  is_default: { type: Boolean, default: false }
});

module.exports = mongoose.model('Address', addressSchema);
