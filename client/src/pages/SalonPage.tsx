import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, Clock, Phone, Mail, Calendar, User, CheckCircle, ArrowLeft, Sparkles, Shield, Award, Users, Crown, Scissors, Heart, XCircle, User as UserIcon, AlertCircle, X, Target } from 'lucide-react';
import { salonService } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useTranslationStore } from '../stores/translationStore';
import Navbar from '../components/Navbar';
import MediaGallery from '../components/MediaGallery';
import QuickBooking from '../components/QuickBooking';
import RelatedSalons from '../components/RelatedSalons';

const SalonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const { language, t } = useTranslationStore();
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [availableStaff, setAvailableStaff] = useState<any[]>([]);
  const [showStaffSelection, setShowStaffSelection] = useState(false);
  const [showServiceSelectionMessage, setShowServiceSelectionMessage] = useState(false);

  const { data: salonResponse, isLoading, error } = useQuery({
    queryKey: ['salon', id],
    queryFn: () => salonService.getSalon(id!),
    enabled: !!id,
  });

  const salon = salonResponse?.data?.salon || salonResponse?.salon;

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setSelectedBarber('');
    
    // Find staff members who can perform this service
    const staffForService = salon.barbers?.filter((staff: any) => 
      staff.assignedServices?.some((service: any) => service._id === serviceId)
    ) || [];
    
    setAvailableStaff(staffForService);
    setShowStaffSelection(true);
  };

  const handleStaffSelect = (barberId: string) => {
    setSelectedBarber(barberId);
    setShowStaffSelection(false);
  };

  const handleBookAppointment = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedBarber || !selectedService) {
      alert('Please select a barber and service');
      return;
    }

    navigate(`/booking/${id}/${selectedBarber}/${selectedService}`);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <Navbar />
        <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-300 mt-4">{t('loadingHawu', language)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !salon) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <Navbar />
        <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t('salonNotFound', language)}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                {t('salonNotFoundDesc', language)}
              </p>
              <button
                onClick={() => navigate('/salons')}
                className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <ArrowLeft className="h-4 w-4 inline mr-2" />
                {t('backToSalons', language)}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <Navbar />
      <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/salons')}
            className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-600 px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            {t('backToSalons', language)}
          </button>

          {/* Salon Header */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-xl mb-8 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8">
              {/* Salon Media Gallery */}
              <div className="lg:col-span-2">
                <MediaGallery 
                  salon={{
                    logo: salon.logo,
                    gallery: salon.gallery,
                    promotionalVideo: salon.promotionalVideo,
                    uploadedImages: salon.uploadedImages
                  }}
                  salonName={salon.name}
                />
              </div>

              {/* Salon Info */}
              <div className="space-y-4 lg:space-y-6">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 pr-2">{salon.name}</h1>
                    {salon.verified && (
                      <div className="flex items-center bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900 dark:to-blue-900 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">{t('verified', language)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-300 mb-3">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                      <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                      <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                      <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                      <Star className="h-5 w-5 text-yellow-400 fill-current mr-2" />
                    </div>
                    <span className="text-lg font-semibold">4.8</span>
                    <span className="text-sm ml-2">(24 {t('reviews', language)})</span>
                  </div>

                  <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
                    <MapPin className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-medium">{salon.address}, {salon.district}</span>
                  </div>

                  {salon.description && (
                    <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">{salon.description}</p>
                  )}

                  <div className="space-y-3">
                    {salon.phone && (
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Phone className="h-4 w-4 mr-3 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-medium">{salon.phone}</span>
                      </div>
                    )}
                    {salon.email && (
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Mail className="h-4 w-4 mr-3 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-medium">{salon.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 lg:mb-6">
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{salon.barbers?.length || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium">{t('staffCount', language)}</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{salon.services?.length || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium">{t('servicesCount', language)}</div>
                  </div>
                </div>

                {/* Quick Booking */}
                <QuickBooking 
                  salon={salon}
                  onBookNow={() => {
                    if (!user) {
                      navigate('/login');
                      return;
                    }
                    // Navigate to booking page
                    navigate(`/booking/${salon._id}`);
                  }}
                />
              </div>
          </div>
        </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Services */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
                    <div className="flex items-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{t('ourServices', language)}</h2>
                    </div>
                    <button
                      onClick={() => {
                        if (!user) {
                          navigate('/login');
                          return;
                        }
                        setShowServiceSelectionMessage(true);
                      }}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center text-sm sm:text-base"
                    >
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      <span className="hidden sm:inline">{t('bookAppointmentBtn', language)}</span>
                      <span className="sm:hidden">{t('bookNow', language)}</span>
                    </button>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {salon.services?.map((service) => (
                      <div
                        key={service._id}
                        className={`p-4 sm:p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                          selectedService === service._id
                            ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md'
                        }`}
                        onClick={() => handleServiceSelect(service._id)}
                      >
                        <div className="flex items-start">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                            <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base sm:text-lg truncate">{service.title}</h3>
                                {service.description && (
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 sm:mt-2 leading-relaxed line-clamp-2">{service.description}</p>
                                )}
                                <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 sm:mt-3 space-y-1 sm:space-y-0">
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-emerald-600 dark:text-emerald-400" />
                                    <span className="font-medium">{service.durationMinutes} min</span>
                                  </div>
                                  <div className="flex items-center sm:ml-2">
                                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full">
                                      {service.category}
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {service.targetAudience && service.targetAudience.length > 0 ? (
                                    service.targetAudience.map((audience: string, index: number) => {
                                      const getAudienceInfo = (audience: string) => {
                                        switch (audience) {
                                          case 'children':
                                            return { label: 'Children', icon: '👶', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' };
                                          case 'adults':
                                            return { label: 'Adults', icon: '👤', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' };
                                          case 'men':
                                            return { label: 'Men', icon: '👨', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' };
                                          case 'women':
                                            return { label: 'Women', icon: '👩', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' };
                                          default:
                                            return { label: audience, icon: '👤', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300' };
                                        }
                                      };
                                      
                                      const audienceInfo = getAudienceInfo(audience);
                                      
                                      return (
                                        <span
                                          key={index}
                                          className={`inline-flex items-center px-2 py-1 ${audienceInfo.color} text-xs font-medium rounded-full`}
                                        >
                                          <span className="mr-1">{audienceInfo.icon}</span>
                                          {audienceInfo.label}
                                        </span>
                                      );
                                    })
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 text-xs font-medium rounded-full">
                                      <span className="mr-1">👤</span>
                                      All Ages
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                  {service.price.toLocaleString()} RWF
                                </div>
                                {selectedService === service._id && (
                                  <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Selected
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Barbers */}
            <div>
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Our Team</h2>
                  </div>
                  <div className="space-y-4">
                    {/* Owner Section */}
                    {salon.ownerId && (
                      <div className="p-6 border-2 border-gradient-to-r from-yellow-400 to-orange-500 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 shadow-lg">
                        <div className="flex items-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mr-4 relative">
                            <Crown className="h-8 w-8 text-white" />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-orange-800">★</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                              {salon.ownerId.name}
                              <span className="ml-2 px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs font-semibold rounded-full">
                                Owner
                              </span>
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Salon Owner & Manager
                            </p>
                            <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                              <Phone className="h-4 w-4 mr-1" />
                              <span>{salon.ownerId.phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Staff Members */}
                    {salon.barbers?.map((staff) => (
                      <div
                        key={staff._id}
                        className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                          selectedBarber === staff._id
                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
                        }`}
                        onClick={() => setSelectedBarber(staff._id)}
                      >
                        <div className="flex items-center">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4 relative overflow-hidden">
                            {staff.profilePhoto ? (
                              <img
                                src={staff.profilePhoto}
                                alt={staff.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <span className="text-white font-bold text-lg">
                                {staff.name?.charAt(0).toUpperCase()}
                              </span>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <Scissors className="h-3 w-3 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {staff.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {staff.role === 'barber' ? 'Professional Barber' :
                               staff.role === 'hairstylist' ? 'Hair Stylist' :
                               staff.role === 'nail_technician' ? 'Nail Technician' :
                               staff.role === 'massage_therapist' ? 'Massage Therapist' :
                               staff.role === 'esthetician' ? 'Esthetician' :
                               staff.role === 'receptionist' ? 'Receptionist' :
                               staff.role === 'manager' ? 'Manager' :
                               'Professional Staff'}
                            </p>
                            <div className="flex items-center mt-2">
                              <div className="flex items-center text-yellow-500">
                                <Star className="h-4 w-4 fill-current" />
                                <Star className="h-4 w-4 fill-current" />
                                <Star className="h-4 w-4 fill-current" />
                                <Star className="h-4 w-4 fill-current" />
                                <Star className="h-4 w-4 fill-current" />
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">4.8</span>
                              </div>
                            </div>
                          </div>
                          {selectedBarber === staff._id && (
                            <div className="flex items-center">
                              <CheckCircle className="h-6 w-6 text-blue-500 mr-2" />
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Selected</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Book Button */}
              <div className="mt-8">
                <button
                  onClick={handleBookAppointment}
                  disabled={!selectedBarber || !selectedService}
                  className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg disabled:shadow-none flex items-center justify-center"
                >
                  <Calendar className="h-5 w-5 mr-3" />
                  {t('bookNow', language)}
                </button>
                {(!selectedBarber || !selectedService) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-3">
                    {t('selectBarberAndService', language)}
                  </p>
                )}
              </div>
            </div>
        </div>

          {/* Working Hours */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-xl overflow-hidden mt-8">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Working Hours</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                {Object.entries(salon.workingHours || {}).map(([day, hours]) => (
                  <div key={day} className={`text-center p-4 rounded-xl border-2 transition-all duration-200 ${
                    hours.closed 
                      ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800' 
                      : 'bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-emerald-200 dark:border-emerald-800 hover:shadow-md'
                  }`}>
                    <div className="font-bold text-gray-900 dark:text-gray-100 capitalize mb-2 text-sm">{day}</div>
                    <div className="text-sm">
                      {hours.closed ? (
                        <div className="flex items-center justify-center">
                          <span className="text-red-600 dark:text-red-400 font-medium flex items-center">
                            <XCircle className="h-4 w-4 mr-1" />
                            Closed
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">{hours.open}</div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs">to</div>
                          <div className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">{hours.close}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Staff Selection Modal */}
        {showStaffSelection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Select Your Stylist</h3>
                  <button
                    onClick={() => setShowStaffSelection(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="text-center mb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Choose your preferred stylist for this service
                  </h4>
                  <p className="text-sm text-gray-600">
                    All our stylists are professionally trained and experienced
                  </p>
                </div>

                {availableStaff.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No stylists available for this service</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Please contact the salon for availability
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableStaff.map((staff: any) => (
                      <div
                        key={staff._id}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedBarber === staff._id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleStaffSelect(staff._id)}
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4 relative overflow-hidden">
                            {staff.profilePhoto ? (
                              <img
                                src={staff.profilePhoto}
                                alt={staff.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <span className="text-white font-bold text-lg">
                                {staff.name?.charAt(0).toUpperCase()}
                              </span>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <Scissors className="h-3 w-3 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">{staff.name}</h5>
                            <p className="text-sm text-gray-600">Professional Stylist</p>
                            <div className="flex items-center mt-1">
                              <div className="flex items-center text-yellow-500">
                                <Star className="h-4 w-4 fill-current" />
                                <Star className="h-4 w-4 fill-current" />
                                <Star className="h-4 w-4 fill-current" />
                                <Star className="h-4 w-4 fill-current" />
                                <Star className="h-4 w-4 fill-current" />
                                <span className="ml-2 text-sm text-gray-600">4.8</span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            {selectedBarber === staff._id ? (
                              <CheckCircle className="h-6 w-6 text-blue-500" />
                            ) : (
                              <div className="h-6 w-6 border-2 border-gray-300 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowStaffSelection(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowStaffSelection(false)}
                    disabled={!selectedBarber}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Media Gallery Section */}
        <div className="mt-6 lg:mt-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                  <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Salon Media</h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Explore our salon's visual gallery</p>
                </div>
              </div>
              
              <MediaGallery 
                salon={{
                  logo: salon.logo,
                  gallery: salon.gallery,
                  promotionalVideo: salon.promotionalVideo,
                  uploadedImages: salon.uploadedImages
                }}
                salonName={salon.name}
              />
            </div>
          </div>
        </div>

        {/* Related Salons Section */}
        <div className="mt-6 lg:mt-8">
          <RelatedSalons currentSalon={salon} />
        </div>

        {/* Floating Quick Book Button for Mobile */}
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 lg:hidden">
          <button
            onClick={() => {
              if (!user) {
                navigate('/login');
                return;
              }
              setShowServiceSelectionMessage(true);
            }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-3 sm:p-4 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center space-x-1 sm:space-x-2"
          >
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="font-semibold text-sm sm:text-base hidden xs:inline">Book Now</span>
          </button>
        </div>

        {/* Service Selection Message Modal */}
        {showServiceSelectionMessage && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                      <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Select a Service First</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Choose a service to book your appointment</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowServiceSelectionMessage(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                {/* Message */}
                <div className="mb-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    To book an appointment, please first select a service from the list above. 
                    Each service shows its duration, price, and target audience.
                  </p>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      How to select a service:
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Click on any service card above</li>
                      <li>• Review the service details and target audience</li>
                      <li>• The service will be highlighted when selected</li>
                      <li>• Then you can proceed to book your appointment</li>
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowServiceSelectionMessage(false);
                      // Scroll to services section
                      const servicesSection = document.querySelector('.space-y-3');
                      if (servicesSection) {
                        servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Show Me Services
                  </button>
                  <button
                    onClick={() => setShowServiceSelectionMessage(false)}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalonPage;
