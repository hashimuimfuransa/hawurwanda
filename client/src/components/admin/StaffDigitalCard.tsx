import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { X, Download, Building2, Calendar, Star, Award, User, Phone, Mail, Scissors, Upload, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/api';

interface StaffDigitalCardProps {
  staff: any;
  isOpen: boolean;
  onClose: () => void;
}

const StaffDigitalCard: React.FC<StaffDigitalCardProps> = ({ staff, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [cardView, setCardView] = useState<'front' | 'back'>('front');
  const [downloadingCard, setDownloadingCard] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (staff && isOpen) {
      generateQRCode();
    }
  }, [staff, isOpen]);

  const generateQRCode = async () => {
    const staffInfo = JSON.stringify({
      id: staff._id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      salon: staff.salonId?.name || 'N/A',
    });

    try {
      const qrUrl = await QRCode.toDataURL(staffInfo, {
        width: 200,
        margin: 1,
        color: { dark: '#1e3a8a', light: '#ffffff' },
      });
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadCard = async (view: 'front' | 'back') => {
    const cardElement = document.getElementById(`staff-card-${view}`);
    if (!cardElement) {
      toast.error('Card element not found');
      return;
    }

    setDownloadingCard(true);
    try {
      // Wait for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(cardElement, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 15000, // Increase timeout
        onclone: (clonedDoc) => {
          const clonedCard = clonedDoc.getElementById(`staff-card-${view}`);
          if (clonedCard) {
            // Ensure all images are visible
            const images = clonedCard.getElementsByTagName('img');
            Array.from(images).forEach((img: HTMLImageElement) => {
              img.style.display = 'block';
              img.style.visibility = 'visible';
              img.crossOrigin = 'anonymous';
            });
            
            // Ensure proper styling is applied
            clonedCard.style.transform = 'none';
            clonedCard.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
          }
        },
        removeContainer: true,
      });

      // Convert to high-quality PNG
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${staff.name.replace(/\s+/g, '-')}-staff-card-${view}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Card downloaded successfully');
    } catch (error) {
      console.error('Error downloading card:', error);
      toast.error('Failed to download card. Please try again.');
    } finally {
      setDownloadingCard(false);
    }
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Calculate new dimensions (max 400px on longest side for profile photos to make them faster)
          let { width, height } = img;
          const maxSize = 400;
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw image with compression
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with 60% quality for faster uploads
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Could not compress image'));
              }
            },
            'image/jpeg',
            0.6
          );
        };
        img.onerror = () => reject(new Error('Could not load image'));
      };
      reader.onerror = () => reject(new Error('Could not read file'));
    });
  };

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reduce file size limit to 5MB to prevent timeouts
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB. Please choose a smaller image.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploadingPhoto(true);
    try {
      // Compress image to reduce upload time
      let finalFile = file;
      if (file.type !== 'image/gif') { // Don't compress GIFs to preserve animation
        try {
          const compressedBlob = await compressImage(file);
          finalFile = new File([compressedBlob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
        } catch (compressError) {
          console.warn('Could not compress image, uploading original:', compressError);
        }
      }

      const formData = new FormData();
      formData.append('profilePhoto', finalFile);

      // Use the admin service to update staff profile photo with retry mechanism
      let uploadSuccess = false;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!uploadSuccess && attempts < maxAttempts) {
        try {
          await adminService.updateStaffProfilePhoto(staff._id, formData);
          uploadSuccess = true;
        } catch (error: any) {
          attempts++;
          if (attempts >= maxAttempts) {
            throw error; // Re-throw if max attempts reached
          }
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
      toast.success('Profile photo uploaded successfully!');
      setShowUploadModal(false);
      
      // Refresh the component data without full page reload
      queryClient.refetchQueries({ queryKey: ['admin-staff'] });
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        toast.error('Upload timed out. Please try a smaller image or check your connection.');
      } else if (error.response?.status === 404) {
        toast.error('Staff member not found');
      } else if (error.response?.status === 403) {
        toast.error('Permission denied');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to upload profile photo. Please try again.');
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!isOpen || !staff) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Staff Digital Card</h3>
              <p className="text-sm text-gray-500 mt-1">{staff.name}</p>
            </div>
            <div className="flex items-center space-x-3">
              {uploadingPhoto ? (
                <button
                  disabled={true}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-400 text-white rounded-lg cursor-not-allowed"
                >
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </button>
              ) : (!staff.profilePhoto || staff.profilePhoto === '' || staff.profilePhoto === null) ? (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Photo</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>Change Photo</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-lg border-2 border-gray-300 p-1 bg-gray-50">
              <button
                onClick={() => setCardView('front')}
                className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                  cardView === 'front'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Front Card
              </button>
              <button
                onClick={() => setCardView('back')}
                className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                  cardView === 'back'
                    ? 'bg-slate-700 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Back Card
              </button>
            </div>
          </div>

          {/* Card Display Area */}
          <div className="relative min-h-[400px]">
            {/* Front Card */}
            {cardView === 'front' && (
              <div
                id="staff-card-front"
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl"
                style={{ aspectRatio: '1.586 / 1' }}
              >
                <div className="h-full flex items-center gap-8">
                  {/* Left Side - Profile Photo */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="relative">
                      {staff.profilePhoto ? (
                        <img
                          src={staff.profilePhoto}
                          alt={staff.name}
                          className="h-40 w-40 rounded-full object-cover border-4 border-white shadow-xl"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="h-40 w-40 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white flex items-center justify-center shadow-xl">
                          <span className="text-white font-bold text-6xl">
                            {staff.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="absolute -bottom-3 -right-3 bg-white rounded-full p-3 shadow-lg">
                        <Scissors className="h-7 w-7 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Personal Info */}
                  <div className="flex-1 space-y-6">
                    {/* Name & Role */}
                    <div className="border-b border-white/30 pb-4">
                      <h2 className="text-4xl font-bold mb-2">{staff.name}</h2>
                      <p className="text-2xl text-blue-100 capitalize font-medium">
                        {staff.role?.replace('_', ' ') || 'Staff Member'}
                      </p>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-blue-100 mb-3">Contact Information</h3>
                      <div className="flex items-center space-x-3 bg-white/15 backdrop-blur-sm rounded-lg p-3">
                        <Mail className="h-5 w-5 text-white flex-shrink-0" />
                        <span className="text-sm break-all">{staff.email}</span>
                      </div>
                      <div className="flex items-center space-x-3 bg-white/15 backdrop-blur-sm rounded-lg p-3">
                        <Phone className="h-5 w-5 text-white flex-shrink-0" />
                        <span className="text-sm">{staff.phone}</span>
                      </div>
                    </div>

                    {/* Status & ID */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/30">
                      <div>
                        <p className="text-blue-100 text-xs mb-1">Staff ID</p>
                        <p className="font-mono font-bold text-lg">#{staff._id.slice(-8).toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-100 text-xs mb-1">Status</p>
                        <span className={`px-4 py-2 rounded-full font-semibold text-sm inline-block ${
                          staff.isActive !== false
                            ? 'bg-green-500/40 text-green-100 border border-green-300'
                            : 'bg-red-500/40 text-red-100 border border-red-300'
                        }`}>
                          {staff.isActive !== false ? '● Active' : '● Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Back Card */}
            {cardView === 'back' && (
              <div
                id="staff-card-back"
                className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-2xl p-8 text-white shadow-2xl"
                style={{ aspectRatio: '1.586 / 1' }}
              >
                <div className="h-full flex gap-6">
                  {/* Left Side - Salon & QR Code */}
                  <div className="w-1/3 flex flex-col justify-between">
                    {/* Salon Details */}
                    <div className="space-y-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
                          <Building2 className="h-4 w-4 mr-2" />
                          Workplace
                        </h3>
                        {staff.salonId ? (
                          <div className="space-y-2">
                            <p className="font-bold text-lg break-words">{staff.salonId.name}</p>
                            {staff.salonId.address && (
                              <p className="text-xs text-slate-300 break-words">{staff.salonId.address}</p>
                            )}
                            {staff.salonId.district && (
                              <p className="text-xs text-slate-300">{staff.salonId.district}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400">No salon assigned</p>
                        )}
                      </div>

                      {/* Member Since */}
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Member Since
                        </h3>
                        <p className="font-bold text-lg">
                          {new Date(staff.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* QR Code */}
                    {qrCodeUrl && (
                      <div className="bg-white rounded-xl p-4 shadow-xl">
                        <img src={qrCodeUrl} alt="Staff QR Code" className="w-full h-auto" />
                        <p className="text-xs text-slate-600 text-center mt-2 font-medium">Scan for details</p>
                      </div>
                    )}
                  </div>

                  {/* Right Side - Professional Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    {/* Header */}
                    <div className="border-b border-white/20 pb-4">
                      <h2 className="text-2xl font-bold mb-1">Professional Profile</h2>
                      <p className="text-slate-300 text-sm">{staff.name}</p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 py-4 space-y-5">
                      {/* Specialties */}
                      {staff.specialties && staff.specialties.length > 0 && (
                        <div>
                          <h4 className="text-base font-semibold mb-3 flex items-center text-slate-200">
                            <Star className="h-4 w-4 mr-2 text-yellow-400" />
                            Specialties
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {staff.specialties.map((specialty: string, index: number) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-500/20 text-blue-200 border border-blue-400/30"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Experience */}
                      {staff.experience && (
                        <div>
                          <h4 className="text-base font-semibold mb-2 flex items-center text-slate-200">
                            <Award className="h-4 w-4 mr-2 text-yellow-400" />
                            Experience
                          </h4>
                          <p className="text-slate-300">{staff.experience} years of professional experience</p>
                        </div>
                      )}

                      {/* Bio */}
                      {staff.bio && (
                        <div>
                          <h4 className="text-base font-semibold mb-2 flex items-center text-slate-200">
                            <User className="h-4 w-4 mr-2 text-blue-400" />
                            About
                          </h4>
                          <p className="text-slate-300 text-sm leading-relaxed">{staff.bio}</p>
                        </div>
                      )}

                      {/* Credentials */}
                      {staff.credentials && staff.credentials.length > 0 && (
                        <div>
                          <h4 className="text-base font-semibold mb-2 flex items-center text-slate-200">
                            <Award className="h-4 w-4 mr-2 text-green-400" />
                            Credentials
                          </h4>
                          <ul className="space-y-1">
                            {staff.credentials.map((credential: string, index: number) => (
                              <li key={index} className="text-sm text-slate-300 flex items-center">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                                {credential}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="text-center pt-4 border-t border-white/20">
                      <p className="text-slate-400 text-xs">Professional ID Card • {staff.salonId?.name || 'Staff Member'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => downloadCard('front')}
                disabled={downloadingCard}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {downloadingCard ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Download Front</span>
                  </>
                )}
              </button>
              <button
                onClick={() => downloadCard('back')}
                disabled={downloadingCard}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-slate-700 to-slate-900 rounded-lg hover:from-slate-800 hover:to-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {downloadingCard ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Download Back</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Photo Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Upload Profile Photo</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-3xl">
                      {staff.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{staff.name}</p>
                    <p className="text-sm text-gray-500">{staff.email}</p>
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    {uploadingPhoto ? (
                      <div className="flex items-center justify-center space-x-2 text-blue-600">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <span className="text-sm font-medium">Uploading photo...</span>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700 font-medium">
                          Choose a photo
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePhotoUpload}
                          className="hidden"
                          disabled={uploadingPhoto}
                        />
                      </label>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={uploadingPhoto}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default StaffDigitalCard;