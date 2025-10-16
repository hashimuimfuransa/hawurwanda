import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useTranslationStore } from '../stores/translationStore';
import { bookingService, authService } from '../services/api';
import BookingCard from '../components/BookingCard';
import Navbar from '../components/Navbar';
import { User, Mail, Phone, Calendar, MapPin, Edit, Save, X, Star, Clock, Award, Heart, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { language, t } = useTranslationStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings', 'user'],
    queryFn: () => bookingService.getBookings(),
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => authService.updateProfile(data),
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const onSubmit = async (data: any) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const handleEdit = () => {
    setIsEditing(true);
    reset({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  const handleBookingStatusChange = async (bookingId: string, status: string) => {
    try {
      await bookingService.updateBookingStatus(bookingId, status);
      toast.success('Booking status updated!');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update booking');
    }
  };

  const handlePaymentRecord = async (bookingId: string) => {
    // This would open a payment recording modal
    toast.info('Payment recording feature coming soon!');
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <p className="text-red-600">{t('pleaseLoginToViewProfile', language)}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Calculate stats for user dashboard
  const bookingsList = bookings?.data?.bookings || bookings?.bookings || [];
  const completedBookings = bookingsList.filter((booking: any) => booking.status === 'completed');
  const upcomingBookings = bookingsList.filter((booking: any) => booking.status === 'confirmed');
  const totalSpent = completedBookings.reduce((sum: number, booking: any) => sum + (booking.amountTotal || 0), 0);

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 text-white mb-8">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative px-8 py-12 sm:px-12 sm:py-16">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t('welcomeBack', language)}, {user.name}!</h1>
                  <p className="text-xl text-blue-100">{t('beautyJourneyContinues', language)}</p>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-8 w-8 text-blue-200" />
                    <div>
                      <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                      <p className="text-blue-100">{t('upcomingBookings', language)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <Award className="h-8 w-8 text-emerald-200" />
                    <div>
                      <p className="text-2xl font-bold">{completedBookings.length}</p>
                      <p className="text-emerald-100">{t('completedSessions', language)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <Star className="h-8 w-8 text-yellow-200" />
                    <div>
                      <p className="text-2xl font-bold">{totalSpent.toLocaleString()} RWF</p>
                      <p className="text-yellow-100">{t('totalSpent', language)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <User className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{user.name}</h2>
                <p className="text-emerald-600 dark:text-emerald-400 font-medium capitalize bg-emerald-50 dark:bg-emerald-900/20 px-4 py-1 rounded-full inline-block">
                  {t(user.role, language)} {t('account', language)}
                </p>
              </div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('personalInformation', language)}</h3>
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="text-sm font-medium">{t('edit', language)}</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('fullName', language)}
                    </label>
                    <input
                      {...register('name', { required: t('nameRequired', language) })}
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('email', language)}
                    </label>
                    <input
                      {...register('email', {
                        required: t('emailRequired', language),
                        pattern: {
                          value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                          message: t('emailInvalid', language),
                        },
                      })}
                      type="email"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('phone', language)}
                    </label>
                    <input
                      {...register('phone', {
                        required: t('phoneRequired', language),
                        pattern: {
                          value: /^(\+250|250|0)?[0-9]{9}$/,
                          message: t('phoneInvalid', language),
                        },
                      })}
                      type="tel"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="h-4 w-4" />
                      <span>{updateProfileMutation.isPending ? t('saving', language) : t('saveChanges', language)}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                    >
                      <X className="h-4 w-4" />
                      <span>{t('cancel', language)}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center space-x-4">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('fullName', language)}</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('email', language)}</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('phone', language)}</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{user.phone}</p>
                    </div>
                  </div>
                  
                  {user.salonId && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center space-x-4">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('status', language)}</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{t('salonMember', language)}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => {
                    logout(() => {
                      toast.success('Logged out successfully');
                      navigate('/login');
                    });
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('signOut', language)}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('myBookings', language)}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t('trackAppointments', language)}</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 px-4 py-2 rounded-full">
                  <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                    {bookingsList.length} {t('total', language)}
                  </span>
                </div>
              </div>

              {/* Quick Actions for Customers */}
              <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/10 dark:to-blue-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('readyForFreshLook', language)}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('bookNextAppointment', language)}</p>
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium">
                    {t('bookNow', language)}
                  </button>
                </div>
              </div>

              {bookingsLoading ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Clock className="h-8 w-8 text-white animate-spin" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">{t('loadingBookings', language)}</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">{t('pleaseWaitAppointments', language)}</p>
                </div>
              ) : bookingsList.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('noBookingsYet', language)}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {t('startBeautyJourney', language)}
                  </p>
                  <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold">
                    {t('findSalonsNearYou', language)}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Filter/Sort Options */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('upcoming', language)}: {upcomingBookings.length}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('completed', language)}: {completedBookings.length}</span>
                      </div>
                    </div>
                  </div>

                  {bookingsList.map((booking: any) => (
                    <div key={booking._id} className="transform hover:scale-[1.02] transition-all duration-200">
                      <BookingCard
                        booking={booking}
                        onStatusChange={handleBookingStatusChange}
                        onPaymentRecord={handlePaymentRecord}
                        userRole={user.role}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
