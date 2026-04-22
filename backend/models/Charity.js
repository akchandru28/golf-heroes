const mongoose = require('mongoose');

const charitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  image: { type: String },
  website: { type: String },
  featured: { type: Boolean, default: false },
  totalReceived: { type: Number, default: 0 },
  events: [{
    title: String,
    date: Date,
    description: String,
  }],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Charity', charitySchema);
