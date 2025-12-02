import React, { useState, useRef } from 'react';
import { X, User, Mail, UserCheck, Camera, Download } from 'lucide-react';
import QRCode from 'react-qr-code';
import * as htmlToImage from 'html-to-image';

interface StaffDigitalCardProps {
  staff: any;
  onClose: () => void;
}

const StaffDigitalCard: React.FC<StaffDigitalCardProps> = ({ staff, onClose }) => {
  if (!staff) return null;

  const [profilePhoto, setProfilePhoto] = useState<string | null>(staff.profilePhoto || null);
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setTempPhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const savePhoto = () => {
    if (tempPhoto) {
      setProfilePhoto(tempPhoto);
      setTempPhoto(null);
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

  // Ensure all images are loaded
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

  // Hide buttons before capture
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

  // Download Front
  const downloadFrontCard = async () => {
    if (!frontCardRef.current) return;

    try {
      await hideButtonsTemporarily(frontCardRef.current, async () => {
        await waitForImages(frontCardRef.current);

        const dataUrl = await htmlToImage.toPng(frontCardRef.current, {
          cacheBust: true,
          quality: 1,
          pixelRatio: 2,
          backgroundColor: '#1e3a8a',
        });

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `hawu-member-card-front-${staff.name.replace(/\s+/g, '_')}-${staff._id.substring(0, 8)}.png`;
        link.click();
      });
    } catch (error) {
      console.error('Front download error:', error);
    }
  };

  // Download Back
  const downloadBackCard = async () => {
    if (!backCardRef.current) return;

    try {
      await hideButtonsTemporarily(backCardRef.current, async () => {
        await waitForImages(backCardRef.current);

        const dataUrl = await htmlToImage.toPng(backCardRef.current, {
          cacheBust: true,
          quality: 1,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
        });

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `hawu-member-card-back-${staff.name.replace(/\s+/g, '_')}-${staff._id.substring(0, 8)}.png`;
        link.click();
      });
    } catch (error) {
      console.error('Back download error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border-2 border-white/10">
        <div className="flex flex-col md:flex-row">

          {/* FRONT CARD */}
          <div ref={frontCardRef} className="w-full md:w-2/5 bg-gradient-to-br from-blue-900 to-indigo-800 p-8 flex flex-col items-center justify-center relative">

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10 download-hide"
            >
              <X className="h-6 w-6" />
            </button>

            <button
              onClick={downloadFrontCard}
              className="absolute top-4 left-4 text-white/70 hover:text-white transition-colors z-10 download-hide"
            >
              <Download className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              <div className="bg-white rounded-2xl p-4 inline-block mb-2 shadow-lg">
                <img
                  src={`${window.location.origin}/images/logo.png`}
                  alt="Logo"
                  className="h-16 w-auto mx-auto"
                  crossOrigin="anonymous"
                />
              </div>
              <p className="text-white/90 text-sm uppercase tracking-wider font-medium mt-2">HAWU MEMBER CARD</p>
            </div>

            {/* PHOTO */}
            <div className="relative group mb-6">
              <div className="relative">
                {(tempPhoto || profilePhoto) ? (
                  <img
                    src={tempPhoto || profilePhoto}
                    alt={staff.name}
                    className="h-32 w-32 rounded-2xl object-cover border-4 border-white/30 shadow-2xl"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-2xl bg-white/10 flex items-center justify-center border-4 border-white/20">
                    <User className="h-16 w-16 text-white/60" />
                  </div>
                )}

                <label className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer download-hide">
                  <Camera className="h-8 w-8 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>

              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full p-2 shadow-lg border-2 border-white">
                <UserCheck className="h-5 w-5 text-gray-900" />
              </div>
            </div>

            {/* NAME */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">{staff.name}</h2>
              <p className="text-blue-200 mt-1 capitalize">
                {staff.staffCategory || staff.role || 'Staff Member'}
              </p>
            </div>

            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-3 w-full">
              <div className="flex items-center justify-between">
                <span className="text-blue-200 text-sm">Member ID</span>
                <span className="text-white font-mono text-sm">{staff._id?.substring(0, 8).toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* BACK CARD */}
          <div ref={backCardRef} className="w-full md:w-3/5 bg-white p-8 flex flex-col">

            <button
              onClick={onClose}
              className="self-end text-gray-500 hover:text-gray-700 transition-colors z-10 download-hide"
            >
              <X className="h-6 w-6" />
            </button>

            <button
              onClick={downloadBackCard}
              className="self-start text-gray-500 hover:text-gray-700 transition-colors z-10 flex items-center mb-4 download-hide"
            >
              <Download className="h-5 w-5 mr-1" />
              <span className="text-sm">Download</span>
            </button>

            <div className="flex-grow flex flex-col items-center justify-center text-center">

              <div className="mb-8">
                <div className="bg-white rounded-2xl p-4 inline-block shadow-lg mb-3">
                  <img
                    src={`${window.location.origin}/images/logo.png`}
                    alt="Logo"
                    className="h-16 w-auto mx-auto"
                    crossOrigin="anonymous"
                  />
                </div>
                <p className="text-gray-600 text-sm uppercase tracking-wider">MEMBER CARD</p>
              </div>

              <div className="mb-8">
                <div className="bg-gray-900 p-4 rounded-xl inline-block">
                  <QRCode
                    value={`HAWU-MEMBER-ID:${staff._id}\nNAME:${staff.name}\nROLE:${staff.staffCategory || staff.role || 'Staff'}`}
                    size={120}
                    bgColor="#111827"
                    fgColor="#ffffff"
                    level="H"
                  />
                </div>
                <p className="text-gray-600 text-sm mt-2">Scan for member details</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Lost Card?</h3>
                <p className="text-gray-600 mb-4">If this card is lost, please contact us at:</p>
                <div className="flex items-center justify-center bg-white rounded-lg p-3 border">
                  <Mail className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-600">info@hawu.com</span>
                </div>
              </div>

              <div className="mt-6 text-xs text-gray-500">
                <p>ID: {staff._id}</p>
                <p>Joined: {formatDate(staff.createdAt)}</p>
              </div>

            </div>
          </div>
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
