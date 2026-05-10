// API Configuration
const isDevelopment = !import.meta.env.PROD;
export const API_URL = isDevelopment 
  ? 'http://localhost:5000'
  : process.env.VITE_API_URL || 'https://gj99pm096l.execute-api.us-east-1.amazonaws.com';

// Frontend URL
export const FRONTEND_URL = isDevelopment
  ? 'http://localhost:5173'
  : 'http://chimangofrontendwebsitebucket.s3-website-us-east-1.amazonaws.com';

// Helper function to get image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/images/placeholder.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('s3://')) {
    return `https://chimangofilebucket.s3.us-east-1.amazonaws.com/${imagePath.replace('s3://', '')}`;
  }
  if (imagePath.startsWith('/uploads')) return `${API_URL}${imagePath}`;
  if (imagePath.startsWith('./')) return imagePath.substring(1);
  return imagePath;
};

// Helper function to format currency
export const formatCurrency = (amount) => {
  return `USD ${amount?.toLocaleString() || 0}`;
};

// Helper function to format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};