const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  phone: String,
  last_login: Date
}, { timestamps: { createdAt: 'created_at', updatedAt: false } }); // Keep custom timestamp for created_at

module.exports = mongoose.model('Profile', profileSchema);
