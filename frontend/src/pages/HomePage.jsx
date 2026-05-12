import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityDetailModal from '../components/ActivityDetailModal';
import ActivityCard from '../components/ActivityCard';
import { API_URL } from '../config';
import './HomePage.css';

const HomePage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [user, setUser] = useState(null);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const navigate = useNavigate();

  const openActivityModal = (activity) => {
    setSelectedActivity(activity);
  };

  const backgroundImages = [
    '/images/viphya-hike.jpg',
    '/images/livingstonia.jpg',
    '/images/kayaking.jpg',
    '/images/safari.jpg',
    '/images/likoma-island.jpg',
    '/images/mulanje-mountain.jpg',
  ];

  const backgroundTitles = [
    'Hiking Adventure',
    'Cultural Experience',
    'Water Activities',
    'Wildlife Safari',
    'Island Paradise',
    'Mountain Trekking'
  ];

  const [stats, setStats] = useState({
    tours: 0,
    customers: 0,
    years: 0,
    satisfaction: 0
  });

  // Safe JSON parse function
  const safeJsonParse = (item, defaultValue = null) => {
    if (!item || item === 'undefined' || item === 'null') {
      return defaultValue;
    }
    try {
      return JSON.parse(item);
    } catch (error) {
      console.error('JSON Parse error:', error);
      return defaultValue;
    }
  };

  useEffect(() => {
    // FIX: Safe parsing of stored user
    const storedUser = localStorage.getItem('user');
    const userData = safeJsonParse(storedUser);
    if (userData) setUser(userData);
    
    fetchActivities();
    loadStats();
    
    // Rotate background images every 5 seconds
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await fetch(`${API_URL}/api/activities`);
      const data = await res.json();
      setActivities(data.slice(0, 6));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setLoading(false);
    }
  };

  const loadStats = async () => {
    setStats({
      tours: 150,
      customers: 5000,
      years: 12,
      satisfaction: 98
    });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Discovering Malawi...</p>
      </div>
    );
  }

  return (
    <div className="tourism-homepage">
      {/* Hero Section with Rotating Background */}
      <section className="hero-section">
        <div className="hero-background">
          {backgroundImages.map((img, index) => (
            <div 
              key={index}
              className={`hero-bg-slide ${index === currentBgIndex ? 'active' : ''}`}
              style={{ backgroundImage: `url(${img})` }}
            >
              <div className="hero-bg-overlay"></div>
            </div>
          ))}
          <div className="hero-bg-caption">
            <span className="caption-text">{backgroundTitles[currentBgIndex]}</span>
          </div>
        </div>
        
        <div className="hero-container">
          <div className="hero-badge">Experience Malawi</div>
          <h1 className="hero-title">
            Discover the<br />
            <span className="hero-highlight">Warm Heart of Africa</span>
          </h1>
          <p className="hero-subtitle">
            Curated adventures, authentic cultural experiences, and unforgettable journeys through Malawi's most breathtaking landscapes
          </p>
          
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="stat-value">{stats.years}+</div>
              <div className="stat-label">Years of Excellence</div>
            </div>
            <div className="hero-stat">
              <div className="stat-value">{stats.customers}+</div>
              <div className="stat-label">Happy Travelers</div>
            </div>
            <div className="hero-stat">
              <div className="stat-value">{stats.satisfaction}%</div>
              <div className="stat-label">Satisfaction Rate</div>
            </div>
          </div>
          
          <div className="hero-actions">
            <button className="btn-primary btn-large" onClick={() => {
              const element = document.getElementById('activities-section');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Explore Adventures
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button className="btn-outline btn-large" onClick={() => navigate('/custom-booking')}>
              Plan Your Journey
            </button>
          </div>
        </div>
        
        <div className="hero-scroll-indicator">
          <span>Discover More</span>
          <div className="scroll-mouse"></div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-icon">🏆</div>
            <div className="stat-info">
              <div className="stat-number">12+</div>
              <div className="stat-label">Years Experience</div>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-icon">🌍</div>
            <div className="stat-info">
              <div className="stat-number">50+</div>
              <div className="stat-label">Destinations</div>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <div className="stat-number">5,000+</div>
              <div className="stat-label">Happy Travelers</div>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <div className="stat-number">4.9</div>
              <div className="stat-label">Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <section className="welcome-section" style={{
        padding: '5rem 0',
        background: '#ffffff',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          <div className="welcome-content">
            <div className="welcome-icon" style={{ fontSize: '4rem', marginBottom: '1.5rem', display: 'inline-block' }}>🏔️</div>
            <h2 className="welcome-title" style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#1a472a',
              marginBottom: '1rem',
              fontFamily: 'Playfair Display, Georgia, serif'
            }}>Welcome to Chimango Tour</h2>
            <p className="welcome-subtitle" style={{
              fontSize: '1rem',
              color: '#4a5568',
              maxWidth: '800px',
              margin: '0 auto 2rem',
              lineHeight: '1.7'
            }}>
              Your premier gateway to unforgettable Malawian adventures. We craft authentic experiences 
              that connect you with the warmth of our people, the richness of our culture, and the 
              breathtaking beauty of our landscapes.
            </p>
            <div className="welcome-features" style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              flexWrap: 'wrap'
            }}>
              <div className="welcome-feature" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                color: '#2d3748',
                background: '#f7fafc',
                padding: '0.5rem 1.25rem',
                borderRadius: '999px',
                transition: 'all 0.3s ease',
                border: '1px solid #e2e8f0'
              }}>
                <span style={{ color: '#2ecc71', fontWeight: '700', fontSize: '1rem' }}>✓</span> Expert Local Guides
              </div>
              <div className="welcome-feature" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                color: '#2d3748',
                background: '#f7fafc',
                padding: '0.5rem 1.25rem',
                borderRadius: '999px',
                transition: 'all 0.3s ease',
                border: '1px solid #e2e8f0'
              }}>
                <span style={{ color: '#2ecc71', fontWeight: '700', fontSize: '1rem' }}>✓</span> Sustainable Tourism
              </div>
              <div className="welcome-feature" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                color: '#2d3748',
                background: '#f7fafc',
                padding: '0.5rem 1.25rem',
                borderRadius: '999px',
                transition: 'all 0.3s ease',
                border: '1px solid #e2e8f0'
              }}>
                <span style={{ color: '#2ecc71', fontWeight: '700', fontSize: '1rem' }}>✓</span> 24/7 Support
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Activities Section */}
      <section id="activities-section" className="featured-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Featured Experiences</span>
            <h2>Popular Activities in Malawi</h2>
            <p>Discover our most loved adventures, handpicked for you</p>
          </div>
          
          <div className="activities-grid">
            {activities.slice(0, 6).map((activity, index) => (
              <ActivityCard 
                key={activity._id} 
                activity={activity} 
                onBookClick={openActivityModal}
              />
            ))}
          </div>
          
          <div className="view-all-container">
            <button className="view-all-btn" onClick={() => navigate('/activities')}>
              Browse All Activities
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Why Choose Us</span>
            <h2>Travel with Confidence</h2>
            <p>Experience the Chimango difference</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <div className="feature-content">
                <h3>Expert Local Guides</h3>
                <p>Certified guides with deep local knowledge and passion for storytelling</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚙</div>
              <div className="feature-content">
                <h3>Premium Safari Vehicles</h3>
                <p>Modern 4x4 vehicles with pop-up roofs for optimal wildlife viewing</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏕️</div>
              <div className="feature-content">
                <h3>Luxury Accommodations</h3>
                <p>Carefully selected eco-lodges and boutique hotels</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌿</div>
              <div className="feature-content">
                <h3>Sustainable Tourism</h3>
                <p>Committed to responsible travel and community development</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Begin Your Malawi Adventure?</h2>
            <p>Contact our travel specialists to start planning your dream journey</p>
            <div className="cta-buttons">
              <button className="cta-primary" onClick={() => navigate('/activities')}>
                Book Your Safari
              </button>
              <button className="cta-secondary" onClick={() => navigate('/custom-booking')}>
                Customize Experience
              </button>
            </div>
          </div>
        </div>
      </section>

      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          user={user}
        />
      )}
    </div>
  );
};

export default HomePage;