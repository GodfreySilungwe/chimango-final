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
    req.userRole = decoded.role;
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

app.post('/api/activities/upload', upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), async (req, res) => {
  try {
    const raw = req.body || {};
    const parseNumber = (value, fallback = 0) => {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? fallback : parsed;
    };

    const parseBoolean = (value, fallback = false) => {
      if (typeof value === 'boolean') return value;
      if (value === undefined || value === null || value === '') return fallback;
      const lower = String(value).toLowerCase();
      return ['true', '1', 'yes', 'on'].includes(lower);
    };

    const activityData = {
      name: raw.name || '',
      location: raw.location || '',
      region: raw.region || 'Southern Region',
      description: raw.description || '',
      pricePerDay: parseNumber(raw.pricePerDay, 0),
      pricePerPerson: parseNumber(raw.pricePerPerson, 0),
      hasAccommodation: parseBoolean(raw.hasAccommodation, true),
      campingRate: parseBoolean(raw.hasAccommodation, true) ? parseNumber(raw.campingRate, 0) : 0,
      roomsRate: parseBoolean(raw.hasAccommodation, true) ? parseNumber(raw.roomsRate, 0) : 0,
      charetsRate: parseBoolean(raw.hasAccommodation, true) ? parseNumber(raw.charetsRate, 0) : 0,
      airportPickupAvailable: parseBoolean(raw.airportPickupAvailable, true),
      airportPickupRate: parseBoolean(raw.airportPickupAvailable, true) ? parseNumber(raw.airportPickupRate, 7.5) : 0,
      durationHours: parseNumber(raw.durationHours, 0),
      category: raw.category || 'hiking',
      difficulty: raw.difficulty || 'easy',
      mealIncluded: parseBoolean(raw.mealIncluded, false),
      minPeople: parseNumber(raw.minPeople, 1),
      maxPeople: parseNumber(raw.maxPeople, 20),
      status: raw.status || 'active',
      isActive: raw.status !== 'inactive'
    };

    if (req.files?.mainImage?.[0]) {
      const mainImageFile = req.files.mainImage[0];
      const uploadedMainImage = await s3Service.uploadFile(
        mainImageFile.buffer,
        mainImageFile.originalname,
        mainImageFile.mimetype,
        'activities'
      );
      activityData.mainImage = uploadedMainImage.url;
    }

    const uploadedGallery = [];
    if (req.files?.images?.length) {
      for (const imageFile of req.files.images) {
        const uploadedImage = await s3Service.uploadFile(
          imageFile.buffer,
          imageFile.originalname,
          imageFile.mimetype,
          'activities'
        );
        uploadedGallery.push(uploadedImage.url);
      }
    }

    activityData.images = uploadedGallery;

    const activity = await Activity.create(activityData);
    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity with upload:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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

app.post('/api/forgot-password', async (req, res) => {
  let body = req.body;
  if (Buffer.isBuffer(body)) {
    const bodyString = body.toString('utf-8');
    try {
      body = JSON.parse(bodyString);
    } catch (e) {}
  }

  try {
    const { email } = body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findByEmail(email);
    const resetToken = crypto.randomBytes(20).toString('hex');
    const expiresAt = Date.now() + 60 * 60 * 1000;

    await PasswordReset.create({
      email,
      token: resetToken,
      expiresAt
    });

    if (user) {
      await sendPasswordResetEmail(user.email, user.fullName || 'Customer', resetToken);
    }

    res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/reset-password', async (req, res) => {
  let body = req.body;
  if (Buffer.isBuffer(body)) {
    const bodyString = body.toString('utf-8');
    try {
      body = JSON.parse(bodyString);
    } catch (e) {}
  }

  try {
    const { token, newPassword } = body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const resetEntries = await PasswordReset.findByToken(token);
    const resetEntry = Array.isArray(resetEntries) ? resetEntries[0] : resetEntries;

    if (!resetEntry || resetEntry.used || resetEntry.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = await User.findByEmail(resetEntry.email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.update(user.id, { password: hashedPassword });
    await PasswordReset.markAsUsed(token);

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
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

app.get('/api/users', authMiddleware, async (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  try {
    const users = await User.getAll();
    res.json(users.map(u => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      role: u.role
    })));
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/users/profile', authMiddleware, async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const updateData = {};

    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;

    const updatedUser = await User.update(req.userId, updateData);
    res.json({
      id: updatedUser.id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/users/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.update(req.userId, { password: hashedPassword });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/payment-request', async (req, res) => {
  const body = parseBody(req);
  const {
    bookingCode,
    paymentMethod,
    paymentReference,
    amount,
    customerName,
    customerPhone,
    customerEmail,
    activityName,
    selectedDate,
    status
  } = body;

  if (!bookingCode || !paymentMethod || !paymentReference || !amount || !customerName) {
    return res.status(400).json({ message: 'Missing required payment request fields' });
  }

  try {
    const payment = await PaymentRequest.create({
      bookingCode,
      paymentMethod,
      paymentReference,
      amount,
      customerName,
      customerPhone,
      customerEmail,
      activityName,
      selectedDate,
      status: status || 'pending'
    });
    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creating payment request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/payment-requests/pending', authMiddleware, async (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  try {
    const payments = await PaymentRequest.find({ status: 'pending' });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching pending payment requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/payment-requests/:id/verify', authMiddleware, async (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  try {
    const payment = await PaymentRequest.markAsVerified(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment request not found' });
    }
    res.json({ success: true, payment });
  } catch (error) {
    console.error('Error verifying payment request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== CUSTOM BOOKING ROUTES ====================

// Helper function to parse request body (handles Buffer from API Gateway)
const parseBody = (req) => {
  let body = req.body;
  if (Buffer.isBuffer(body)) {
    const bodyString = body.toString('utf-8');
    try {
      body = JSON.parse(bodyString);
      console.log('Parsed body from buffer:', body);
    } catch (e) {
      console.log('Could not parse buffer:', e.message);
    }
  }
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
      console.log('Parsed body from string:', body);
    } catch (e) {
      console.log('Could not parse string body:', e.message);
    }
  }
  return body;
};

// Get regular bookings by user ID
app.get('/api/bookings/user/:userId', async (req, res) => {
  console.log('=== GET BOOKINGS BY USER ===');
  console.log('UserId:', req.params.userId);
  
  try {
    const bookings = await Booking.findByUserId(req.params.userId);
    console.log(`Found ${bookings.length} bookings for user`);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings by user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get custom bookings by user ID
app.get('/api/custom-bookings/user/:userId', async (req, res) => {
  console.log('=== GET CUSTOM BOOKINGS BY USER ===');
  console.log('UserId:', req.params.userId);
  
  try {
    const bookings = await CustomBooking.findByUserId(req.params.userId);
    console.log(`Found ${bookings.length} bookings for user`);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching custom bookings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all custom bookings (admin)
app.get('/api/custom-bookings', async (req, res) => {
  console.log('=== GET ALL CUSTOM BOOKINGS ===');
  
  try {
    const bookings = await CustomBooking.find();
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching all custom bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get custom booking by booking code
app.get('/api/custom-bookings/code/:bookingCode', async (req, res) => {
  console.log('=== GET CUSTOM BOOKING BY CODE ===');
  console.log('BookingCode:', req.params.bookingCode);
  
  try {
    const booking = await CustomBooking.findByBookingCode(req.params.bookingCode);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking by code:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new custom booking
app.post('/api/custom-bookings', async (req, res) => {
  console.log('=== CREATE CUSTOM BOOKING ===');
  
  // Parse body (handles Buffer from API Gateway)
  const body = parseBody(req);
  console.log('Request body after parsing:', body);
  
  try {
    const { 
      userId, 
      selectedActivities, 
      totalPrice, 
      specialRequests, 
      airportPickup, 
      airportPickupRate,
      flightNumber, 
      arrivalTime, 
      personalDetails, 
      nationality, 
      paymentMethod,
      bookingCode
    } = body;
    
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    
    if (!selectedActivities || !selectedActivities.length) {
      return res.status(400).json({ message: 'selectedActivities is required' });
    }
    
    // Validate each activity
    for (const activity of selectedActivities) {
      if (!activity.activity || !activity.selectedDate) {
        return res.status(400).json({ message: 'activity ID and selectedDate are required' });
      }
    }
    
    const computedTotalPrice = Number(totalPrice) || selectedActivities.reduce((sum, act) => sum + (Number(act.totalPrice) || 0), 0);
    const booking = await CustomBooking.create({
      userId,
      selectedActivities: selectedActivities.map(act => ({
        activity: act.activity,
        numberOfDays: act.numberOfDays,
        numberOfPeople: act.numberOfPeople,
        accommodationChoice: act.accommodationChoice || 'camping',
        accommodationRate: Number(act.accommodationRate) || 0,
        foodOption: act.foodOption || 'exclusive',
        foodRate: Number(act.foodRate) || 0,
        foodTotal: Number(act.foodTotal) || 0,
        totalPrice: Number(act.totalPrice) || 0,
        selectedDate: new Date(act.selectedDate).toISOString()
      })),
      totalPrice: computedTotalPrice,
      specialRequests: specialRequests || '',
      airportPickup: Boolean(airportPickup),
      airportPickupRate: airportPickup ? Number(airportPickupRate) || 7.5 : 0,
      flightNumber: flightNumber || '',
      arrivalTime: arrivalTime || '',
      personalDetails: personalDetails || {},
      accommodationChoice: selectedActivities[0]?.accommodationChoice || 'camping',
      accommodationRate: Number(selectedActivities[0]?.accommodationRate) || 0,
      bookingCode,
      nationality: nationality || 'international',
      paymentMethod: paymentMethod || null,
      status: 'pending',
      paymentStatus: 'pending'
    });
    
    // Send confirmation email (don't await - fire and forget)
    try {
      await sendBookingConfirmationEmail(
        personalDetails?.email,
        personalDetails?.fullName,
        booking
      );
      console.log('Booking confirmation email sent to:', personalDetails?.email);
    } catch (emailError) {
      console.error('Failed to send booking email:', emailError);
    }
    
    res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error('Custom booking error:', error);
    res.status(500).json({ 
      message: error.message,
      errorType: error.name
    });
  }
});

// Verify a booking (admin action)
app.put('/api/custom-bookings/:id/verify', async (req, res) => {
  console.log('=== VERIFY CUSTOM BOOKING ===');
  console.log('Booking ID:', req.params.id);
  
  try {
    const booking = await CustomBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    const updated = await CustomBooking.update(req.params.id, { status: 'verified' });
    
    res.json({ success: true, booking: updated });
  } catch (error) {
    console.error('Error verifying booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel a custom booking
app.put('/api/custom-bookings/:id/cancel', async (req, res) => {
  console.log('=== CANCEL CUSTOM BOOKING ===');
  console.log('Booking ID:', req.params.id);
  
  try {
    const booking = await CustomBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }
    
    const updated = await CustomBooking.update(req.params.id, { status: 'cancelled' });
    res.json({ message: 'Booking cancelled successfully', booking: updated });
  } catch (error) {
    console.error('Cancel error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Confirm a custom booking (admin)
app.put('/api/custom-bookings/confirm/:bookingCode', async (req, res) => {
  console.log('=== CONFIRM CUSTOM BOOKING ===');
  console.log('Booking Code:', req.params.bookingCode);
  
  try {
    const booking = await CustomBooking.findByBookingCode(req.params.bookingCode);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    const updated = await CustomBooking.update(booking.id, { 
      status: 'confirmed', 
      paymentStatus: 'paid' 
    });
    res.json(updated);
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check availability
app.post('/api/check-availability', async (req, res) => {
  console.log('=== CHECK AVAILABILITY ===');
  
  // Parse body (handles Buffer from API Gateway)
  const body = parseBody(req);
  console.log('Request body after parsing:', body);
  
  try {
    const { activityId, selectedDate } = body;
    
    if (!activityId || !selectedDate) {
      return res.status(400).json({ message: 'activityId and selectedDate are required' });
    }
    
    const bookings = await CustomBooking.find({ status: 'confirmed' });
    let totalPeopleBooked = 0;
    
    bookings.forEach(booking => {
      booking.selectedActivities.forEach(activity => {
        const bookedActivityId = typeof activity.activity === 'object'
          ? activity.activity.id || activity.activity._id
          : activity.activity;

        if (bookedActivityId === activityId && 
            new Date(activity.selectedDate).toDateString() === new Date(selectedDate).toDateString()) {
          totalPeopleBooked += activity.numberOfPeople;
        }
      });
    });
    
    const activity = await Activity.findById(activityId);
    const maxCapacity = activity?.maxPeople || 20;
    const availableSpots = maxCapacity - totalPeopleBooked;
    
    res.json({
      available: availableSpots > 0,
      availableSpots,
      totalBooked: totalPeopleBooked,
      maxCapacity,
      message: availableSpots > 0 
        ? `${availableSpots} spot(s) available` 
        : 'Fully booked'
    });
  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update custom booking (general update)
app.put('/api/custom-bookings/:id', async (req, res) => {
  console.log('=== UPDATE CUSTOM BOOKING ===');
  console.log('Booking ID:', req.params.id);
  
  // Parse body (handles Buffer from API Gateway)
  const body = parseBody(req);
  console.log('Update data:', body);
  
  try {
    const updated = await CustomBooking.update(req.params.id, body);
    if (!updated) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Server error' });
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