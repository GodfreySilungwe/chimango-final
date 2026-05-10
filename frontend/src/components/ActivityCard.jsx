import { useState } from 'react';
import ImageGalleryModal from './ImageGalleryModal';
import { getImageUrl } from '../config';

const ActivityCard = ({ activity, onBookClick }) => {
  const [showGallery, setShowGallery] = useState(false);

  const handleCardClick = () => {
    onBookClick(activity);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    setShowGallery(true);
  };

  const handleBookClick = (e) => {
    e.stopPropagation();
    onBookClick(activity);
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="activity-card"
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
        onMouseEnter={(e) => {
          if (window.matchMedia('(hover: hover)').matches) {
            e.currentTarget.style.transform = 'scale(1.03)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }}
      >
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img 
            src={getImageUrl(activity.mainImage)} 
            alt={activity.name}
            onClick={handleImageClick}
            className="activity-card-image"
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (window.matchMedia('(hover: hover)').matches) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'; }}
          />
        </div>
        <div className="activity-card-content" style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 className="activity-card-title" style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontSize: 'clamp(16px, 4vw, 18px)' }}>{activity.name}</h3>
          <p style={{ color: '#e74c3c', margin: '0 0 0.5rem 0', fontSize: 'clamp(12px, 3vw, 14px)' }}>📍 {activity.location}</p>
          <p style={{ color: '#666', fontSize: 'clamp(12px, 3vw, 14px)', marginBottom: '0.5rem', flex: 1 }}>
            {activity.description?.substring(0, 80)}...
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap', gap: '10px' }}>
            <span className="activity-card-price" style={{ fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: 'bold', color: '#e67e22' }}>
              USD {activity.pricePerDay}
            </span>
            <button
              onClick={handleBookClick}
              className="view-details-btn"
              style={{
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
                fontSize: 'clamp(12px, 3vw, 14px)',
                minHeight: '36px'
              }}
              onMouseEnter={(e) => {
                if (window.matchMedia('(hover: hover)').matches) {
                  e.currentTarget.style.backgroundColor = '#2980b9';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3498db';
              }}
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      {showGallery && (
        <ImageGalleryModal
          activity={activity}
          onClose={() => setShowGallery(false)}
        />
      )}
    </>
  );
};

export default ActivityCard;