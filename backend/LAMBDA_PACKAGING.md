# AWS Lambda Manual Packaging Guide

This guide explains how to manually package your Chimango backend for AWS Lambda deployment.

## Prerequisites
- Node.js installed locally
- AWS Lambda console access
- All environment variables configured in `.env`

## Build Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Lambda Package
```bash
npm run build:lambda
```

This command will:
- Create a `dist` directory
- Copy `models/`, `services/`, `handler.js`, `server.js`, `package.json`, and `.env`
- Install production dependencies into `dist/node_modules`

### 3. Manual Zipping

#### Windows (PowerShell):
```powershell
cd dist
Compress-Archive -Path * -DestinationPath ../lambda-package.zip -Force
cd ..
```

#### macOS/Linux:
```bash
cd dist
zip -r ../lambda-package.zip . -x "*.git*"
cd ..
```

### 4. Upload to AWS Lambda

1. Go to AWS Lambda Console
2. Create a new function or select existing function
3. Upload the `lambda-package.zip` file:
   - Code source → Upload from → .zip file
   - Select `lambda-package.zip`
   - Click "Deploy"

4. Set Lambda Handler: `handler.lambda`

5. Configure Environment Variables in Lambda Console:
   ```
   AWS_REGION: us-east-1
   AWS_ACCESS_KEY_ID: your_key
   AWS_SECRET_ACCESS_KEY: your_secret
   DYNAMODB_TABLE: chimango_dynamoDB
   S3_BUCKET: chimangofilebucket
   API_BASE_URL: https://your-api-gateway-endpoint
   FRONTEND_URL: http://chimangofrontendwebsitebucket.s3-website-us-east-1.amazonaws.com
   JWT_SECRET: your_secret
   JWT_EXPIRE: 7d
   EMAIL_USER: your_email
   EMAIL_PASS: your_app_password
   PAYCHANGU_PUBLIC_KEY: your_key
   PAYCHANGU_SECRET_KEY: your_secret
   ```

6. Set Timeout: 30 seconds (or higher)
7. Set Memory: 512 MB (or adjust as needed)

## Files Included in the ZIP

```
lambda-package.zip
├── handler.js           # Lambda entry point
├── server.js            # Express application
├── package.json         # Dependencies manifest
├── .env                 # Environment variables
├── models/              # DynamoDB models
│   ├── User_DynamoDB.js
│   ├── Tour_DynamoDB.js
│   ├── Activity_DynamoDB.js
│   ├── Booking_DynamoDB.js
│   ├── CustomBooking_DynamoDB.js
│   ├── Review_DynamoDB.js
│   ├── PaymentRequest_DynamoDB.js
│   ├── PasswordReset_DynamoDB.js
│   └── Wishlist_DynamoDB.js
├── services/            # AWS service wrappers
│   ├── dynamodbService.js
│   ├── s3Service.js
│   └── emailService.js
└── node_modules/        # Production dependencies
```

## Troubleshooting

### "Cannot find module 'serverless-http'"
- Ensure `npm run build:lambda` completed successfully
- Verify `serverless-http` is in `package.json` dependencies
- Rebuild: `npm run build:lambda`

### Lambda timeout errors
- Increase timeout in Lambda console to 60+ seconds
- Check CloudWatch logs for specific errors

### DynamoDB table not found
- The Lambda function automatically creates the table on first run
- Ensure AWS credentials have DynamoDB permissions
- Check CloudWatch logs for table creation messages

### S3 upload failures
- Verify S3 bucket name matches `S3_BUCKET` environment variable
- Check bucket exists and is in the same AWS region
- Verify Lambda IAM role has S3 permissions

## Testing

Once deployed, test the Lambda function:

1. **Test through API Gateway**: Make HTTP requests to your API endpoint
2. **Test through Lambda Console**: 
   - Use Test tab
   - Create test event with sample HTTP request
   - Execute and check response

Example test event:
```json
{
  "requestContext": {
    "http": {
      "method": "GET",
      "path": "/test"
    }
  },
  "rawPath": "/test"
}
```

## Important Notes

- Keep `.env` file secure; consider using AWS Secrets Manager for production
- The Lambda function initializes DynamoDB table automatically on first invocation
- Ensure all AWS resources (DynamoDB, S3, API Gateway) exist before deploying
- Monitor CloudWatch logs: `/aws/lambda/your-function-name`

## Next Steps

1. Set up API Gateway for HTTP routing
2. Configure custom domain (optional)
3. Set up CloudWatch monitoring and alarms
4. Deploy frontend to S3 bucket
5. Test end-to-end workflow
