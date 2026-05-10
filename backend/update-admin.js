const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function updateAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const result = await User.findOneAndUpdate(
      { email: 'admin@chimango.com' },
      { fullName: 'Chimango' },
      { new: true }
    );
    
    if (result) {
      console.log('Admin name updated to: Chimango');
    } else {
      console.log('Admin user not found');
    }
    
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit();
  }
}

updateAdmin();