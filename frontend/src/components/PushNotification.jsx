import { useState, useEffect } from 'react';
import { API_URL } from '../config';

const PushNotification = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    // Check current permission status
    setNotificationPermission(Notification.permission);

    // Check if already subscribed
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered');
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  };

  const subscribeToPush = async () => {
    try {
      // Request permission
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission !== 'granted') {
        alert('Please allow notifications to receive booking updates');
        return;
      }

      // Register service worker
      const registration = await registerServiceWorker();
      if (!registration) return;

      // Get VAPID public key from backend
      const vapidPublicKey = 'BHjo2aWpvyHKGBoaIm_qBW2Sfnc-lUAMun52aTypbHoaX3j3w_BWsOjcorbqtM3MByir0u64bJZA8_Smy1779jA';
      // Subscribe
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      // Send subscription to backend
      const response = await fetch(`${API_URL}/api/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      if (response.ok) {
        setIsSubscribed(true);
        setShowPrompt(false);
        showLocalNotification('Notifications Enabled', 'You will now receive booking updates!');
      }
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify backend
        await fetch(`${API_URL}/api/push/unsubscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
        
        setIsSubscribed(false);
        showLocalNotification('Notifications Disabled', 'You will no longer receive updates.');
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
    }
  };

  const showLocalNotification = (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icon.png' });
    }
  };

  // Helper function to convert base64 to Uint8Array
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Don't show prompt if already subscribed or denied
  if (isSubscribed || notificationPermission === 'denied') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease'
    }}>
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-100px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
      
      <div style={{
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        maxWidth: '300px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <span style={{ fontSize: '24px'}}>🔔</span>
          <div>
            <strong>Get Booking Updates</strong>
            <p style={{ margin: '5px 0 0', fontSize: '12px', opacity: 0.8 }}>
              Receive real-time notifications about your bookings
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            onClick={subscribeToPush}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: '#e67e22',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Enable
          </button>
          <button
            onClick={() => setShowPrompt(false)}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid white',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default PushNotification;