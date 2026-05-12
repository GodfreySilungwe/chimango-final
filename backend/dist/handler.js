if (!process.env.AWS_EXECUTION_ENV) {
  require('dotenv').config();
}

const serverless = require('serverless-http');
const app = require('./server');
const { initializeTable } = require('./services/dynamodbService');

// Initialize DynamoDB table on cold start
initializeTable().catch(error => {
  console.error('Error initializing DynamoDB table:', error);
});

// Parse the event body and attach to event
const wrapper = async (event, context) => {
  console.log('=== HANDLER DEBUG ===');
  console.log('Event body type:', typeof event.body);
  console.log('Event body raw:', event.body);
  
  // Parse body if it's a string
  if (event.body && typeof event.body === 'string') {
    try {
      const parsedBody = JSON.parse(event.body);
      console.log('Parsed body successfully:', parsedBody);
      // Replace the body with the parsed object
      event.body = parsedBody;
    } catch (e) {
      console.log('Could not parse body as JSON:', e.message);
    }
  }
  
  console.log('Event body after parsing:', event.body);
  console.log('Event body type after:', typeof event.body);
  
  const handler = serverless(app);
  const result = await handler(event, context);
  return result;
};

module.exports.handler = wrapper;