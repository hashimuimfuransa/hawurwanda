import dotenv from 'dotenv';
import axios from 'axios';

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

/**
 * Upload file to Uploadcare via direct upload
 * @param fileBuffer - File buffer
 * @param fileName - Original file name
 * @returns Promise with uploaded file URL
 */
export const uploadFileToCloud = async (fileBuffer: Buffer, fileName: string): Promise<string> => {
  try {
    // Check if Uploadcare is configured
    if (!UPLOADCARE_PUBLIC_KEY || UPLOADCARE_PUBLIC_KEY === 'your-uploadcare-public-key') {
      throw new Error('Uploadcare is not configured. Please set UPLOADCARE_PUBLIC_KEY in your .env file.');
    }

    // Create FormData for upload
    const formData = new FormData();
    formData.append('UPLOADCARE_PUB_KEY', UPLOADCARE_PUBLIC_KEY);
    formData.append('file', new Blob([fileBuffer]), fileName);

    // Upload to Uploadcare
    const response = await axios.post('https://upload.uploadcare.com/base/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Extract file ID from response
    const fileId = response.data.file;
    
    // Return CDN URL
    return `https://ucarecdn.com/${fileId}/`;
  } catch (error: any) {
    console.error('Uploadcare upload error:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.detail || error.message || 'Unknown error occurred during upload';
    throw new Error(`File upload failed: ${errorMessage}`);
  }
};

// Keep the old name for backward compatibility
export const uploadToUploadcare = uploadFileToCloud;

export {
  UPLOADCARE_PUBLIC_KEY,
  UPLOADCARE_SECRET_KEY
};