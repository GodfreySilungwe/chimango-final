import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const WishlistPage = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.id) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/wishlist/${user.id}`);
      setWishlist(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setLoading(false);
    }
  };

  const removeFromWishlist = async (activityId) => {
    if (!confirm('Remove this activity from your wishlist?')) return;
    
    try {
      await axios.delete(`${API_URL}/api/wishlist/${user.id}/${activityId}`);
      fetchWishlist();
      alert('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading your wishlist...</h2>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '8px' }}>My Wishlist</h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>Your saved activities</p>

        {wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '12px' }}>
            <p style={{ fontSize: '18px', color: '#666' }}>Your wishlist is empty.</p>
            <a href="/activities" style={{ color: '#3498db', textDecoration: 'none' }}>Browse Activities →</a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {wishlist.map((item) => (
              <div key={item._id} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <img 
                  src={item.activity.mainImage} 
                  alt={item.activity.name}
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'; }}
                />
                <div style={{ padding: '16px' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>{item.activity.name}</h3>
                  <p style={{ color: '#e74c3c', margin: '0 0 8px 0', fontSize: '14px' }}>📍 {item.activity.location}</p>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>
                    {item.activity.description?.substring(0, 100)}...
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', fontSize: '12px', color: '#888' }}>
                    <span>⏱️ {item.activity.durationHours} hours</span>
                    <span>👥 Min {item.activity.minPeople}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#e67e22' }}>
                      USD {item.activity.pricePerDay?.toLocaleString()}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => window.location.href = `/activities?book=${item.activity._id}`}
                        style={{
                          backgroundColor: '#3498db',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Book Now
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.activity._id)}
                        style={{
                          backgroundColor: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;