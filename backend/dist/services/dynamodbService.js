const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");

const TABLE_NAME = process.env.DYNAMODB_TABLE || "chimango_dynamoDB";

// REMOVE credentials for Lambda - use IAM role instead
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1"
  // No credentials - Lambda IAM role handles authentication
});

const docClient = DynamoDBDocumentClient.from(client);

// Import commands only when needed to avoid circular dependencies
const { PutCommand, GetCommand, QueryCommand, ScanCommand, UpdateCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

/**
 * Initialize DynamoDB table
 */
async function initializeTable() {
  try {
    const { DescribeTableCommand, CreateTableCommand } = require("@aws-sdk/client-dynamodb");
    
    // Try to describe the table
    await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    console.log(`Table ${TABLE_NAME} already exists`);
    
  } catch (error) {
    if (error.name === "ResourceNotFoundException") {
      console.log(`Creating table ${TABLE_NAME}...`);
      
      const params = {
        TableName: TABLE_NAME,
        KeySchema: [
          { AttributeName: "PK", KeyType: "HASH" },
          { AttributeName: "SK", KeyType: "RANGE" }
        ],
        AttributeDefinitions: [
          { AttributeName: "PK", AttributeType: "S" },
          { AttributeName: "SK", AttributeType: "S" },
          { AttributeName: "type", AttributeType: "S" },
          { AttributeName: "createdAt", AttributeType: "N" },
          { AttributeName: "email", AttributeType: "S" }
        ],
        BillingMode: "PAY_PER_REQUEST",
        GlobalSecondaryIndexes: [
          {
            IndexName: "typeIndex",
            KeySchema: [
              { AttributeName: "type", KeyType: "HASH" },
              { AttributeName: "createdAt", KeyType: "RANGE" }
            ],
            Projection: { ProjectionType: "ALL" }
          },
          {
            IndexName: "emailIndex",
            KeySchema: [
              { AttributeName: "email", KeyType: "HASH" }
            ],
            Projection: { ProjectionType: "ALL" }
          }
        ]
      };
      
      await client.send(new CreateTableCommand(params));
      console.log(`Table ${TABLE_NAME} created successfully`);
    } else {
      throw error;
    }
  }
}

/**
 * Generic put item
 */
async function putItem(item) {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      ...item,
      createdAt: item.createdAt || Date.now(),
      updatedAt: Date.now()
    }
  };
  
  return await docClient.send(new PutCommand(params));
}

/**
 * Generic get item
 */
async function getItem(pk, sk) {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      PK: pk,
      SK: sk
    }
  };
  
  const result = await docClient.send(new GetCommand(params));
  return result.Item;
}

/**
 * Generic query by PK
 */
async function queryByPK(pk, filters = {}) {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "PK = :pk",
    ExpressionAttributeValues: {
      ":pk": pk
    }
  };
  
  const result = await docClient.send(new QueryCommand(params));
  return result.Items || [];
}

/**
 * Generic query by type and createdAt
 */
async function queryByType(type, sortOrder = "DESC") {
  const params = {
    TableName: TABLE_NAME,
    IndexName: "typeIndex",
    KeyConditionExpression: "#type = :type",
    ExpressionAttributeNames: {
      "#type": "type"
    },
    ExpressionAttributeValues: {
      ":type": type
    },
    ScanIndexForward: sortOrder === "ASC"
  };
  
  const result = await docClient.send(new QueryCommand(params));
  return result.Items || [];
}

/**
 * Generic scan (use with caution)
 */
async function scanTable(filterExpression = null, expressionValues = null) {
  const params = {
    TableName: TABLE_NAME
  };
  
  if (filterExpression) {
    params.FilterExpression = filterExpression;
    params.ExpressionAttributeValues = expressionValues;
  }
  
  const result = await docClient.send(new ScanCommand(params));
  return result.Items || [];
}

/**
 * Generic update item
 */
async function updateItem(pk, sk, updateData) {
  if (!updateData || typeof updateData !== 'object' || Object.keys(updateData).length === 0) {
    throw new Error('No update data provided');
  }

  const filteredEntries = Object.entries(updateData).filter(
    ([key]) => key !== 'PK' && key !== 'SK' && key !== 'updatedAt'
  );

  const expressionAttributeNames = { '#updatedAt': 'updatedAt' };
  const expressionAttributeValues = { ':updatedAt': Date.now() };
  const setParts = [];

  filteredEntries.forEach(([key, val], idx) => {
    const nameKey = `#key${idx}`;
    const valueKey = `:val${idx}`;
    expressionAttributeNames[nameKey] = key;
    expressionAttributeValues[valueKey] = val;
    setParts.push(`${nameKey} = ${valueKey}`);
  });

  setParts.push('#updatedAt = :updatedAt');

  const params = {
    TableName: TABLE_NAME,
    Key: {
      PK: pk,
      SK: sk
    },
    UpdateExpression: `SET ${setParts.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
    ReturnValues: 'ALL_NEW'
  };

  const result = await docClient.send(new UpdateCommand(params));
  return result.Attributes;
}

/**
 * Generic delete item
 */
async function deleteItem(pk, sk) {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      PK: pk,
      SK: sk
    }
  };
  
  return await docClient.send(new DeleteCommand(params));
}

/**
 * Query by email (for users/password resets)
 */
async function queryByEmail(email) {
  const params = {
    TableName: TABLE_NAME,
    IndexName: "emailIndex",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email
    }
  };
  
  const result = await docClient.send(new QueryCommand(params));
  return result.Items || [];
}

module.exports = {
  initializeTable,
  putItem,
  getItem,
  queryByPK,
  queryByType,
  scanTable,
  updateItem,
  deleteItem,
  queryByEmail,
  TABLE_NAME
};