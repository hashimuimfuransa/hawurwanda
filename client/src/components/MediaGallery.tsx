import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Image as ImageIcon, Camera, Crown } from 'lucide-react';

interface MediaGalleryProps {
  salon: {
    logo?: string;
    gallery?: string[];
    promotionalVideo?: string;
    uploadedImages?: string[];
  };
  salonName: string;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ salon, salonName }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Combine all media sources with better organization
  const allMedia = [
    // Logo first if available - special treatment
    ...(salon.logo ? [{ 
      type: 'logo', 
      url: salon.logo, 
      title: `${salonName} Logo`,
      priority: 1 
    }] : []),
    // Promotional video second
    ...(salon.promotionalVideo ? [{ 
      type: 'video', 
      url: salon.promotionalVideo, 
      title: `${salonName} Promotional Video`,
      priority: 2
    }] : []),
    // Gallery images
    ...(salon.gallery?.map((url, index) => ({
      type: 'gallery',
      url,
      title: `${salonName} Gallery ${index + 1}`,
      priority: 3
    })) || []),
    // Uploaded images
    ...(salon.uploadedImages?.map((url, index) => ({
      type: 'uploaded',
      url,
      title: `${salonName} Uploaded ${index + 1}`,
      priority: 4
    })) || [])
  ];

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setSelectedImage(allMedia[index].url);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % allMedia.length);
    setSelectedImage(allMedia[(currentIndex + 1) % allMedia.length].url);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
    setSelectedImage(allMedia[(currentIndex - 1 + allMedia.length) % allMedia.length].url);
  };

  if (allMedia.length === 0) {
    return (
      <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <span className="text-gray-500 dark:text-gray-400 text-lg">No media available</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Main Featured Image/Video */}
        <div className="relative overflow-hidden rounded-xl shadow-lg group">
          {allMedia[0].type === 'video' ? (
            <div className="relative">
              <video
                controls
                className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-xl"
                poster={allMedia[1]?.url || undefined}
              >
                <source src={allMedia[0].url} type="video/mp4" />
                <source src={allMedia[0].url} type="video/webm" />
                <source src={allMedia[0].url} type="video/mov" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <Play className="h-4 w-4 mr-1" />
                Promotional Video
              </div>
            </div>
          ) : allMedia[0].type === 'logo' ? (
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-8">
              <div className="flex items-center justify-center h-64 sm:h-80 lg:h-96">
                <div className="text-center">
                  <div className="relative mb-4">
                    <img
                      src={allMedia[0].url}
                      alt={allMedia[0].title}
                      className="max-h-48 sm:max-h-64 lg:max-h-80 max-w-full object-contain transition-transform duration-500 group-hover:scale-105 cursor-pointer rounded-lg shadow-lg"
                      onClick={() => openModal(0)}
                    />
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                      <Crown className="h-3 w-3 mr-1" />
                      LOGO
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{salonName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Official Logo</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <img
                src={allMedia[0].url}
                alt={allMedia[0].title}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                onClick={() => openModal(0)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <ImageIcon className="h-4 w-4 mr-1" />
                Featured
              </div>
            </div>
          )}
        </div>

        {/* Thumbnail Grid */}
        {allMedia.length > 1 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {allMedia.slice(1).map((media, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-lg shadow-md group cursor-pointer"
                onClick={() => openModal(index + 1)}
              >
                {media.type === 'video' ? (
                  <div className="relative">
                    <video
                      className="w-full h-24 sm:h-32 object-cover transition-transform duration-500 group-hover:scale-105"
                      muted
                    >
                      <source src={media.url} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium">
                      Video
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={media.url}
                      alt={media.title}
                      className="w-full h-24 sm:h-32 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium">
                      {media.type === 'logo' ? 'Logo' : 
                       media.type === 'gallery' ? 'Gallery' : 
                       media.type === 'uploaded' ? 'Uploaded' : 'Media'}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Media Count */}
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <ImageIcon className="h-4 w-4 mr-1" />
            <span>{allMedia.filter(m => m.type !== 'video').length} Images</span>
          </div>
          {salon.promotionalVideo && (
            <div className="flex items-center">
              <Play className="h-4 w-4 mr-1" />
              <span>1 Video</span>
            </div>
          )}
          {salon.logo && (
            <div className="flex items-center">
              <Crown className="h-4 w-4 mr-1" />
              <span>Logo</span>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            
            {allMedia[currentIndex].type === 'video' ? (
              <video
                controls
                autoPlay
                className="max-w-full max-h-[80vh] rounded-lg"
              >
                <source src={selectedImage} type="video/mp4" />
                <source src={selectedImage} type="video/webm" />
                <source src={selectedImage} type="video/mov" />
              </video>
            ) : (
              <img
                src={selectedImage}
                alt={allMedia[currentIndex].title}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            )}

            {/* Navigation */}
            {allMedia.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Media Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-4 rounded-lg">
              <h3 className="font-semibold text-lg">{allMedia[currentIndex].title}</h3>
              <p className="text-sm opacity-80">
                {currentIndex + 1} of {allMedia.length} • {allMedia[currentIndex].type}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MediaGallery;
