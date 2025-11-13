import dotenv from 'dotenv';
import axios from 'axios';
import { uploadToCloudinary } from './cloudinary';

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
 * Upload file to cloud storage via backend
 * @param fileBuffer - File buffer
 * @param fileName - Original file name
 * @returns Promise with uploaded file URL
 */
export const uploadFileToCloud = async (fileBuffer: Buffer, fileName: string): Promise<string> => {
  try {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.');
    }

    // Use Cloudinary for uploads
    const result = await uploadToCloudinary(fileBuffer, 'staff-profiles', `staff-${Date.now()}`);
    return result.secure_url;
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    const errorMessage = error.message || 'Unknown error occurred during upload';
    throw new Error(`File upload failed: ${errorMessage}`);
  }
};

// Keep the old name for backward compatibility
export const uploadToUploadcare = uploadFileToCloud;

export {
  UPLOADCARE_PUBLIC_KEY,
  UPLOADCARE_SECRET_KEY
};