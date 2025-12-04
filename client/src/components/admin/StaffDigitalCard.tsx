import React, { useState, useRef, useEffect } from 'react';
import { X, User, Mail, UserCheck, Camera, Download, Save, X as CloseIcon, Phone } from 'lucide-react';
import QRCode from 'react-qr-code';
import * as htmlToImage from 'html-to-image';
import { adminService } from '../../services/api';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface StaffDigitalCardProps {
  staff: any;
  onClose: () => void;
  onUpdateStaff?: (updatedStaff: any) => void;
}

const StaffDigitalCard: React.FC<StaffDigitalCardProps> = ({ staff, onClose, onUpdateStaff }) => {
  if (!staff) return null;

  const [profilePhoto, setProfilePhoto] = useState<string | null>(staff.profilePhoto || null);
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const frontCardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCropImage(event.target.result as string);
          setCrop(undefined); // Reset crop when new image is selected
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1, // Aspect ratio 1:1 for square crop
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  };

  const saveCroppedImage = () => {
    if (imgRef.current && completedCrop) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;
      
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );
      
      const dataUrl = canvas.toDataURL('image/png');
      setTempPhoto(dataUrl);
      setCropImage(null);
    }
  };

  const cancelCrop = () => {
    setCropImage(null);
  };

  const savePhotoToBackend = async () => {
    if (!tempPhoto) return;
    
    setIsSaving(true);
    try {
      // Convert data URL to Blob
      const blob = await fetch(tempPhoto).then(res => res.blob());
      const file = new File([blob], `profile_${staff._id}.png`, { type: 'image/png' });
      
      // Create FormData
      const formData = new FormData();
      formData.append('profilePhoto', file);
      
      // Update staff member with new profile photo
      const response = await adminService.updateStaffMember(staff._id, formData);
      
      // Update local state and notify parent component
      setProfilePhoto(tempPhoto);
      setTempPhoto(null);
      
      if (onUpdateStaff) {
        onUpdateStaff(response.data.staff);
      }
      
      alert('Profile photo updated successfully!');
    } catch (error) {
      console.error('Error saving profile photo:', error);
      alert('Failed to update profile photo. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelPhoto = () => {
    setTempPhoto(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const waitForImages = (element: HTMLElement): Promise<void> =>
    new Promise((resolve) => {
      const images = element.querySelectorAll('img');
      let loadedCount = 0;

      if (images.length === 0) return resolve();

      images.forEach((img) => {
        if (img.complete) {
          loadedCount++;
          if (loadedCount === images.length) resolve();
        } else {
          img.onload = () => {
            loadedCount++;
            if (loadedCount === images.length) resolve();
          };
          img.onerror = () => {
            loadedCount++;
            if (loadedCount === images.length) resolve();
          };
        }
      });
    });

  const hideButtonsTemporarily = async (cardRef: HTMLElement, callback: () => Promise<void>) => {
    const elementsToHide = cardRef.querySelectorAll('.download-hide');

    elementsToHide.forEach((el: any) => {
      el.dataset.originalDisplay = el.style.display;
      el.style.display = 'none';
    });

    await callback();

    elementsToHide.forEach((el: any) => {
      el.style.display = el.dataset.originalDisplay || '';
      delete el.dataset.originalDisplay;
    });
  };

  const downloadFrontCard = async () => {
    if (!frontCardRef.current) return;

    try {
      await hideButtonsTemporarily(frontCardRef.current, async () => {
        await waitForImages(frontCardRef.current);

        const cardElement = frontCardRef.current;
        if (cardElement) {
          const originalBackground = cardElement.style.background;
          
          cardElement.style.background = '#ffffff';
          
          const dataUrl = await htmlToImage.toPng(cardElement, {
            cacheBust: true,
            quality: 1,
            pixelRatio: 2,
            backgroundColor: '#ffffff',
          });
          
          cardElement.style.background = originalBackground;
          
          // Record the download in the backend
          try {
            await adminService.recordDigitalCardDownload(staff._id);
          } catch (error) {
            console.error('Failed to record download:', error);
          }
          
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `hawu-member-card-${staff.name.replace(/\s+/g, '_')}-${staff._id.substring(0, 8)}.png`;
          link.click();
        }
      });
    } catch (error) {
      console.error('Front download error:', error);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden border border-gray-200">
        {/* SINGLE CARD */}
        <div ref={frontCardRef} className="w-full bg-white p-5 flex flex-col items-center justify-center relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors z-10 download-hide"
          >
            <X className="h-4 w-4" />
          </button>

          <button
            onClick={downloadFrontCard}
            className="absolute top-3 left-3 text-gray-400 hover:text-gray-700 transition-colors z-10 download-hide"
          >
            <Download className="h-4 w-4" />
          </button>

          <div className="text-center mb-4">
            <img
              src={`${window.location.origin}/images/logo.png`}
              alt="Logo"
              className="h-28 w-auto mx-auto"
              crossOrigin="anonymous"
            />
            <p className="text-gray-800 text-sm uppercase tracking-wide font-bold mt-2">HAWU MEMBER CARD</p>
          </div>

          {/* PHOTO */}
          <div className="relative group mb-4">
            <div className="relative">
              {cropImage ? (
                <div className="flex flex-col items-center">
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={1}
                    circularCrop
                  >
                    <img
                      ref={imgRef}
                      src={cropImage}
                      alt="Crop"
                      onLoad={onImageLoad}
                      className="max-h-64"
                    />
                  </ReactCrop>
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={saveCroppedImage}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Apply Crop
                    </button>
                    <button
                      onClick={cancelCrop}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : tempPhoto || profilePhoto ? (
                <img
                  src={tempPhoto || profilePhoto}
                  alt={staff.name}
                  className="h-32 w-32 rounded-xl object-cover object-center border-2 border-gray-200 shadow-md"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="h-32 w-32 rounded-xl bg-gray-50 flex items-center justify-center border-2 border-gray-200">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              )}

              {!cropImage && (
                <label className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer download-hide">
                  <Camera className="h-8 w-8 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              )}
            </div>

            <div className="absolute -bottom-2 -right-2 bg-amber-400 rounded-full p-2 shadow border border-white">
              <UserCheck className="h-5 w-5 text-gray-900" />
            </div>
          </div>

          {/* NAME */}
          <div className="text-center mb-3">
            <h2 className="text-xl font-bold text-gray-900 mb-0.5">{staff.name}</h2>
            <p className="text-gray-600 text-sm font-medium capitalize">
              {staff.staffCategory || staff.role || 'Staff Member'}
            </p>
          </div>

          <div className="mt-2 bg-gray-50 rounded-md p-2 w-full border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-xs font-medium">Member ID</span>
              <span className="text-gray-900 font-bold text-sm font-mono">{staff._id?.substring(0, 8).toUpperCase()}</span>
            </div>
          </div>
          
          {/* QR CODE SECTION */}
          <div className="mt-4 mb-4 flex justify-center w-full">
            <div className="bg-gray-900 p-4 rounded-xl inline-flex flex-col items-center border border-gray-300 shadow-sm">
              <div className="bg-white p-2 rounded-lg">
                <QRCode
                  value={`HAWU MEMBER PROFILE
ID:${staff._id}
Name:${staff.name}
Role:${staff.staffCategory || staff.role || 'Staff'}
Since:${formatDate(staff.createdAt)}`}
                  size={100}
                  bgColor="#ffffff"
                  fgColor="#111827"
                  level="H"
                />
              </div>
              <p className="text-gray-300 text-xs mt-2 font-medium">Scan to view member profile</p>
            </div>
          </div>
          
          {/* LOST CARD INFORMATION */}
          <div className="bg-gray-100 rounded-lg p-3 w-full border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-1.5 text-center">If Lost, Please Contact</h3>
            <div className="flex items-center justify-center bg-white rounded-md p-2 shadow-sm border border-gray-200">
              <Phone className="h-4 w-4 text-gray-600 mr-1.5" />
              <span className="font-bold text-gray-900 text-base">0793828834</span>
            </div>
            <p className="text-gray-600 text-xs mt-1.5 text-center">Professional Hairdressers Association</p>
          </div>

          {/* Save/Cancel buttons for photo changes */}
          {tempPhoto && !cropImage && (
            <div className="flex space-x-2 mt-4 download-hide">
              <button
                onClick={savePhotoToBackend}
                disabled={isSaving}
                className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 text-xs font-medium"
              >
                <Save className="h-3 w-3 mr-1" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={cancelPhoto}
                className="flex items-center px-3 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-xs font-medium"
              >
                <CloseIcon className="h-3 w-3 mr-1" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffDigitalCard;