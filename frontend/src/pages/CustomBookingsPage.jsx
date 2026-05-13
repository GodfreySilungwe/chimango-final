import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const CustomBookingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    preferredDate: '',
    numberOfPeople: 1,
    location: '',
    travelStyle: 'Adventure',
    budget: '',
    specialRequests: '',
    airportPickup: false,
    flightNumber: '',
    arrivalTime: '',
    nationality: 'international'
  });
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      fetchBookings();
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        email: user.email || prev.email
      }));
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/custom-bookings/user/${user.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setBookings(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await fetch(`${API_URL}/api/custom-bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      console.error('Cancel error:', err);
      alert('Failed to cancel booking');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (formError) setFormError('');
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.fullName.trim()) {
      errors.push('Full name is required');
    }
    if (!formData.email.trim()) {
      errors.push('Email address is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    if (!formData.preferredDate) {
      errors.push('Preferred travel date is required');
    }
    if (!formData.location.trim()) {
      errors.push('Destination/Region is required');
    }
    if (formData.numberOfPeople < 1) {
      errors.push('Number of people must be at least 1');
    }
    
    // Flight number is ALWAYS optional - no validation needed
    
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate all mandatory fields before proceeding
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setFormError(validationErrors.join('. '));
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (!user?.id) {
      sessionStorage.setItem('pendingCustomJourney', JSON.stringify(formData));
      navigate('/login?redirect=custom-booking');
      return;
    }

    setSubmitting(true);
    setFormError('');
    setSuccessMessage('');

    try {
      const newBookingCode = 'CHM-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const bookingData = {
        userId: user.id,
        selectedActivities: [
          {
            activity: "custom-journey",
            numberOfDays: 1,
            numberOfPeople: formData.numberOfPeople,
            totalPrice: 0,
            selectedDate: new Date(formData.preferredDate).toISOString()
          }
        ],
        totalPrice: 0,
        specialRequests: `Destination: ${formData.location}. Travel style: ${formData.travelStyle}. Budget: ${formData.budget}. ${formData.specialRequests ? `Additional notes: ${formData.specialRequests}` : ''}`,
        airportPickup: formData.airportPickup,
        flightNumber: formData.flightNumber || '',
        arrivalTime: formData.arrivalTime || '',
        personalDetails: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone || '',
          passportNumber: '',
          emergencyContact: ''
        },
        bookingCode: newBookingCode,
        nationality: formData.nationality,
        paymentMethod: null
      };

      console.log('Sending booking data:', bookingData);

      const response = await fetch(`${API_URL}/api/custom-bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bookingData)
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Server returned invalid response');
      }

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Unable to submit your journey request.');
      }

      const savedBooking = data.booking || data;
      
      setSuccessMessage('Your journey request was submitted successfully!');
      
      sessionStorage.setItem('lastBooking', JSON.stringify(savedBooking));
      
      setTimeout(() => {
        navigate(`/booking-confirmation?bookingCode=${savedBooking.bookingCode || newBookingCode}`);
      }, 1500);
      
      setTimeout(() => {
        fetchBookings();
      }, 2000);
      
      // Reset form
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: '',
        preferredDate: '',
        numberOfPeople: 1,
        location: '',
        travelStyle: 'Adventure',
        budget: '',
        specialRequests: '',
        airportPickup: false,
        flightNumber: '',
        arrivalTime: '',
        nationality: 'international'
      });
      
    } catch (err) {
      console.error('Journey request error:', err);
      setFormError(err.message || 'Unable to submit your journey request. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="loading-spinner" style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #e67e22',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }} />
        <h2>Loading your bookings...</h2>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '32px 16px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '8px' }}>Plan Your Journey</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>Share your travel preferences and we will create a personalized itinerary for you.</p>

        {/* Request Form */}
        <div style={{ marginBottom: '32px', padding: '28px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 1px 12px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                Full Name *
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                  placeholder="Your full name"
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                Email Address *
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                  placeholder="you@example.com"
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                Phone Number
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                  placeholder="Optional contact number"
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                Preferred Travel Date *
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  required
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                Destination / Region *
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                  placeholder="e.g. Lake Malawi, Mulanje, Northern Region"
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                Number of People *
                <input
                  type="number"
                  name="numberOfPeople"
                  min="1"
                  value={formData.numberOfPeople}
                  onChange={handleChange}
                  required
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                Travel Style
                <select
                  name="travelStyle"
                  value={formData.travelStyle}
                  onChange={handleChange}
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                >
                  <option value="Adventure">Adventure</option>
                  <option value="Relaxation">Relaxation</option>
                  <option value="Safari">Safari</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Family">Family</option>
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                Budget (optional)
                <input
                  type="text"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                  placeholder="USD 500 - 1500"
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                Customer Type *
                <select
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  required
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                >
                  <option value="international">🌍 International</option>
                  <option value="malawian">🇲🇼 Malawian (Local)</option>
                </select>
              </label>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <input
                  type="checkbox"
                  name="airportPickup"
                  checked={formData.airportPickup}
                  onChange={handleChange}
                  style={{ transform: 'scale(1.2)' }}
                />
                <span>I need airport pickup service</span>
              </label>

              {formData.airportPickup && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginLeft: '28px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    Flight Number (Optional)
                    <input
                      type="text"
                      name="flightNumber"
                      value={formData.flightNumber}
                      onChange={handleChange}
                      style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                      placeholder="You can add this later"
                    />
                    <small style={{ color: '#999', fontSize: '11px' }}>You can provide flight details later</small>
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    Arrival Time
                    <input
                      type="time"
                      name="arrivalTime"
                      value={formData.arrivalTime}
                      onChange={handleChange}
                      style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                    />
                  </label>
                </div>
              )}
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              Tell Us More (Optional)
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', minHeight: '120px' }}
                placeholder="Any special requests, interests, or notes for your itinerary..."
              />
            </label>

            {formError && (
              <div style={{ 
                color: '#e74c3c', 
                marginTop: '16px', 
                padding: '12px', 
                backgroundColor: '#f8d7da', 
                borderRadius: '8px',
                borderLeft: '4px solid #e74c3c'
              }}>
                ❌ {formError}
              </div>
            )}
            
            {successMessage && (
              <div style={{ 
                color: '#2ecc71', 
                marginTop: '16px', 
                padding: '12px', 
                backgroundColor: '#d4edda', 
                borderRadius: '8px',
                borderLeft: '4px solid #2ecc71'
              }}>
                ✅ {successMessage}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{ 
                  padding: '14px 28px', 
                  backgroundColor: '#e67e22', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '10px', 
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  fontWeight: 'bold'
                }}
              >
                {submitting ? 'Submitting...' : 'Request Custom Journey →'}
              </button>
              {!user?.id && (
                <button
                  type="button"
                  onClick={() => navigate('/login?redirect=custom-booking')}
                  style={{ padding: '14px 28px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Login to Submit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Bookings List */}
        <h2 style={{ marginBottom: '16px', color: '#2c3e50' }}>Your Journey Requests</h2>
        
        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '12px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✈️</div>
            <p style={{ fontSize: '18px', color: '#666' }}>You have no journey requests yet.</p>
            <p style={{ color: '#999' }}>Fill out the form above to start planning your custom adventure!</p>
          </div>
        ) : (
          <div>
            {bookings.map((booking) => (
              <div key={booking.id || booking._id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: '#2c3e50' }}>
                    {booking.bookingCode || `Booking #${(booking.id || booking._id).slice(-8)}`}
                  </h3>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: booking.status === 'confirmed' ? '#d4edda' : booking.status === 'cancelled' ? '#f8d7da' : '#fff3cd',
                    color: booking.status === 'confirmed' ? '#155724' : booking.status === 'cancelled' ? '#721c24' : '#856404'
                  }}>
                    {booking.status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Travel Date:</strong> {booking.selectedActivities?.[0]?.selectedDate ? new Date(booking.selectedActivities[0].selectedDate).toLocaleDateString() : 'Not set'}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>People:</strong> {booking.selectedActivities?.[0]?.numberOfPeople || 1}
                  </div>
                </div>

                {booking.specialRequests && (
                  <div style={{ backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '8px', marginTop: '12px' }}>
                    <strong>Special Requests:</strong>
                    <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#666' }}>{booking.specialRequests}</p>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '16px', marginTop: '16px' }}>
                  <div>
                    <strong>Status:</strong> {booking.status || 'Pending'}
                  </div>
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => cancelBooking(booking.id || booking._id)}
                      style={{
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '8px 20px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel Request
                    </button>
                  )}
                </div>

                <div style={{ marginTop: '12px', fontSize: '12px', color: '#999' }}>
                  Requested on: {new Date(booking.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomBookingsPage;