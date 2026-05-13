import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReviewModal from '../components/ReviewModal';
import { API_URL } from '../config';
import './BookingsPage.css';

const BookingsPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [tourBookings, setTourBookings] = useState([]);
  const [activityBookings, setActivityBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activities');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      fetchAllBookings();
    } else if (!user) {
      setLoading(false);
    }
  }, [user]);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      
      const [tourRes, activityRes] = await Promise.all([
        fetch(`${API_URL}/api/bookings/user/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/custom-bookings/user/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      const tourData = tourRes.ok ? await tourRes.json() : [];
      const activityData = activityRes.ok ? await activityRes.json() : [];
      
      setTourBookings(tourData);
      setActivityBookings(activityData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelTourBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this tour booking?')) return;
    
    setCancelling(bookingId);
    try {
      const response = await fetch(`${API_URL}/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        alert('✅ Booking cancelled successfully');
        fetchAllBookings();
      } else {
        throw new Error('Cancellation failed');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('❌ Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  };

  const cancelActivityBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this activity booking?')) return;
    
    setCancelling(bookingId);
    try {
      const response = await fetch(`${API_URL}/api/custom-bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        alert('✅ Booking cancelled successfully');
        fetchAllBookings();
      } else {
        throw new Error('Cancellation failed');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('❌ Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      confirmed: { class: 'status-confirmed', icon: '✓', text: 'Confirmed' },
      verified: { class: 'status-verified', icon: '✅', text: 'Verified' },
      pending: { class: 'status-pending', icon: '⏳', text: 'Pending' },
      cancelled: { class: 'status-cancelled', icon: '✗', text: 'Cancelled' },
      completed: { class: 'status-completed', icon: '★', text: 'Completed' }
    };
    const { class: badgeClass, icon, text } = config[status] || config.pending;
    return <span className={`status-badge ${badgeClass}`}><span className="status-icon">{icon}</span>{text}</span>;
  };

  if (!user) {
    return (
      <div className="bookings-login-required">
        <div className="login-icon">🔒</div>
        <h2>Please Log In</h2>
        <p>Sign in to view your bookings</p>
        <button className="btn-primary" onClick={() => navigate('/login')}>
          Sign In →
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bookings-loading">
        <div className="loading-spinner"></div>
        <h2>Loading your bookings...</h2>
      </div>
    );
  }

  const totalBookings = tourBookings.length + activityBookings.length;

  return (
    <div className="bookings-page">
      <div className="bookings-container">
        {/* Header */}
        <div className="bookings-header">
          <div className="header-icon">📅</div>
          <h1 className="bookings-title">My Bookings</h1>
          <p className="bookings-subtitle">Manage your tours and activity reservations</p>
          <div className="bookings-stats">
            <span className="stat-badge">{totalBookings} Total {totalBookings === 1 ? 'Booking' : 'Bookings'}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bookings-tabs">
          <button
            className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
            onClick={() => setActiveTab('activities')}
          >
            <span className="tab-icon">🏔️</span>
            Activities
            <span className="tab-count">{activityBookings.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'tours' ? 'active' : ''}`}
            onClick={() => setActiveTab('tours')}
          >
            <span className="tab-icon">🏕️</span>
            Tours
            <span className="tab-count">{tourBookings.length}</span>
          </button>
        </div>

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <>
            {activityBookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏔️</div>
                <h3>No Activity Bookings Yet</h3>
                <p>Start your adventure by booking an unforgettable experience</p>
                <button className="btn-primary" onClick={() => navigate('/activities')}>
                  Browse Activities →
                </button>
              </div>
            ) : (
              <div className="bookings-list">
                {activityBookings.map((booking) => (
                  <div className="booking-card" key={booking._id || booking.id}>
                    <div className="booking-header">
                      <div className="booking-info">
                        <div className="booking-icon">🎒</div>
                        <div>
                          <h3 className="booking-title">Activity Booking</h3>
                          <p className="booking-code">Booking ID: {booking.bookingCode || booking._id?.slice(-8)}</p>
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="booking-activities">
                      {booking.selectedActivities?.map((item, idx) => (
                        <div className="activity-detail" key={idx}>
                          <h4 className="activity-name">{item.activity?.name || item.activity || 'Activity'}</h4>
                          <div className="activity-info-grid">
                            <div className="info-item">
                              <span className="info-icon">📍</span>
                              <span>{item.activity?.location || 'Location TBA'}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-icon">📅</span>
                              <span>{new Date(item.selectedDate).toLocaleDateString()}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-icon">⏱️</span>
                              <span>{item.numberOfDays} {item.numberOfDays === 1 ? 'Day' : 'Days'}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-icon">👥</span>
                              <span>{item.numberOfPeople} {item.numberOfPeople === 1 ? 'Person' : 'People'}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-icon">💰</span>
                              <span className="price-highlight">USD {item.totalPrice?.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="booking-footer">
                      <div className="booking-total">
                        <span className="total-label">Total Amount</span>
                        <span className="total-amount">USD {booking.totalPrice?.toLocaleString()}</span>
                      </div>
                      <div className="booking-actions">
                        {booking.status === 'confirmed' && (
                          <button 
                            className="btn-cancel"
                            onClick={() => cancelActivityBooking(booking._id || booking.id)}
                            disabled={cancelling === (booking._id || booking.id)}
                          >
                            {cancelling === (booking._id || booking.id) ? 'Cancelling...' : 'Cancel Booking'}
                          </button>
                        )}
                        {booking.status === 'completed' && (
                          <button 
                            className="btn-review"
                            onClick={() => {
                              setSelectedActivity(booking.selectedActivities?.[0]?.activity);
                              setSelectedBooking(booking);
                              setShowReviewModal(true);
                            }}
                          >
                            Write a Review
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="booking-meta">
                      Booked on: {new Date(booking.createdAt).toLocaleDateString()} at {new Date(booking.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Tours Tab */}
        {activeTab === 'tours' && (
          <>
            {tourBookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏕️</div>
                <h3>No Tour Bookings Yet</h3>
                <p>Embark on a journey with our curated tour packages</p>
                <button className="btn-primary" onClick={() => navigate('/')}>
                  Browse Tours →
                </button>
              </div>
            ) : (
              <div className="bookings-list">
                {tourBookings.map((booking) => (
                  <div className="booking-card" key={booking._id || booking.id}>
                    <div className="booking-header">
                      <div className="booking-info">
                        <div className="booking-icon">🏕️</div>
                        <div>
                          <h3 className="booking-title">{booking.tour?.name || 'Tour Booking'}</h3>
                          <p className="booking-code">Booking ID: {booking._id?.slice(-8)}</p>
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="tour-details">
                      <div className="tour-info-grid">
                        <div className="info-item">
                          <span className="info-icon">📍</span>
                          <span>{booking.tour?.destination || 'Destination TBA'}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-icon">📅</span>
                          <span>{new Date(booking.travelDate).toLocaleDateString()}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-icon">⏱️</span>
                          <span>{booking.tour?.durationDays || 'N/A'} Days</span>
                        </div>
                        <div className="info-item">
                          <span className="info-icon">👥</span>
                          <span>{booking.numTravelers} Travelers</span>
                        </div>
                        <div className="info-item">
                          <span className="info-icon">💰</span>
                          <span className="price-highlight">USD {booking.totalPrice?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="booking-footer">
                      <div className="booking-total">
                        <span className="total-label">Total Paid</span>
                        <span className="total-amount">USD {booking.totalPrice}</span>
                      </div>
                      {booking.status === 'confirmed' && (
                        <button 
                          className="btn-cancel"
                          onClick={() => cancelTourBooking(booking._id || booking.id)}
                          disabled={cancelling === (booking._id || booking.id)}
                        >
                          {cancelling === (booking._id || booking.id) ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      )}
                    </div>

                    <div className="booking-meta">
                      Booked on: {new Date(booking.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedActivity && (
        <ReviewModal
          activity={selectedActivity}
          booking={selectedBooking}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={() => {
            alert('Thank you for your review! 🌟');
            fetchAllBookings();
          }}
        />
      )}
    </div>
  );
};

export default BookingsPage;