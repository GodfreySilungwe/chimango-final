# Chimango Tourism - AWS Lambda Deployment Guide

## Overview
This application has been refactored to run on **AWS Lambda** with **DynamoDB** for database storage and **S3** for file uploads. This guide provides step-by-step instructions for deployment.

## AWS Resources Created

### 1. DynamoDB Table
- **Table Name**: `chimango_dynamoDB`
- **Partition Key (PK)**: String
- **Sort Key (SK)**: String
- **Billing Mode**: On-demand (pay-per-request)
- **Global Secondary Indexes**:
  - `typeIndex`: For querying by entity type
  - `emailIndex`: For querying users by email

### 2. S3 Buckets

#### File Storage Bucket
- **Bucket Name**: `chimangofilebucket`
- **Purpose**: Stores tour/activity images and user uploads
- **Access**: Public read for images

#### Frontend Hosting Bucket
- **Bucket Name**: `chimangofrontendwebsitebucket`
- **Purpose**: Hosts static frontend files
- **Website Configuration**: Enabled with index.html
- **URL**: `http://chimangofrontendwebsitebucket.s3-website-us-east-1.amazonaws.com`

### 3. API Gateway
- **Base URL**: `https://gj99pm096l.execute-api.us-east-1.amazonaws.com`
- **Stage**: `prod`
- **Integration**: Lambda function

### 4. Lambda Function
- **Handler**: `handler.lambda.handler`
- **Runtime**: Node.js 18.x (or higher)
- **Memory**: 512 MB (adjustable)
- **Timeout**: 30 seconds (adjustable)

## Prerequisites

Before deployment, ensure you have:

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Node.js** 18.x or higher installed
4. **Serverless Framework** (optional, for easy deployment)
5. AWS credentials configured locally

```bash
aws configure
```

## Environment Variables Setup

### Backend (.env file in backend directory)

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# DynamoDB
DYNAMODB_TABLE=chimango_dynamoDB

# S3
S3_BUCKET=chimangofilebucket

# API Configuration
API_BASE_URL=https://gj99pm096l.execute-api.us-east-1.amazonaws.com
FRONTEND_URL=http://chimangofrontendwebsitebucket.s3-website-us-east-1.amazonaws.com

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Payment Provider
PAYCHANGU_PUBLIC_KEY=your_public_key
PAYCHANGU_SECRET_KEY=your_secret_key

# Environment
NODE_ENV=production
```

### Frontend (.env file in frontend directory)

```env
VITE_API_URL=https://gj99pm096l.execute-api.us-east-1.amazonaws.com
VITE_FRONTEND_URL=http://chimangofrontendwebsitebucket.s3-website-us-east-1.amazonaws.com
```

## Deployment Steps

### Step 1: Deploy Backend to Lambda

#### Option A: Using Serverless Framework (Recommended)

1. Install Serverless Framework:
```bash
npm install -g serverless
```

2. From the backend directory, deploy:
```bash
cd backend
npm install
serverless deploy --stage prod
```

#### Option B: Manual Lambda Deployment

1. Create deployment package:
```bash
cd backend
npm install
zip -r function.zip .
```

2. Create Lambda function via AWS Console:
   - Runtime: Node.js 18.x
   - Handler: `handler.lambda.handler`
   - Upload `function.zip`

3. Set environment variables in Lambda console

4. Create API Gateway integration

### Step 2: Create DynamoDB Table

The table will be created automatically when the Lambda function first runs. The `dynamodbService.js` includes table initialization logic.

Alternatively, create manually via AWS Console:
- Table name: `chimango_dynamoDB`
- Partition key: `PK` (String)
- Sort key: `SK` (String)
- Billing mode: On-demand

### Step 3: Create S3 Buckets

```bash
# Create file storage bucket
aws s3 mb s3://chimangofilebucket --region us-east-1

# Create frontend hosting bucket
aws s3 mb s3://chimangofrontendwebsitebucket --region us-east-1

# Enable website hosting on frontend bucket
aws s3 website s3://chimangofrontendwebsitebucket \
  --index-document index.html \
  --error-document index.html

# Set bucket policies for public access (frontend)
# Add public read policy to frontend bucket
```

### Step 4: Configure CORS for S3

Add CORS configuration to `chimangofilebucket`:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "http://chimangofrontendwebsitebucket.s3-website-us-east-1.amazonaws.com",
      "https://gj99pm096l.execute-api.us-east-1.amazonaws.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### Step 5: Deploy Frontend to S3

1. Build the frontend:
```bash
cd frontend
npm install
npm run build
```

2. Upload to S3:
```bash
aws s3 sync dist/ s3://chimangofrontendwebsitebucket --delete
```

3. Access the frontend:
```
http://chimangofrontendwebsitebucket.s3-website-us-east-1.amazonaws.com
```

### Step 6: Set API Gateway CORS

In API Gateway console:
- Select your API
- Click "Actions" → "Enable CORS"
- Add headers and methods as needed
- Redeploy the API

## Database Schema (DynamoDB)

The application uses a single DynamoDB table with the following key patterns:

```
USER Data:
- PK: USER#{email}
- SK: PROFILE#{userId}

TOUR Data:
- PK: TOUR#{tourId}
- SK: PROFILE#{tourId}

ACTIVITY Data:
- PK: ACTIVITY#{activityId}
- SK: PROFILE#{activityId}

BOOKING Data:
- PK: BOOKING#{bookingId}
- SK: PROFILE#{bookingId}
- GSI: USER#{userId} → BOOKING#{bookingId}

CUSTOM_BOOKING Data:
- PK: CUSTOMBOOKING#{bookingId}
- SK: PROFILE#{bookingId}
- GSI: BOOKINGCODE#{code} → PROFILE#{bookingId}

REVIEW Data:
- PK: REVIEW#{reviewId}
- SK: PROFILE#{reviewId}
- GSI: ACTIVITY#{activityId} → REVIEW#{reviewId}

WISHLIST Data:
- PK: WISHLIST#{userId}
- SK: ACTIVITY#{activityId}

PASSWORD_RESET Data:
- PK: PASSWORDRESET#{token}
- SK: PROFILE#{tokenId}

PAYMENT_REQUEST Data:
- PK: PAYMENTREQUEST#{paymentId}
- SK: PROFILE#{paymentId}
```

## File Structure

```
backend/
├── handler.js                 # Lambda entry point
├── server.js                  # Express app
├── package.json              # Dependencies
├── .env                       # Environment variables
├── models/
│   ├── User_DynamoDB.js
│   ├── Tour_DynamoDB.js
│   ├── Activity_DynamoDB.js
│   ├── Booking_DynamoDB.js
│   ├── CustomBooking_DynamoDB.js
│   ├── Review_DynamoDB.js
│   ├── Wishlist_DynamoDB.js
│   ├── PasswordReset_DynamoDB.js
│   └── PaymentRequest_DynamoDB.js
└── services/
    ├── dynamodbService.js    # DynamoDB utilities
    ├── s3Service.js          # S3 file operations
    └── emailService.js       # Email notifications

frontend/
├── src/
│   ├── config.js            # API configuration
│   └── ...
├── .env                      # Frontend environment variables
└── ...
```

## API Endpoints

All endpoints are prefixed with the API Gateway base URL:
`https://gj99pm096l.execute-api.us-east-1.amazonaws.com`

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login

### Tours
- `GET /api/tours` - List all published tours
- `GET /api/tours/:id` - Get tour details
- `POST /api/tours` - Create tour (admin)
- `PUT /api/tours/:id` - Update tour (admin)
- `DELETE /api/tours/:id` - Delete tour (admin)

### Activities
- `GET /api/activities` - List activities
- `GET /api/activities/:id` - Get activity details
- `POST /api/activities` - Create activity (admin)
- `PUT /api/activities/:id` - Update activity (admin)
- `DELETE /api/activities/:id` - Delete activity (admin)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/user/:userId` - Get user bookings
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Custom Bookings
- `POST /api/custom-bookings` - Create custom booking
- `GET /api/custom-bookings/user/:userId` - Get user custom bookings
- `GET /api/custom-bookings` - Get all custom bookings (admin)
- `GET /api/custom-bookings/code/:bookingCode` - Get booking by code
- `PUT /api/custom-bookings/confirm/:bookingCode` - Confirm booking

### File Upload
- `POST /api/upload` - Upload single image
- `POST /api/upload-multiple` - Upload multiple images
- `DELETE /api/upload/:key` - Delete image

### Reviews
- `GET /api/reviews/activity/:activityId` - Get activity reviews
- `POST /api/reviews` - Submit review

### Wishlist
- `POST /api/wishlist` - Add to wishlist
- `GET /api/wishlist/:userId` - Get user wishlist
- `DELETE /api/wishlist/:userId/:activityId` - Remove from wishlist
- `GET /api/wishlist/check/:userId/:activityId` - Check if in wishlist

## Monitoring & Troubleshooting

### CloudWatch Logs
View Lambda logs in AWS CloudWatch:
```bash
aws logs tail /aws/lambda/your-function-name --follow
```

### DynamoDB Monitoring
- Check table capacity in DynamoDB console
- Monitor read/write capacity units
- View table metrics in CloudWatch

### Common Issues

1. **Lambda Timeout**: Increase timeout in Lambda settings (default: 30s)
2. **DynamoDB Not Found**: Ensure table exists and region matches
3. **S3 Upload Failed**: Check bucket permissions and CORS settings
4. **CORS Errors**: Verify API Gateway CORS configuration

## Optimization Tips

1. **Lambda Cold Starts**: Pre-warm functions or use provisioned concurrency
2. **DynamoDB**: Monitor capacity usage and adjust as needed
3. **S3**: Enable CloudFront for faster image delivery
4. **API Gateway**: Enable caching for read-heavy endpoints

## Security Recommendations

1. Enable VPC for Lambda (optional)
2. Use IAM roles with least privilege
3. Enable encryption for S3 buckets
4. Enable DynamoDB point-in-time recovery
5. Rotate AWS credentials regularly
6. Use AWS Secrets Manager for sensitive data

## Cost Estimation

Monthly costs approximate (based on usage):
- Lambda: $0.20 per 1M requests
- DynamoDB: $1.25 per million read/write units
- S3: $0.023 per GB storage + data transfer
- API Gateway: $3.50 per million calls

Use AWS Calculator for precise estimates.

## Support & Documentation

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [DynamoDB Developer Guide](https://docs.aws.amazon.com/dynamodb/)
- [S3 User Guide](https://docs.aws.amazon.com/s3/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)

## Next Steps

1. Update environment variables with actual AWS credentials
2. Deploy backend Lambda function
3. Create and configure AWS resources
4. Deploy frontend to S3
5. Test all endpoints
6. Set up monitoring and alerts
7. Configure domain name (optional)
