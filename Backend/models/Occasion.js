const mongoose = require('mongoose');

const occasionSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

module.exports = mongoose.model('Occasion', occasionSchema);
