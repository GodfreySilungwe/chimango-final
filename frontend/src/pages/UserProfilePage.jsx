import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import './UserProfilePage.css';

const UserProfilePage = () => {
  const { user, token, login } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [bookings, setBookings] = useState([]);
  const [customBookings, setCustomBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'bookings' && user) {
      fetchAllBookings();
    }
  }, [activeTab, user]);

  const fetchAllBookings = async () => {
    setLoadingBookings(true);
    try {
      // Fetch both regular bookings and custom bookings
      const [regularRes, customRes] = await Promise.all([
        fetch(`${API_URL}/api/bookings/user/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/custom-bookings/user/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      const regularData = regularRes.ok ? await regularRes.json() : [];
      const customData = customRes.ok ? await customRes.json() : [];
      
      setBookings(regularData);
      setCustomBookings(customData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: profileData.fullName,
          phone: profileData.phone
        })
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        // Update local user data
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const newUserData = { ...storedUser, fullName: profileData.fullName, phone: profileData.phone };
        localStorage.setItem('user', JSON.stringify(newUserData));
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Update failed');
      }
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/api/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      if (response.ok) {
        setMessage('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password change failed');
      }
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId, type) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    setCancelling(bookingId);
    try {
      const endpoint = type === 'custom' 
        ? `${API_URL}/api/custom-bookings/${bookingId}/cancel`
        : `${API_URL}/api/bookings/${bookingId}/cancel`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        await fetchAllBookings();
        setMessage('Booking cancelled successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('Cancellation failed');
      }
    } catch (err) {
      setError('Failed to cancel booking');
      setTimeout(() => setError(''), 3000);
    } finally {
      setCancelling(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { class: 'status-confirmed', text: 'Confirmed' },
      verified: { class: 'status-verified', text: 'Verified' },
      pending: { class: 'status-pending', text: 'Pending' },
      cancelled: { class: 'status-cancelled', text: 'Cancelled' },
      completed: { class: 'status-completed', text: 'Completed' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar">👤</div>
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your account information and view your bookings</p>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="tab-icon">📝</span>
            Profile Information
          </button>
          <button
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <span className="tab-icon">🔒</span>
            Change Password
          </button>
          <button
            className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <span className="tab-icon">📅</span>
            My Bookings
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div className="alert alert-success">
            <span className="alert-icon">✓</span>
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-card">
            <form onSubmit={updateProfile} className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleProfileChange}
                    required
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon">📧</span>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="input-disabled"
                  />
                </div>
                <small className="form-hint">Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <div className="input-wrapper">
                  <span className="input-icon">📞</span>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    placeholder="Your phone number"
                  />
                </div>
              </div>

              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes →'}
              </button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="profile-card">
            <form onSubmit={changePassword} className="profile-form">
              <div className="form-group">
                <label>Current Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Enter current password"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>New Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Enter new password"
                  />
                </div>
                <small className="form-hint">Minimum 6 characters, include uppercase and numbers</small>
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Confirm new password"
                  />
                </div>
                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <div className="input-error">Passwords do not match</div>
                )}
              </div>

              <button type="submit" className="btn-change-password" disabled={loading}>
                {loading ? 'Changing...' : 'Change Password →'}
              </button>
            </form>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bookings-card">
            <h3 className="bookings-title">
              <span className="title-icon">📅</span>
              My Activity Bookings
            </h3>

            {loadingBookings ? (
              <div className="loading-state">
                <div className="loading-spinner-small"></div>
                <p>Loading your bookings...</p>
              </div>
            ) : bookings.length === 0 && customBookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🗺️</div>
                <h4>No Bookings Yet</h4>
                <p>You haven't made any bookings. Start your adventure today!</p>
                <a href="/activities" className="btn-browse">Browse Activities →</a>
              </div>
            ) : (
              <div className="bookings-list">
                {/* Regular Bookings */}
                {bookings.map((booking) => (
                  <div className="booking-card" key={booking.id}>
                    <div className="booking-header">
                      <div className="booking-icon">🏕️</div>
                      <div className="booking-info">
                        <h4>{booking.tourId?.name || 'Tour Booking'}</h4>
                        <p className="booking-code">Booking Code: {booking.id}</p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="booking-details">
                      <div className="booking-detail">
                        <span className="detail-label">Travel Date:</span>
                        <span className="detail-value">{new Date(booking.travelDate).toLocaleDateString()}</span>
                      </div>
                      <div className="booking-detail">
                        <span className="detail-label">Travelers:</span>
                        <span className="detail-value">{booking.numTravelers}</span>
                      </div>
                      <div className="booking-detail">
                        <span className="detail-label">Total Price:</span>
                        <span className="detail-value">${booking.totalPrice}</span>
                      </div>
                    </div>
                    {booking.status !== 'cancelled' && (
                      <button 
                        className="btn-cancel"
                        onClick={() => cancelBooking(booking.id, 'regular')}
                        disabled={cancelling === booking.id}
                      >
                        {cancelling === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    )}
                  </div>
                ))}

                {/* Custom Bookings */}
                {customBookings.map((booking) => (
                  <div className="booking-card" key={booking.id}>
                    <div className="booking-header">
                      <div className="booking-icon">🎒</div>
                      <div className="booking-info">
                        <h4>Custom Booking</h4>
                        <p className="booking-code">Booking Code: {booking.bookingCode}</p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="booking-details">
                      <div className="booking-detail">
                        <span className="detail-label">Activities:</span>
                        <span className="detail-value">{booking.selectedActivities?.length || 0} activities</span>
                      </div>
                      <div className="booking-detail">
                        <span className="detail-label">Total Price:</span>
                        <span className="detail-value">MK {booking.totalPrice?.toLocaleString()}</span>
                      </div>
                      <div className="booking-detail">
                        <span className="detail-label">Booked on:</span>
                        <span className="detail-value">{new Date(booking.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {booking.status !== 'cancelled' && booking.status !== 'confirmed' && (
                      <button 
                        className="btn-cancel"
                        onClick={() => cancelBooking(booking.id, 'custom')}
                        disabled={cancelling === booking.id}
                      >
                        {cancelling === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;