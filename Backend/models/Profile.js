const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  phone: String,
  phone_verified: { type: Boolean, default: false },
  phone_otp_hash: { type: String },
  phone_otp_expires: { type: Date },
  last_login: Date
}, { timestamps: { createdAt: 'created_at', updatedAt: false } }); // Keep custom timestamp for created_at

module.exports = mongoose.model('Profile', profileSchema);
