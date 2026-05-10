const mongoose = require('mongoose');

const paymentRequestSchema = new mongoose.Schema({
  bookingCode: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  paymentReference: { type: String, required: true },
  amount: { type: Number, required: true },
  customerName: { type: String },
  customerPhone: { type: String },
  activityName: { type: String },
  selectedDate: { type: Date },
  status: { type: String, enum: ['pending', 'verified', 'cancelled'], default: 'pending' },
  verifiedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PaymentRequest', paymentRequestSchema);