const db = require('../services/dynamodbService');
const { v4: uuidv4 } = require('uuid');

// PasswordReset model
const PasswordReset = {
  // Create password reset token
  async create(resetData) {
    const resetId = uuidv4();
    const item = {
      PK: `PASSWORDRESET#${resetData.token}`,
      SK: `PROFILE#${resetId}`,
      type: 'PASSWORDRESET',
      id: resetId,
      email: resetData.email,
      token: resetData.token,
      expiresAt: resetData.expiresAt,
      used: false,
      createdAt: Date.now()
    };
    
    // Also create email index
    const emailIndexItem = {
      PK: `EMAIL#${resetData.email}`,
      SK: `PASSWORDRESET#${resetData.token}`,
      type: 'PASSWORDRESET',
      ...item
    };
    
    await db.putItem(item);
    await db.putItem(emailIndexItem);
    
    return item;
  },

  // Find by token
  async findByToken(token) {
    const items = await db.queryByPK(`PASSWORDRESET#${token}`);
    return items.filter(item => item.type === 'PASSWORDRESET');
  },

  // Find by email
  async findByEmail(email) {
    const items = await db.queryByPK(`EMAIL#${email}`);
    return items.filter(item => item.type === 'PASSWORDRESET' && !item.used);
  },

  // Update token status
  async markAsUsed(token) {
    const resetEntries = await this.findByToken(token);
    const entry = resetEntries[0];
    if (!entry) {
      throw new Error('Reset token not found');
    }
    return await db.updateItem(entry.PK, entry.SK, {
      used: true
    });
  },

  // Delete expired tokens
  async deleteExpired() {
    const allTokens = await db.queryByType('PASSWORDRESET');
    const now = Date.now();
    
    for (const token of allTokens) {
      if (token.expiresAt < now) {
        await db.deleteItem(token.PK, token.SK);
        if (token.email) {
          const emailItems = await db.queryByPK(`EMAIL#${token.email}`);
          const matching = emailItems.find(item => item.token === token.token);
          if (matching) {
            await db.deleteItem(matching.PK, matching.SK);
          }
        }
      }
    }
  }
};

module.exports = PasswordReset;
