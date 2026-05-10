import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const BookingModal = ({ activity, onClose }) => {
  const { user } = useAuth();
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const totalPrice = (activity.pricePerDay * numberOfDays) + (activity.pricePerPerson * numberOfPeople);

  const handleBooking = async () => {
    if (!user) {
      alert('Please login to book activities');
      onClose();
      window.location.href = '/login';
      return;
    }

    if (!selectedDate) {
      alert('Please select a date');
      return;
    }

    setIsBooking(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/custom-bookings', {
        userId: user.id,
        selectedActivities: [{
          activity: activity._id,
          numberOfDays,
          numberOfPeople,
          totalPrice: (activity.pricePerDay * numberOfDays) + (activity.pricePerPerson * numberOfPeople),
          selectedDate
        }],
        totalPrice,
        specialRequests: ''
      });
      
      setBookingSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.href = '/my-bookings';
      }, 2000);
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div
      style={{
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
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          maxWidth: '500px',
          width: '90%',
          padding: '2rem',
          animation: 'slideUp 0.3s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(50px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>
        
        
        {bookingSuccess ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>✓</div>
            <h2>Booking Confirmed!</h2>
            <p>Redirecting to your bookings...</p>
          </div>
        ) : (
          <>
            <h2 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>Book Activity</h2>
            <h3 style={{ color: '#e67e22', marginBottom: '1.5rem' }}>{activity.name}</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Number of Days:
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={numberOfDays}
                onChange={(e) => setNumberOfDays(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
              <small>MK {activity.pricePerDay.toLocaleString()} per day</small>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Number of People:
              </label>
              <input
                type="number"
                min={activity.minPeople}
                max={activity.maxPeople}
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
              <small>MK {activity.pricePerPerson.toLocaleString()} per person (min {activity.minPeople})</small>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Select Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
            
            <div style={{ 
  marginBottom: '1.5rem', 
  padding: '1rem', 
  backgroundColor: '#f8f9fa', 
  borderRadius: '8px',
  textAlign: 'center'
}}>
  <span style={{ fontSize: '14px', color: '#666' }}>Total Price:</span>
  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#e67e22' }}>
    MK {totalPrice.toLocaleString()}
  </div>
</div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBooking}
                disabled={isBooking}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  opacity: isBooking ? 0.7 : 1
                }}
              >
                {isBooking ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingModal;