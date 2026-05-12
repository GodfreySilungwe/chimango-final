require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const multer = require('multer');

// Import DynamoDB models
const User = require('./models/User_DynamoDB');
const Tour = require('./models/Tour_DynamoDB');
const Booking = require('./models/Booking_DynamoDB');
const Activity = require('./models/Activity_DynamoDB');
const CustomBooking = require('./models/CustomBooking_DynamoDB');
const PasswordReset = require('./models/PasswordReset_DynamoDB');
const Review = require('./models/Review_DynamoDB');
const PaymentRequest = require('./models/PaymentRequest_DynamoDB');
const Wishlist = require('./models/Wishlist_DynamoDB');

// Import services
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
  sendPaymentVerificationEmail
} = require('./services/emailService');

const s3Service = require('./services/s3Service');
const { initializeTable } = require('./services/dynamodbService');

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://chimangofrontendwebsitebucket.s3-website-us-east-1.amazonaws.com'
  ],
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
}));

// ==================== BODY PARSERS (MUST BE BEFORE PATH NORMALIZATION) ====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ==================== PATH NORMALIZATION MIDDLEWARE ====================
// Fixes API Gateway stripping leading slashes
app.use((req, res, next) => {
  const originalPath = req.path;
  if (originalPath && !originalPath.startsWith('/') && originalPath !== '') {
    req.url = '/' + req.url;
    req.path = '/' + req.path;
    console.log(`Path normalized: "${originalPath}" -> "${req.path}"`);
  }
  next();
});

// Configure multer for in-memory file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// ==================== AUTH MIDDLEWARE ====================
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ==================== TEST ROUTE ====================
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// ==================== TOUR ROUTES ====================
app.get('/api/tours', async (req, res) => {
  try {
    const tours = await Tour.find({ status: 'published' });
    res.json(tours);
  } catch (error) {
    console.error('Error fetching tours:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/tours/:id', async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.json(tour);
  } catch (error) {
    console.error('Error fetching tour:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/tours', async (req, res) => {
  try {
    const tour = await Tour.create(req.body);
    res.status(201).json(tour);
  } catch (error) {
    console.error('Error creating tour:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/tours/:id', async (req, res) => {
  try {
    const tour = await Tour.update(req.params.id, req.body);
    res.json(tour);
  } catch (error) {
    console.error('Error updating tour:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/tours/:id', async (req, res) => {
  try {
    await Tour.delete(req.params.id);
    res.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    console.error('Error deleting tour:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== ACTIVITY ROUTES ====================
app.get('/api/activities', async (req, res) => {
  try {
    const { category, region, difficulty } = req.query;
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (region) query.region = region;
    if (difficulty) query.difficulty = difficulty;
    
    const activities = await Activity.find(query);
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/activities/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/activities', async (req, res) => {
  try {
    const activity = await Activity.create(req.body);
    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/activities/:id', async (req, res) => {
  try {
    const activity = await Activity.update(req.params.id, req.body);
    res.json(activity);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/activities/:id', async (req, res) => {
  try {
    await Activity.delete(req.params.id);
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== USER ROUTES ====================
app.post('/api/register', async (req, res) => {
  console.log('=== REGISTER ROUTE HIT ===');
  
  let body = req.body;
  if (Buffer.isBuffer(body)) {
    const bodyString = body.toString('utf-8');
    try {
      body = JSON.parse(bodyString);
    } catch (e) {}
  }
  
  try {
    const { fullName, email, password, phone } = body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'fullName, email and password are required' });
    }
    
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone: phone || ''
    });
    
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  console.log('=== LOGIN ROUTE HIT ===');
  
  let body = req.body;
  if (Buffer.isBuffer(body)) {
    const bodyString = body.toString('utf-8');
    try {
      body = JSON.parse(bodyString);
    } catch (e) {}
  }
  
  try {
    const { email, password } = body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/users/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// TEMPORARY ADMIN CREATION ENDPOINT - Remove after use!
app.post('/api/admin/create', async (req, res) => {
  console.log('=== ADMIN CREATE ROUTE HIT ===');
  
  let body = req.body;
  if (Buffer.isBuffer(body)) {
    const bodyString = body.toString('utf-8');
    try {
      body = JSON.parse(bodyString);
    } catch (e) {}
  }
  
  try {
    const { fullName, email, password, phone, role } = body;
    
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'fullName, email and password are required' });
    }
    
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone: phone || '',
      role: role || 'admin'
    });
    
    res.status(201).json({
      message: 'Admin user created successfully',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== EXPORT ====================
module.exports = app;

// ==================== LOCAL DEVELOPMENT ====================
if (require.main === module) {
  initializeTable()
    .then(() => {
      app.listen(process.env.PORT || 5000, () => {
        console.log(`Server running on port ${process.env.PORT || 5000}`);
      });
    })
    .catch(error => {
      console.error('Failed to initialize DynamoDB table:', error);
      process.exit(1);
    });
}