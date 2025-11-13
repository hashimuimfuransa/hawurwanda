import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Uploadcare configuration
const UPLOADCARE_PUBLIC_KEY = process.env.UPLOADCARE_PUBLIC_KEY || 'your-uploadcare-public-key';
const UPLOADCARE_SECRET_KEY = process.env.UPLOADCARE_SECRET_KEY || 'your-uploadcare-secret-key';

/**
 * Validate Uploadcare URL
 * @param url - URL to validate
 * @returns boolean indicating if URL is a valid Uploadcare URL
 */
export const isValidUploadcareUrl = (url: string): boolean => {
  // Check if URL is from Uploadcare CDN
  return url.startsWith('https://ucarecdn.com/') && url.includes('/');
};

/**
 * Extract file ID from Uploadcare URL
 * @param url - Uploadcare URL
 * @returns file ID or null if invalid
 */
export const extractUploadcareFileId = (url: string): string | null => {
  if (!isValidUploadcareUrl(url)) {
    return null;
  }
  
  // Extract file ID from URL like: https://ucarecdn.com/file-id/
  const match = url.match(/https:\/\/ucarecdn\.com\/([a-zA-Z0-9\-]+)\//);
  return match ? match[1] : null;
};

export {
  UPLOADCARE_PUBLIC_KEY,
  UPLOADCARE_SECRET_KEY
};