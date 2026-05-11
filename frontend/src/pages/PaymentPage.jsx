import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const bankDetails = {
    bankName: 'National Bank of Malawi',
    accountName: 'Chimango Tour',
    accountNumber: '1006924529',
    branch: 'Lilongwe City Centre'
  };

  const mobileMoneyNumbers = {
    airtel: '0985489510',
    tnm: '0884183092'
  };

  // Exchange rate: 1 USD = 1800 MWK
  const exchangeRate = 1800;

  useEffect(() => {
    const storedData = sessionStorage.getItem('pendingPayment');
    
    if (storedData) {
      setBookingData(JSON.parse(storedData));
      setLoading(false);
    } else if (location.state?.bookingData) {
      setBookingData(location.state.bookingData);
      setLoading(false);
    } else {
      const params = new URLSearchParams(location.search);
      const bookingCode = params.get('bookingCode');
      if (bookingCode) {
        fetchBookingData(bookingCode);
      } else {
        setLoading(false);
      }
    }
  }, [location]);

  const fetchBookingData = async (bookingCode) => {
    try {
      const response = await fetch(`${API_URL}/api/custom-bookings/code/${bookingCode}`);
      const data = await response.json();
      if (data) {
        const booking = data;
        const paymentData = {
          bookingCode: booking.bookingCode,
          totalPrice: booking.totalPrice,
          personalDetails: booking.personalDetails,
          activityName: booking.selectedActivities?.[0]?.activity?.name || 'Activity',
          selectedDate: booking.selectedActivities?.[0]?.selectedDate,
          booking: booking
        };
        setBookingData(paymentData);
        sessionStorage.setItem('pendingPayment', JSON.stringify(paymentData));
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    if (!paymentReference) {
      alert('Please enter the payment reference number');
      return;
    }

    setSubmitting(true);

    try {
      let methodName = '';
      
      if (paymentMethod === 'bank') {
        methodName = 'National Bank Transfer';
      } else if (paymentMethod === 'airtel') {
        methodName = 'Airtel Money';
      } else {
        methodName = 'TNM Mpamba';
      }

      const paymentData = {
        bookingCode: bookingData.bookingCode,
        paymentMethod: methodName,
        paymentReference: paymentReference,
        amount: bookingData.totalPrice,
        amountMWK: Math.round(bookingData.totalPrice * exchangeRate),
        customerName: bookingData.personalDetails?.fullName,
        customerPhone: bookingData.personalDetails?.phone,
        customerEmail: bookingData.personalDetails?.email,
        activityName: bookingData.activityName,
        selectedDate: bookingData.selectedDate,
        status: 'pending'
      };

      await fetch(`${API_URL}/api/payment-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });
      
      alert(`✅ Payment request submitted successfully!\n\nBooking Code: ${bookingData.bookingCode}\nReference: ${paymentReference}\nAmount: MWK ${Math.round(bookingData.totalPrice * exchangeRate).toLocaleString()}\n\nYour booking is pending admin approval.`);
      
      sessionStorage.removeItem('pendingPayment');
      
      navigate('/booking-confirmation', { 
        state: { booking: bookingData.booking }
      });
      
    } catch (error) {
      console.error('Payment error:', error);
      alert(`Failed to submit payment: ${error.response?.data?.message || 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // PayChangu Payment Handler - MWK only
  const handlePayChanguPayment = () => {
    const amountMWK = Math.round(bookingData.totalPrice * exchangeRate);
    const paymentLink = "https://pay.paychangu.com/SC-CWC5T0";
    const paymentUrl = `${paymentLink}?amount=${amountMWK}&currency=MWK&description=Chimango%20Tour%20Booking%20${bookingData.bookingCode}`;
    
    console.log(`Redirecting to PayChangu with amount: MWK ${amountMWK.toLocaleString()}`);
    window.location.href = paymentUrl;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '5px solid #f3f3f3', 
          borderTop: '5px solid #e67e22', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }} />
        <h2>Loading payment details...</h2>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>No booking information found</h2>
        <p>Please complete your booking first.</p>
        <button onClick={() => navigate('/activities')} style={{ padding: '10px 20px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Back to Activities
        </button>
      </div>
    );
  }

  const amountMWK = Math.round(bookingData.totalPrice * exchangeRate);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f2f5', 
      padding: '40px 20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        maxWidth: '500px', 
        width: '100%',
        padding: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '10px', textAlign: 'center' }}>Complete Your Payment</h2>
        
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0 }}><strong>Booking Code:</strong> {bookingData.bookingCode}</p>
          <p style={{ margin: '5px 0 0' }}><strong>Amount (USD):</strong> <span style={{ color: '#e67e22', fontSize: '24px', fontWeight: 'bold' }}>USD {bookingData.totalPrice}</span></p>
          <p style={{ margin: '5px 0 0' }}><strong>Amount (MWK):</strong> <span style={{ color: '#2c3e50', fontSize: '18px', fontWeight: 'bold' }}>MWK {amountMWK.toLocaleString()}</span></p>
          <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#666' }}>Activity: {bookingData.activityName}</p>
        </div>

        <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>Select Payment Method:</h3>

        {/* PayChangu Option - MWK only */}
        <div 
          onClick={() => setPaymentMethod('paychangu')}
          style={{
            border: paymentMethod === 'paychangu' ? '2px solid #e67e22' : '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '15px',
            cursor: 'pointer',
            backgroundColor: paymentMethod === 'paychangu' ? '#fff8f0' : 'white'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="radio" checked={paymentMethod === 'paychangu'} readOnly />
            <span style={{ fontWeight: 'bold' }}>💳 PayChangu (Card/Mobile Money) - MWK only</span>
          </div>
          {paymentMethod === 'paychangu' && (
            <div style={{ marginTop: '15px' }}>
              <button
                onClick={handlePayChanguPayment}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#e67e22',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Pay MWK {amountMWK.toLocaleString()} with PayChangu
              </button>
            </div>
          )}
        </div>

        {/* Airtel Money - MWK only */}
        <div 
          onClick={() => setPaymentMethod('airtel')}
          style={{
            border: paymentMethod === 'airtel' ? '2px solid #e67e22' : '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '15px',
            cursor: 'pointer',
            backgroundColor: paymentMethod === 'airtel' ? '#fff8f0' : 'white'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="radio" checked={paymentMethod === 'airtel'} readOnly />
            <span style={{ fontWeight: 'bold' }}>📱 Airtel Money</span>
          </div>
          {paymentMethod === 'airtel' && (
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <p><strong>Send payment to:</strong> <span style={{ color: '#e67e22', fontSize: '18px' }}>{mobileMoneyNumbers.airtel}</span></p>
              <p><strong>Reference:</strong> {bookingData.bookingCode}</p>
              <p><strong>Amount:</strong> MWK {amountMWK.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* TNM Mpamba - MWK only */}
        <div 
          onClick={() => setPaymentMethod('tnm')}
          style={{
            border: paymentMethod === 'tnm' ? '2px solid #e67e22' : '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '15px',
            cursor: 'pointer',
            backgroundColor: paymentMethod === 'tnm' ? '#fff8f0' : 'white'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="radio" checked={paymentMethod === 'tnm'} readOnly />
            <span style={{ fontWeight: 'bold' }}>📱 TNM Mpamba</span>
          </div>
          {paymentMethod === 'tnm' && (
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <p><strong>Send payment to:</strong> <span style={{ color: '#e67e22', fontSize: '18px' }}>{mobileMoneyNumbers.tnm}</span></p>
              <p><strong>Reference:</strong> {bookingData.bookingCode}</p>
              <p><strong>Amount:</strong> MWK {amountMWK.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* National Bank - MWK only */}
        <div 
          onClick={() => setPaymentMethod('bank')}
          style={{
            border: paymentMethod === 'bank' ? '2px solid #e67e22' : '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            cursor: 'pointer',
            backgroundColor: paymentMethod === 'bank' ? '#fff8f0' : 'white'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="radio" checked={paymentMethod === 'bank'} readOnly />
            <span style={{ fontWeight: 'bold' }}>🏦 National Bank Transfer</span>
          </div>
          {paymentMethod === 'bank' && (
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <p><strong>Bank:</strong> {bankDetails.bankName}</p>
              <p><strong>Account Name:</strong> {bankDetails.accountName}</p>
              <p><strong>Account Number:</strong> <span style={{ color: '#e67e22' }}>{bankDetails.accountNumber}</span></p>
              <p><strong>Branch:</strong> {bankDetails.branch}</p>
              <p><strong>Reference:</strong> {bookingData.bookingCode}</p>
              <p><strong>Amount:</strong> MWK {amountMWK.toLocaleString()}</p>
            </div>
          )}
        </div>

        {paymentMethod && paymentMethod !== 'paychangu' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Payment Reference / Transaction ID:</label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Enter the reference number from your payment"
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
            />
            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
              Enter the transaction reference number you received after payment
            </small>
          </div>
        )}

        <div style={{ backgroundColor: '#d4edda', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#155724' }}>Instructions:</h4>
          <ol style={{ margin: '0', paddingLeft: '20px', color: '#155724', fontSize: '13px' }}>
            <li>Make payment of <strong>MWK {amountMWK.toLocaleString()}</strong> using your selected method</li>
            <li>For PayChangu, you will be redirected to complete payment in MWK</li>
            <li>For other methods, enter the transaction reference number after payment</li>
            <li>Click "Submit Payment" (or "Pay with PayChangu")</li>
            <li>Your booking will be confirmed after payment verification</li>
          </ol>
        </div>

        {paymentMethod && paymentMethod !== 'paychangu' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => navigate('/activities')}
              style={{ 
                flex: 1, 
                padding: '12px', 
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
              onClick={handleSubmit} 
              disabled={submitting || !paymentMethod || !paymentReference}
              style={{ 
                flex: 1, 
                padding: '12px', 
                backgroundColor: '#e67e22', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: (!paymentMethod || !paymentReference || submitting) ? 'not-allowed' : 'pointer',
                opacity: (!paymentMethod || !paymentReference || submitting) ? 0.6 : 1
              }}
            >
              {submitting ? 'Processing...' : 'Submit Payment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;