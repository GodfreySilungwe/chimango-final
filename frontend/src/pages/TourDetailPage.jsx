import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numTravelers, setNumTravelers] = useState(1);
  const [travelDate, setTravelDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchTour();
  }, [id]);

  const fetchTour = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/tours/${id}`);
      setTour(res.data);
      if (res.data.startDate) {
        setTravelDate(res.data.startDate.split('T')[0]);
      }
    } catch (error) {
      console.error('Error fetching tour:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
  if (!user) {
    navigate('/login');
    return;
  }
  
  setBookingLoading(true);
  try {
    console.log('User object:', user); // Debug: see what user contains
    
    await axios.post('http://localhost:5000/api/bookings', {
      userId: user.id,  // Make sure this is user.id (not user._id)
      tourId: id,
      travelDate,
      numTravelers,
      promoCode: ''
    });
    
    alert('✅ Booking confirmed! Check your bookings page.');
    navigate('/bookings');
  } catch (error) {
    console.error('Booking error:', error);
    alert(error.response?.data?.message || 'Booking failed. Please try again.');
  } finally {
    setBookingLoading(false);
  }
};
  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tour details...</div>;
  if (!tour) return <div style={{ padding: '2rem', textAlign: 'center' }}>Tour not found</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem', cursor: 'pointer' }}>← Back</button>
      
      <h1 style={{ color: '#2c3e50' }}>{tour.name}</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        <div>
          <p style={{ fontSize: '1.2rem', color: '#e74c3c' }}>📍 {tour.destination}</p>
          <p>⏱️ {tour.durationDays} days</p>
          
          <div style={{ margin: '2rem 0' }}>
            <h3>📋 Itinerary</h3>
            <p style={{ lineHeight: '1.6' }}>{tour.itineraryText || 'Full itinerary will be provided upon booking.'}</p>
          </div>
          
          <div style={{ margin: '2rem 0' }}>
            <h3>✅ What's Included</h3>
            <p>{tour.included || 'Contact us for details.'}</p>
          </div>
          
          <div style={{ margin: '2rem 0' }}>
            <h3>❌ Not Included</h3>
            <p>{tour.notIncluded || 'Contact us for details.'}</p>
          </div>
        </div>
        
        <div style={{ 
          border: '2px solid #3498db', 
          borderRadius: '8px', 
          padding: '1.5rem', 
          backgroundColor: '#f8f9fa',
          position: 'sticky',
          top: '1rem',
          height: 'fit-content'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>Book This Tour</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#e67e22', margin: '0 0 1rem 0' }}>
            ${tour.price} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/ person</span>
          </p>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Travel Date:</label>
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              min={tour.startDate?.split('T')[0]}
              max={tour.endDate?.split('T')[0]}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Number of Travelers:</label>
            <input
              type="number"
              min="1"
              max={tour.maxCapacity}
              value={numTravelers}
              onChange={(e) => setNumTravelers(parseInt(e.target.value))}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
            <strong>Total Price: ${(tour.price * numTravelers).toFixed(2)}</strong>
          </div>
          
          <button
            onClick={handleBooking}
            disabled={bookingLoading}
            style={{ 
              width: '100%', 
              backgroundColor: '#e67e22', 
              color: 'white', 
              border: 'none', 
              padding: '0.75rem', 
              borderRadius: '4px', 
              cursor: 'pointer', 
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            {bookingLoading ? 'Processing...' : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourDetailPage;