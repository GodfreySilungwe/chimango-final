const db = require('../services/dynamodbService');
const { v4: uuidv4 } = require('uuid');

// CustomBooking model
const CustomBooking = {
  // Create a new custom booking
  async create(bookingData) {
    const bookingId = uuidv4();
    const bookingCode = bookingData.bookingCode || this.generateBookingCode();
    
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
      airportPickupRate: bookingData.airportPickupRate || 0,
      flightNumber: bookingData.flightNumber || '',
      arrivalTime: bookingData.arrivalTime || '',
      personalDetails: bookingData.personalDetails || {},
      accommodationChoice: bookingData.accommodationChoice || 'camping',
      accommodationRate: bookingData.accommodationRate || 0,
      bookingCode: bookingCode,
      nationality: bookingData.nationality || 'international',
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
    if (results.length > 0) {
      return results[0];
    }

    // Fallback: scan for the booking code on primary booking items
    const allBookings = await db.queryByType('CUSTOMBOOKING');
    return allBookings.find(item => item.PK?.startsWith('CUSTOMBOOKING#') && item.bookingCode === bookingCode) || null;
  },

  // Find by user ID
  async findByUserId(userId) {
    const items = await db.queryByPK(`USER#${userId}`);
    const bookings = items.filter(item => item.type === 'CUSTOMBOOKING');
    if (bookings.length > 0) {
      return bookings;
    }

    // Fallback: scan primary booking items for the userId
    const allBookings = await db.queryByType('CUSTOMBOOKING');
    return allBookings.filter(item => item.PK?.startsWith('CUSTOMBOOKING#') && item.userId === userId);
  },

  // Update booking and keep all booking copies in sync
  async update(bookingId, updateData) {
    const booking = await this.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const primaryResult = await db.updateItem(`CUSTOMBOOKING#${bookingId}`, `PROFILE#${bookingId}`, updateData);
    const updatedBooking = { ...booking, ...primaryResult };

    const secondaryUpdates = [];
    const bookingCode = primaryResult.bookingCode || booking.bookingCode;
    const userId = primaryResult.userId || booking.userId;

    if (bookingCode) {
      secondaryUpdates.push(
        db.putItem({
          PK: `BOOKINGCODE#${bookingCode}`,
          SK: `PROFILE#${bookingId}`,
          type: 'CUSTOMBOOKING',
          ...updatedBooking
        }).catch(error => {
          console.warn(`Failed to sync bookingCode index for ${bookingCode}:`, error.message);
          return null;
        })
      );
    }

    if (userId) {
      secondaryUpdates.push(
        db.putItem({
          PK: `USER#${userId}`,
          SK: `CUSTOMBOOKING#${bookingId}`,
          type: 'CUSTOMBOOKING',
          ...updatedBooking
        }).catch(error => {
          console.warn(`Failed to sync user index for ${userId}:`, error.message);
          return null;
        })
      );
    }

    await Promise.all(secondaryUpdates);
    return primaryResult;
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
