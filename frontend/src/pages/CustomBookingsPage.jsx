import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CustomBookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.id) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/custom-bookings/user/${user.id}`);
      setBookings(response.data);
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
      await axios.put(`http://localhost:5000/api/custom-bookings/${bookingId}/cancel`);
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      console.error('Cancel error:', err);
      alert('Failed to cancel booking');
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
        <h1 style={{ color: '#2c3e50', marginBottom: '8px' }}>My Activity Bookings</h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>View and manage your booked activities</p>

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
                      <h4 style={{ margin: '0 0 8px 0', color: '#e67e22' }}>{item.activity.name}</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', fontSize: '14px' }}>
                        <div>📍 Location: {item.activity.location}</div>
                        <div>📅 Date: {new Date(item.selectedDate).toLocaleDateString()}</div>
                        <div>⏱️ Days: {item.numberOfDays}</div>
                        <div>👥 People: {item.numberOfPeople}</div>
                        <div>💰 Price: MK {item.totalPrice.toLocaleString()}</div>
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