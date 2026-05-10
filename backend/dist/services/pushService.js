const webpush = require('web-push');

// Configure VAPID keys
webpush.setVapidDetails(
  'mailto:info@chimangotour.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Store subscriptions (in production, save to database)
let subscriptions = [];

// Save subscription
const saveSubscription = (subscription) => {
  const exists = subscriptions.find(s => s.endpoint === subscription.endpoint);
  if (!exists) {
    subscriptions.push(subscription);
    console.log('New subscription saved. Total:', subscriptions.length);
  }
  return subscription;
};

// Remove subscription
const removeSubscription = (endpoint) => {
  subscriptions = subscriptions.filter(s => s.endpoint !== endpoint);
  console.log('Subscription removed. Total:', subscriptions.length);
};

// Send notification to all subscribers
const sendNotificationToAll = async (title, body, icon = '/icon.png', url = '/') => {
  const payload = JSON.stringify({
    title,
    body,
    icon,
    data: { url }
  });

  const results = [];
  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(subscription, payload);
      results.push({ success: true, endpoint: subscription.endpoint });
    } catch (error) {
      console.error('Error sending notification:', error);
      if (error.statusCode === 410) {
        // Subscription expired
        removeSubscription(subscription.endpoint);
      }
      results.push({ success: false, endpoint: subscription.endpoint, error: error.message });
    }
  }
  return results;
};

// Send notification to specific user
const sendNotificationToUser = async (subscription, title, body, icon = '/icon.png', url = '/') => {
  const payload = JSON.stringify({
    title,
    body,
    icon,
    data: { url }
  });

  try {
    await webpush.sendNotification(subscription, payload);
    return { success: true };
  } catch (error) {
    console.error('Error sending notification:', error);
    if (error.statusCode === 410) {
      removeSubscription(subscription.endpoint);
    }
    return { success: false, error: error.message };
  }
};

module.exports = {
  saveSubscription,
  removeSubscription,
  sendNotificationToAll,
  sendNotificationToUser,
  getSubscriptions: () => subscriptions
};