const mongoose = require('mongoose');

const userRoleSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true }
});

module.exports = mongoose.model('UserRole', userRoleSchema);
