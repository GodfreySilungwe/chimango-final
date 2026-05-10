const mongoose = require('mongoose');

const customBookingSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  selectedActivities: [{
    activity: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Activity', 
      required: true 
    },
    numberOfDays: { 
      type: Number, 
      required: true, 
      min: 1 
    },
    numberOfPeople: { 
      type: Number, 
      required: true, 
      min: 1 
    },
    totalPrice: { 
      type: Number, 
      required: true 
    },
    selectedDate: { 
      type: Date, 
      required: true 
    }
  }],
  totalPrice: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed'], 
    default: 'pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['unpaid', 'paid', 'refunded', 'pending'], 
    default: 'pending' 
  },
  specialRequests: { 
    type: String 
  },
  airportPickup: { 
    type: Boolean, 
    default: false 
  },
  flightNumber: { 
    type: String 
  },
  arrivalTime: { 
    type: String 
  },
  personalDetails: {
    fullName: { type: String },
    email: { type: String },
    phone: { type: String },
    passportNumber: { type: String },
    emergencyContact: { type: String }
  },
  bookingCode: { 
    type: String 
  },
  nationality: { 
    type: String, 
    enum: ['malawian', 'international'], 
    default: 'malawian' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['airtel', 'tnm', 'bank', 'pay_on_arrival'], 
    default: null 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index for faster queries on activity and date
customBookingSchema.index({ 'selectedActivities.activity': 1, 'selectedActivities.selectedDate': 1 });

// Index for user lookups
customBookingSchema.index({ user: 1 });

// Index for booking code lookups
customBookingSchema.index({ bookingCode: 1 });

module.exports = mongoose.model('CustomBooking', customBookingSchema);