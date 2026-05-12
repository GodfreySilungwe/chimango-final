import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import './TourDetailPage.css';

const TourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numTravelers, setNumTravelers] = useState(1);
  const [travelDate, setTravelDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchTour();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchTour = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tours/${id}`);
      const data = await res.json();
      setTour(data);
      if (data.startDate) {
        setTravelDate(data.startDate.split('T')[0]);
      }
    } catch (error) {
      console.error('Error fetching tour:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      sessionStorage.setItem('redirectAfterLogin', `/tours/${id}`);
      navigate('/login');
      return;
    }
    
    setBookingLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          tourId: id,
          travelDate,
          numTravelers,
          promoCode: ''
        })
      });
      
      if (response.ok) {
        alert('✅ Booking confirmed! Check your bookings page.');
        navigate('/bookings');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const getMinDate = () => {
    if (tour?.startDate) {
      return tour.startDate.split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    if (tour?.endDate) {
      return tour.endDate.split('T')[0];
    }
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading tour details...</p>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="error-container">
        <div className="error-icon">🔍</div>
        <h2>Tour Not Found</h2>
        <p>The tour you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/tours')} className="btn-back">
          Browse Tours →
        </button>
      </div>
    );
  }

  return (
    <div className="tour-detail-page">
      {/* Hero Section */}
      <div className="tour-hero">
        <div className="tour-hero-overlay"></div>
        <div className="tour-hero-content">
          <div className="tour-badge">{tour.category || 'Adventure'}</div>
          <h1 className="tour-title">{tour.name}</h1>
          <div className="tour-meta">
            <span className="tour-meta-item">
              <span className="meta-icon">📍</span> {tour.destination}
            </span>
            <span className="tour-meta-item">
              <span className="meta-icon">⏱️</span> {tour.durationDays} days
            </span>
            <span className="tour-meta-item">
              <span className="meta-icon">⭐</span> {tour.rating || '4.8'} ({tour.reviewCount || 25} reviews)
            </span>
          </div>
          <div className="tour-price-hero">
            <span className="price-label">From</span>
            <span className="price-amount">${tour.price}</span>
            <span className="price-period">/ person</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="tour-content">
        <div className="tour-main">
          {/* Tab Navigation */}
          <div className="tour-tabs">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'itinerary' ? 'active' : ''}`}
              onClick={() => setActiveTab('itinerary')}
            >
              Itinerary
            </button>
            <button 
              className={`tab-btn ${activeTab === 'included' ? 'active' : ''}`}
              onClick={() => setActiveTab('included')}
            >
              What's Included
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-content">
                <h3>Tour Description</h3>
                <p>{tour.description || 'Experience the beauty of Malawi with this amazing tour package.'}</p>
                <div className="highlights">
                  <h4>Highlights</h4>
                  <ul>
                    <li>✓ Expert local guides</li>
                    <li>✓ Comfortable transportation</li>
                    <li>✓ Handpicked accommodations</li>
                    <li>✓ Authentic cultural experiences</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'itinerary' && (
              <div className="itinerary-content">
                <h3>Daily Itinerary</h3>
                <p>{tour.itineraryText || 'Full itinerary will be provided upon booking.'}</p>
                {tour.itinerary && (
                  <div className="itinerary-days">
                    {tour.itinerary.map((day, index) => (
                      <div key={index} className="itinerary-day">
                        <div className="day-number">Day {day.day}</div>
                        <div className="day-title">{day.title}</div>
                        <div className="day-description">{day.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'included' && (
              <div className="included-content">
                <div className="included-grid">
                  <div className="included-section">
                    <h3>✅ What's Included</h3>
                    <ul>
                      <li>Accommodation</li>
                      <li>Meals as per itinerary</li>
                      <li>Transportation</li>
                      <li>Professional guide</li>
                      <li>Park fees</li>
                      <li>Activities as specified</li>
                    </ul>
                  </div>
                  <div className="excluded-section">
                    <h3>❌ Not Included</h3>
                    <ul>
                      <li>International flights</li>
                      <li>Visa fees</li>
                      <li>Travel insurance</li>
                      <li>Personal expenses</li>
                      <li>Tips and gratuities</li>
                      <li>Optional activities</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-content">
                <div className="reviews-summary">
                  <div className="rating-overall">
                    <span className="rating-number">{tour.rating || '4.8'}</span>
                    <span className="rating-stars">★★★★★</span>
                    <span className="rating-count">Based on {tour.reviewCount || 25} reviews</span>
                  </div>
                </div>
                <div className="reviews-list">
                  <div className="review-card">
                    <div className="review-header">
                      <strong>Sarah Johnson</strong>
                      <span className="review-rating">★★★★★</span>
                    </div>
                    <p>"An incredible experience! The guides were knowledgeable and the scenery was breathtaking."</p>
                    <small>March 2025</small>
                  </div>
                  <div className="review-card">
                    <div className="review-header">
                      <strong>Michael Chen</strong>
                      <span className="review-rating">★★★★★</span>
                    </div>
                    <p>"Well-organized tour with amazing accommodations. Highly recommend!"</p>
                    <small>February 2025</small>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="tour-sidebar">
          <div className="booking-card">
            <h3 className="booking-title">Book This Tour</h3>
            <div className="booking-price">
              <span className="price-label">Price per person</span>
              <span className="price-amount">${tour.price}</span>
            </div>

            <div className="booking-form">
              <div className="form-group">
                <label>Travel Date</label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Number of Travelers</label>
                <div className="traveler-selector">
                  <button 
                    className="traveler-btn"
                    onClick={() => setNumTravelers(Math.max(1, numTravelers - 1))}
                    disabled={numTravelers <= 1}
                  >
                    −
                  </button>
                  <span className="traveler-count">{numTravelers}</span>
                  <button 
                    className="traveler-btn"
                    onClick={() => setNumTravelers(Math.min(tour.maxCapacity || 20, numTravelers + 1))}
                    disabled={numTravelers >= (tour.maxCapacity || 20)}
                  >
                    +
                  </button>
                </div>
                <small>Max {tour.maxCapacity || 20} travelers</small>
              </div>

              <div className="booking-total">
                <span>Total Price</span>
                <span className="total-amount">${(tour.price * numTravelers).toFixed(2)}</span>
              </div>

              <button
                className="btn-book"
                onClick={handleBooking}
                disabled={bookingLoading || !travelDate}
              >
                {bookingLoading ? (
                  <span className="btn-loading">Processing...</span>
                ) : (
                  'Book Now →'
                )}
              </button>

              <div className="booking-guarantee">
                <span className="guarantee-icon">🔒</span>
                <div>
                  <strong>Secure Booking</strong>
                  <p>Your payment is safe and secure</p>
                </div>
              </div>
            </div>
          </div>

          {/* Need Help Card */}
          <div className="help-card">
            <h4>Need Help?</h4>
            <p>Have questions about this tour?</p>
            <button className="btn-help" onClick={() => navigate('/contact')}>
              Contact Us →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailPage;