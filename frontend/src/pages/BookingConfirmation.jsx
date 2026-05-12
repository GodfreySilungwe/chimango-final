import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchBooking = async () => {
      if (location.state && location.state.booking) {
        setBooking(location.state.booking);
        setLoading(false);
        return;
      }

      const params = new URLSearchParams(location.search);
      const bookingCode = params.get('bookingCode');

      if (bookingCode) {
        try {
          const response = await fetch(`${API_URL}/api/custom-bookings/code/${bookingCode}`);
          const data = await response.json();
          if (data) {
            setBooking(data);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Error fetching booking:', err);
          setError('Unable to load booking details');
          setLoading(false);
          return;
        }
      }

      const savedBooking = sessionStorage.getItem('lastBooking');
      if (savedBooking) {
        setBooking(JSON.parse(savedBooking));
        setLoading(false);
        return;
      }

      setError('No booking found');
      setLoading(false);
    };

    fetchBooking();
  }, [location]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = () => {
    if (booking?.bookingCode) {
      navigator.clipboard.writeText(booking.bookingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleDownloadPDF = () => {
    const printContent = document.getElementById('confirmation-content').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Booking Confirmation - ${booking?.bookingCode || 'Chimango Tour'}</title>
          <style>
            body { font-family: 'Poppins', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #e67e22; padding-bottom: 20px; margin-bottom: 30px; }
            .booking-code { background-color: #e67e22; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 8px; margin: 20px 0; }
            .details table { width: 100%; border-collapse: collapse; }
            .details td { padding: 10px; border-bottom: 1px solid #ddd; }
            .total { font-size: 24px; font-weight: bold; color: #e67e22; text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          ${printContent}
          <div class="footer">
            <p>Chimango Tour - Discover the Warm Heart of Africa</p>
            <p>Email: info@chimangotour.com | Phone: +265 123 456 789</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const shareOnWhatsApp = () => {
    const activity = booking.selectedActivities?.[0]?.activity;
    const status = booking?.status === 'pending' ? 'PENDING' : 'CONFIRMED';
    const message = `🎉 Booking ${status} - Chimango Tour%0A%0A` +
      `Booking Code: ${booking.bookingCode}%0A` +
      `Activity: ${activity?.name}%0A` +
      `Date: ${new Date(booking.selectedActivities[0]?.selectedDate).toLocaleDateString()}%0A` +
      `Days: ${booking.selectedActivities[0]?.numberOfDays}%0A` +
      `People: ${booking.selectedActivities[0]?.numberOfPeople}%0A` +
      `Total: USD ${booking.totalPrice?.toLocaleString()}%0A%0A` +
      `Thank you for choosing Chimango Tour! 🌍`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="confirmation-loading">
        <div className="loading-spinner"></div>
        <h2>Processing your booking...</h2>
        <p>Please wait while we confirm your booking details.</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="confirmation-error">
        <div className="error-icon">❓</div>
        <h2>No Booking Found</h2>
        <p>We couldn't find your booking information.</p>
        <button className="btn-primary" onClick={() => navigate('/activities')}>
          Browse Activities →
        </button>
      </div>
    );
  }

  const isConfirmed = booking.status === 'confirmed';
  const isCancelled = booking.status === 'cancelled';
  const isCompleted = booking.status === 'completed';
  const isPending = !booking.status || booking.status === 'pending';

  const getStatusConfig = () => {
    if (isConfirmed) {
      return { icon: '✅', title: 'Booking Confirmed!', message: 'Your booking has been confirmed. Thank you for choosing Chimango Tour!', color: '#2ecc71' };
    }
    if (isPending) {
      return { icon: '⏳', title: 'Booking Request Sent!', message: 'Your booking has been submitted and is awaiting admin approval.', color: '#f39c12' };
    }
    if (isCompleted) {
      return { icon: '✅', title: 'Booking Completed!', message: 'Your booking has been completed successfully.', color: '#2ecc71' };
    }
    return { icon: '❌', title: 'Booking Cancelled', message: 'This booking has been cancelled.', color: '#e74c3c' };
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">
        {/* Action Buttons */}
        <div className="action-buttons no-print">
          <button className="action-btn home" onClick={() => navigate('/')}>
            🏠 Home
          </button>
          <button className="action-btn download" onClick={handleDownloadPDF}>
            📄 Download PDF
          </button>
          <button className="action-btn print" onClick={handlePrint}>
            🖨️ Print
          </button>
          <button className="action-btn whatsapp" onClick={shareOnWhatsApp}>
            📱 Share
          </button>
          <button className="action-btn bookings" onClick={() => navigate('/bookings')}>
            📋 My Bookings
          </button>
        </div>

        {/* Main Content */}
        <div id="confirmation-content" className="confirmation-card">
          {/* Status Header */}
          <div className={`status-header ${booking.status}`}>
            <div className="status-icon">{statusConfig.icon}</div>
            <h1 className="status-title">{statusConfig.title}</h1>
            <p className="status-message">{statusConfig.message}</p>
          </div>

          {/* Booking Code */}
          <div className="booking-code-section">
            <div className="code-label">Your Booking Code</div>
            <div className="code-value">
              <span>{booking.bookingCode}</span>
              <button className="copy-btn" onClick={handleCopyCode}>
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>

          {/* Booking Details */}
          <div className="details-section">
            <h3 className="section-title">
              <span className="title-icon">📋</span>
              Booking Details
            </h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Activity Name</span>
                <span className="detail-value">{booking.selectedActivities?.[0]?.activity?.name || 'Activity'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Travel Date</span>
                <span className="detail-value">{booking.selectedActivities?.[0]?.selectedDate ? new Date(booking.selectedActivities[0].selectedDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Number of Days</span>
                <span className="detail-value">{booking.selectedActivities?.[0]?.numberOfDays || 1}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Number of People</span>
                <span className="detail-value">{booking.selectedActivities?.[0]?.numberOfPeople || 1}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Customer Type</span>
                <span className="detail-value">{booking.nationality === 'international' ? '🌍 International' : '🇲🇼 Malawian'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className={`status-badge ${booking.status || 'pending'}`}>{booking.status || 'pending'}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="details-section">
            <h3 className="section-title">
              <span className="title-icon">👤</span>
              Customer Information
            </h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Full Name</span>
                <span className="detail-value">{booking.personalDetails?.fullName || user?.fullName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email Address</span>
                <span className="detail-value">{booking.personalDetails?.email || user?.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone Number</span>
                <span className="detail-value">{booking.personalDetails?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {booking.paymentMethod && (
            <div className="details-section">
              <h3 className="section-title">
                <span className="title-icon">💰</span>
                Payment Information
              </h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Payment Method</span>
                  <span className="detail-value">{booking.paymentMethod}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Payment Status</span>
                  <span className={`status-badge ${booking.paymentStatus}`}>{booking.paymentStatus || 'Pending'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Total Amount */}
          <div className="total-section">
            <div className="total-label">Total Amount</div>
            <div className="total-amount">USD {booking.totalPrice?.toLocaleString() || 0}</div>
            {isPending && (
              <div className="payment-note">
                💰 Please complete payment to confirm your booking
              </div>
            )}
          </div>

          {/* Important Information */}
          <div className="info-section">
            <h4 className="info-title">📌 Important Information</h4>
            <ul className="info-list">
              <li>Please present this confirmation at the activity location</li>
              <li>Arrive at least 15 minutes before the scheduled time</li>
              <li>Cancellation policy applies as per our terms and conditions</li>
              <li>For assistance, contact our support team at +265 123 456 789</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="confirmation-footer">
            <div className="footer-logo">🌍 Chimango Tour</div>
            <div className="footer-tagline">Discover the Warm Heart of Africa</div>
            <div className="footer-contact">
              📧 info@chimangotour.com | 📞 +265 123 456 789
            </div>
            <div className="footer-date">
              Booking Date: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;