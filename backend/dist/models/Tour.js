const mongoose = require('mongoose');

const TourSchema = new mongoose.Schema({
  name: { type: String, required: true },
  destination: { type: String, required: true },
  durationDays: { type: Number, required: true },
  price: { type: Number, required: true },
  maxCapacity: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  itineraryText: { type: String },
  included: { type: String },
  notIncluded: { type: String },
  images: [{ type: String }],
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tour', TourSchema);