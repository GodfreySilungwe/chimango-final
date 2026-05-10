const db = require('../services/dynamodbService');
const { v4: uuidv4 } = require('uuid');

// Review model
const Review = {
  // Create a new review
  async create(reviewData) {
    const reviewId = uuidv4();
    const item = {
      PK: `REVIEW#${reviewId}`,
      SK: `PROFILE#${reviewId}`,
      type: 'REVIEW',
      id: reviewId,
      userId: reviewData.userId,
      activityId: reviewData.activityId,
      bookingId: reviewData.bookingId,
      rating: reviewData.rating,
      comment: reviewData.comment,
      status: reviewData.status || 'approved',
      createdAt: Date.now()
    };
    
    // Also create activity index
    const activityIndexItem = {
      PK: `ACTIVITY#${reviewData.activityId}`,
      SK: `REVIEW#${reviewId}`,
      type: 'REVIEW',
      ...item
    };
    
    await db.putItem(item);
    await db.putItem(activityIndexItem);
    
    return item;
  },

  // Find by ID
  async findById(reviewId) {
    return await db.getItem(`REVIEW#${reviewId}`, `PROFILE#${reviewId}`);
  },

  // Find reviews by activity ID
  async findByActivityId(activityId) {
    const items = await db.queryByPK(`ACTIVITY#${activityId}`);
    return items.filter(item => item.type === 'REVIEW');
  },

  // Update review
  async update(reviewId, updateData) {
    return await db.updateItem(`REVIEW#${reviewId}`, `PROFILE#${reviewId}`, updateData);
  },

  // Delete review
  async delete(reviewId) {
    const review = await this.findById(reviewId);
    if (!review) throw new Error('Review not found');
    
    await db.deleteItem(`REVIEW#${reviewId}`, `PROFILE#${reviewId}`);
    await db.deleteItem(`ACTIVITY#${review.activityId}`, `REVIEW#${reviewId}`);
  },

  // Get all reviews
  async find(query = {}) {
    const allReviews = await db.queryByType('REVIEW');
    
    if (query.status) {
      return allReviews.filter(r => r.status === query.status);
    }
    
    return allReviews;
  }
};

module.exports = Review;
