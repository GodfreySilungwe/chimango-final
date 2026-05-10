import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config';

const UserProfilePage = () => {
  const { user, token } = useAuth();
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
  const [loadingBookings, setLoadingBookings] = useState(false);

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
    if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab]);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const response = await axios.get(`${API_URL}/api/custom-bookings/user/${user.id}`);
      setBookings(response.data);
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
      const response = await axios.put(`${API_URL}/api/users/profile`, {
        fullName: profileData.fullName,
        phone: profileData.phone
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage('Profile updated successfully!');
      const updatedUser = { ...user, fullName: profileData.fullName, phone: profileData.phone };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
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
      await axios.post(`${API_URL}/api/users/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change password');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '8px' }}>My Profile</h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>Manage your account information and view your bookings</p>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #ddd', paddingBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '10px 24px',
              backgroundColor: activeTab === 'profile' ? '#3498db' : 'white',
              color: activeTab === 'profile' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('password')}
            style={{
              padding: '10px 24px',
              backgroundColor: activeTab === 'password' ? '#3498db' : 'white',
              color: activeTab === 'password' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Change Password
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            style={{
              padding: '10px 24px',
              backgroundColor: activeTab === 'bookings' ? '#3498db' : 'white',
              color: activeTab === 'bookings' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            My Bookings
          </button>
        </div>
        
        {activeTab === 'profile' && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {message && (
              <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                {message}
              </div>
            )}
            {error && (
              <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                {error}
              </div>
            )}
            
            <form onSubmit={updateProfile}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleProfileChange}
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px' }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Email Address</label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', backgroundColor: '#f5f5f5' }}
                />
                <small style={{ color: '#666' }}>Email cannot be changed</small>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px' }}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}
        
        {activeTab === 'password' && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {message && (
              <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                {message}
              </div>
            )}
            {error && (
              <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                {error}
              </div>
            )}
            
            <form onSubmit={changePassword}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px' }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px' }}
                />
                <small style={{ color: '#666' }}>Minimum 6 characters</small>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px' }}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: '#e67e22',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}
        
        {activeTab === 'bookings' && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>My Activity Bookings</h3>
            
            {loadingBookings ? (
              <p>Loading your bookings...</p>
            ) : bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>You have no bookings yet.</p>
                <a href="/activities" style={{ color: '#3498db', textDecoration: 'none' }}>Browse Activities →</a>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking._id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, color: '#e67e22' }}>{booking.selectedActivities[0]?.activity?.name}</h4>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      backgroundColor: booking.status === 'confirmed' ? '#d4edda' : '#f8d7da',
                      color: booking.status === 'confirmed' ? '#155724' : '#721c24'
                    }}>
                      {booking.status}
                    </span>
                  </div>
                  <p style={{ margin: '5px 0' }}><strong>Booking Code:</strong> {booking.bookingCode}</p>
                  <p style={{ margin: '5px 0' }}><strong>Date:</strong> {new Date(booking.selectedActivities[0]?.selectedDate).toLocaleDateString()}</p>
                  <p style={{ margin: '5px 0' }}><strong>Days:</strong> {booking.selectedActivities[0]?.numberOfDays}</p>
                  <p style={{ margin: '5px 0' }}><strong>People:</strong> {booking.selectedActivities[0]?.numberOfPeople}</p>
                  <p style={{ margin: '5px 0' }}><strong>Total:</strong> MK {booking.totalPrice?.toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;