const db = require('../services/dynamodbService');
const { v4: uuidv4 } = require('uuid');

// Tour model
const Tour = {
  // Create a new tour
  async create(tourData) {
    const tourId = uuidv4();
    const item = {
      PK: `TOUR#${tourId}`,
      SK: `PROFILE#${tourId}`,
      type: 'TOUR',
      id: tourId,
      name: tourData.name,
      destination: tourData.destination,
      durationDays: tourData.durationDays,
      price: tourData.price,
      maxCapacity: tourData.maxCapacity,
      startDate: tourData.startDate,
      endDate: tourData.endDate,
      itineraryText: tourData.itineraryText || '',
      included: tourData.included || '',
      notIncluded: tourData.notIncluded || '',
      images: tourData.images || [],
      status: tourData.status || 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    await db.putItem(item);
    return item;
  },

  // Find tour by ID
  async findById(tourId) {
    return await db.getItem(`TOUR#${tourId}`, `PROFILE#${tourId}`);
  },

  // Update tour
  async update(tourId, updateData) {
    updateData.updatedAt = Date.now();
    return await db.updateItem(`TOUR#${tourId}`, `PROFILE#${tourId}`, updateData);
  },

  // Delete tour
  async delete(tourId) {
    return await db.deleteItem(`TOUR#${tourId}`, `PROFILE#${tourId}`);
  },

  // Get all tours
  async find(query = {}) {
    const allTours = await db.queryByType('TOUR');
    
    // Filter by status if provided
    if (query.status) {
      return allTours.filter(tour => tour.status === query.status);
    }
    
    return allTours;
  },

  // Get published tours
  async getPublished() {
    return await this.find({ status: 'published' });
  }
};

module.exports = Tour;
