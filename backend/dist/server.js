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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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
app.get('test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// ==================== TOUR ROUTES ====================
app.get('api/tours', async (req, res) => {
  try {
    const tours = await Tour.find({ status: 'published' });
    res.json(tours);
  } catch (error) {
    console.error('Error fetching tours:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('api/tours/:id', async (req, res) => {
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

app.post('api/tours', async (req, res) => {
  try {
    const tour = await Tour.create(req.body);
    res.status(201).json(tour);
  } catch (error) {
    console.error('Error creating tour:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('api/tours/:id', async (req, res) => {
  try {
    const tour = await Tour.update(req.params.id, req.body);
    res.json(tour);
  } catch (error) {
    console.error('Error updating tour:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('api/tours/:id', async (req, res) => {
  try {
    await Tour.delete(req.params.id);
    res.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    console.error('Error deleting tour:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== ACTIVITY ROUTES ====================
app.get('api/activities', async (req, res) => {
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

app.get('api/activities/:id', async (req, res) => {
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

app.post('api/activities', async (req, res) => {
  try {
    const activity = await Activity.create(req.body);
    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('api/activities/:id', async (req, res) => {
  try {
    const activity = await Activity.update(req.params.id, req.body);
    res.json(activity);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('api/activities/:id', async (req, res) => {
  try {
    await Activity.delete(req.params.id);
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== USER ROUTES ====================
app.post('api/users/register', async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;
    
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
    
    try {
      await sendWelcomeEmail(email, fullName);
      console.log('Welcome email sent to:', email);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }
    
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

app.post('api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
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

app.get('api/users/me', authMiddleware, async (req, res) => {
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
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.get('api/users', async (req, res) => {
  try {
    const users = await User.getAll();
    const sanitized = users.map(u => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      role: u.role,
      createdAt: u.createdAt
    }));
    res.json(sanitized);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('api/users/profile', authMiddleware, async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const user = await User.update(req.userId, { fullName, phone });
    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('api/users/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(req.userId, { password: hashedPassword });
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== BOOKING ROUTES ====================
app.post('api/bookings', async (req, res) => {
  try {
    const { userId, tourId, travelDate, numTravelers, promoCode } = req.body;
    
    if (!userId || !tourId || !travelDate || !numTravelers) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    
    let totalPrice = tour.price * numTravelers;
    if (promoCode === 'SUMMER10') {
      totalPrice = totalPrice * 0.9;
    }
    
    const booking = await Booking.create({
      userId,
      tourId,
      travelDate: new Date(travelDate),
      numTravelers,
      totalPrice,
      promoCode: promoCode || '',
      status: 'confirmed',
      paymentStatus: 'paid'
    });
    
    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('api/bookings/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.findByUserId(req.params.userId);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('api/bookings/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }
    
    const updated = await Booking.update(req.params.id, { status: 'cancelled' });
    res.json({ message: 'Booking cancelled successfully', booking: updated });
  } catch (error) {
    console.error('Cancel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== CUSTOM BOOKING ROUTES ====================
app.post('api/check-availability', async (req, res) => {
  try {
    const { activityId, selectedDate } = req.body;
    
    const bookings = await CustomBooking.find({ status: 'confirmed' });
    let totalPeopleBooked = 0;
    
    bookings.forEach(booking => {
      booking.selectedActivities.forEach(activity => {
        if (activity.activity === activityId && 
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

app.post('api/custom-bookings', async (req, res) => {
  try {
    const { userId, selectedActivities, totalPrice, specialRequests, airportPickup, flightNumber, arrivalTime, personalDetails, nationality, paymentMethod } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    
    if (!selectedActivities || !selectedActivities.length) {
      return res.status(400).json({ message: 'selectedActivities is required' });
    }
    
    for (const activity of selectedActivities) {
      if (!activity.activity || !activity.selectedDate) {
        return res.status(400).json({ message: 'activity ID and selectedDate are required' });
      }
    }
    
    const booking = await CustomBooking.create({
      userId,
      selectedActivities: selectedActivities.map(act => ({
        activity: act.activity,
        numberOfDays: act.numberOfDays,
        numberOfPeople: act.numberOfPeople,
        totalPrice: act.totalPrice,
        selectedDate: new Date(act.selectedDate)
      })),
      totalPrice,
      specialRequests: specialRequests || '',
      airportPickup: airportPickup || false,
      flightNumber: flightNumber || '',
      arrivalTime: arrivalTime || '',
      personalDetails: personalDetails || {},
      nationality: nationality || 'malawian',
      paymentMethod: paymentMethod || null,
      status: 'pending',
      paymentStatus: 'pending'
    });
    
    try {
      await sendBookingConfirmationEmail(
        personalDetails.email,
        personalDetails.fullName,
        booking
      );
      console.log('Booking confirmation email sent to:', personalDetails.email);
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

app.get('api/custom-bookings/user/:userId', async (req, res) => {
  try {
    const bookings = await CustomBooking.findByUserId(req.params.userId);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching custom bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('api/custom-bookings', async (req, res) => {
  try {
    const bookings = await CustomBooking.find();
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching all custom bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('api/custom-bookings/:id/cancel', async (req, res) => {
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
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('api/custom-bookings/confirm/:bookingCode', async (req, res) => {
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

app.get('api/custom-bookings/code/:bookingCode', async (req, res) => {
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

// ==================== PAYMENT REQUEST ROUTES ====================
app.post('api/payment-request', async (req, res) => {
  try {
    const paymentRequest = await PaymentRequest.create(req.body);
    console.log('Payment request saved:', paymentRequest.bookingCode);
    res.status(201).json({ message: 'Payment request saved', payment: paymentRequest });
  } catch (error) {
    console.error('Payment request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('api/payment-requests/pending', async (req, res) => {
  try {
    const payments = await PaymentRequest.find({ status: 'pending' });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payment requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('api/payment-requests/:id/verify', async (req, res) => {
  try {
    const payment = await PaymentRequest.update(req.params.id, {
      status: 'verified',
      verifiedAt: Date.now()
    });
    res.json(payment);
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== REVIEW ROUTES ====================
app.get('api/reviews/activity/:activityId', async (req, res) => {
  try {
    const reviews = await Review.findByActivityId(req.params.activityId);
    const approvedReviews = reviews.filter(r => r.status === 'approved');
    
    const averageRating = approvedReviews.length > 0 
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length 
      : 0;
    
    res.json({
      reviews: approvedReviews,
      averageRating,
      totalReviews: approvedReviews.length
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('api/reviews', async (req, res) => {
  try {
    const { userId, activityId, bookingId, rating, comment } = req.body;
    
    const reviews = await Review.findByActivityId(activityId);
    const existingReview = reviews.find(r => r.userId === userId);
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this activity' });
    }
    
    const review = await Review.create({
      userId,
      activityId,
      bookingId,
      rating,
      comment,
      status: 'approved'
    });
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== PASSWORD RESET ROUTES ====================
app.post('api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findByEmail(email);
    if (!user) {
      return res.json({ message: 'If your email is registered, you will receive a reset link' });
    }
    
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
    
    await PasswordReset.create({ email, token, expiresAt });
    
    try {
      await sendPasswordResetEmail(email, user.fullName, token);
      console.log('Password reset email sent to:', email);
      res.json({ message: 'Password reset link has been sent to your email.' });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      res.json({ message: 'Reset link generated but email failed. Check server console.' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('api/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    const resetEntries = await PasswordReset.findByToken(token);
    if (!resetEntries) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }
    
    const resetEntry = resetEntries[0];
    if (resetEntry.expiresAt < Date.now() || resetEntry.used) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }
    
    res.json({ message: 'Token valid', email: resetEntry.email });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const resetEntries = await PasswordReset.findByToken(token);
    if (!resetEntries) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }
    
    const resetEntry = resetEntries[0];
    if (resetEntry.expiresAt < Date.now() || resetEntry.used) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(resetEntry.email, { password: hashedPassword });
    
    await PasswordReset.markAsUsed(token);
    
    res.json({ message: 'Password reset successfully!' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== WISHLIST ROUTES ====================
app.post('api/wishlist', async (req, res) => {
  try {
    const { userId, activityId } = req.body;
    
    const existing = await Wishlist.findOne({ userId, activityId });
    if (existing) {
      return res.status(400).json({ message: 'Activity already in wishlist' });
    }
    
    const wishlistItem = await Wishlist.create({ userId, activityId });
    res.status(201).json(wishlistItem);
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('api/wishlist/:userId/:activityId', async (req, res) => {
  try {
    await Wishlist.delete(req.params.userId, req.params.activityId);
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('api/wishlist/:userId', async (req, res) => {
  try {
    const wishlist = await Wishlist.findByUserId(req.params.userId);
    res.json(wishlist);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('api/wishlist/check/:userId/:activityId', async (req, res) => {
  try {
    const inWishlist = await Wishlist.exists(req.params.userId, req.params.activityId);
    res.json({ inWishlist });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== FILE UPLOAD ====================
app.post('api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const result = await s3Service.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      'uploads'
    );
    
    res.json({ imageUrl: result.url, filename: result.fileName });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

app.post('api/upload-multiple', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    const files = req.files.map(file => ({
      buffer: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype
    }));
    
    const results = await s3Service.uploadMultipleFiles(files, 'uploads');
    const imageUrls = results.map(r => r.url);
    
    res.json({ images: imageUrls });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

app.delete('api/upload/:key', async (req, res) => {
  try {
    const key = `uploads/${req.params.key}`;
    await s3Service.deleteFile(key);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Delete failed' });
  }
});

// ==================== PAYCHANGU INTEGRATION ====================
app.post('api/paychangu/create-order', async (req, res) => {
  try {
    const { amount, bookingCode, customerName, customerEmail, customerPhone } = req.body;
    
    console.log('Creating PayChangu order:', { amount, bookingCode, customerName, customerEmail });
    
    const amountMWK = Math.round(amount * 1800);
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const payload = {
      amount: amountMWK,
      currency: "MWK",
      email: customerEmail,
      first_name: customerName?.split(' ')[0] || 'Customer',
      last_name: customerName?.split(' ')[1] || '',
      tx_ref: `${bookingCode}_${Date.now()}`,
      return_url: `${frontendUrl}/booking-confirmation?bookingCode=${bookingCode}`,
      callback_url: `${baseUrl}/api/paychangu/webhook`,
      customization: {
        title: "Chimango Tour Booking",
        description: `Booking for ${bookingCode}`,
      }
    };
    
    const response = await axios.post(
      'https://api.paychangu.com/payment',
      payload,
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (response.data && response.data.status === 'success') {
      const checkoutUrl = response.data.data?.checkout_url;
      
      if (checkoutUrl) {
        await PaymentRequest.create({
          bookingCode: bookingCode,
          paymentMethod: 'PayChangu',
          paymentReference: response.data.data?.tx_ref || payload.tx_ref,
          amount: amount,
          customerName: customerName,
          customerPhone: customerPhone,
          status: 'pending'
        });
        
        res.json({
          success: true,
          checkout_url: checkoutUrl,
          reference: bookingCode
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: 'No checkout URL received'
        });
      }
    } else {
      res.status(400).json({ 
        success: false, 
        message: response.data?.message || 'Payment initiation failed'
      });
    }
  } catch (error) {
    console.error('PayChangu error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: error.response?.data?.message || error.message
    });
  }
});

// ==================== CONTACT FORM ====================
app.post('api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'goshsolution@gmail.com',
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Export app for Lambda handler
module.exports = app;

// Initialize DynamoDB table when launched directly
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
