import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ReviewModal from '../components/ReviewModal';
import { API_URL } from '../config';

const BookingsPage = () => {
  const { user } = useAuth();
  const [tourBookings, setTourBookings] = useState([]);
  const [activityBookings, setActivityBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activities');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      fetchAllBookings();
    }
  }, [user]);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      
      const tourRes = await axios.get(`${API_URL}/api/bookings/user/${user.id}`);
      setTourBookings(tourRes.data);
      
      const activityRes = await axios.get(`${API_URL}/api/custom-bookings/user/${user.id}`);
      setActivityBookings(activityRes.data);
      
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelTourBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this tour booking?')) return;
    
    try {
      await axios.put(`${API_URL}/api/bookings/${bookingId}/cancel`);
      alert('Booking cancelled successfully');
      fetchAllBookings();
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel booking');
    }
  };

  const cancelActivityBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this activity booking?')) return;
    
    try {
      await axios.put(`${API_URL}/api/custom-bookings/${bookingId}/cancel`);
      alert('Booking cancelled successfully');
      fetchAllBookings();
    } catch (error) {
      console.error('Cancel error:', error);
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

  const totalBookings = tourBookings.length + activityBookings.length;

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '32px 16px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '8px' }}>My Bookings</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>You have {totalBookings} total booking(s)</p>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #ddd', paddingBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('activities')}
            style={{
              padding: '10px 24px',
              backgroundColor: activeTab === 'activities' ? '#3498db' : 'white',
              color: activeTab === 'activities' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Activities ({activityBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('tours')}
            style={{
              padding: '10px 24px',
              backgroundColor: activeTab === 'tours' ? '#3498db' : 'white',
              color: activeTab === 'tours' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Tours ({tourBookings.length})
          </button>
        </div>

        {activeTab === 'activities' && (
          <>
            {activityBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '12px' }}>
                <p style={{ fontSize: '18px', color: '#666' }}>You have no activity bookings yet.</p>
                <a href="/activities" style={{ color: '#3498db', textDecoration: 'none' }}>Browse Activities →</a>
              </div>
            ) : (
              activityBookings.map((booking) => (
                <div key={booking._id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, color: '#2c3e50' }}>Activity Booking #{booking._id.slice(-8)}</h3>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: booking.status === 'confirmed' ? '#d4edda' : booking.status === 'completed' ? '#cce5ff' : '#f8d7da',
                      color: booking.status === 'confirmed' ? '#155724' : booking.status === 'completed' ? '#004085' : '#721c24'
                    }}>
                      {booking.status.toUpperCase()}
                    </span>
                  </div>

                  {booking.selectedActivities.map((item, idx) => (
                    <div key={idx} style={{ marginBottom: '16px', borderBottom: idx !== booking.selectedActivities.length - 1 ? '1px solid #f0f0f0' : 'none', paddingBottom: '16px' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#e67e22' }}>{item.activity?.name || 'Activity'}</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', fontSize: '14px' }}>
                        <div>📍 Location: {item.activity?.location || 'N/A'}</div>
                        <div>📅 Date: {new Date(item.selectedDate).toLocaleDateString()}</div>
                        <div>⏱️ Days: {item.numberOfDays}</div>
                        <div>👥 People: {item.numberOfPeople}</div>
                        <div>💰 Price: USD {item.totalPrice?.toLocaleString() || 0}</div>
                      </div>
                    </div>
                  ))}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '16px', marginTop: '8px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <strong>Total Amount:</strong>
                      <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#e67e22', marginLeft: '8px' }}>
                        USD {booking.totalPrice?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => cancelActivityBooking(booking._id)}
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
                      {booking.status === 'completed' && (
                        <button
                          onClick={() => {
                            setSelectedActivity(booking.selectedActivities[0]?.activity);
                            setSelectedBooking(booking);
                            setShowReviewModal(true);
                          }}
                          style={{
                            backgroundColor: '#f39c12',
                            color: 'white',
                            border: 'none',
                            padding: '8px 20px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Write a Review
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: '12px', fontSize: '12px', color: '#999' }}>
                    Booked on: {new Date(booking.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'tours' && (
          <>
            {tourBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '12px' }}>
                <p style={{ fontSize: '18px', color: '#666' }}>You have no tour bookings yet.</p>
                <a href="/" style={{ color: '#3498db', textDecoration: 'none' }}>Browse Tours →</a>
              </div>
            ) : (
              tourBookings.map((booking) => (
                <div key={booking._id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, color: '#2c3e50' }}>{booking.tour?.name || 'Tour'}</h3>
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

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', fontSize: '14px', marginBottom: '16px' }}>
                    <div>📍 Destination: {booking.tour?.destination || 'N/A'}</div>
                    <div>📅 Travel Date: {new Date(booking.travelDate).toLocaleDateString()}</div>
                    <div>👥 Travelers: {booking.numTravelers}</div>
                    <div>💰 Price: USD {booking.totalPrice}</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                    <div>
                      <strong>Total Paid:</strong>
                      <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#e67e22', marginLeft: '8px' }}>
                        USD {booking.totalPrice}
                      </span>
                    </div>
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => cancelTourBooking(booking._id)}
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
              ))
            )}
          </>
        )}
      </div>

      {showReviewModal && selectedActivity && (
        <ReviewModal
          activity={selectedActivity}
          booking={selectedBooking}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={() => {
            alert('Thank you for your review!');
            fetchAllBookings();
          }}
        />
      )}
    </div>
  );
};

export default BookingsPage;