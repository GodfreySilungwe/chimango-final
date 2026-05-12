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
    airportPickup: false
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
      const response = await fetch(`${API_URL}/api/custom-bookings/user/${user.id}`);
      const data = await response.json();
      setBookings(data);
      setError('');
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await fetch(`${API_URL}/api/custom-bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      console.error('Cancel error:', err);
      alert('Failed to cancel booking');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!formData.fullName || !formData.email || !formData.preferredDate || !formData.location) {
      setFormError('Please fill in your name, email, preferred date, and destination.');
      return;
    }

    if (!user?.id) {
      sessionStorage.setItem('pendingCustomJourney', JSON.stringify(formData));
      window.location.href = '/login?redirect=custom-booking';
      return;
    }

    setSubmitting(true);

    try {
      const newBookingCode = 'CHM-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      const bookingData = {
        userId: user.id,
        selectedActivities: [
          {
            activity: null,
            numberOfDays: 1,
            numberOfPeople: formData.numberOfPeople,
            totalPrice: 0,
            selectedDate: new Date(formData.preferredDate)
          }
        ],
        totalPrice: 0,
        specialRequests: `Destination: ${formData.location}. Travel style: ${formData.travelStyle}. Budget: ${formData.budget}. ${formData.specialRequests}`,
        airportPickup: formData.airportPickup,
        personalDetails: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          passportNumber: '',
          emergencyContact: ''
        },
        bookingCode: newBookingCode,
        nationality: 'malawian',
        paymentMethod: null
      };

      const response = await fetch(`${API_URL}/api/custom-bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to submit your journey request.');
      }

      setSuccessMessage('Your journey request was submitted successfully.');
      sessionStorage.setItem('lastBooking', JSON.stringify(data));
      window.location.href = `/booking-confirmation?bookingCode=${newBookingCode}`;
    } catch (err) {
      console.error('Journey request error:', err);
      setFormError(err.message || 'Unable to submit your journey request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Loading your bookings...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: 'red' }}>Error</h2>
        <p>{error}</p>
        <button onClick={fetchBookings} style={{ padding: '8px 16px', cursor: 'pointer' }}>Try Again</button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '32px 16px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '8px' }}>Plan Your Journey</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>Share your travel preferences and we will create a personalized itinerary for you.</p>

        <div style={{ marginBottom: '32px', padding: '28px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 1px 12px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                Full Name*
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                  placeholder="Your full name"
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                Email Address*
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                  placeholder="you@example.com"
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                Phone Number
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                  placeholder="Optional contact number"
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                Preferred Travel Date*
                <input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                Destination / Region*
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                  placeholder="e.g. Lake Malawi, Mulanje, Northern Region"
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                Group Size
                <input
                  type="number"
                  min="1"
                  value={formData.numberOfPeople}
                  onChange={(e) => setFormData({ ...formData, numberOfPeople: parseInt(e.target.value) || 1 })}
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                Travel Style
                <select
                  value={formData.travelStyle}
                  onChange={(e) => setFormData({ ...formData, travelStyle: e.target.value })}
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
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                  placeholder="USD 500 - 1500"
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                Airport Pickup
                <input
                  type="checkbox"
                  checked={formData.airportPickup}
                  onChange={(e) => setFormData({ ...formData, airportPickup: e.target.checked })}
                  style={{ transform: 'scale(1.2)' }}
                />
              </label>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              Tell Us More
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', minHeight: '120px' }}
                placeholder="Any special requests or notes for your itinerary"
              />
            </label>

            {formError && <p style={{ color: '#e74c3c', marginTop: '12px' }}>{formError}</p>}
            {successMessage && <p style={{ color: '#2ecc71', marginTop: '12px' }}>{successMessage}</p>}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: '14px 28px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
              >
                {submitting ? 'Submitting...' : 'Request Custom Journey'}
              </button>
              {!user?.id && (
                <button
                  type="button"
                  onClick={() => navigate('/login?redirect=custom-booking')}
                  style={{ padding: '14px 28px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
                >
                  Login to Submit
                </button>
              )}
            </div>
          </form>
        </div>

        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '12px' }}>
            <p style={{ fontSize: '18px', color: '#666' }}>You have no activity bookings yet.</p>
            <a href="/activities" style={{ color: '#3498db', textDecoration: 'none' }}>Browse Activities →</a>
          </div>
        ) : (
          <div>
            {bookings.map((booking) => (
              <div key={booking._id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: '#2c3e50' }}>Booking #{booking._id.slice(-8)}</h3>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: booking.status === 'confirmed' ? '#d4edda' : '#f8d7da',
                    color: booking.status === 'confirmed' ? '#155724' : '#721c24'
                  }}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
                  {booking.selectedActivities.map((item, idx) => (
                    <div key={idx} style={{ marginBottom: '16px', borderBottom: idx !== booking.selectedActivities.length - 1 ? '1px solid #f0f0f0' : 'none', paddingBottom: '16px' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#e67e22' }}>{item.activity?.name || 'Custom Journey Item'}</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', fontSize: '14px' }}>
                        <div>📍 Location: {item.activity?.location || 'Not specified'}</div>
                        <div>📅 Date: {item.selectedDate ? new Date(item.selectedDate).toLocaleDateString() : 'Not set'}</div>
                        <div>⏱️ Days: {item.numberOfDays}</div>
                        <div>👥 People: {item.numberOfPeople}</div>
                        <div>💰 Price: MK {item.totalPrice?.toLocaleString() || 'Pending'}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '16px', marginTop: '8px' }}>
                  <div>
                    <strong>Total Amount:</strong>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#e67e22', marginLeft: '8px' }}>
                      MK {booking.totalPrice.toLocaleString()}
                    </span>
                  </div>
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => cancelBooking(booking._id)}
                      style={{
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '8px 20px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>

                <div style={{ marginTop: '12px', fontSize: '12px', color: '#999' }}>
                  Booked on: {new Date(booking.createdAt).toLocaleString()}
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