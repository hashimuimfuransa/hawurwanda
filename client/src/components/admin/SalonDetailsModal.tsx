import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Building2, 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Star,
  Camera,
  Briefcase,
  Scissors,
  Users
} from 'lucide-react';

interface SalonDetailsModalProps {
  showModal: boolean;
  onClose: () => void;
  salonDetails: any;
  salonDetailsLoading: boolean;
  fallbackSalonData?: any;
}

const SalonDetailsModal: React.FC<SalonDetailsModalProps> = ({
  showModal,
  onClose,
  salonDetails,
  salonDetailsLoading,
  fallbackSalonData
}) => {
  // Avoid React concurrent rendering warning by only creating the portal after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll while modal is open
  useEffect(() => {
    const { body } = document;
    const previousOverflow = body.style.overflow;
    if (showModal) {
      body.style.overflow = 'hidden';
    }
    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [showModal]);

  // Combine salon details with fallback data
  const displayData = { ...fallbackSalonData, ...salonDetails?.data };

  if (!mounted) return null;

  return createPortal(
    showModal ? (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
      style={{ zIndex: 99999 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white shadow-2xl w-full sm:max-w-2xl lg:max-w-4xl h-[100vh] sm:h-auto sm:max-h-[92vh] overflow-hidden rounded-none sm:rounded-3xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center sticky top-0 z-10 rounded-t-none sm:rounded-t-3xl">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Salon Verification Details</h2>
              <p className="text-amber-100 text-sm">Review complete salon information for approval</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1">
          {salonDetailsLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
              <p className="text-slate-600">Loading salon details...</p>
            </div>
          ) : salonDetails ? (
            <div className="space-y-6">
              {/* Logo, Cover Images, and Promotional Video */}
              {(displayData.logo || (displayData.coverImages && displayData.coverImages.length > 0) || displayData.promotionalVideo) && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50/50 rounded-2xl p-6 border border-indigo-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <Camera className="h-5 w-5 mr-2 text-indigo-600" />
                    Branding & Media
                  </h3>
                  <div className="space-y-4">
                    {/* Promotional Video */}
                    {displayData.promotionalVideo && (
                      <div>
                        <p className="text-sm text-slate-600 font-medium mb-2">Promotional Video</p>
                        <div className="aspect-video rounded-xl overflow-hidden border-2 border-indigo-200 bg-slate-900">
                          <video
                            controls
                            className="w-full h-full object-cover"
                            poster={displayData.coverImages?.[0] || displayData.logo || undefined}
                          >
                            <source src={displayData.promotionalVideo} type="video/mp4" />
                            <source src={displayData.promotionalVideo} type="video/webm" />
                            <source src={displayData.promotionalVideo} type="video/mov" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      </div>
                    )}

                    {displayData.logo && (
                      <div>
                        <p className="text-sm text-slate-600 font-medium mb-2">Salon Logo</p>
                        <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-indigo-200">
                          <img src={displayData.logo} alt="Salon Logo" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}
                    {displayData.coverImages && displayData.coverImages.length > 0 && (
                      <div>
                        <p className="text-sm text-slate-600 font-medium mb-2">Cover Images ({displayData.coverImages.length})</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {displayData.coverImages.map((image: string, index: number) => (
                            <div key={index} className="aspect-video rounded-xl overflow-hidden border-2 border-indigo-200">
                              <img src={image} alt={`Cover ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50/50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Salon Name</p>
                    <p className="text-base text-slate-900 font-semibold">{displayData.name}</p>
                  </div>
                  {displayData.description && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-slate-600 font-medium">Description</p>
                      <p className="text-base text-slate-900">{displayData.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-2xl p-6 border border-green-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-green-600" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayData.phone && (
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Phone</p>
                        <p className="text-base text-slate-900 font-medium">{displayData.phone}</p>
                      </div>
                    </div>
                  )}
                  {displayData.email && (
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Mail className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Email</p>
                        <p className="text-base text-slate-900 font-medium">{displayData.email}</p>
                      </div>
                    </div>
                  )}
                  {displayData.address && (
                    <div className="flex items-center space-x-3 md:col-span-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Address</p>
                        <p className="text-base text-slate-900 font-medium">{displayData.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Operating Hours */}
              {displayData.operatingHours && (
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50/50 rounded-2xl p-6 border border-amber-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-amber-600" />
                    Operating Hours
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(displayData.operatingHours).map(([day, hours]: [string, any]) => (
                      <div key={day} className="flex justify-between items-center bg-white rounded-lg p-3 border border-amber-200">
                        <span className="font-medium text-slate-900 capitalize">{day}</span>
                        <span className="text-slate-600">
                          {hours.isOpen ? `${hours.open} - ${hours.close}` : 'Closed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Categories */}
              {displayData.serviceCategories && displayData.serviceCategories.length > 0 && (
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50/50 rounded-2xl p-6 border border-teal-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-teal-600" />
                    Service Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {displayData.serviceCategories.map((category: string, index: number) => (
                      <span key={index} className="px-4 py-2 bg-teal-100 text-teal-800 rounded-full text-sm font-medium capitalize">
                        {category}
                      </span>
                    ))}
                  </div>
                  {displayData.customServices && (
                    <div className="mt-4">
                      <p className="text-sm text-slate-600 font-medium">Custom Services</p>
                      <p className="text-base text-slate-900 mt-1">{displayData.customServices}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Services */}
              {displayData.services && displayData.services.length > 0 && (
                <div className="bg-gradient-to-br from-emerald-50 to-green-50/50 rounded-2xl p-6 border border-emerald-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <Scissors className="h-5 w-5 mr-2 text-emerald-600" />
                    Services Offered ({displayData.services.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayData.services.map((service: any, index: number) => (
                      <div key={index} className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm">
                        <p className="font-semibold text-slate-900 text-lg">{service.title || service.name}</p>
                        {service.description && (
                          <p className="text-sm text-slate-600 mt-1">{service.description}</p>
                        )}
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-emerald-100">
                          <span className="text-emerald-600 font-bold text-lg">{service.price} RWF</span>
                          <span className="text-sm text-slate-500 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {service.durationMinutes || service.duration} min
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Barbers */}
              {displayData.barbers && displayData.barbers.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50/50 rounded-2xl p-6 border border-purple-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-purple-600" />
                    Barbers ({displayData.barbers.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayData.barbers.map((barber: any, index: number) => (
                      <div key={index} className="bg-white rounded-xl p-4 border border-purple-200 flex items-center space-x-4">
                        <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                          {barber.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{barber.name}</p>
                          <p className="text-sm text-slate-600">{barber.specialization || 'General Barber'}</p>
                          {barber.experience && (
                            <p className="text-xs text-slate-500 mt-1">{barber.experience} years experience</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery */}
              {displayData.gallery && displayData.gallery.length > 0 && (
                <div className="bg-gradient-to-br from-rose-50 to-red-50/50 rounded-2xl p-6 border border-rose-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <Camera className="h-5 w-5 mr-2 text-rose-600" />
                    Gallery ({displayData.gallery.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {displayData.gallery.map((image: string, index: number) => (
                      <div key={index} className="aspect-square rounded-xl overflow-hidden border border-rose-200">
                        <img
                          src={image}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-slate-600">No salon details available</p>
            </div>
          )}
        </div>
      </div>
    </div>
    ) : null,
    document.body
  );
};

export default SalonDetailsModal;