import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import './WishlistPage.css';

const WishlistPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      fetchWishlist();
    } else if (!user) {
      setLoading(false);
    }
  }, [user]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/wishlist/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setWishlist(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (activityId) => {
    if (!window.confirm('Remove this activity from your wishlist?')) return;
    
    setRemoving(activityId);
    try {
      const response = await fetch(`${API_URL}/api/wishlist/${user.id}/${activityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        await fetchWishlist();
      } else {
        throw new Error('Failed to remove');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove from wishlist. Please try again.');
    } finally {
      setRemoving(null);
    }
  };

  const handleBookNow = (activityId) => {
    navigate(`/activities?book=${activityId}`);
  };

  const handleViewDetails = (activityId) => {
    navigate(`/activities/${activityId}`);
  };

  if (loading) {
    return (
      <div className="wishlist-loading">
        <div className="loading-spinner"></div>
        <p>Loading your wishlist...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="wishlist-empty">
        <div className="empty-icon">🔒</div>
        <h2>Please Log In</h2>
        <p>Sign in to view and manage your wishlist</p>
        <button className="btn-primary" onClick={() => navigate('/login')}>
          Sign In →
        </button>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        {/* Header */}
        <div className="wishlist-header">
          <div className="header-icon">❤️</div>
          <h1 className="wishlist-title">My Wishlist</h1>
          <p className="wishlist-subtitle">Your saved activities and adventures</p>
          {wishlist.length > 0 && (
            <span className="wishlist-count">{wishlist.length} items</span>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <div className="empty-icon">❤️</div>
            <h2>Your wishlist is empty</h2>
            <p>Save your favorite activities and create your dream itinerary</p>
            <button className="btn-browse" onClick={() => navigate('/activities')}>
              Browse Activities →
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((item) => (
              <div className="wishlist-card" key={item._id || item.id}>
                <div className="card-image-wrapper">
                  <img 
                    src={item.activity?.mainImage || item.activity?.images?.[0] || 'https://via.placeholder.com/400x250?text=No+Image'} 
                    alt={item.activity?.name}
                    className="card-image"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x250?text=Chimango+Tour'; }}
                  />
                  <button 
                    className="remove-btn"
                    onClick={() => removeFromWishlist(item.activity?._id || item.activity?.id)}
                    disabled={removing === (item.activity?._id || item.activity?.id)}
                  >
                    {removing === (item.activity?._id || item.activity?.id) ? '...' : '✕'}
                  </button>
                  <div className="card-category">{item.activity?.category || 'Adventure'}</div>
                </div>
                
                <div className="card-content">
                  <h3 className="card-title">{item.activity?.name}</h3>
                  <div className="card-location">
                    <span className="location-icon">📍</span>
                    <span>{item.activity?.location || item.activity?.region}</span>
                  </div>
                  <p className="card-description">
                    {item.activity?.description?.substring(0, 100)}...
                  </p>
                  
                  <div className="card-details">
                    {item.activity?.durationHours && (
                      <div className="detail-item">
                        <span className="detail-icon">⏱️</span>
                        <span>{item.activity.durationHours} hours</span>
                      </div>
                    )}
                    {item.activity?.difficulty && (
                      <div className="detail-item">
                        <span className="detail-icon">🏔️</span>
                        <span className={`difficulty-${item.activity.difficulty}`}>
                          {item.activity.difficulty}
                        </span>
                      </div>
                    )}
                    {item.activity?.maxPeople && (
                      <div className="detail-item">
                        <span className="detail-icon">👥</span>
                        <span>Max {item.activity.maxPeople}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="card-footer">
                    <div className="card-price">
                      <span className="price-amount">${item.activity?.pricePerDay || item.activity?.price}</span>
                      <span className="price-period">/person</span>
                    </div>
                    <div className="card-actions">
                      <button 
                        className="btn-details"
                        onClick={() => handleViewDetails(item.activity?._id || item.activity?.id)}
                      >
                        Details
                      </button>
                      <button 
                        className="btn-book"
                        onClick={() => handleBookNow(item.activity?._id || item.activity?.id)}
                      >
                        Book Now →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommended Section */}
        {wishlist.length > 0 && (
          <div className="recommended-section">
            <h3 className="recommended-title">You might also like</h3>
            <div className="recommended-grid">
              <div className="recommended-card">
                <div className="rec-icon">🏕️</div>
                <h4>Lake Malawi Kayaking</h4>
                <p>Explore the crystal clear waters</p>
              </div>
              <div className="recommended-card">
                <div className="rec-icon">⛰️</div>
                <h4>Mount Mulanje Hike</h4>
                <p>Challenge yourself on the highest peak</p>
              </div>
              <div className="recommended-card">
                <div className="rec-icon">🦁</div>
                <h4>Liwonde Safari</h4>
                <p>Spot the Big Five</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;