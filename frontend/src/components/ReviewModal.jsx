import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const ReviewModal = ({ activity, booking, onClose, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError('Please write a review comment');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      await axios.post(`${API_URL}/api/reviews`, {
        userId: user.id,
        activityId: activity._id,
        bookingId: booking._id,
        rating,
        comment
      });
      
      onReviewSubmitted();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '90%',
        padding: '2rem',
        animation: 'slideUp 0.3s ease'
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>Rate Your Experience</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>{activity.name}</p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Your Rating</label>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', fontSize: '32px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    cursor: 'pointer',
                    color: (hoverRating || rating) >= star ? '#f39c12' : '#ddd',
                    transition: 'color 0.2s ease'
                  }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              placeholder="Share your experience with this activity..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
          </div>
          
          {error && (
            <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '8px', marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#f39c12',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;