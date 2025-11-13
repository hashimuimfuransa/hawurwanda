import uploadcare from 'uploadcare-widget';

// Initialize Uploadcare with public key from environment
const UPLOADCARE_PUBLIC_KEY = import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY || 'your-uploadcare-public-key';

// Configure Uploadcare
uploadcare.defaults({
  publicKey: UPLOADCARE_PUBLIC_KEY,
  previewStep: true,
  multiple: false,
  imagesOnly: true,
  clearable: true,
  crop: '1:1', // Square crop for profile photos
  imageShrink: '600x600', // Resize to 600x600 for faster uploads
});

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
    
    // Set the file to the input
    const data = new FormData();
    data.append('file', file);
    
    // Use Uploadcare's direct file upload
    const widget = uploadcare.Widget(input);
    
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
 * Direct upload to Uploadcare using REST API
 * @param file - File object to upload
 * @returns Promise with uploaded file URL
 */
export const directUploadToUploadcare = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('UPLOADCARE_PUB_KEY', UPLOADCARE_PUBLIC_KEY);
  formData.append('file', file);
  
  try {
    const response = await fetch('https://upload.uploadcare.com/base/', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }
    
    const data = await response.json();
    // Return the CDN URL for the uploaded file
    return `https://ucarecdn.com/${data.file}/`;
  } catch (error) {
    console.error('Uploadcare upload error:', error);
    throw error;
  }
};

export default uploadcare;