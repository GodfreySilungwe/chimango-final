const db = require('../services/dynamodbService');
const { v4: uuidv4 } = require('uuid');

// Booking model
const Booking = {
  // Create a new booking
  async create(bookingData) {
    const bookingId = uuidv4();
    const item = {
      PK: `BOOKING#${bookingId}`,
      SK: `PROFILE#${bookingId}`,
      type: 'BOOKING',
      id: bookingId,
      userId: bookingData.userId,
      tourId: bookingData.tourId,
      travelDate: bookingData.travelDate,
      numTravelers: bookingData.numTravelers,
      totalPrice: bookingData.totalPrice,
      status: bookingData.status || 'pending',
      paymentStatus: bookingData.paymentStatus || 'unpaid',
      promoCode: bookingData.promoCode || '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // Also create a user index for quick lookups
    const userIndexItem = {
      PK: `USER#${bookingData.userId}`,
      SK: `BOOKING#${bookingId}`,
      type: 'BOOKING',
      ...item
    };
    
    await db.putItem(item);
    await db.putItem(userIndexItem);
    
    return item;
  },

  // Find booking by ID
  async findById(bookingId) {
    return await db.getItem(`BOOKING#${bookingId}`, `PROFILE#${bookingId}`);
  },

  // Find bookings by user ID
  async findByUserId(userId) {
    const items = await db.queryByPK(`USER#${userId}`);
    const bookings = items.filter(item => item.type === 'BOOKING');
    if (bookings.length > 0) {
      return bookings;
    }

    // Fallback: scan primary booking items for the userId
    const allBookings = await db.queryByType('BOOKING');
    return allBookings.filter(item => item.PK?.startsWith('BOOKING#') && item.userId === userId);
  },

  // Update booking
  async update(bookingId, updateData) {
    updateData.updatedAt = Date.now();
    return await db.updateItem(`BOOKING#${bookingId}`, `PROFILE#${bookingId}`, updateData);
  },

  // Delete booking
  async delete(bookingId) {
    const booking = await this.findById(bookingId);
    if (!booking) throw new Error('Booking not found');
    
    // Delete from both locations
    await db.deleteItem(`BOOKING#${bookingId}`, `PROFILE#${bookingId}`);
    await db.deleteItem(`USER#${booking.userId}`, `BOOKING#${bookingId}`);
  },

  // Get all bookings
  async find(query = {}) {
    const allBookings = await db.queryByType('BOOKING');
    
    if (query.status) {
      return allBookings.filter(b => b.status === query.status);
    }
    
    return allBookings;
  }
};

module.exports = Booking;
