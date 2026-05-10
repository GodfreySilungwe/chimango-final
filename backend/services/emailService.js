const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send Welcome Email
const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to Chimango Tourism!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; background-color: #e67e22; padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Welcome to Chimango Tourism!</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hello ${name},</h2>
          <p>Thank you for registering with Chimango Tourism!</p>
          <p>We're excited to help you discover the beauty of Malawi. With your account, you can:</p>
          <ul>
            <li>Browse amazing activities and tours</li>
            <li>Book your adventures instantly</li>
            <li>Manage your bookings</li>
            <li>Save your favorite activities</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/activities" style="background-color: #e67e22; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
              Start Exploring Now
            </a>
          </div>
          <p>If you have any questions, feel free to contact us.</p>
          <p>Best regards,<br>Chimango Tourism Team</p>
        </div>
        <div style="text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 0 0 10px 10px; font-size: 12px; color: #666;">
          <p>Chimango Tourism - Discover the beauty of Malawi</p>
          <p>Email: info@chimangotourism.com | Phone: +265 123 456 789</p>
        </div>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// Send Password Reset Email
const sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request - Chimango Tourism',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; background-color: #e67e22; padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Reset Your Password</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hello ${name},</h2>
          <p>We received a request to reset your password for your Chimango Tourism account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #e67e22; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
          </div>
          <p>This link will expire in <strong>1 hour</strong>.</p>
          <p>If you did not request this, please ignore this email.</p>
          <hr />
          <p style="font-size: 12px; color: #666;">For security reasons, do not share this link with anyone.</p>
        </div>
        <div style="text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 0 0 10px 10px; font-size: 12px; color: #666;">
          <p>Chimango Tourism - Discover the beauty of Malawi</p>
        </div>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// Send Booking Confirmation Email
const sendBookingConfirmationEmail = async (email, name, booking) => {
  const activity = booking.selectedActivities?.[0]?.activity;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Booking Confirmed - ${booking.bookingCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; background-color: #2ecc71; padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">✓ Booking Confirmed!</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hello ${name},</h2>
          <p>Your booking has been confirmed! Here are your booking details:</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #e67e22;">Booking Details</h3>
            <p><strong>Booking Code:</strong> <span style="color: #e67e22; font-size: 18px;">${booking.bookingCode}</span></p>
            <p><strong>Activity:</strong> ${activity?.name}</p>
            <p><strong>Location:</strong> ${activity?.location}</p>
            <p><strong>Date:</strong> ${new Date(booking.selectedActivities[0]?.selectedDate).toLocaleDateString()}</p>
            <p><strong>Number of Days:</strong> ${booking.selectedActivities[0]?.numberOfDays}</p>
            <p><strong>Number of People:</strong> ${booking.selectedActivities[0]?.numberOfPeople}</p>
            <p><strong>Total Amount:</strong> MK ${booking.totalPrice?.toLocaleString()}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/bookings" style="background-color: #e67e22; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
              View My Bookings
            </a>
          </div>
          
          <p>Thank you for choosing Chimango Tourism!</p>
          <p>Best regards,<br>Chimango Tourism Team</p>
        </div>
        <div style="text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 0 0 10px 10px; font-size: 12px; color: #666;">
          <p>Chimango Tourism - Discover the beauty of Malawi</p>
        </div>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// Send Payment Verification Email
const sendPaymentVerificationEmail = async (email, name, bookingCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Payment Verified - Booking ${bookingCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; background-color: #e67e22; padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">✓ Payment Verified!</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hello ${name},</h2>
          <p>Your payment has been verified and your booking is now confirmed!</p>
          
          <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #155724;"><strong>Booking Code:</strong> ${bookingCode}</p>
            <p style="margin: 5px 0 0 0; color: #155724;">Status: <strong>CONFIRMED</strong></p>
          </div>
          
          <p>We look forward to serving you!</p>
          <p>Best regards,<br>Chimango Tourism Team</p>
        </div>
        <div style="text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 0 0 10px 10px; font-size: 12px; color: #666;">
          <p>Chimango Tourism - Discover the beauty of Malawi</p>
        </div>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
  sendPaymentVerificationEmail
};