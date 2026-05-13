import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [tours, setTours] = useState([]);
  const [activities, setActivities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddTour, setShowAddTour] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalActivities: 0,
    totalTours: 0,
    totalUsers: 0,
    pendingPayments: 0
  });

  const [newTour, setNewTour] = useState({
    name: '',
    destination: '',
    durationDays: 3,
    price: 0,
    maxCapacity: 20,
    startDate: '',
    endDate: '',
    itineraryText: '',
    included: '',
    notIncluded: '',
    status: 'published'
  });

  const [newActivity, setNewActivity] = useState({
    name: '',
    location: '',
    region: 'Southern Region',
    description: '',
    pricePerDay: 0,
    pricePerPerson: 0,
    durationHours: 3,
    category: 'hiking',
    difficulty: 'easy',
    minPeople: 1,
    maxPeople: 20,
    status: 'active'
  });
  const [newActivityMainImage, setNewActivityMainImage] = useState(null);
  const [newActivityImages, setNewActivityImages] = useState([]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetchAllData();
  }, [user]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchTours(),
      fetchActivities(),
      fetchBookings(),
      fetchPaymentRequests(),
      fetchUsers()
    ]);
  };

  const fetchTours = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tours`);
      const data = await res.json();
      setTours(data);
    } catch (error) {
      console.error('Error fetching tours:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch(`${API_URL}/api/activities`);
      const data = await res.json();
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/custom-bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setBookings(data);
      updateStats(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data);
      setStats(prev => ({ ...prev, totalUsers: data.length }));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPaymentRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/api/payment-requests/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPaymentRequests(data);
      setStats(prev => ({ ...prev, pendingPayments: data.length }));
    } catch (error) {
      console.error('Error fetching payment requests:', error);
    }
  };

  const updateStats = (bookingsData) => {
    const totalRevenue = bookingsData.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    setStats({
      totalRevenue,
      totalBookings: bookingsData.length,
      totalActivities: activities.length,
      totalTours: tours.length,
      totalUsers: users.length,
      pendingPayments: paymentRequests.length
    });
  };

  const handleAddTour = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/api/tours`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTour)
      });
      setShowAddTour(false);
      fetchTours();
      resetTourForm();
      alert('✅ Tour added successfully!');
    } catch (error) {
      console.error('Error adding tour:', error);
      alert('❌ Failed to add tour');
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(newActivity).forEach(([key, value]) => {
        formData.append(key, value != null ? value.toString() : '');
      });

      if (newActivityMainImage) {
        formData.append('mainImage', newActivityMainImage);
      }

      newActivityImages.forEach((imageFile) => {
        formData.append('images', imageFile);
      });

      const response = await fetch(`${API_URL}/api/activities/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.error('Activity upload failed:', errorBody);
        alert(`❌ Failed to add activity: ${errorBody.message || response.statusText}`);
        return;
      }

      setShowAddActivity(false);
      await fetchActivities();
      resetActivityForm();
      alert('✅ Activity added successfully!');
    } catch (error) {
      console.error('Error adding activity:', error);
      alert('❌ Failed to add activity');
    }
  };

  const handleMainImageChange = (e) => {
    setNewActivityMainImage(e.target.files?.[0] || null);
  };

  const handleActivityImagesChange = (e) => {
    setNewActivityImages(Array.from(e.target.files || []));
  };

  const confirmDelete = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    try {
      if (deleteType === 'activity') {
        await fetch(`${API_URL}/api/activities/${itemToDelete._id || itemToDelete.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchActivities();
        alert(`✅ "${itemToDelete.name}" deleted successfully.`);
      } else if (deleteType === 'tour') {
        await fetch(`${API_URL}/api/tours/${itemToDelete._id || itemToDelete.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchTours();
        alert(`✅ "${itemToDelete.name}" deleted successfully.`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Failed to delete. Please try again.');
    } finally {
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      setDeleteType('');
    }
  };

  const verifyPayment = async (paymentId, bookingCode, customerName) => {
    if (!confirm(`Confirm payment verification for ${customerName}?`)) return;
    
    try {
      await fetch(`${API_URL}/api/payment-requests/${paymentId}/verify`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetch(`${API_URL}/api/custom-bookings/confirm/${bookingCode}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert(`✅ Payment verified for ${customerName}`);
      fetchPaymentRequests();
      fetchBookings();
    } catch (error) {
      console.error('Verification error:', error);
      alert('❌ Failed to verify payment');
    }
  };

  const verifyBooking = async (bookingId, customerName) => {
    if (!confirm(`Verify booking for ${customerName}?`)) return;
    
    try {
      await fetch(`${API_URL}/api/custom-bookings/${bookingId}/verify`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert(`✅ Booking verified for ${customerName}`);
      fetchBookings();
    } catch (error) {
      console.error('Booking verification error:', error);
      alert('❌ Failed to verify booking');
    }
  };

  const resetTourForm = () => {
    setNewTour({
      name: '',
      destination: '',
      durationDays: 3,
      price: 0,
      maxCapacity: 20,
      startDate: '',
      endDate: '',
      itineraryText: '',
      included: '',
      notIncluded: '',
      status: 'published'
    });
  };

  const resetActivityForm = () => {
    setNewActivity({
      name: '',
      location: '',
      region: 'Southern Region',
      description: '',
      pricePerDay: 0,
      pricePerPerson: 0,
      durationHours: 3,
      category: 'hiking',
      difficulty: 'easy',
      minPeople: 1,
      maxPeople: 20,
      status: 'active'
    });
    setNewActivityMainImage(null);
    setNewActivityImages([]);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="admin-access-denied">
        <div className="access-icon">🔒</div>
        <h2>Access Denied</h2>
        <p>You need administrator privileges to view this page.</p>
        <button className="btn-primary" onClick={() => window.location.href = '/'}>
          Return to Home →
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-title">
          <span className="admin-icon">👑</span>
          <h1>Admin Dashboard</h1>
        </div>
        <p className="admin-subtitle">Manage tours, activities, users, and view bookings</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-tours">
          <div className="stat-icon">🏕️</div>
          <div className="stat-info">
            <h3>{stats.totalTours}</h3>
            <p>Total Tours</p>
          </div>
        </div>
        <div className="stat-card stat-activities">
          <div className="stat-icon">🏔️</div>
          <div className="stat-info">
            <h3>{stats.totalActivities}</h3>
            <p>Activities</p>
          </div>
        </div>
        <div className="stat-card stat-bookings">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>{stats.totalBookings}</h3>
            <p>Bookings</p>
          </div>
        </div>
        <div className="stat-card stat-revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>${stats.totalRevenue.toLocaleString()}</h3>
            <p>Revenue (USD)</p>
          </div>
        </div>
        <div className="stat-card stat-users">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalUsers}</h3>
            <p>Users</p>
          </div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{stats.pendingPayments}</h3>
            <p>Pending</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span className="tab-icon">📊</span> Dashboard
        </button>
        <button 
          className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          <span className="tab-icon">🏔️</span> Activities
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tours' ? 'active' : ''}`}
          onClick={() => setActiveTab('tours')}
        >
          <span className="tab-icon">🏕️</span> Tours
        </button>
        <button 
          className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <span className="tab-icon">📅</span> Bookings
        </button>
        <button 
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <span className="tab-icon">💳</span> Payments
          {stats.pendingPayments > 0 && <span className="tab-badge">{stats.pendingPayments}</span>}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <span className="tab-icon">👥</span> Users
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="dashboard-tab">
          <div className="dashboard-welcome">
            <h2>Welcome back, {user.fullName}!</h2>
            <p>Here's what's happening with your business today.</p>
          </div>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h4>Recent Bookings</h4>
              {bookings.slice(0, 5).map(booking => (
                <div key={booking.id} className="recent-item">
                  <span>{booking.bookingCode}</span>
                  <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                </div>
              ))}
            </div>
            <div className="dashboard-card">
              <h4>Pending Payments</h4>
              {paymentRequests.slice(0, 5).map(payment => (
                <div key={payment.id} className="recent-item">
                  <span>{payment.customerName}</span>
                  <span>${payment.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <div className="admin-section">
          <div className="section-header">
            <h2>Manage Activities</h2>
            <button className="btn-add" onClick={() => setShowAddActivity(!showAddActivity)}>
              {showAddActivity ? 'Cancel' : '+ Add New Activity'}
            </button>
          </div>

          {showAddActivity && (
            <form className="admin-form" onSubmit={handleAddActivity}>
              <h3>Add New Activity</h3>
              <div className="form-grid">
                <input type="text" placeholder="Activity Name" value={newActivity.name} onChange={(e) => setNewActivity({...newActivity, name: e.target.value})} required />
                <input type="text" placeholder="Location" value={newActivity.location} onChange={(e) => setNewActivity({...newActivity, location: e.target.value})} required />
                <select value={newActivity.region} onChange={(e) => setNewActivity({...newActivity, region: e.target.value})}>
                  <option value="Northern Region">Northern Region</option>
                  <option value="Southern Region">Southern Region</option>
                  <option value="Central Region">Central Region</option>
                  <option value="Eastern Region">Eastern Region</option>
                </select>
                <select value={newActivity.category} onChange={(e) => setNewActivity({...newActivity, category: e.target.value})}>
                  <option value="hiking">Hiking</option>
                  <option value="safari">Safari</option>
                  <option value="kayaking">Kayaking</option>
                  <option value="cultural">Cultural</option>
                  <option value="beach">Beach</option>
                </select>
                <input type="number" placeholder="Price Per Day (USD)" value={newActivity.pricePerDay} onChange={(e) => setNewActivity({...newActivity, pricePerDay: parseInt(e.target.value)})} />
                <input type="number" placeholder="Duration (hours)" value={newActivity.durationHours} onChange={(e) => setNewActivity({...newActivity, durationHours: parseInt(e.target.value)})} />
                <select value={newActivity.difficulty} onChange={(e) => setNewActivity({...newActivity, difficulty: e.target.value})}>
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="challenging">Challenging</option>
                </select>
                <input type="number" placeholder="Max People" value={newActivity.maxPeople} onChange={(e) => setNewActivity({...newActivity, maxPeople: parseInt(e.target.value)})} />
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '16px', marginTop: '16px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  Primary Image
                  <input type="file" accept="image/*" onChange={handleMainImageChange} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  Gallery Images
                  <input type="file" accept="image/*" multiple onChange={handleActivityImagesChange} />
                </label>
                {newActivityImages.length > 0 && (
                  <div style={{ color: '#444', fontSize: '0.9rem' }}>
                    Selected images: {newActivityImages.map((file) => file.name).join(', ')}
                  </div>
                )}
              </div>

              <textarea placeholder="Description" value={newActivity.description} onChange={(e) => setNewActivity({...newActivity, description: e.target.value})} rows="3" />
              <button type="submit" className="btn-save">Save Activity</button>
            </form>
          )}

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Price/Day</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={activity._id || activity.id}>
                    <td>{activity.name}</td>
                    <td>{activity.location}</td>
                    <td>${activity.pricePerDay}</td>
                    <td><span className="category-badge">{activity.category}</span></td>
                    <td><span className={`difficulty-badge ${activity.difficulty}`}>{activity.difficulty}</span></td>
                    <td>
                      <button className="btn-delete" onClick={() => confirmDelete(activity, 'activity')}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tours Tab */}
      {activeTab === 'tours' && (
        <div className="admin-section">
          <div className="section-header">
            <h2>Manage Tours</h2>
            <button className="btn-add" onClick={() => setShowAddTour(!showAddTour)}>
              {showAddTour ? 'Cancel' : '+ Add New Tour'}
            </button>
          </div>

          {showAddTour && (
            <form className="admin-form" onSubmit={handleAddTour}>
              <h3>Add New Tour</h3>
              <div className="form-grid">
                <input type="text" placeholder="Tour Name" value={newTour.name} onChange={(e) => setNewTour({...newTour, name: e.target.value})} required />
                <input type="text" placeholder="Destination" value={newTour.destination} onChange={(e) => setNewTour({...newTour, destination: e.target.value})} required />
                <input type="number" placeholder="Duration (days)" value={newTour.durationDays} onChange={(e) => setNewTour({...newTour, durationDays: parseInt(e.target.value)})} />
                <input type="number" placeholder="Price (USD)" value={newTour.price} onChange={(e) => setNewTour({...newTour, price: parseInt(e.target.value)})} />
                <input type="number" placeholder="Max Capacity" value={newTour.maxCapacity} onChange={(e) => setNewTour({...newTour, maxCapacity: parseInt(e.target.value)})} />
                <input type="date" placeholder="Start Date" value={newTour.startDate} onChange={(e) => setNewTour({...newTour, startDate: e.target.value})} />
                <input type="date" placeholder="End Date" value={newTour.endDate} onChange={(e) => setNewTour({...newTour, endDate: e.target.value})} />
                <select value={newTour.status} onChange={(e) => setNewTour({...newTour, status: e.target.value})}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <textarea placeholder="Itinerary" value={newTour.itineraryText} onChange={(e) => setNewTour({...newTour, itineraryText: e.target.value})} rows="3" />
              <textarea placeholder="What's Included" value={newTour.included} onChange={(e) => setNewTour({...newTour, included: e.target.value})} rows="2" />
              <textarea placeholder="What's Not Included" value={newTour.notIncluded} onChange={(e) => setNewTour({...newTour, notIncluded: e.target.value})} rows="2" />
              <button type="submit" className="btn-save">Save Tour</button>
            </form>
          )}

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Destination</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tours.map((tour) => (
                  <tr key={tour._id || tour.id}>
                    <td>{tour.name}</td>
                    <td>{tour.destination}</td>
                    <td>{tour.durationDays} days</td>
                    <td>${tour.price}</td>
                    <td><span className={`status-badge ${tour.status}`}>{tour.status}</span></td>
                    <td>
                      <button className="btn-delete" onClick={() => confirmDelete(tour, 'tour')}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="admin-section">
          <h2>All Bookings</h2>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking Code</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Activity</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id || booking.id}>
                    <td><code>{booking.bookingCode}</code></td>
                    <td>{booking.personalDetails?.fullName || booking.user?.fullName}</td>
                    <td>{booking.personalDetails?.phone || booking.user?.phone}</td>
                    <td>{booking.selectedActivities?.[0]?.activity?.name || 'N/A'}</td>
                    <td>{booking.selectedActivities?.[0]?.selectedDate ? new Date(booking.selectedActivities[0].selectedDate).toLocaleDateString() : 'N/A'}</td>
                    <td>${booking.totalPrice}</td>
                    <td><span className={`status-badge ${booking.status}`}>{booking.status}</span></td>
                    <td>
                      {booking.status === 'pending' && (
                        <button className="btn-verify" onClick={() => verifyBooking(booking._id || booking.id, booking.personalDetails?.fullName)}>
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="admin-section">
          <h2>Pending Payment Verifications</h2>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Booking Code</th>
                  <th>Amount</th>
                  <th>Reference</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paymentRequests.map((payment) => (
                  <tr key={payment._id || payment.id}>
                    <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td>{payment.customerName}</td>
                    <td>{payment.customerPhone}</td>
                    <td><code>{payment.bookingCode}</code></td>
                    <td>${payment.amount}</td>
                    <td><code>{payment.paymentReference}</code></td>
                    <td>
                      <button className="btn-verify" onClick={() => verifyPayment(payment._id, payment.bookingCode, payment.customerName)}>
                        Verify & Confirm
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-section">
          <h2>Registered Users</h2>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Registered On</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id || user.id}>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || '—'}</td>
                    <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && itemToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">⚠️</div>
            <h2>Delete {deleteType === 'activity' ? 'Activity' : 'Tour'}?</h2>
            <p>Are you sure you want to delete <strong>"{itemToDelete.name}"</strong>?</p>
            <p className="modal-warning">This action cannot be undone!</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="btn-confirm-delete" onClick={handleDeleteConfirm}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;