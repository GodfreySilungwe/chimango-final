import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [tours, setTours] = useState([]);
  const [activities, setActivities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('activities');
  const [showAddTour, setShowAddTour] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  
  // Delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(''); // 'activity' or 'tour'
  
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

  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetchTours();
    fetchActivities();
    fetchBookings();
    fetchUsers();
    fetchPaymentRequests();
  }, [user]);

  const fetchTours = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/tours`);
      setTours(res.data);
    } catch (error) {
      console.error('Error fetching tours:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/activities`);
      setActivities(res.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/custom-bookings`);
      setBookings(res.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users`);
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPaymentRequests = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/payment-requests/pending`);
      setPaymentRequests(res.data);
    } catch (error) {
      console.error('Error fetching payment requests:', error);
    }
  };

  const handleAddTour = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/tours`, newTour);
      setShowAddTour(false);
      fetchTours();
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
      alert('Tour added successfully!');
    } catch (error) {
      console.error('Error adding tour:', error);
      alert('Failed to add tour');
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/activities`, newActivity);
      setShowAddActivity(false);
      fetchActivities();
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
      alert('Activity added successfully');
    } catch (error) {
      console.error('Error adding activity:', error);
      alert('Failed to add activity');
    }
  };

  // Show delete confirmation modal
  const confirmDelete = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setShowDeleteConfirm(true);
  };

  // Handle actual deletion after confirmation
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    try {
      if (deleteType === 'activity') {
        await axios.delete(`${API_URL}/api/activities/${itemToDelete._id}`);
        fetchActivities();
        alert(`✅ "${itemToDelete.name}" has been deleted successfully.`);
      } else if (deleteType === 'tour') {
        await axios.delete(`${API_URL}/api/tours/${itemToDelete._id}`);
        fetchTours();
        alert(`✅ "${itemToDelete.name}" has been deleted successfully.`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(`❌ Failed to delete. Please try again.`);
    } finally {
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      setDeleteType('');
    }
  };

  const exportBookings = () => {
    window.open(`${API_URL}/api/export-bookings`, '_blank');
  };

  const verifyPayment = async (paymentId, bookingCode, userPhone, customerName) => {
    if (!confirm(`Confirm payment for ${customerName}?`)) return;
    
    try {
      await axios.put(`${API_URL}/api/payment-requests/${paymentId}/verify`);
      await axios.put(`${API_URL}/api/custom-bookings/confirm/${bookingCode}`);
      alert(`Payment verified for ${customerName}`);
      fetchPaymentRequests();
      fetchBookings();
    } catch (error) {
      console.error('Verification error:', error);
      alert('Failed to verify payment');
    }
  };

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const totalBookings = bookings.length;
  const totalActivities = activities.length;
  const totalTours = tours.length;
  const totalUsers = users.length;

  if (user?.role !== 'admin') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You need admin privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>Admin Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Manage tours, activities, users, and view bookings</p>
      
      <button onClick={exportBookings} style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px', fontSize: '14px' }}>📊 Export Bookings to Excel</button>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1rem', backgroundColor: '#3498db', color: 'white', borderRadius: '8px', textAlign: 'center' }}><h2 style={{ margin: 0 }}>{totalTours}</h2><p style={{ margin: 0 }}>Total Tours</p></div>
        <div style={{ padding: '1rem', backgroundColor: '#2ecc71', color: 'white', borderRadius: '8px', textAlign: 'center' }}><h2 style={{ margin: 0 }}>{totalActivities}</h2><p style={{ margin: 0 }}>Total Activities</p></div>
        <div style={{ padding: '1rem', backgroundColor: '#e67e22', color: 'white', borderRadius: '8px', textAlign: 'center' }}><h2 style={{ margin: 0 }}>{totalBookings}</h2><p style={{ margin: 0 }}>Total Bookings</p></div>
        <div style={{ padding: '1rem', backgroundColor: '#9b59b6', color: 'white', borderRadius: '8px', textAlign: 'center' }}><h2 style={{ margin: 0 }}>USD {totalRevenue.toLocaleString()}</h2><p style={{ margin: 0 }}>Total Revenue</p></div>
        <div style={{ padding: '1rem', backgroundColor: '#1abc9c', color: 'white', borderRadius: '8px', textAlign: 'center' }}><h2 style={{ margin: 0 }}>{totalUsers}</h2><p style={{ margin: 0 }}>Total Users</p></div>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid #ddd', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('activities')} style={{ padding: '0.5rem 1rem', backgroundColor: activeTab === 'activities' ? '#3498db' : 'transparent', color: activeTab === 'activities' ? 'white' : '#333', border: 'none', cursor: 'pointer', borderRadius: '4px 4px 0 0' }}>Manage Activities</button>
        <button onClick={() => setActiveTab('tours')} style={{ padding: '0.5rem 1rem', backgroundColor: activeTab === 'tours' ? '#3498db' : 'transparent', color: activeTab === 'tours' ? 'white' : '#333', border: 'none', cursor: 'pointer', borderRadius: '4px 4px 0 0' }}>Manage Tours</button>
        <button onClick={() => setActiveTab('bookings')} style={{ padding: '0.5rem 1rem', backgroundColor: activeTab === 'bookings' ? '#3498db' : 'transparent', color: activeTab === 'bookings' ? 'white' : '#333', border: 'none', cursor: 'pointer', borderRadius: '4px 4px 0 0' }}>View Bookings</button>
        <button onClick={() => setActiveTab('users')} style={{ padding: '0.5rem 1rem', backgroundColor: activeTab === 'users' ? '#3498db' : 'transparent', color: activeTab === 'users' ? 'white' : '#333', border: 'none', cursor: 'pointer', borderRadius: '4px 4px 0 0' }}>Users &amp; Contacts</button>
        <button onClick={() => setActiveTab('payments')} style={{ padding: '0.5rem 1rem', backgroundColor: activeTab === 'payments' ? '#3498db' : 'transparent', color: activeTab === 'payments' ? 'white' : '#333', border: 'none', cursor: 'pointer', borderRadius: '4px 4px 0 0' }}>Payment Requests ({paymentRequests.length})</button>
      </div>
      
      {activeTab === 'activities' && (
        <div>
          <button onClick={() => setShowAddActivity(!showAddActivity)} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{showAddActivity ? 'Cancel' : '+ Add New Activity'}</button>
          {showAddActivity && (
            <form onSubmit={handleAddActivity} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
              <h3>Add New Activity</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <input type="text" placeholder="Activity Name" value={newActivity.name} onChange={(e) => setNewActivity({...newActivity, name: e.target.value})} required style={{ padding: '0.5rem' }} />
                <input type="text" placeholder="Location" value={newActivity.location} onChange={(e) => setNewActivity({...newActivity, location: e.target.value})} required style={{ padding: '0.5rem' }} />
                <select value={newActivity.region} onChange={(e) => setNewActivity({...newActivity, region: e.target.value})} style={{ padding: '0.5rem' }}><option value="Northern Region">Northern Region</option><option value="Southern Region">Southern Region</option><option value="Central Region">Central Region</option><option value="Eastern Region">Eastern Region</option></select>
                <select value={newActivity.category} onChange={(e) => setNewActivity({...newActivity, category: e.target.value})} style={{ padding: '0.5rem' }}><option value="hiking">Hiking</option><option value="safari">Safari</option><option value="kayaking">Kayaking</option><option value="cultural">Cultural</option><option value="beach">Beach</option></select>
                <input type="number" placeholder="Price Per Day (USD)" value={newActivity.pricePerDay} onChange={(e) => setNewActivity({...newActivity, pricePerDay: parseInt(e.target.value)})} required style={{ padding: '0.5rem' }} />
                <input type="number" placeholder="Price Per Person (USD)" value={newActivity.pricePerPerson} onChange={(e) => setNewActivity({...newActivity, pricePerPerson: parseInt(e.target.value)})} required style={{ padding: '0.5rem' }} />
                <input type="number" placeholder="Duration (hours)" value={newActivity.durationHours} onChange={(e) => setNewActivity({...newActivity, durationHours: parseInt(e.target.value)})} required style={{ padding: '0.5rem' }} />
                <select value={newActivity.difficulty} onChange={(e) => setNewActivity({...newActivity, difficulty: e.target.value})} style={{ padding: '0.5rem' }}><option value="easy">Easy</option><option value="moderate">Moderate</option><option value="challenging">Challenging</option></select>
                <input type="number" placeholder="Min People" value={newActivity.minPeople} onChange={(e) => setNewActivity({...newActivity, minPeople: parseInt(e.target.value)})} required style={{ padding: '0.5rem' }} />
                <input type="number" placeholder="Max People" value={newActivity.maxPeople} onChange={(e) => setNewActivity({...newActivity, maxPeople: parseInt(e.target.value)})} required style={{ padding: '0.5rem' }} />
              </div>
              <textarea placeholder="Description" value={newActivity.description} onChange={(e) => setNewActivity({...newActivity, description: e.target.value})} rows="3" style={{ width: '100%', marginTop: '1rem', padding: '0.5rem' }} required />
              <button type="submit" style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Activity</button>
            </form>
          )}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Location</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Price/Day (USD)</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Category</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity._id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '0.5rem' }}>{activity.name}</td>
                  <td style={{ padding: '0.5rem' }}>{activity.location}</td>
                  <td style={{ padding: '0.5rem' }}>USD {activity.pricePerDay?.toLocaleString() || 0}</td>
                  <td style={{ padding: '0.5rem' }}>{activity.category}</td>
                  <td style={{ padding: '0.5rem' }}>
                    <button onClick={() => confirmDelete(activity, 'activity')} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                  </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {activeTab === 'tours' && (
        <div>
          <button onClick={() => setShowAddTour(!showAddTour)} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{showAddTour ? 'Cancel' : '+ Add New Tour'}</button>
          {showAddTour && (
            <form onSubmit={handleAddTour} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3>Add New Tour</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <input type="text" placeholder="Tour Name" value={newTour.name} onChange={(e) => setNewTour({...newTour, name: e.target.value})} required style={{ padding: '0.5rem' }} />
                <input type="text" placeholder="Destination" value={newTour.destination} onChange={(e) => setNewTour({...newTour, destination: e.target.value})} required style={{ padding: '0.5rem' }} />
                <input type="number" placeholder="Duration (days)" value={newTour.durationDays} onChange={(e) => setNewTour({...newTour, durationDays: parseInt(e.target.value)})} required style={{ padding: '0.5rem' }} />
                <input type="number" placeholder="Price (USD)" value={newTour.price} onChange={(e) => setNewTour({...newTour, price: parseInt(e.target.value)})} required style={{ padding: '0.5rem' }} />
                <input type="number" placeholder="Max Capacity" value={newTour.maxCapacity} onChange={(e) => setNewTour({...newTour, maxCapacity: parseInt(e.target.value)})} required style={{ padding: '0.5rem' }} />
                <input type="date" placeholder="Start Date" value={newTour.startDate} onChange={(e) => setNewTour({...newTour, startDate: e.target.value})} required style={{ padding: '0.5rem' }} />
                <input type="date" placeholder="End Date" value={newTour.endDate} onChange={(e) => setNewTour({...newTour, endDate: e.target.value})} required style={{ padding: '0.5rem' }} />
                <select value={newTour.status} onChange={(e) => setNewTour({...newTour, status: e.target.value})} style={{ padding: '0.5rem' }}><option value="draft">Draft</option><option value="published">Published</option></select>
              </div>
              <textarea placeholder="Itinerary" value={newTour.itineraryText} onChange={(e) => setNewTour({...newTour, itineraryText: e.target.value})} rows="3" style={{ width: '100%', marginTop: '1rem', padding: '0.5rem' }} />
              <textarea placeholder="What's Included" value={newTour.included} onChange={(e) => setNewTour({...newTour, included: e.target.value})} rows="2" style={{ width: '100%', marginTop: '1rem', padding: '0.5rem' }} />
              <textarea placeholder="What's Not Included" value={newTour.notIncluded} onChange={(e) => setNewTour({...newTour, notIncluded: e.target.value})} rows="2" style={{ width: '100%', marginTop: '1rem', padding: '0.5rem' }} />
              <button type="submit" style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Tour</button>
            </form>
          )}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Destination</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Price (USD)</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Actions</th>
               </tr>
            </thead>
            <tbody>
              {tours.map((tour) => (
                <tr key={tour._id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '0.5rem' }}>{tour.name}</td>
                  <td style={{ padding: '0.5rem' }}>{tour.destination}</td>
                  <td style={{ padding: '0.5rem' }}>USD {tour.price?.toLocaleString() || 0}</td>
                  <td style={{ padding: '0.5rem' }}>{tour.status}</td>
                  <td style={{ padding: '0.5rem' }}>
                    <button onClick={() => confirmDelete(tour, 'tour')} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                  </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {activeTab === 'bookings' && (
        <div>
          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}><p>No bookings yet.</p></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f2f2f2' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Booking Code</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Customer</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Phone</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Activity</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Total (USD)</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Action</th>
                   </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '0.5rem' }}>{booking.bookingCode || 'N/A'}</td>
                      <td style={{ padding: '0.5rem' }}>{booking.personalDetails?.fullName || booking.user?.fullName || 'N/A'}</td>
                      <td style={{ padding: '0.5rem' }}>{booking.personalDetails?.phone || booking.user?.phone || 'N/A'}</td>
                      <td style={{ padding: '0.5rem' }}>{booking.selectedActivities?.[0]?.activity?.name || 'N/A'}</td>
                      <td style={{ padding: '0.5rem' }}>{booking.selectedActivities?.[0]?.selectedDate ? new Date(booking.selectedActivities[0].selectedDate).toLocaleDateString() : 'N/A'}</td>
                      <td style={{ padding: '0.5rem' }}>USD {booking.totalPrice?.toLocaleString() || 0}</td>
                      <td style={{ padding: '0.5rem' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', backgroundColor: booking.status === 'confirmed' ? '#d4edda' : '#f8d7da', color: booking.status === 'confirmed' ? '#155724' : '#721c24' }}>{booking.status}</span>
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        {booking.status === 'pending' && (
                          <button onClick={() => verifyPayment(booking._id, booking.bookingCode, booking.personalDetails?.phone, booking.personalDetails?.fullName)} style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Verify Payment</button>
                        )}
                        {booking.status === 'confirmed' && <span style={{ color: 'green', fontSize: '12px' }}>Confirmed</span>}
                      </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'users' && (
        <div>
          <div style={{ marginBottom: '1rem' }}><p><strong>Total Registered Users:</strong> {users.length}</p></div>
          {users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}><p>No users found.</p></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f2f2f2' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Full Name</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Phone Number</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Role</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Registered On</th>
                   </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '0.5rem' }}>{user.fullName}</td>
                      <td style={{ padding: '0.5rem' }}>{user.email}</td>
                      <td style={{ padding: '0.5rem' }}>{user.phone ? <a href={`tel:${user.phone}`} style={{ color: '#3498db', textDecoration: 'none' }}>📞 {user.phone}</a> : 'Not provided'}</td>
                      <td style={{ padding: '0.5rem' }}><span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', backgroundColor: user.role === 'admin' ? '#cce5ff' : '#d4edda', color: user.role === 'admin' ? '#004085' : '#155724' }}>{user.role}</span></td>
                      <td style={{ padding: '0.5rem' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'payments' && (
        <div>
          <h3>Pending Payment Verifications</h3>
          {paymentRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}><p>No pending payment requests.</p></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f2f2f2' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Customer</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Phone</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Booking Code</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Amount</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Reference</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Action</th>
                   </tr>
                </thead>
                <tbody>
                  {paymentRequests.map((payment) => (
                    <tr key={payment._id} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '0.5rem' }}>{new Date(payment.createdAt).toLocaleString()}</td>
                      <td style={{ padding: '0.5rem' }}>{payment.customerName}</td>
                      <td style={{ padding: '0.5rem' }}>{payment.customerPhone}</td>
                      <td style={{ padding: '0.5rem' }}>{payment.bookingCode}</td>
                      <td style={{ padding: '0.5rem' }}>USD {payment.amount?.toLocaleString()}</td>
                      <td style={{ padding: '0.5rem' }}>{payment.paymentReference}</td>
                      <td style={{ padding: '0.5rem' }}>
                        <button onClick={() => verifyPayment(payment._id, payment.bookingCode, payment.customerPhone, payment.customerName)} style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Verify &amp; Confirm</button>
                      </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && itemToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '450px',
            width: '90%',
            padding: '30px',
            textAlign: 'center'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              width: '70px',
              height: '70px',
              backgroundColor: '#e74c3c',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <span style={{ fontSize: '40px' }}>⚠️</span>
            </div>
            <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>Delete {deleteType === 'activity' ? 'Activity' : 'Tour'}?</h2>
            <p style={{ color: '#666', marginBottom: '10px' }}>
              Are you sure you want to delete <strong>"{itemToDelete.name}"</strong>?
            </p>
            <p style={{ color: '#e74c3c', fontSize: '14px', marginBottom: '20px' }}>
              This action cannot be undone!
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                style={{ flex: 1, padding: '12px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                style={{ flex: 1, padding: '12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
              >
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