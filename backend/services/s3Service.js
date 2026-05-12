const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const BUCKET_NAME = process.env.S3_BUCKET || "chimangofilebucket";
const AWS_REGION = process.env.AWS_REGION || "us-east-1";

// Use IAM role for Lambda - no hardcoded credentials needed
// Remove the awsCredentials object entirely for Lambda
const s3Client = new S3Client({
  region: AWS_REGION
  // No credentials - Lambda IAM role handles authentication
});

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - The file buffer/content
 * @param {string} fileName - Original file name
 * @param {string} mimeType - MIME type of the file
 * @param {string} folder - Folder path in S3 (e.g., "tours", "activities", "users")
 * @returns {Promise<{url: string, key: string}>}
 */
async function uploadFile(fileBuffer, fileName, mimeType, folder = "uploads") {
  try {
    const fileExtension = path.extname(fileName);
    const baseName = path.basename(fileName, fileExtension);
    const uniqueName = `${baseName}-${uuidv4()}${fileExtension}`;
    const key = `${folder}/${uniqueName}`;
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType
      // REMOVED: ACL: "public-read" - bucket doesn't support ACLs
    };
    
    await s3Client.send(new PutObjectCommand(params));
    
    const url = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
    
    return {
      url,
      key,
      fileName: uniqueName
    };
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
}

/**
 * Upload multiple files
 * @param {Array} files - Array of {buffer, fileName, mimeType}
 * @param {string} folder - Folder path in S3
 * @returns {Promise<Array>}
 */
async function uploadMultipleFiles(files, folder = "uploads") {
  try {
    const uploadPromises = files.map(file =>
      uploadFile(file.buffer, file.fileName, file.mimeType, folder)
    );
    
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading multiple files:", error);
    throw error;
  }
}

/**
 * Delete a file from S3
 * @param {string} key - The S3 object key
 */
async function deleteFile(key) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };
    
    await s3Client.send(new DeleteObjectCommand(params));
    console.log(`File deleted: ${key}`);
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw error;
  }
}

/**
 * Get signed URL for file
 * @param {string} key - The S3 object key
 * @param {number} expirationSeconds - URL expiration time in seconds (default: 1 hour)
 */
async function getPresignedUrl(key, expirationSeconds = 3600) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };
    
    const command = new GetObjectCommand(params);
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: expirationSeconds
    });
    
    return signedUrl;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw error;
  }
}

/**
 * List files in a folder
 * @param {string} folder - Folder path
 */
async function listFiles(folder) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Prefix: folder
    };
    
    const result = await s3Client.send(new ListObjectsV2Command(params));
    return result.Contents || [];
  } catch (error) {
    console.error("Error listing files:", error);
    throw error;
  }
}

/**
 * Delete multiple files
 * @param {Array} keys - Array of S3 object keys
 */
async function deleteMultipleFiles(keys) {
  try {
    const deletePromises = keys.map(key => deleteFile(key));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting multiple files:", error);
    throw error;
  }
}

/**
 * Get public URL for S3 object
 * @param {string} key - The S3 object key
 */
function getPublicUrl(key) {
  return `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
}

module.exports = {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  getPresignedUrl,
  listFiles,
  deleteMultipleFiles,
  getPublicUrl,
  BUCKET_NAME
};