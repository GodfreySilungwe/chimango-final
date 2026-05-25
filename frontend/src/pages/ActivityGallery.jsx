import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityCard from '../components/ActivityCard';
import ActivityDetailModal from '../components/ActivityDetailModal';
import { API_URL } from '../config';
import './ActivityGallery.css';

const ActivityGallery = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedAccommodation, setSelectedAccommodation] = useState('camping');
  const [user, setUser] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
    fetchActivities();
    
    // Check for pending booking to restore
    const params = new URLSearchParams(window.location.search);
    if (params.get('restoreBooking') === 'true') {
      const pendingBooking = sessionStorage.getItem('pendingBooking');
      if (pendingBooking) {
        try {
          const booking = JSON.parse(pendingBooking);
          // We'll restore it after activities load
          sessionStorage.setItem('_restorePendingBooking', 'true');
        } catch (e) {
          console.error('Failed to parse pending booking:', e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (activities.length > 0) {
      filterActivities();
      
      // Restore pending booking if needed
      const shouldRestore = sessionStorage.getItem('_restorePendingBooking');
      if (shouldRestore === 'true') {
        const pendingBooking = sessionStorage.getItem('pendingBooking');
        if (pendingBooking) {
          try {
            const booking = JSON.parse(pendingBooking);
            // Find the activity by ID
            const activity = activities.find(a => a._id === booking.activityId || a.id === booking.activityId);
            if (activity) {
              setSelectedActivity(activity);
              sessionStorage.setItem('_pendingBookingToRestore', JSON.stringify(booking));
              sessionStorage.removeItem('_restorePendingBooking');
            }
          } catch (e) {
            console.error('Failed to restore booking:', e);
          }
        }
      }
    }
  }, [searchTerm, selectedCategory, selectedRegion, selectedDifficulty, activities]);

  const fetchActivities = async () => {
    try {
      const res = await fetch(`${API_URL}/api/activities`);
      const data = await res.json();
      setActivities(data);
      setFilteredActivities(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = [...activities];
    
    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }
    
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(a => a.region === selectedRegion);
    }
    
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(a => a.difficulty === selectedDifficulty);
    }
    
    setFilteredActivities(filtered);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedRegion('all');
    setSelectedDifficulty('all');
  };

  const openActivityModal = (activity, accommodation) => {
    setSelectedActivity(activity);
    setSelectedAccommodation(accommodation || 'camping');
  };

  const closeModal = () => {
    setSelectedActivity(null);
  };

  const categories = [
    { value: 'all', label: 'All', icon: '🎯' },
    { value: 'hiking', label: 'Hiking', icon: '🥾' },
    { value: 'safari', label: 'Safari', icon: '🦁' },
    { value: 'kayaking', label: 'Kayaking', icon: '🛶' },
    { value: 'cultural', label: 'Cultural', icon: '🏺' },
    { value: 'beach', label: 'Beach', icon: '🏖️' }
  ];
  
  const regions = [
    { value: 'all', label: 'All Regions', icon: '🌍' },
    { value: 'Northern Region', label: 'Northern', icon: '⬆️' },
    { value: 'Southern Region', label: 'Southern', icon: '⬇️' },
    { value: 'Central Region', label: 'Central', icon: '🟤' },
    { value: 'Eastern Region', label: 'Eastern', icon: '➡️' }
  ];
  
  const difficulties = [
    { value: 'all', label: 'All', icon: '🎯' },
    { value: 'easy', label: 'Easy', icon: '🌱' },
    { value: 'moderate', label: 'Moderate', icon: '⚡' },
    { value: 'challenging', label: 'Challenging', icon: '🏔️' }
  ];

  const activeFilterCount = [
    selectedCategory !== 'all',
    selectedRegion !== 'all',
    selectedDifficulty !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="gallery-loading">
        <div className="loading-spinner"></div>
        <h2>Discovering Malawi's Hidden Gems...</h2>
      </div>
    );
  }

  return (
    <div className="gallery-page">
      {/* Hero Banner */}
      <div className="gallery-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Discover Amazing <span className="highlight">Activities</span></h1>
          <p className="hero-subtitle">Explore the best experiences Malawi has to offer</p>
        </div>
      </div>

      <div className="gallery-container">
        {/* User Greeting */}
        {user && (
          <div className="user-greeting">
            <span className="greeting-icon">👋</span>
            <span>Welcome back, <strong>{user.fullName}</strong>!</span>
          </div>
        )}

        {/* Stats Bar */}
        <div className="gallery-stats-bar">
          <span className="gallery-stat-item">
            <span className="gallery-stat-number">{filteredActivities.length}</span>
            <span className="gallery-stat-label">Activities Found</span>
          </span>
          <span className="gallery-stat-item">
            <span className="gallery-stat-number">{activities.length}</span>
            <span className="gallery-stat-label">Total Activities</span>
          </span>
        </div>

        {/* Search and View Controls */}
        <div className="search-controls">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search activities by name, location, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
            )}
          </div>
          <div className="view-controls">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              ⊞ Grid
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              ☰ List
            </button>
            <button 
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters ↑' : 'Show Filters ↓'}
              {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
            </button>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="filters-section">
            <div className="filter-panel">
              <div className="compact-filter">
                <label className="compact-filter-label">
                  <span className="filter-icon">🏷️</span> Category
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="compact-filter-select"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </label>

                <label className="compact-filter-label">
                  <span className="filter-icon">📍</span> Region
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="compact-filter-select"
                  >
                    {regions.map(reg => (
                      <option key={reg.value} value={reg.value}>{reg.label}</option>
                    ))}
                  </select>
                </label>

                <label className="compact-filter-label">
                  <span className="filter-icon">🏔️</span> Difficulty
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="compact-filter-select"
                  >
                    {difficulties.map(diff => (
                      <option key={diff.value} value={diff.value}>{diff.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="filter-actions">
                <button className="reset-filters" onClick={resetFilters}>
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="results-count">
          <span>Showing {filteredActivities.length} of {activities.length} activities</span>
          {filteredActivities.length === 0 && (
            <button className="reset-link" onClick={resetFilters}>Clear Filters</button>
          )}
        </div>

        {/* Activities Grid/List */}
        {filteredActivities.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No activities found</h3>
            <p>Try adjusting your search or filters to find what you're looking for.</p>
            <button className="btn-browse" onClick={resetFilters}>
              Browse All Activities →
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="activities-grid">
            {filteredActivities.map((activity, index) => (
                <ActivityCard
                key={activity._id || activity.id} 
                activity={activity} 
                  onBookClick={(a, acc) => openActivityModal(a, acc)}
                user={user}
              />
            ))}
          </div>
        ) : (
          <div className="activities-list">
            {filteredActivities.map((activity) => (
              <div key={activity._id || activity.id} className="list-item">
                <div className="list-item-image">
                  <img 
                    src={activity.mainImage || activity.images?.[0] || 'https://via.placeholder.com/100x100?text=No+Image'} 
                    alt={activity.name}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=Chimango'; }}
                  />
                </div>
                <div className="list-item-content">
                  <div className="list-item-header">
                    <h3>{activity.name}</h3>
                    <span className={`difficulty-badge ${activity.difficulty}`}>
                      {activity.difficulty}
                    </span>
                  </div>
                  <p className="list-item-location">📍 {activity.location}</p>
                  <p className="list-item-description">{activity.description?.substring(0, 120)}...</p>
                  <div className="list-item-footer">
                    <div className="list-item-price">
                      ${activity.pricePerDay || activity.price} <span>/person</span>
                    </div>
                    <button 
                      className="list-item-btn"
                      onClick={() => openActivityModal(activity)}
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={closeModal}
          user={user}
          selectedAccommodation={selectedAccommodation}
        />
      )}
    </div>
  );
};

export default ActivityGallery;