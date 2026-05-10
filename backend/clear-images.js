const mongoose = require('mongoose');
require('dotenv').config();
const Activity = require('./models/Activity');

async function clearImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const result = await Activity.updateMany(
      {},
      { $set: { images: [], mainImage: '' } }
    );
    
    console.log('Cleared all images from activities');
    console.log('Modified count:', result.modifiedCount);
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit();
  }
}

clearImages();