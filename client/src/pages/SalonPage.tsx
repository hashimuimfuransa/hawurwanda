import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, Clock, Phone, Mail, Calendar, User, CheckCircle, ArrowLeft, Sparkles, Shield, Award } from 'lucide-react';
import { salonService } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useTranslationStore, t } from '../stores/translationStore';
import Navbar from '../components/Navbar';

const SalonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const { language } = useTranslationStore();
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');

  const { data: salon, isLoading, error } = useQuery({
    queryKey: ['salon', id],
    queryFn: () => salonService.getSalon(id!),
    enabled: !!id,
  });

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
              {/* Salon Images */}
              <div className="lg:col-span-2">
                {salon.gallery.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <div className="relative overflow-hidden rounded-xl shadow-lg group">
                        <img
                          src={salon.gallery[0]}
                          alt={salon.name}
                          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    </div>
                    {salon.gallery.slice(1, 5).map((image, index) => (
                      <div key={index} className="relative overflow-hidden rounded-lg shadow-md group">
                        <img
                          src={image}
                          alt={`${salon.name} ${index + 2}`}
                          className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <Sparkles className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                      <span className="text-gray-500 dark:text-gray-400 text-lg">{t('noImagesAvailable', language)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Salon Info */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{salon.name}</h1>
                    {salon.verified && (
                      <div className="flex items-center bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900 dark:to-blue-900 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">{t('verified', language)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-300 mb-3">
                    <Star className="h-5 w-5 text-yellow-400 fill-current mr-2" />
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{salon.barbers.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">{t('barbers', language)}</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{salon.services.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">{t('services', language)}</div>
                  </div>
                </div>
              </div>
          </div>
        </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Services */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('salonServices', language)}</h2>
                  </div>
                  <div className="space-y-4">
                    {salon.services.map((service) => (
                      <div
                        key={service._id}
                        className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                          selectedService === service._id
                            ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md'
                        }`}
                        onClick={() => setSelectedService(service._id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{service.title}</h3>
                            {service.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">{service.description}</p>
                            )}
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-3">
                              <Clock className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                              <span className="font-medium">{service.durationMinutes} {t('minutes', language)}</span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                              {service.price.toLocaleString()} RWF
                            </div>
                            {selectedService === service._id && (
                              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                                {t('selected', language)}
                              </div>
                            )}
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
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('salonBarbers', language)}</h2>
                  </div>
                  <div className="space-y-4">
                    {salon.barbers.map((barber) => (
                      <div
                        key={barber._id}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                          selectedBarber === barber._id
                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
                        }`}
                        onClick={() => setSelectedBarber(barber._id)}
                      >
                        <div className="flex items-center">
                          <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mr-4 overflow-hidden">
                            {barber.profilePhoto ? (
                              <img
                                src={barber.profilePhoto}
                                alt={barber.name}
                                className="w-14 h-14 rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-7 w-7 text-gray-500 dark:text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{barber.name}</h3>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                              <span className="font-medium">4.9</span>
                              <span className="ml-2">({t('expert', language)})</span>
                            </div>
                            {selectedBarber === barber._id && (
                              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                                {t('selected', language)}
                              </div>
                            )}
                          </div>
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('workingHours', language)}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                {Object.entries(salon.workingHours).map(([day, hours]) => (
                  <div key={day} className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="font-bold text-gray-900 dark:text-gray-100 capitalize mb-2 text-sm">{day}</div>
                    <div className="text-sm">
                      {hours.closed ? (
                        <span className="text-red-600 dark:text-red-400 font-medium">{t('closed', language)}</span>
                      ) : (
                        <span className="text-gray-600 dark:text-gray-300 font-medium">{hours.open} - {hours.close}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonPage;
