// scripts/updateUserDynamoDB.js
require('dotenv').config();
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");

const TABLE_NAME = process.env.DYNAMODB_TABLE || "chimango_dynamoDB";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1"
});

const docClient = DynamoDBDocumentClient.from(client);

async function updateUser() {
  try {
    const email = 'admin@chimango.com';
    
    // First, find the user by email using the email index
    const findParams = {
      TableName: TABLE_NAME,
      IndexName: "emailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email
      }
    };
    
    const findResult = await docClient.send(new QueryCommand(findParams));
    
    if (!findResult.Items || findResult.Items.length === 0) {
      console.log('User not found with email:', email);
      process.exit();
    }
    
    const user = findResult.Items[0];
    const userId = user.id;
    const userPK = user.PK;
    const userSK = user.SK;
    
    console.log('Found user:', user.fullName);
    
    // Update the user
    const updateParams = {
      TableName: TABLE_NAME,
      Key: {
        PK: userPK,
        SK: userSK
      },
      UpdateExpression: "SET fullName = :fullName, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":fullName": "Chimango",
        ":updatedAt": Date.now()
      },
      ReturnValues: "ALL_NEW"
    };
    
    const result = await docClient.send(new UpdateCommand(updateParams));
    console.log('User updated successfully:', result.Attributes.fullName);
    
  } catch (error) {
    console.error('Error updating user:', error);
  }
}

updateUser();