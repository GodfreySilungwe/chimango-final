const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Delete old admin
    await User.deleteOne({ email: 'admin@chimango.com' });
    console.log('Old admin deleted');
    
    // Create new admin
    const newAdmin = new User({
      fullName: 'Super Admin',
      email: 'admin@chimango.com',
      password: hashedPassword,
      phone: '0888000000',
      role: 'admin'
    });
    
    await newAdmin.save();
    console.log('New admin created!');
    console.log('Email: admin@chimango.com');
    console.log('Password: admin123');
    
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit();
  }
}

resetAdmin();