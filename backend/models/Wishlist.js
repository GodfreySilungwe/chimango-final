const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activity: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Each user can only add an activity once
wishlistSchema.index({ user: 1, activity: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);