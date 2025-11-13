/// <reference types="vite/client" />

import uploadcare from 'uploadcare-widget';

// Initialize Uploadcare with public key from environment
const UPLOADCARE_PUBLIC_KEY = import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY || 'your-uploadcare-public-key';

// Configure Uploadcare - Updated for v3.x API
// Instead of using uploadcare.defaults(), we'll pass options directly to widget instances
// Global configuration object
const uploadcareConfig = {
  publicKey: UPLOADCARE_PUBLIC_KEY,
  previewStep: true,
  multiple: false,
  imagesOnly: true,
  clearable: true,
  crop: '1:1', // Square crop for profile photos
  imageShrink: '600x600', // Resize to 600x600 for faster uploads
};

/**
 * Upload a file to Uploadcare
 * @param file - File object to upload
 * @returns Promise with uploaded file info
 */
export const uploadToUploadcare = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Create a temporary input element for Uploadcare
    const input = document.createElement('input');
    input.type = 'hidden';
    document.body.appendChild(input);
    
    // Use Uploadcare's direct file upload with config
    const widget = uploadcare.Widget(input, uploadcareConfig);
    
    // Open dialog and handle result
    widget.onUploadComplete((info: any) => {
      document.body.removeChild(input);
      resolve(info);
    });
    
    widget.onError((error: any) => {
      document.body.removeChild(input);
      reject(error);
    });
    
    // Set the file and open dialog
    widget.value(file);
  });
};

/**
 * Direct upload to Uploadcare using SDK
 * @param file - File object to upload
 * @returns Promise with uploaded file URL
 */
export const directUploadToUploadcare = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`https://upload.uploadcare.com/files/?pub_key=${UPLOADCARE_PUBLIC_KEY}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Uploadcare error response:', errorText);
      throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Uploadcare response:', data);

    // The response should contain file info with uuid
    if (data.uuid) {
      return `https://ucarecdn.com/${data.uuid}/`;
    } else if (data.file_id) {
      return `https://ucarecdn.com/${data.file_id}/`;
    } else {
      console.error('Unexpected response format:', data);
      throw new Error('Invalid response from Uploadcare: no file ID found');
    }
  } catch (error) {
    console.error('Uploadcare upload error:', error);
    throw error;
  }
};

export default uploadcare;