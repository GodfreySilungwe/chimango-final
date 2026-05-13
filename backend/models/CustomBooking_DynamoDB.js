const db = require('../services/dynamodbService');
const { v4: uuidv4 } = require('uuid');

// CustomBooking model
const CustomBooking = {
  // Create a new custom booking
  async create(bookingData) {
    const bookingId = uuidv4();
    const bookingCode = this.generateBookingCode();
    
    const item = {
      PK: `CUSTOMBOOKING#${bookingId}`,
      SK: `PROFILE#${bookingId}`,
      type: 'CUSTOMBOOKING',
      id: bookingId,
      userId: bookingData.userId || null,
      selectedActivities: bookingData.selectedActivities || [],
      totalPrice: bookingData.totalPrice,
      status: bookingData.status || 'pending',
      paymentStatus: bookingData.paymentStatus || 'pending',
      specialRequests: bookingData.specialRequests || '',
      airportPickup: bookingData.airportPickup || false,
      flightNumber: bookingData.flightNumber || '',
      arrivalTime: bookingData.arrivalTime || '',
      personalDetails: bookingData.personalDetails || {},
      bookingCode: bookingCode,
      nationality: bookingData.nationality || 'malawian',
      paymentMethod: bookingData.paymentMethod || null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // Also create indexes for lookups
    const bookingCodeItem = {
      PK: `BOOKINGCODE#${bookingCode}`,
      SK: `PROFILE#${bookingId}`,
      type: 'CUSTOMBOOKING',
      ...item
    };
    
    let userIndexItem = null;
    if (bookingData.userId) {
      userIndexItem = {
        PK: `USER#${bookingData.userId}`,
        SK: `CUSTOMBOOKING#${bookingId}`,
        type: 'CUSTOMBOOKING',
        ...item
      };
    }
    
    await db.putItem(item);
    await db.putItem(bookingCodeItem);
    if (userIndexItem) {
      await db.putItem(userIndexItem);
    }
    
    return item;
  },

  // Find by ID
  async findById(bookingId) {
    return await db.getItem(`CUSTOMBOOKING#${bookingId}`, `PROFILE#${bookingId}`);
  },

  // Find by booking code
  async findByBookingCode(bookingCode) {
    const results = await db.queryByPK(`BOOKINGCODE#${bookingCode}`);
    return results[0] || null;
  },

  // Find by user ID
  async findByUserId(userId) {
    const items = await db.queryByPK(`USER#${userId}`);
    return items.filter(item => item.type === 'CUSTOMBOOKING');
  },

  // Update booking and keep all booking copies in sync
  async update(bookingId, updateData) {
    const booking = await this.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const updatePromises = [
      db.updateItem(`CUSTOMBOOKING#${bookingId}`, `PROFILE#${bookingId}`, updateData)
    ];

    if (booking.bookingCode) {
      updatePromises.push(db.updateItem(`BOOKINGCODE#${booking.bookingCode}`, `PROFILE#${bookingId}`, updateData));
    }

    if (booking.userId) {
      updatePromises.push(db.updateItem(`USER#${booking.userId}`, `CUSTOMBOOKING#${bookingId}`, updateData));
    }

    const results = await Promise.all(updatePromises);
    return results[0];
  },

  // Delete booking
  async delete(bookingId) {
    const booking = await this.findById(bookingId);
    if (!booking) throw new Error('Booking not found');
    
    // Delete from all locations
    await db.deleteItem(`CUSTOMBOOKING#${bookingId}`, `PROFILE#${bookingId}`);
    await db.deleteItem(`BOOKINGCODE#${booking.bookingCode}`, `PROFILE#${bookingId}`);
    
    if (booking.userId) {
      await db.deleteItem(`USER#${booking.userId}`, `CUSTOMBOOKING#${bookingId}`);
    }
  },

  // Get all custom bookings
  async find(query = {}) {
    const allBookings = await db.queryByType('CUSTOMBOOKING');
    
    if (query.status) {
      return allBookings.filter(b => b.status === query.status);
    }
    
    if (query.paymentStatus) {
      return allBookings.filter(b => b.paymentStatus === query.paymentStatus);
    }
    
    return allBookings;
  },

  // Generate unique booking code
  generateBookingCode() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CHM-${timestamp}-${random}`;
  }
};

module.exports = CustomBooking;
