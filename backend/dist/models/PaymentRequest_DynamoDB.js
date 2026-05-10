const db = require('../services/dynamodbService');
const { v4: uuidv4 } = require('uuid');

// PaymentRequest model
const PaymentRequest = {
  // Create payment request
  async create(paymentData) {
    const paymentId = uuidv4();
    const item = {
      PK: `PAYMENTREQUEST#${paymentId}`,
      SK: `PROFILE#${paymentId}`,
      type: 'PAYMENTREQUEST',
      id: paymentId,
      bookingCode: paymentData.bookingCode,
      paymentMethod: paymentData.paymentMethod,
      paymentReference: paymentData.paymentReference,
      amount: paymentData.amount,
      customerName: paymentData.customerName || '',
      customerPhone: paymentData.customerPhone || '',
      activityName: paymentData.activityName || '',
      selectedDate: paymentData.selectedDate || '',
      status: paymentData.status || 'pending',
      verifiedAt: null,
      createdAt: Date.now()
    };
    
    // Also create booking code index
    const bookingCodeItem = {
      PK: `BOOKINGCODE#${paymentData.bookingCode}`,
      SK: `PAYMENTREQUEST#${paymentId}`,
      type: 'PAYMENTREQUEST',
      ...item
    };
    
    await db.putItem(item);
    await db.putItem(bookingCodeItem);
    
    return item;
  },

  // Find by ID
  async findById(paymentId) {
    return await db.getItem(`PAYMENTREQUEST#${paymentId}`, `PROFILE#${paymentId}`);
  },

  // Find by booking code
  async findByBookingCode(bookingCode) {
    const items = await db.queryByPK(`BOOKINGCODE#${bookingCode}`);
    return items.filter(item => item.type === 'PAYMENTREQUEST');
  },

  // Update payment request
  async update(paymentId, updateData) {
    return await db.updateItem(`PAYMENTREQUEST#${paymentId}`, `PROFILE#${paymentId}`, updateData);
  },

  // Mark as verified
  async markAsVerified(paymentId) {
    return await this.update(paymentId, {
      status: 'verified',
      verifiedAt: Date.now()
    });
  },

  // Delete payment request
  async delete(paymentId) {
    const payment = await this.findById(paymentId);
    if (!payment) throw new Error('Payment request not found');
    
    await db.deleteItem(`PAYMENTREQUEST#${paymentId}`, `PROFILE#${paymentId}`);
    await db.deleteItem(`BOOKINGCODE#${payment.bookingCode}`, `PAYMENTREQUEST#${paymentId}`);
  },

  // Get all payment requests
  async find(query = {}) {
    const allPayments = await db.queryByType('PAYMENTREQUEST');
    
    if (query.status) {
      return allPayments.filter(p => p.status === query.status);
    }
    
    return allPayments;
  }
};

module.exports = PaymentRequest;
