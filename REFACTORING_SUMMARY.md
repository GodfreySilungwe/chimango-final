# Chimango Tourism - AWS Lambda Refactoring Summary

## Project Overview
The Chimango Tourism application has been successfully refactored from a traditional Node.js/Express + MongoDB architecture to a **serverless AWS Lambda** architecture with **DynamoDB** and **S3** for cost-effective, scalable hosting.

## Key Changes Made

### 1. **Database Migration: MongoDB → DynamoDB**

#### Old Structure (MongoDB)
- Separate MongoDB collections for each entity:
  - Users
  - Tours
  - Activities
  - Bookings
  - CustomBookings
  - Reviews
  - Wishlists
  - PasswordResets
  - PaymentRequests

#### New Structure (DynamoDB)
- **Single table design** (`chimango_dynamoDB`) with:
  - Partition Key (PK): Entity type + ID (e.g., `USER#john@example.com`)
  - Sort Key (SK): Entity sub-type + ID (e.g., `PROFILE#user-123`)
  - Global Secondary Indexes for efficient querying

**Benefits:**
- ✅ Reduced AWS costs (fewer tables = lower pricing)
- ✅ On-demand billing (pay only for what you use)
- ✅ Automatic scaling without manual capacity management
- ✅ Suitable for Lambda's stateless, function-per-request model

### 2. **File Storage: Local → AWS S3**

#### Old Structure
- Files stored locally in `/uploads` directory
- Served via Express static middleware
- Limited scalability and durability

#### New Structure
- All files uploaded to S3 bucket: `chimangofilebucket`
- In-memory multer storage (no local disk)
- Presigned URLs for secure access
- CloudFront-ready for CDN delivery

**New Services:**
- `s3Service.js`: Handles file upload/download/delete operations
- Updated routes: File uploads now go to S3 instead of local storage

### 3. **Backend Architecture: Express Server → AWS Lambda**

#### Old Structure
- Traditional Express server running continuously
- HTTP server listening on port 5000
- Socket.io for real-time chat
- MongoDB connection management

#### New Structure
- **Serverless handler**: `handler.js` exports Lambda-compatible function
- Express app wrapped with `serverless-http` for HTTP request handling
- No server to manage or provision
- Automatic table initialization on first invocation

**Lambda Advantages:**
- ✅ No idle costs (pay only for execution time)
- ✅ Automatic scaling for traffic spikes
- ✅ High availability (AWS-managed infrastructure)
- ✅ Integrated monitoring with CloudWatch
- ✅ Supports 15-minute execution time limit (customizable)

### 4. **Data Models Refactored**

Each MongoDB model has been replaced with a DynamoDB equivalent:

| Model | Old File | New File | Changes |
|-------|----------|----------|---------|
| User | `User.js` | `User_DynamoDB.js` | Email-based queries, UUID for user IDs |
| Tour | `Tour.js` | `Tour_DynamoDB.js` | Status filtering, simplified queries |
| Activity | `Activity.js` | `Activity_DynamoDB.js` | Category/region filtering, search |
| Booking | `Booking.js` | `Booking_DynamoDB.js` | User index for quick lookups |
| CustomBooking | `CustomBooking.js` | `CustomBooking_DynamoDB.js` | Booking code index, code generation |
| Review | `Review.js` | `Review_DynamoDB.js` | Activity-based review lookup |
| Wishlist | `Wishlist.js` | `Wishlist_DynamoDB.js` | User-activity index |
| PasswordReset | `PasswordReset.js` | `PasswordReset_DynamoDB.js` | Token-based lookup, expiration |
| PaymentRequest | `PaymentRequest.js` | `PaymentRequest_DynamoDB.js` | Booking code tracking |

### 5. **New AWS Services**

#### Created Files:
1. **`services/dynamodbService.js`**
   - Generic DynamoDB CRUD operations
   - Table initialization logic
   - Query helpers (by type, by email, etc.)
   - Automatic table creation if missing

2. **`services/s3Service.js`**
   - Upload single/multiple files
   - Delete files
   - Generate presigned URLs
   - List objects in bucket

3. **`handler.js`**
   - Lambda entry point
   - Wraps Express app for Lambda compatibility
   - Handles CORS configuration
   - Auto-initializes DynamoDB table

### 6. **Environment Configuration**

#### Backend `.env` (Complete refactoring)
```env
# AWS Resources
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=***
AWS_SECRET_ACCESS_KEY=***
DYNAMODB_TABLE=chimango_dynamoDB
S3_BUCKET=chimangofilebucket

# API & Frontend URLs
API_BASE_URL=https://gj99pm096l.execute-api.us-east-1.amazonaws.com
FRONTEND_URL=http://chimangofrontendwebsitebucket.s3-website-us-east-1.amazonaws.com

# Removed: MONGO_URI, PORT (Lambda-managed)
```

#### Frontend `.env` (New file)
```env
VITE_API_URL=https://gj99pm096l.execute-api.us-east-1.amazonaws.com
VITE_FRONTEND_URL=http://chimangofrontendwebsitebucket.s3-website-us-east-1.amazonaws.com
```

### 7. **CORS Configuration Updates**

#### Old CORS (Development only)
```javascript
origin: ['http://localhost:5173', 'http://192.168.8.132:5173']
```

#### New CORS (Production + Development)
```javascript
origin: [
  'http://localhost:5173',              // Local development
  'http://localhost:3000',              // Alternate dev port
  'http://chimangofrontendwebsitebucket.s3-website-us-east-1.amazonaws.com'  // Production
]
```

### 8. **Removed Features**

The following features were removed due to Lambda's stateless nature:

1. **Socket.io Chat**: Real-time bidirectional communication
   - Why: Lambda is stateless; WebSocket would require API Gateway WebSocket API
   - Alternative: Implement using API Gateway WebSocket API + DynamoDB for state
   - For now: Chat removed, can use polling or implement WebSocket separately

2. **Local File Storage**: Files no longer stored on server
   - Replaced with: S3 storage

3. **Server Port Binding**: No more `app.listen()`
   - Lambda handles HTTP through API Gateway

## API Gateway Configuration

**Endpoint**: `https://gj99pm096l.execute-api.us-east-1.amazonaws.com`

All routes are accessible through this endpoint:
- `POST /api/users/register`
- `GET /api/activities`
- `POST /api/custom-bookings`
- etc.

## Package.json Updates

### Dependencies Removed:
- `mongoose` - MongoDB driver
- `socket.io` - Real-time communication
- `nodemon` - Development auto-reload
- `exceljs` - Excel export (can be re-added if needed)

### Dependencies Added:
- `@aws-sdk/client-dynamodb` - DynamoDB client
- `@aws-sdk/client-s3` - S3 client
- `@aws-sdk/lib-dynamodb` - DynamoDB Document client
- `@aws-sdk/s3-request-presigner` - Presigned URL generation
- `uuid` - Unique ID generation
- `serverless-http` - Lambda/Express bridge

## Route Updates

### Image Upload Changes

**Before:**
```javascript
// Local file storage
POST /api/upload → saves to /uploads/ directory → returns local path
```

**After:**
```javascript
// S3 storage
POST /api/upload → uploads to S3 → returns S3 URL
// URL format: https://chimangofilebucket.s3.us-east-1.amazonaws.com/uploads/filename
```

### Authentication

- JWT tokens still used (same implementation)
- Token validation in middleware
- Bearer token in Authorization header

### Query Methods

**Before (MongoDB):**
```javascript
await User.findOne({ email: userEmail });
await Tour.find({ status: 'published' });
```

**After (DynamoDB):**
```javascript
await User.findByEmail(userEmail);
await Tour.find({ status: 'published' });
```

## Testing the Refactored Application

### Local Development
```bash
cd backend
npm install
npm run dev  # Uses serverless offline

# In another terminal
cd frontend
npm install
npm run dev
```

### Production Deployment
```bash
# Deploy backend
cd backend
serverless deploy --stage prod

# Build and deploy frontend
cd frontend
npm run build
aws s3 sync dist/ s3://chimangofrontendwebsitebucket --delete
```

## Cost Comparison

### Old Architecture (Self-hosted/Traditional)
- EC2 instance: ~$30-50/month
- MongoDB Atlas: ~$20-100/month
- RDS/Database: ~$10-50/month
- **Total**: $60-200/month

### New Architecture (AWS Lambda/Serverless)
- Lambda: ~$0.20 per 1M requests
- DynamoDB: ~$1.25 per 1M R/W units
- S3: $0.023 per GB + data transfer
- API Gateway: $3.50 per 1M calls
- **Estimated Monthly**: $5-30/month (varies with usage)

**Cost Savings**: 50-80% reduction in hosting costs!

## Performance Improvements

1. **Faster Database Access**: DynamoDB microsecond latency
2. **Automatic Scaling**: Handles traffic spikes without manual intervention
3. **Global Distribution**: Ready for CloudFront CDN
4. **Reduced Cold Starts**: 512MB Lambda memory reduces cold start time
5. **Direct S3 Access**: No intermediary server for file downloads

## Security Enhancements

1. **IAM Roles**: Least privilege access for Lambda function
2. **VPC Optional**: Can isolate Lambda in VPC if needed
3. **Encryption**: S3 encryption in transit and at rest
4. **DynamoDB Encryption**: Server-side encryption enabled by default
5. **API Gateway**: Built-in DDoS protection, SSL/TLS

## Migration Notes

### Data Migration (If migrating existing data)
```bash
# Export from MongoDB
mongoexport --db tourist_booking --collection users > users.json

# Import to DynamoDB
# Use AWS DMS (Database Migration Service) or custom migration script
```

### Session/Connection Management
- Remove connection pooling code
- Lambda maintains connections per execution context
- Reuse connections for warm starts

## Known Limitations

1. **Maximum Execution Time**: 15 minutes (default)
   - Solution: Use Step Functions for longer processes
2. **File Upload Size**: Limited to 6MB by API Gateway
   - Solution: Use S3 Presigned URLs for larger files
3. **Real-time Features**: Chat functionality removed
   - Solution: Implement using WebSocket API + DynamoDB
4. **Cold Starts**: Initial invocation slower (~1-3 seconds)
   - Solution: Provisioned Concurrency or Warmup events

## Deployment Checklist

- [ ] Update AWS credentials in `.env`
- [ ] Create DynamoDB table or let Lambda create it
- [ ] Create S3 buckets (`chimangofilebucket`, frontend bucket)
- [ ] Set up S3 bucket policies and CORS
- [ ] Deploy Lambda function via serverless
- [ ] Configure API Gateway
- [ ] Deploy frontend to S3
- [ ] Update DNS records if using custom domain
- [ ] Test all API endpoints
- [ ] Set up CloudWatch monitoring
- [ ] Configure error alerting

## Further Optimization

1. **Add CloudFront**: Cache static content and API responses
2. **Add Lambda Layers**: Separate dependencies for faster deployment
3. **Add DynamoDB Streams**: Real-time data processing
4. **Add SQS/SNS**: Asynchronous task processing
5. **Add Step Functions**: Complex workflow orchestration
6. **Add EventBridge**: Event-driven architecture

## Support & Next Steps

1. Review the `AWS_DEPLOYMENT_GUIDE.md` for detailed deployment instructions
2. Check `serverless.yml` for infrastructure-as-code configuration
3. Monitor CloudWatch logs for any issues
4. Set up cost alerts in AWS Billing
5. Plan for backup and disaster recovery strategies

---

**Refactoring Completed**: May 9, 2026
**Technology Stack**: Node.js + Express + AWS Lambda + DynamoDB + S3
**API Version**: v1.0 (Serverless)
