const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activity: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomBooking', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  createdAt: { type: Date, default: Date.now }
});

// Each user can only review an activity once per booking
reviewSchema.index({ user: 1, activity: 1, booking: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);