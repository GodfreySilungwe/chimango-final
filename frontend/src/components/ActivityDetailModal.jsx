import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import ImageGalleryModal from './ImageGalleryModal';

const ActivityDetailModal = ({ activity, onClose, user }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('details');
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [nationality, setNationality] = useState('international');
  const [airportPickup, setAirportPickup] = useState(false);
  const [flightNumber, setFlightNumber] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInternationalConfirm, setShowInternationalConfirm] = useState(false);
  const [showFullGallery, setShowFullGallery] = useState(false);
  const [personalDetails, setPersonalDetails] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    passportNumber: '',
    emergencyContact: '',
    specialRequests: ''
  });

  const allImages = activity.images && activity.images.length > 0 
    ? [activity.mainImage, ...activity.images] 
    : [activity.mainImage];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const totalPrice = (activity.pricePerDay * numberOfDays) + 
                     (activity.pricePerPerson * numberOfPeople) + 
                     (airportPickup ? 7.50 : 0);

  const handleBookClick = () => {
    setShowBookingForm(true);
    setActiveTab('trip');
  };

  const saveBookingToDatabase = async () => {
    const newBookingCode = 'CHM-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    const bookingData = {
      userId: user.id,
      selectedActivities: [{
        activity: activity._id,
        numberOfDays,
        numberOfPeople,
        totalPrice: totalPrice,
        selectedDate: new Date(selectedDate)
      }],
      totalPrice: totalPrice,
      specialRequests: personalDetails.specialRequests,
      airportPickup,
      flightNumber: flightNumber,
      arrivalTime: arrivalTime,
      personalDetails: {
        fullName: personalDetails.fullName,
        email: personalDetails.email,
        phone: personalDetails.phone,
        passportNumber: personalDetails.passportNumber,
        emergencyContact: personalDetails.emergencyContact
      },
      bookingCode: newBookingCode,
      nationality: nationality,
      paymentMethod: nationality === 'international' ? 'pay_on_arrival' : null
    };

    const response = await axios.post(`${API_URL}/api/custom-bookings`, bookingData);
    return {
      booking: response.data.booking || response.data,
      bookingCode: newBookingCode,
      totalPrice: totalPrice
    };
  };

  const handleInternationalBooking = async () => {
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }

    if (!personalDetails.fullName || !personalDetails.email) {
      alert('Please fill in Full Name and Email');
      return;
    }

    if (!personalDetails.passportNumber) {
      alert('Passport number is required for international customers');
      return;
    }

    if (airportPickup && (!flightNumber || !arrivalTime)) {
      alert('Please provide flight number and arrival time for airport pickup');
      return;
    }

    setIsSubmitting(true);

    try {
      const newBookingCode = 'CHM-' + Math.random().toString(36).substring(2, 10).toUpperCase();

      const bookingData = {
        userId: user.id,
        selectedActivities: [{
          activity: activity._id,
          numberOfDays,
          numberOfPeople,
          totalPrice: totalPrice,
          selectedDate: new Date(selectedDate)
        }],
        totalPrice: totalPrice,
        specialRequests: personalDetails.specialRequests,
        airportPickup,
        flightNumber: flightNumber,
        arrivalTime: arrivalTime,
        personalDetails: {
          fullName: personalDetails.fullName,
          email: personalDetails.email,
          phone: personalDetails.phone,
          passportNumber: personalDetails.passportNumber,
          emergencyContact: personalDetails.emergencyContact
        },
        bookingCode: newBookingCode,
        nationality: nationality,
        paymentMethod: 'pay_on_arrival'
      };

      const responsePromise = axios.post(`${API_URL}/api/custom-bookings`, bookingData);
      
      setShowInternationalConfirm(false);
      setShowBookingForm(false);
      
      window.location.href = `/booking-confirmation?bookingCode=${newBookingCode}`;
      
      responsePromise.catch(error => {
        console.error('Background booking error:', error);
      });
      
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleMalawianBooking = async () => {
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }

    if (!personalDetails.fullName || !personalDetails.email) {
      alert('Please fill in Full Name and Email');
      return;
    }

    if (!personalDetails.phone) {
      alert('Phone number is required for Malawian customers');
      return;
    }

    if (airportPickup && (!flightNumber || !arrivalTime)) {
      alert('Please provide flight number and arrival time for airport pickup');
      return;
    }

    setIsSubmitting(true);

    try {
      const newBookingCode = 'CHM-' + Math.random().toString(36).substring(2, 10).toUpperCase();

      const bookingData = {
        userId: user.id,
        selectedActivities: [{
          activity: activity._id,
          numberOfDays,
          numberOfPeople,
          totalPrice: totalPrice,
          selectedDate: new Date(selectedDate)
        }],
        totalPrice: totalPrice,
        specialRequests: personalDetails.specialRequests,
        airportPickup,
        flightNumber: flightNumber,
        arrivalTime: arrivalTime,
        personalDetails: {
          fullName: personalDetails.fullName,
          email: personalDetails.email,
          phone: personalDetails.phone,
          passportNumber: personalDetails.passportNumber,
          emergencyContact: personalDetails.emergencyContact
        },
        bookingCode: newBookingCode,
        nationality: nationality,
        paymentMethod: null
      };

      const response = await axios.post(`${API_URL}/api/custom-bookings`, bookingData);
      
      const paymentData = {
        bookingCode: newBookingCode,
        totalPrice: totalPrice,
        personalDetails: {
          fullName: personalDetails.fullName,
          phone: personalDetails.phone,
          email: personalDetails.email
        },
        activityName: activity.name,
        selectedDate: selectedDate,
        booking: response.data.booking || response.data
      };
      
      sessionStorage.setItem('pendingPayment', JSON.stringify(paymentData));
      
      setShowBookingForm(false);
      window.location.href = `/payment?bookingCode=${newBookingCode}`;
      
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleSubmitBooking = () => {
    if (!user || !user.id) {
      alert('Please login to complete your booking');
      const pendingBookingData = {
        activityId: activity._id,
        activityName: activity.name,
        numberOfDays,
        numberOfPeople,
        selectedDate,
        airportPickup,
        flightNumber,
        arrivalTime,
        nationality,
        personalDetails,
        totalPrice
      };
      sessionStorage.setItem('pendingBooking', JSON.stringify(pendingBookingData));
      window.location.href = `/login?redirect=booking`;
      return;
    }
    
    if (nationality === 'international') {
      setShowInternationalConfirm(true);
    } else {
      handleMalawianBooking();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.95)',
      zIndex: 2000,
      overflowY: 'auto',
    }} onClick={onClose}>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        minHeight: '100vh',
        position: 'relative',
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: '#e74c3c',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          fontSize: '20px',
          cursor: 'pointer',
          zIndex: 10,
        }}>✕</button>

        {/* Image Gallery */}
        <div style={{ position: 'relative', height: '450px', backgroundColor: '#1a1a2e' }}>
          <img 
            src={allImages[currentImageIndex]} 
            alt={activity.name}
            onClick={() => setShowFullGallery(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              cursor: 'pointer'
            }}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/1200x450?text=Image+Not+Found'; }}
          />
          
          {allImages.length > 1 && (
            <>
              <button onClick={prevImage} style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                fontSize: '24px',
                cursor: 'pointer',
              }}>❮</button>
              <button onClick={nextImage} style={{
                position: 'absolute',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                fontSize: '24px',
                cursor: 'pointer',
              }}>❯</button>
            </>
          )}
          
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '14px'
          }}>
            {currentImageIndex + 1} / {allImages.length}
          </div>
        </div>

        {/* Activity Info */}
        <div style={{ padding: '25px 30px 0' }}>
          <h1 style={{ color: '#2c3e50', marginBottom: '5px' }}>{activity.name}</h1>
          <p style={{ color: '#e74c3c', fontSize: '16px' }}>📍 {activity.location} | {activity.region}</p>
          
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', margin: '20px 0' }}>
            <span style={{ backgroundColor: '#f0f0f0', padding: '5px 15px', borderRadius: '20px', fontSize: '14px' }}>⏱️ {activity.durationHours} hours</span>
            <span style={{ backgroundColor: '#f0f0f0', padding: '5px 15px', borderRadius: '20px', fontSize: '14px' }}>👥 Min {activity.minPeople} people</span>
            <span style={{ backgroundColor: '#f0f0f0', padding: '5px 15px', borderRadius: '20px', fontSize: '14px' }}>🎯 Difficulty: {activity.difficulty}</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ padding: '0 30px' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
            <button onClick={() => setActiveTab('details')} style={{ padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: activeTab === 'details' ? '3px solid #e67e22' : 'none', cursor: 'pointer', fontWeight: activeTab === 'details' ? 'bold' : 'normal', color: activeTab === 'details' ? '#e67e22' : '#666' }}>📖 Description</button>
            <button onClick={() => setActiveTab('whatToBring')} style={{ padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: activeTab === 'whatToBring' ? '3px solid #e67e22' : 'none', cursor: 'pointer', fontWeight: activeTab === 'whatToBring' ? 'bold' : 'normal', color: activeTab === 'whatToBring' ? '#e67e22' : '#666' }}>🎒 What to Bring</button>
            <button onClick={() => setActiveTab('meetingPoint')} style={{ padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: activeTab === 'meetingPoint' ? '3px solid #e67e22' : 'none', cursor: 'pointer', fontWeight: activeTab === 'meetingPoint' ? 'bold' : 'normal', color: activeTab === 'meetingPoint' ? '#e67e22' : '#666' }}>📍 Meeting Point</button>
          </div>

          {activeTab === 'details' && <div style={{ lineHeight: '1.8', color: '#555', marginBottom: '30px' }}><p>{activity.description}</p></div>}
          {activeTab === 'whatToBring' && <div style={{ marginBottom: '30px' }}><ul style={{ marginLeft: '20px', lineHeight: '1.8', color: '#555' }}>{activity.whatToBring?.map((item, idx) => <li key={idx}>{item}</li>)}</ul></div>}
          {activeTab === 'meetingPoint' && <div style={{ marginBottom: '30px', lineHeight: '1.8', color: '#555' }}><p>{activity.meetingPoint || 'Information provided after booking'}</p></div>}
        </div>

        {/* Price and Book Button */}
        <div style={{ padding: '20px 30px', backgroundColor: '#f8f9fa', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <span style={{ fontSize: '14px', color: '#666' }}>Price</span>
            <div><span style={{ fontSize: '32px', fontWeight: 'bold', color: '#e67e22' }}>USD {activity.pricePerDay}</span><span style={{ fontSize: '14px', color: '#666' }}> / day</span></div>
            <div><span style={{ fontSize: '14px', color: '#666' }}>+ USD {activity.pricePerPerson} per person</span></div>
          </div>
          <button onClick={handleBookClick} style={{ backgroundColor: '#e67e22', color: 'white', border: 'none', padding: '14px 40px', borderRadius: '50px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>Book Now</button>
        </div>

        {/* Booking Form Modal */}
        {showBookingForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2100, overflowY: 'auto' }} onClick={() => setShowBookingForm(false)}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', maxWidth: '600px', width: '90%', maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
              
              <div style={{ background: 'linear-gradient(135deg, #2c3e50, #3498db)', color: 'white', padding: '20px', textAlign: 'center' }}>
                <h3 style={{ margin: 0 }}>Complete Your Booking</h3>
                <p style={{ margin: '5px 0 0', opacity: 0.9, fontSize: '14px' }}>{activity.name}</p>
              </div>

              <div style={{ display: 'flex', borderBottom: '1px solid #ddd' }}>
                <button onClick={() => setActiveTab('trip')} style={{ flex: 1, padding: '15px', background: activeTab === 'trip' ? '#fff' : '#f8f9fa', border: 'none', borderBottom: activeTab === 'trip' ? '3px solid #e67e22' : 'none', cursor: 'pointer', fontWeight: activeTab === 'trip' ? 'bold' : 'normal', color: activeTab === 'trip' ? '#e67e22' : '#666' }}>📋 Trip Details</button>
                <button onClick={() => setActiveTab('personal')} style={{ flex: 1, padding: '15px', background: activeTab === 'personal' ? '#fff' : '#f8f9fa', border: 'none', borderBottom: activeTab === 'personal' ? '3px solid #e67e22' : 'none', cursor: 'pointer', fontWeight: activeTab === 'personal' ? 'bold' : 'normal', color: activeTab === 'personal' ? '#e67e22' : '#666' }}>👤 Personal Info</button>
                <button onClick={() => setActiveTab('summary')} style={{ flex: 1, padding: '15px', background: activeTab === 'summary' ? '#fff' : '#f8f9fa', border: 'none', borderBottom: activeTab === 'summary' ? '3px solid #e67e22' : 'none', cursor: 'pointer', fontWeight: activeTab === 'summary' ? 'bold' : 'normal', color: activeTab === 'summary' ? '#e67e22' : '#666' }}>💳 Summary</button>
              </div>

              <div style={{ padding: '25px' }}>
                {activeTab === 'trip' && (
                  <div>
                    <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Number of Days</label><input type="number" min="1" max="7" value={numberOfDays} onChange={(e) => setNumberOfDays(parseInt(e.target.value))} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} /></div>
                    <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Number of People</label><input type="number" min={activity.minPeople} max={activity.maxPeople} value={numberOfPeople} onChange={(e) => setNumberOfPeople(parseInt(e.target.value))} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} /></div>
                    <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Select Travel Date</label><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} /></div>
                    <div style={{ marginBottom: '20px' }}><label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}><input type="checkbox" checked={airportPickup} onChange={(e) => setAirportPickup(e.target.checked)} /><span>✈️ Add Airport Pickup Service <strong>(USD 7.50 extra)</strong></span></label></div>
                    {airportPickup && (
                      <div style={{ backgroundColor: '#f0f7ff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                        <div style={{ marginBottom: '10px' }}><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Flight Number</label><input type="text" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} placeholder="e.g., ET 1234" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }} /></div>
                        <div><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Arrival Time</label><input type="time" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }} /></div>
                      </div>
                    )}
                    <button onClick={() => setActiveTab('personal')} style={{ width: '100%', padding: '14px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>Continue →</button>
                  </div>
                )}

                {activeTab === 'personal' && (
                  <div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Customer Type</label>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px', border: nationality === 'international' ? '2px solid #3498db' : '1px solid #ddd', borderRadius: '8px', flex: 1, justifyContent: 'center' }}><input type="radio" value="international" checked={nationality === 'international'} onChange={(e) => setNationality(e.target.value)} /><span>🌍 International</span></label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px', border: nationality === 'malawian' ? '2px solid #3498db' : '1px solid #ddd', borderRadius: '8px', flex: 1, justifyContent: 'center' }}><input type="radio" value="malawian" checked={nationality === 'malawian'} onChange={(e) => setNationality(e.target.value)} /><span>🇲🇼 Malawian</span></label>
                      </div>
                    </div>
                    <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Full Name *</label><input type="text" value={personalDetails.fullName} onChange={(e) => setPersonalDetails({...personalDetails, fullName: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} /></div>
                    <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Email Address *</label><input type="email" value={personalDetails.email} onChange={(e) => setPersonalDetails({...personalDetails, email: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} /></div>
                    {nationality === 'malawian' && <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Phone Number *</label><input type="tel" value={personalDetails.phone} onChange={(e) => setPersonalDetails({...personalDetails, phone: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} /></div>}
                    {nationality === 'international' && (
                      <>
                        <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>WhatsApp / International Phone</label><input type="tel" value={personalDetails.phone} onChange={(e) => setPersonalDetails({...personalDetails, phone: e.target.value})} placeholder="Include country code (e.g., +1234567890)" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} /></div>
                        <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Passport Number *</label><input type="text" value={personalDetails.passportNumber} onChange={(e) => setPersonalDetails({...personalDetails, passportNumber: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} /></div>
                      </>
                    )}
                    <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', marginBottom: '8px' }}>Emergency Contact (Optional)</label><input type="text" value={personalDetails.emergencyContact} onChange={(e) => setPersonalDetails({...personalDetails, emergencyContact: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} /></div>
                    <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', marginBottom: '8px' }}>Special Requests (Optional)</label><textarea value={personalDetails.specialRequests} onChange={(e) => setPersonalDetails({...personalDetails, specialRequests: e.target.value})} rows="3" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} placeholder="Any special requirements..." /></div>
                    <div style={{ display: 'flex', gap: '10px' }}><button onClick={() => setActiveTab('trip')} style={{ flex: 1, padding: '14px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>← Back</button><button onClick={() => setActiveTab('summary')} style={{ flex: 1, padding: '14px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Continue →</button></div>
                  </div>
                )}

                {activeTab === 'summary' && (
                  <div>
                    <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>
                      <strong style={{ fontSize: '14px', color: '#666' }}>Total Amount</strong>
                      <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#e67e22' }}>USD {totalPrice.toLocaleString()}</div>
                      {airportPickup && <small>+ USD 7.50 for airport pickup</small>}
                    </div>
                    
                    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f4fd', borderRadius: '8px' }}>
                      <h4 style={{ margin: '0 0 10px 0' }}>📌 Booking Summary</h4>
                      <p><strong>Activity:</strong> {activity.name}</p>
                      <p><strong>Travel Date:</strong> {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Not selected'}</p>
                      <p><strong>Duration:</strong> {numberOfDays} day(s)</p>
                      <p><strong>Travelers:</strong> {numberOfPeople} person(s)</p>
                      <p><strong>Customer Type:</strong> {nationality === 'international' ? '🌍 International' : '🇲🇼 Malawian'}</p>
                      {airportPickup && <p><strong>Airport Pickup:</strong> Yes (Flight: {flightNumber || 'TBD'})</p>}
                    </div>
                    
                    {nationality === 'international' && (
                      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
                        <p style={{ margin: 0, color: '#856404' }}>💰 50% upfront payment required on arrival: <strong>USD {Math.round(totalPrice * 0.5)}</strong></p>
                      </div>
                    )}
                    
                    {/* PRICE SUMMARY WITH MWK FOR MALAWIAN */}
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                      <span style={{ fontSize: '14px', color: '#666' }}>Total Price:</span>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#e67e22' }}>
                        USD {totalPrice.toLocaleString()}
                      </div>
                      {nationality === 'malawian' && (
                        <div style={{ fontSize: '16px', color: '#2c3e50', marginTop: '5px' }}>
                          ≈ MWK {(totalPrice * 1800).toLocaleString()}
                        </div>
                      )}
                      {airportPickup && <small>+ USD 7.50 for airport pickup</small>}
                      {nationality === 'international' && (
                        <small style={{ display: 'block', marginTop: '5px' }}>※ 50% upfront payment required on arrival in USD</small>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => setActiveTab('personal')} style={{ flex: 1, padding: '14px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>← Back</button>
                      <button 
                        onClick={handleSubmitBooking}
                        disabled={isSubmitting}
                        style={{ 
                          flex: 1, 
                          padding: '14px', 
                          backgroundColor: nationality === 'international' ? '#3498db' : '#2ecc71', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '8px', 
                          cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          opacity: isSubmitting ? 0.7 : 1
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              border: '3px solid white',
                              borderTop: '3px solid transparent',
                              borderRadius: '50%',
                              animation: 'spin 0.8s linear infinite'
                            }} />
                            <span>Processing...</span>
                          </>
                        ) : (
                          nationality === 'international' ? 'CONFIRM & PAY ON ARRIVAL' : 'PROCEED TO PAYMENT'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* International Confirmation Modal */}
      {showInternationalConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2200 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', maxWidth: '450px', width: '90%', padding: '30px', textAlign: 'center' }}>
            <div style={{ width: '70px', height: '70px', backgroundColor: '#f39c12', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><span style={{ fontSize: '40px' }}>🌍</span></div>
            <h2>International Booking</h2>
            <div style={{ textAlign: 'left', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <h4 style={{ color: '#e67e22', marginBottom: '10px' }}>Payment Terms:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>💰 <strong>50% upfront payment</strong> required on arrival</li>
                <li>💵 Payment in <strong>USD only</strong></li>
                <li>⚖️ Balance payable before activity starts</li>
                <li>📋 Please bring your passport for verification</li>
              </ul>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => setShowInternationalConfirm(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { setShowInternationalConfirm(false); handleInternationalBooking(); }} style={{ flex: 1, padding: '12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Agree & Proceed</button>
            </div>
          </div>
        </div>
      )}

      {/* Full Gallery Modal */}
      {showFullGallery && (
        <ImageGalleryModal          activity={activity}
          onClose={() => setShowFullGallery(false)}
        />
      )}
    </div>
  );
};

export default ActivityDetailModal;