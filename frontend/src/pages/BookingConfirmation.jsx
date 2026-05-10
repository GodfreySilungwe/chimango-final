import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config';

const BookingConfirmation = () => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
          const response = await axios.get(`${API_URL}/api/custom-bookings/code/${bookingCode}`);
          if (response.data) {
            setBooking(response.data);
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

  const handleDownloadPDF = () => {
    const printContent = document.getElementById('confirmation-content').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Booking Confirmation - ${booking?.bookingCode || 'Chimango Tour'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
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
            <p>Chimango Tour - Discover the beauty of Malawi</p>
            <p>Contact: info@chimangotour.com | +265 123 456 789</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const shareOnWhatsApp = () => {
    const activity = booking.selectedActivities?.[0]?.activity;
    const status = booking?.nationality === 'international' ? 'PENDING APPROVAL' : 'CONFIRMED';
    const message = `🎉 Booking ${status} - Chimango Tour%0A%0A` +
      `Booking Code: ${booking.bookingCode}%0A` +
      `Activity: ${activity?.name}%0A` +
      `Date: ${new Date(booking.selectedActivities[0]?.selectedDate).toLocaleDateString()}%0A` +
      `Days: ${booking.selectedActivities[0]?.numberOfDays}%0A` +
      `People: ${booking.selectedActivities[0]?.numberOfPeople}%0A` +
      `Total: USD ${booking.totalPrice?.toLocaleString()}%0A%0A` +
      `Thank you for choosing Chimango Tour! 🌍`;
    
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f0f2f5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'inline-block', textAlign: 'center' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            border: '6px solid #f3f3f3', 
            borderTop: '6px solid #e67e22', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>Processing your booking...</h2>
          <p style={{ color: '#666' }}>Please wait while we confirm your booking details.</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>❓</div>
        <h2>No Booking Found</h2>
        <p>We couldn't find your booking information.</p>
        <button 
          onClick={() => navigate('/activities')} 
          style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          Browse Activities
        </button>
      </div>
    );
  }

  const isInternational = booking.nationality === 'international';
  const isPending = booking.status === 'pending' || (isInternational && booking.paymentStatus !== 'paid');

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* BUTTON SECTION WITH HOME BUTTON */}
        <div className="no-print" style={{ textAlign: 'center', marginBottom: '20px', flexWrap: 'wrap', display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button onClick={() => navigate('/')} style={{ backgroundColor: '#2c3e50', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' }}>🏠 Home</button>
          <button onClick={handleDownloadPDF} style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' }}>📄 Download PDF</button>
          <button onClick={handlePrint} style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' }}>🖨️ Print</button>
          <button onClick={shareOnWhatsApp} style={{ backgroundColor: '#25D366', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' }}>📱 Share on WhatsApp</button>
          <button onClick={() => navigate('/bookings')} style={{ backgroundColor: '#e67e22', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' }}>📋 My Bookings</button>
        </div>

        <div id="confirmation-content" style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          
          {isInternational && (
            <div style={{ 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffeeba',
              borderRadius: '8px', 
              padding: '15px', 
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '30px', display: 'block' }}>⏳</span>
              <h3 style={{ color: '#856404', margin: '10px 0 5px' }}>Booking Request Sent!</h3>
              <p style={{ color: '#856404', margin: 0 }}>
                Your booking has been submitted and is awaiting admin approval.
              </p>
            </div>
          )}

          {!isInternational && (
            <div style={{ 
              backgroundColor: '#d4edda', 
              border: '1px solid #c3e6cb',
              borderRadius: '8px', 
              padding: '15px', 
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '30px', display: 'block' }}>✅</span>
              <h3 style={{ color: '#155724', margin: '10px 0 5px' }}>Booking Confirmed!</h3>
              <p style={{ color: '#155724', margin: 0 }}>
                Your booking has been confirmed. Thank you for choosing Chimango Tour!
              </p>
            </div>
          )}

          <div className="header" style={{ textAlign: 'center', borderBottom: '2px solid #e67e22', paddingBottom: '20px', marginBottom: '30px' }}>
            <h1 style={{ color: '#2c3e50', margin: 0 }}>
              {isInternational ? 'Booking Request Received!' : 'Booking Confirmed!'}
            </h1>
            <p style={{ color: '#666', marginTop: '10px' }}>
              {isInternational 
                ? 'Your booking request has been sent to our team' 
                : 'Thank you for choosing Chimango Tour'}
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: isInternational ? '#f39c12' : '#2ecc71', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 20px'
            }}>
              <span style={{ fontSize: '40px', color: 'white' }}>{isInternational ? '⏳' : '✓'}</span>
            </div>
          </div>

          <div className="booking-code" style={{ backgroundColor: '#e67e22', color: 'white', padding: '15px', textAlign: 'center', borderRadius: '8px', margin: '20px 0' }}>
            <p style={{ margin: 0, fontSize: '14px' }}>Your Booking Code</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>{booking.bookingCode}</p>
          </div>

          <div className="details">
            <h3 style={{ color: '#2c3e50', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Booking Details</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
              <tbody>
                <tr><td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold', width: '40%' }}>Activity Name:</td><td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{booking.selectedActivities?.[0]?.activity?.name || 'Activity'}</td></tr>
                <tr><td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Travel Date:</td><td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{booking.selectedActivities?.[0]?.selectedDate ? new Date(booking.selectedActivities[0].selectedDate).toLocaleDateString() : 'N/A'}</td></tr>
                <tr><td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Number of Days:</td><td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{booking.selectedActivities?.[0]?.numberOfDays || 1}</td></tr>
                <tr><td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Number of People:</td><td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{booking.selectedActivities?.[0]?.numberOfPeople || 1}</td></tr>
                <tr><td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Customer Type:</td><td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{booking.nationality === 'international' ? '🌍 International' : '🇲🇼 Malawian'}</td></tr>
                <tr><td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Status:</td><td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}><span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', backgroundColor: isPending ? '#fff3cd' : '#d4edda', color: isPending ? '#856404' : '#155724' }}>{isPending ? 'Pending Approval' : booking.status?.toUpperCase() || 'CONFIRMED'}</span></td></tr>
              </tbody>
            </table>
          </div>

          <div className="details" style={{ marginTop: '20px' }}>
            <h3 style={{ color: '#2c3e50', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Customer Information</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
              <tbody>
                <tr><td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold', width: '40%' }}>Full Name:</td><td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{booking.personalDetails?.fullName || user?.fullName}</td></tr>
                <tr><td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Email:</td><td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{booking.personalDetails?.email || user?.email}</td></tr>
                <tr><td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Phone:</td><td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{booking.personalDetails?.phone || 'N/A'}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="total" style={{ textAlign: 'center', margin: '30px 0', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <p style={{ margin: 0, fontSize: '16px', color: '#666' }}>Total Amount</p>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#e67e22' }}>USD {booking.totalPrice?.toLocaleString() || 0}</p>
            {isInternational && (
              <p style={{ margin: '10px 0 0', fontSize: '14px', color: '#856404' }}>
                💰 50% upfront payment (USD {Math.round((booking.totalPrice || 0) * 0.5)}) required on arrival
              </p>
            )}
          </div>

          <div className="footer" style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #ddd', fontSize: '12px', color: '#666' }}>
            <p>Chimango Tour - Discover the beauty of Malawi</p>
            <p>Email: info@chimangotour.com | Phone: +265 123 456 789</p>
            <p>Booking Date: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;