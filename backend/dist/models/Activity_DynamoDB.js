const db = require('../services/dynamodbService');
const { v4: uuidv4 } = require('uuid');

// Activity model
const Activity = {
  // Create a new activity
  async create(activityData) {
    const activityId = uuidv4();
    const item = {
      PK: `ACTIVITY#${activityId}`,
      SK: `PROFILE#${activityId}`,
      type: 'ACTIVITY',
      id: activityId,
      name: activityData.name,
      location: activityData.location,
      region: activityData.region,
      description: activityData.description,
      pricePerDay: activityData.pricePerDay,
      pricePerPerson: activityData.pricePerPerson,
      durationHours: activityData.durationHours,
      category: activityData.category,
      difficulty: activityData.difficulty || 'moderate',
      status: activityData.status || 'active',
      images: activityData.images || [],
      mainImage: activityData.mainImage || '',
      whatToBring: activityData.whatToBring || [],
      meetingPoint: activityData.meetingPoint || '',
      minPeople: activityData.minPeople || 1,
      maxPeople: activityData.maxPeople || 20,
      isActive: activityData.isActive !== false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    await db.putItem(item);
    return item;
  },

  // Find activity by ID
  async findById(activityId) {
    return await db.getItem(`ACTIVITY#${activityId}`, `PROFILE#${activityId}`);
  },

  // Update activity
  async update(activityId, updateData) {
    updateData.updatedAt = Date.now();
    return await db.updateItem(`ACTIVITY#${activityId}`, `PROFILE#${activityId}`, updateData);
  },

  // Delete activity
  async delete(activityId) {
    return await db.deleteItem(`ACTIVITY#${activityId}`, `PROFILE#${activityId}`);
  },

  // Get all activities
  async find(query = {}) {
    let filteredActivities = await db.queryByType('ACTIVITY');

    if (query.category) {
      filteredActivities = filteredActivities.filter(a => a.category === query.category);
    }

    if (query.region) {
      filteredActivities = filteredActivities.filter(a => a.region === query.region);
    }

    if (query.difficulty) {
      filteredActivities = filteredActivities.filter(a => a.difficulty === query.difficulty);
    }

    if (query.isActive !== undefined) {
      filteredActivities = filteredActivities.filter(a => a.isActive === query.isActive);
    }

    if (query.status) {
      filteredActivities = filteredActivities.filter(a => a.status === query.status);
    }

    return filteredActivities;
  },

  // Search activities
  async search(query) {
    const allActivities = await db.queryByType('ACTIVITY');
    const searchLower = query.toLowerCase();
    
    return allActivities.filter(activity =>
      activity.name.toLowerCase().includes(searchLower) ||
      activity.description.toLowerCase().includes(searchLower) ||
      activity.location.toLowerCase().includes(searchLower)
    );
  }
};

module.exports = Activity;
