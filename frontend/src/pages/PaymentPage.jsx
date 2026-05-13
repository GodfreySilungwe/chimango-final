import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import './PaymentPage.css';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState('');

  const bankDetails = {
    bankName: 'National Bank of Malawi',
    accountName: 'Chimango Tour',
    accountNumber: '1006924529',
    branch: 'Lilongwe City Centre',
    swiftCode: 'NBMAMWMW'
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
          activityName: booking.selectedActivities?.[0]?.activity?.name || booking.selectedActivities?.[0]?.activity || 'Activity',
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
      } else if (paymentMethod === 'tnm') {
        methodName = 'TNM Mpamba';
      } else {
        methodName = selectedWallet === 'airtel' ? 'Airtel Money' : 'TNM Mpamba';
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

  // PayChangu Payment Handler
  const handlePayChanguPayment = () => {
    const amountMWK = Math.round(bookingData.totalPrice * exchangeRate);
    const paymentLink = "https://pay.paychangu.com/SC-CWC5T0";
    const paymentUrl = `${paymentLink}?amount=${amountMWK}&currency=MWK&description=Chimango%20Tour%20Booking%20${bookingData.bookingCode}`;
    
    console.log(`Redirecting to PayChangu with amount: MWK ${amountMWK.toLocaleString()}`);
    window.location.href = paymentUrl;
  };

  if (loading) {
    return (
      <div className="payment-loading">
        <div className="loading-spinner"></div>
        <h2>Loading payment details...</h2>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="payment-error">
        <div className="error-icon">🔍</div>
        <h2>No booking information found</h2>
        <p>Please complete your booking first.</p>
        <button onClick={() => navigate('/activities')} className="btn-back">
          Browse Activities →
        </button>
      </div>
    );
  }

  const amountMWK = Math.round(bookingData.totalPrice * exchangeRate);

  return (
    <div className="payment-page">
      <div className="payment-container">
        {/* Header */}
        <div className="payment-header">
          <div className="payment-icon">💳</div>
          <h1 className="payment-title">Complete Your <span className="highlight">Payment</span></h1>
          <p className="payment-subtitle">Secure payment to confirm your booking</p>
        </div>

        {/* Booking Summary */}
        <div className="booking-summary">
          <h3 className="summary-title">Booking Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Booking Code</span>
              <span className="summary-value">{bookingData.bookingCode}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Activity</span>
              <span className="summary-value">{bookingData.activityName}</span>
            </div>
            {bookingData.selectedDate && (
              <div className="summary-item">
                <span className="summary-label">Travel Date</span>
                <span className="summary-value">{new Date(bookingData.selectedDate).toLocaleDateString()}</span>
              </div>
            )}
            <div className="summary-item">
              <span className="summary-label">Customer</span>
              <span className="summary-value">{bookingData.personalDetails?.fullName}</span>
            </div>
          </div>
        </div>

        {/* Amount Display */}
        <div className="amount-display">
          <div className="amount-card">
            <div className="amount-label">Amount to Pay (USD)</div>
            <div className="amount-value">${bookingData.totalPrice}</div>
          </div>
          <div className="amount-card amount-card-mwk">
            <div className="amount-label">Amount to Pay (MWK)</div>
            <div className="amount-value">{amountMWK.toLocaleString()} MWK</div>
            <div className="amount-note">*Exchange rate: 1 USD = {exchangeRate} MWK</div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="payment-methods">
          <h3 className="section-title">Select Payment Method</h3>
          
          {/* PayChangu Option */}
          <div 
            className={`payment-option ${paymentMethod === 'paychangu' ? 'selected' : ''}`}
            onClick={() => setPaymentMethod('paychangu')}
          >
            <div className="payment-option-header">
              <input 
                type="radio" 
                checked={paymentMethod === 'paychangu'} 
                onChange={() => setPaymentMethod('paychangu')}
              />
              <div className="payment-option-icon">💳</div>
              <div className="payment-option-info">
                <span className="payment-option-title">PayChangu</span>
                <span className="payment-option-desc">Card, Mobile Money, or Bank Transfer</span>
              </div>
            </div>
            {paymentMethod === 'paychangu' && (
              <div className="payment-option-details">
                <div className="payment-instructions">
                  <p>✓ Instant payment processing</p>
                  <p>✓ Multiple payment options</p>
                  <p>✓ Secure checkout</p>
                </div>
                <button className="btn-paychangu" onClick={handlePayChanguPayment}>
                  Pay MWK {amountMWK.toLocaleString()} → 
                </button>
              </div>
            )}
          </div>

          {/* Airtel Money Option */}
          <div 
            className={`payment-option ${paymentMethod === 'airtel' ? 'selected' : ''}`}
            onClick={() => setPaymentMethod('airtel')}
          >
            <div className="payment-option-header">
              <input 
                type="radio" 
                checked={paymentMethod === 'airtel'} 
                onChange={() => setPaymentMethod('airtel')}
              />
              <div className="payment-option-icon">📱</div>
              <div className="payment-option-info">
                <span className="payment-option-title">Airtel Money</span>
                <span className="payment-option-desc">Pay using Airtel Money wallet</span>
              </div>
            </div>
            {paymentMethod === 'airtel' && (
              <div className="payment-option-details">
                <div className="payment-instructions">
                  <p>Send payment to Airtel Money number:</p>
                  <div className="payment-number">{mobileMoneyNumbers.airtel}</div>
                  <p><strong>Amount:</strong> MWK {amountMWK.toLocaleString()}</p>
                  <p><strong>Reference:</strong> {bookingData.bookingCode}</p>
                </div>
              </div>
            )}
          </div>

          {/* TNM Mpamba Option */}
          <div 
            className={`payment-option ${paymentMethod === 'tnm' ? 'selected' : ''}`}
            onClick={() => setPaymentMethod('tnm')}
          >
            <div className="payment-option-header">
              <input 
                type="radio" 
                checked={paymentMethod === 'tnm'} 
                onChange={() => setPaymentMethod('tnm')}
              />
              <div className="payment-option-icon">📱</div>
              <div className="payment-option-info">
                <span className="payment-option-title">TNM Mpamba</span>
                <span className="payment-option-desc">Pay using TNM Mpamba wallet</span>
              </div>
            </div>
            {paymentMethod === 'tnm' && (
              <div className="payment-option-details">
                <div className="payment-instructions">
                  <p>Send payment to TNM Mpamba number:</p>
                  <div className="payment-number">{mobileMoneyNumbers.tnm}</div>
                  <p><strong>Amount:</strong> MWK {amountMWK.toLocaleString()}</p>
                  <p><strong>Reference:</strong> {bookingData.bookingCode}</p>
                </div>
              </div>
            )}
          </div>

          {/* Bank Transfer Option */}
          <div 
            className={`payment-option ${paymentMethod === 'bank' ? 'selected' : ''}`}
            onClick={() => setPaymentMethod('bank')}
          >
            <div className="payment-option-header">
              <input 
                type="radio" 
                checked={paymentMethod === 'bank'} 
                onChange={() => setPaymentMethod('bank')}
              />
              <div className="payment-option-icon">🏦</div>
              <div className="payment-option-info">
                <span className="payment-option-title">Bank Transfer (MWK)</span>
                <span className="payment-option-desc">National Bank of Malawi</span>
              </div>
            </div>
            {paymentMethod === 'bank' && (
              <div className="payment-option-details">
                <div className="bank-details">
                  <div className="bank-row">
                    <span className="bank-label">Bank Name:</span>
                    <span className="bank-value">{bankDetails.bankName}</span>
                  </div>
                  <div className="bank-row">
                    <span className="bank-label">Account Name:</span>
                    <span className="bank-value">{bankDetails.accountName}</span>
                  </div>
                  <div className="bank-row">
                    <span className="bank-label">Account Number:</span>
                    <span className="bank-value bank-highlight">{bankDetails.accountNumber}</span>
                  </div>
                  <div className="bank-row">
                    <span className="bank-label">Branch:</span>
                    <span className="bank-value">{bankDetails.branch}</span>
                  </div>
                  <div className="bank-row">
                    <span className="bank-label">Swift Code:</span>
                    <span className="bank-value">{bankDetails.swiftCode}</span>
                  </div>
                </div>
                <div className="payment-instructions">
                  <p><strong>Amount:</strong> MWK {amountMWK.toLocaleString()}</p>
                  <p><strong>Reference:</strong> {bookingData.bookingCode}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Reference Input (for non-PayChangu methods) */}
        {paymentMethod && paymentMethod !== 'paychangu' && (
          <div className="reference-section">
            <label className="reference-label">Transaction Reference Number</label>
            <input
              type="text"
              className="reference-input"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Enter the transaction reference from your payment"
            />
            <p className="reference-hint">
              This reference number helps us verify your payment quickly
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {paymentMethod && paymentMethod !== 'paychangu' && (
          <div className="action-buttons">
            <button 
              className="btn-cancel"
              onClick={() => navigate('/activities')}
            >
              Cancel
            </button>
            <button 
              className="btn-submit"
              onClick={handleSubmit} 
              disabled={submitting || !paymentReference}
            >
              {submitting ? 'Processing...' : 'Submit Payment →'}
            </button>
          </div>
        )}

        {/* Security Notice */}
        <div className="security-notice">
          <span className="security-icon">🔒</span>
          <div>
            <strong>Secure Payment</strong>
            <p>Your payment information is encrypted and secure. We never store your payment details.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;