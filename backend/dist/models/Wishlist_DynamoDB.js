const db = require('../services/dynamodbService');
const { v4: uuidv4 } = require('uuid');

// Wishlist model
const Wishlist = {
  // Add to wishlist
  async create(wishlistData) {
    const wishlistId = uuidv4();
    const item = {
      PK: `WISHLIST#${wishlistData.userId}`,
      SK: `ACTIVITY#${wishlistData.activityId}`,
      type: 'WISHLIST',
      id: wishlistId,
      userId: wishlistData.userId,
      activityId: wishlistData.activityId,
      createdAt: Date.now()
    };
    
    await db.putItem(item);
    return item;
  },

  // Find in wishlist
  async findOne(query) {
    if (query.userId && query.activityId) {
      return await db.getItem(`WISHLIST#${query.userId}`, `ACTIVITY#${query.activityId}`);
    }
    return null;
  },

  // Get user's wishlist
  async findByUserId(userId) {
    const items = await db.queryByPK(`WISHLIST#${userId}`);
    return items.filter(item => item.type === 'WISHLIST');
  },

  // Remove from wishlist
  async delete(userId, activityId) {
    await db.deleteItem(`WISHLIST#${userId}`, `ACTIVITY#${activityId}`);
  },

  // Check if exists
  async exists(userId, activityId) {
    const item = await this.findOne({ userId, activityId });
    return item !== null;
  }
};

module.exports = Wishlist;
