const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  email_verified: { type: Boolean, default: false },
  email_verification_hash: { type: String },
  email_verification_expires: { type: Date }
});

module.exports = mongoose.model('User', userSchema);
