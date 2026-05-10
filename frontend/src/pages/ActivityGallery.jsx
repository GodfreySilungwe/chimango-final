import { useState, useEffect } from 'react';
import axios from 'axios';
import ActivityCard from '../components/ActivityCard';
import ActivityDetailModal from '../components/ActivityDetailModal';
import { API_URL } from '../config';

const ActivityGallery = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchActivities();
  }, []);

  useEffect(() => {
    if (activities.length > 0) {
      filterActivities();
    }
  }, [searchTerm, selectedCategory, selectedRegion, selectedDifficulty, activities]);

  const fetchActivities = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/activities`);
      setActivities(res.data);
      setFilteredActivities(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = [...activities];
    
    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase())
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

  const openActivityModal = (activity) => {
    setSelectedActivity(activity);
  };

  const closeModal = () => {
    setSelectedActivity(null);
  };

  const categories = ['all', 'hiking', 'safari', 'kayaking', 'cultural', 'beach'];
  const regions = ['all', 'Northern Region', 'Southern Region', 'Central Region', 'Eastern Region'];
  const difficulties = ['all', 'easy', 'moderate', 'challenging'];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px' }}>⏳</div>
          <h2>Loading Activities...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '32px 16px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: '#2c3e50', marginBottom: '8px' }}>Discover Amazing Activities in Malawi</h1>
          <p style={{ color: '#666' }}>Click on any image to see more photos. Click Book Now to reserve your spot.</p>
          {user && <p style={{ color: 'green', fontSize: '14px' }}>✓ Logged in as: {user.fullName}</p>}
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <input
            type="text"
            placeholder="Search activities by name, location, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Filters */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '16px' }}>
            <strong>Category:</strong>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ padding: '6px 16px', backgroundColor: selectedCategory === cat ? '#3498db' : '#e9ecef', color: selectedCategory === cat ? 'white' : '#333', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <strong>Region:</strong>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              {regions.map(reg => (
                <button key={reg} onClick={() => setSelectedRegion(reg)} style={{ padding: '6px 16px', backgroundColor: selectedRegion === reg ? '#3498db' : '#e9ecef', color: selectedRegion === reg ? 'white' : '#333', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>
                  {reg === 'all' ? 'All Regions' : reg}
                </button>
              ))}
            </div>
          </div>

          <div>
            <strong>Difficulty:</strong>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              {difficulties.map(diff => (
                <button key={diff} onClick={() => setSelectedDifficulty(diff)} style={{ padding: '6px 16px', backgroundColor: selectedDifficulty === diff ? '#3498db' : '#e9ecef', color: selectedDifficulty === diff ? 'white' : '#333', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>
                  {diff === 'all' ? 'All' : diff.charAt(0).toUpperCase() + diff.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p style={{ marginBottom: '16px', color: '#666' }}>Found {filteredActivities.length} activity(s)</p>

        {/* Activities Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredActivities.map((activity) => (
            <ActivityCard key={activity._id} activity={activity} onBookClick={openActivityModal} />
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px', marginTop: '24px' }}>
            No activities found. Try different search or filters.
          </div>
        )}
      </div>

      {/* Activity Detail Modal - Same as Home page */}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={closeModal}
          user={user}
        />
      )}
    </div>
  );
};

export default ActivityGallery;