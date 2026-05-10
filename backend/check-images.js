const mongoose = require('mongoose');
require('dotenv').config();
const Activity = require('./models/Activity');

async function checkImages() {
  try {
    
    await mongoose.connect(process.env.MONGO_URI);
    
    const activities = await Activity.find();
    activities.forEach(a => {
      console.log(a.name + ' - Images: ' + a.images.length);
    });
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit();
  }
}

checkImages();