const db = require('../services/dynamodbService');
const { v4: uuidv4 } = require('uuid');

// User model
const User = {
  // Create a new user
  async create(userData) {
    const userId = uuidv4();
    const item = {
      PK: `USER#${userData.email}`,
      SK: `PROFILE#${userId}`,
      type: 'USER',
      id: userId,
      email: userData.email,
      fullName: userData.fullName,
      password: userData.password,
      phone: userData.phone || '',
      role: userData.role || 'customer',
      createdAt: Date.now()
    };
    
    await db.putItem(item);
    return item;
  },

  // Find user by email
  async findByEmail(email) {
    const results = await db.queryByEmail(email);
    return results.find(item => item.type === 'USER');
  },

  // Find user by ID
  async findById(userId) {
    const results = await db.queryByType('USER');
    return results.find(item => item.id === userId);
  },

  // Update user
  async update(userId, updateData) {
    const user = await this.findById(userId);
    if (!user) throw new Error('User not found');
    
    return await db.updateItem(user.PK, user.SK, updateData);
  },

  // Delete user
  async delete(userId) {
    const user = await this.findById(userId);
    if (!user) throw new Error('User not found');
    
    return await db.deleteItem(user.PK, user.SK);
  },

  // Get all users
  async getAll() {
    return await db.queryByType('USER');
  },

  // Find by unique constraint (for registration check)
  async findOne(query) {
    if (query.email) {
      return await this.findByEmail(query.email);
    }
    return null;
  }
};

module.exports = User;
