import { useState, useEffect } from 'react';
import axios from 'axios';
import ActivityCard from '../components/ActivityCard';
import ActivityFilters from '../components/ActivityFilters';

const ActivityGallery = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    if (activities.length > 0) {
      filterActivities();
    }
  }, [activities, selectedCategory, selectedRegion, selectedDifficulty]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/activities');
      setActivities(res.data);
      setFilteredActivities(res.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = [...activities];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(activity => activity.category === selectedCategory);
    }
    
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(activity => activity.region === selectedRegion);
    }
    
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(activity => activity.difficulty === selectedDifficulty);
    }
    
    setFilteredActivities(filtered);
  };

  const categories = ['all', 'hiking', 'safari', 'kayaking', 'cultural', 'beach'];
  const regions = ['all', 'Northern Region', 'Southern Region', 'Central Region', 'Eastern Region'];
  const difficulties = ['all', 'easy', 'moderate', 'challenging'];

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      padding: '2rem'
    }}>
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        width: '100%',
        animation: 'fadeIn 0.5s ease-in'
      }}>
        <style>
          {`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            .activity-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
              gap: 2rem;
              animation: fadeIn 0.6s ease-out;
            }
            
            .loading-skeleton {
              background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
              background-size: 200% 100%;
              animation: loading 1.5s infinite;
              border-radius: 12px;
            }
            
            @keyframes loading {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}
        </style>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            color: '#2c3e50', 
            marginBottom: '0.5rem',
            fontSize: '2.5rem',
            fontWeight: 'bold'
          }}>
            Discover Amazing Activities in Malawi
          </h1>
          <p style={{ 
            color: '#555', 
            marginBottom: '2rem', 
            fontSize: '1.1rem',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Click on any activity picture to start booking. Choose your days and number of people.
          </p>
        </div>
        
        <ActivityFilters
          categories={categories}
          regions={regions}
          difficulties={difficulties}
          selectedCategory={selectedCategory}
          selectedRegion={selectedRegion}
          selectedDifficulty={selectedDifficulty}
          onCategoryChange={setSelectedCategory}
          onRegionChange={setSelectedRegion}
          onDifficultyChange={setSelectedDifficulty}
        />
        
        {loading ? (
          <div className="activity-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="loading-skeleton" style={{ height: '420px' }}></div>
            ))}
          </div>
        ) : (
          <div className="activity-grid">
            {filteredActivities.map((activity, index) => (
              <div
                key={activity._id}
                style={{
                  animation: `fadeIn 0.5s ease-out ${index * 0.05}s both`
                }}
              >
                <ActivityCard activity={activity} />
              </div>
            ))}
          </div>
        )}
        
        {filteredActivities.length === 0 && !loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: '#666',
            backgroundColor: 'white',
            borderRadius: '12px',
            marginTop: '2rem'
          }}>
            No activities found. Try different filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityGallery;