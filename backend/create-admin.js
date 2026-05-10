const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (adminExists) {
      console.log('⚠️ Admin user already exists');
      console.log('📧 Email: admin@example.com');
      console.log('🔑 Password: admin123');
      process.exit();
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin
    const admin = new User({
      fullName: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      phone: '1234567890',
      role: 'admin'
    });
    
    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit();
  }
}

createAdmin();