const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  region: { type: String, required: true },
  description: { type: String, required: true },
  pricePerDay: { type: Number, required: true }, // Now in USD
  pricePerPerson: { type: Number, required: true }, // Now in USD
  durationHours: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['hiking', 'safari', 'kayaking', 'cultural', 'beach', 'waterfall', 'mountain', 'village'],
    required: true 
  },
  difficulty: { type: String, enum: ['easy', 'moderate', 'challenging'], default: 'moderate' },
  images: [{ type: String }],
  mainImage: { type: String },
  whatToBring: [String],
  meetingPoint: { type: String },
  minPeople: { type: Number, default: 1 },
  maxPeople: { type: Number, default: 20 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);