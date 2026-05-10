import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const PaymentModal = ({ bookingData, onClose, onPaymentConfirmed }) => {
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

  // Admin WhatsApp number (change to your admin number)
  const ADMIN_WHATSAPP = '0985489510';

  const handleCancel = () => {
    if (onClose) {
      onClose();
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
      let paymentNumber = '';
      let paymentInstructions = '';
      
      if (paymentMethod === 'bank') {
        methodName = 'National Bank Transfer';
        paymentNumber = bankDetails.accountNumber;
        paymentInstructions = `Bank: ${bankDetails.bankName}\nAccount: ${bankDetails.accountNumber}\nName: ${bankDetails.accountName}`;
      } else if (paymentMethod === 'airtel') {
        methodName = 'Airtel Money';
        paymentNumber = mobileMoneyNumbers.airtel;
        paymentInstructions = `Send to Airtel Money number: ${mobileMoneyNumbers.airtel}`;
      } else {
        methodName = 'TNM Mpamba';
        paymentNumber = mobileMoneyNumbers.tnm;
        paymentInstructions = `Send to TNM Mpamba number: ${mobileMoneyNumbers.tnm}`;
      }

      // Get activity name safely
      const activityName = bookingData?.selectedActivities?.[0]?.activity?.name || 
                          bookingData?.activityName || 
                          'Activity';

      // Prepare payment data for backend
      const paymentData = {
        bookingCode: bookingData.bookingCode,
        paymentMethod: methodName,
        paymentReference: paymentReference,
        amount: bookingData.totalPrice,
        customerName: bookingData.personalDetails?.fullName || bookingData.customerName,
        customerPhone: bookingData.personalDetails?.phone || bookingData.customerPhone,
        customerEmail: bookingData.personalDetails?.email,
        activityName: activityName,
        selectedDate: bookingData.selectedActivities?.[0]?.selectedDate || bookingData.selectedDate,
        status: 'pending'
      };

      console.log('Sending payment request:', paymentData);

      // Send to backend
      const response = await axios.post(`${API_URL}/api/payment-request`, paymentData);
      console.log('Payment request saved:', response.data);

      // Create WhatsApp message for admin (using simple text without special formatting)
      const message = 
        `🔔 NEW PAYMENT REQUEST - CHIMANGO TOUR 🔔\n\n` +
        `Booking Code: ${bookingData.bookingCode}\n` +
        `Customer Name: ${paymentData.customerName || 'N/A'}\n` +
        `Customer Phone: ${paymentData.customerPhone || 'N/A'}\n` +
        `Activity: ${activityName}\n` +
        `Amount: USD ${bookingData.totalPrice?.toLocaleString() || 0}\n` +
        `Payment Method: ${methodName}\n` +
        `Payment To: ${paymentNumber}\n` +
        `Reference Number: ${paymentReference}\n\n` +
        `Please verify this payment and confirm the booking.`;

      // Encode message for URL
      const encodedMessage = encodeURIComponent(message);
      
      // Open WhatsApp with admin number
      const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodedMessage}`;
      
      console.log('Opening WhatsApp URL:', whatsappUrl);
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');
      
      // Also copy to clipboard as backup
      await navigator.clipboard.writeText(message);
      
      alert(`✅ Payment request submitted!\n\nBooking Code: ${bookingData.bookingCode}\nReference: ${paymentReference}\n\nWhatsApp will open. Please send the message to complete verification.\n\nMessage has also been copied to clipboard.`);
      
      if (onPaymentConfirmed) {
        onPaymentConfirmed();
      }
      
      if (onClose) {
        onClose();
      }
      
    } catch (error) {
      console.error('Payment submission error:', error);
      console.error('Error response:', error.response?.data);
      alert(`Failed to submit: ${error.response?.data?.message || 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Get total price safely
  const totalPrice = bookingData?.totalPrice || 0;

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
      zIndex: 2000,
      overflowY: 'auto'
    }} onClick={handleCancel}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2rem'
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>Complete Payment</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Total Amount: <strong style={{ color: '#e67e22', fontSize: '20px' }}>USD {totalPrice.toLocaleString()}</strong>
        </p>
        <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
          Booking Code: <strong>{bookingData?.bookingCode}</strong>
        </p>

        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Select Payment Method:</h3>
          
          {/* Airtel Money */}
          <div style={{
            border: paymentMethod === 'airtel' ? '2px solid #e67e22' : '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '15px',
            cursor: 'pointer',
            backgroundColor: paymentMethod === 'airtel' ? '#fff8f0' : 'white'
          }} onClick={() => setPaymentMethod('airtel')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="radio" checked={paymentMethod === 'airtel'} readOnly />
              <span style={{ fontWeight: 'bold' }}>📱 Airtel Money</span>
            </div>
            {paymentMethod === 'airtel' && (
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <p><strong>Send payment to:</strong> <strong style={{ color: '#e67e22', fontSize: '18px' }}>{mobileMoneyNumbers.airtel}</strong></p>
                <p><strong>Reference:</strong> {bookingData?.bookingCode}</p>
                <p><strong>Amount:</strong> USD {totalPrice.toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* TNM Mpamba */}
          <div style={{
            border: paymentMethod === 'tnm' ? '2px solid #e67e22' : '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '15px',
            cursor: 'pointer',
            backgroundColor: paymentMethod === 'tnm' ? '#fff8f0' : 'white'
          }} onClick={() => setPaymentMethod('tnm')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="radio" checked={paymentMethod === 'tnm'} readOnly />
              <span style={{ fontWeight: 'bold' }}>📱 TNM Mpamba</span>
            </div>
            {paymentMethod === 'tnm' && (
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <p><strong>Send payment to:</strong> <strong style={{ color: '#e67e22', fontSize: '18px' }}>{mobileMoneyNumbers.tnm}</strong></p>
                <p><strong>Reference:</strong> {bookingData?.bookingCode}</p>
                <p><strong>Amount:</strong> USD {totalPrice.toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* National Bank */}
          <div style={{
            border: paymentMethod === 'bank' ? '2px solid #e67e22' : '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            cursor: 'pointer',
            backgroundColor: paymentMethod === 'bank' ? '#fff8f0' : 'white'
          }} onClick={() => setPaymentMethod('bank')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="radio" checked={paymentMethod === 'bank'} readOnly />
              <span style={{ fontWeight: 'bold' }}>🏦 National Bank Transfer</span>
            </div>
            {paymentMethod === 'bank' && (
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <p><strong>Bank:</strong> {bankDetails.bankName}</p>
                <p><strong>Account Name:</strong> {bankDetails.accountName}</p>
                <p><strong>Account Number:</strong> <strong style={{ color: '#e67e22' }}>{bankDetails.accountNumber}</strong></p>
                <p><strong>Branch:</strong> {bankDetails.branch}</p>
                <p><strong>Reference:</strong> {bookingData?.bookingCode}</p>
                <p><strong>Amount:</strong> USD {totalPrice.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {paymentMethod && (
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
          <h4 style={{ margin: '0 0 8px 0', color: '#155724' }}>How to complete payment:</h4>
          <ol style={{ margin: '0', paddingLeft: '20px', color: '#155724', fontSize: '13px' }}>
            <li>Make payment using your selected method above</li>
            <li>Enter the transaction reference number</li>
            <li>Click "Submit & Send WhatsApp"</li>
            <li>WhatsApp will open with pre-filled message to Admin</li>
            <li>Send the message to verify your payment</li>
            <li>Admin will verify and confirm your booking</li>
          </ol>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleCancel} 
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
              cursor: !paymentMethod || !paymentReference ? 'not-allowed' : 'pointer',
              opacity: (!paymentMethod || !paymentReference) ? 0.6 : 1
            }}
          >
            {submitting ? 'Processing...' : 'Submit & Send WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;