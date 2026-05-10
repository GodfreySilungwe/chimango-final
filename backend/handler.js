if (!process.env.AWS_EXECUTION_ENV) {
  require('dotenv').config();
}

const serverless = require('serverless-http');
const app = require('./server');
const { initializeTable } = require('./services/dynamodbService');

// Initialize DynamoDB table on cold start (fire and forget)
// This runs once per cold start, doesn't block the response
initializeTable().catch(error => {
  console.error('Error initializing DynamoDB table:', error);
});

// Create the serverless handler - NO double wrapping
const serverlessHandler = serverless(app, {
  basePath: process.env.BASE_PATH || '/',
  httpMethod: 'ANY',
  cors: {
    origin: [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000',
      'http://chimangofrontendwebsitebucket.s3-website-us-east-1.amazonaws.com'
    ],
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
  }
});

// Direct export - serverless-http is the handler
module.exports.handler = serverlessHandler;