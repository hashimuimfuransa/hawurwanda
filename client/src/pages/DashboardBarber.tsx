import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useTranslationStore } from '../stores/translationStore';
import { bookingService, availabilityService, notificationService } from '../services/api';
import BookingCard from '../components/BookingCard';
import WalkInCustomerForm from '../components/WalkInCustomerForm';
import WalkInCustomerList from '../components/WalkInCustomerList';
import StaffBookingManagement from '../components/StaffBookingManagement';
import EarningsSummary from '../components/EarningsSummary';
import StaffDashboardSummary from '../components/StaffDashboardSummary';
import { 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  Settings,
  Plus,
  Minus,
  CheckCircle,
  XCircle,
  Bell,
  BarChart3,
  UserPlus,
  ClipboardList
} from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardStaff: React.FC = () => {
  const { user } = useAuthStore();
  const { language, t } = useTranslationStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showWalkInForm, setShowWalkInForm] = useState(false);

  // Get barber's bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['barber-bookings'],
    queryFn: () => bookingService.getBookings({ barberId: user?.id }),
    enabled: !!user,
  });

  // Get availability
  useQuery({
    queryKey: ['barber-availability', user?.id],
    queryFn: () => availabilityService.getAvailability(user!.id),
    enabled: !!user && !!user.id,
  });

  // Get notifications
  const { data: notificationsData } = useQuery({
    queryKey: ['barber-notifications'],
    queryFn: () => notificationService.getNotifications(),
  });

  // Get notification count
  const { data: notificationCount } = useQuery({
    queryKey: ['barber-notification-count'],
    queryFn: () => notificationService.getNotificationCount(),
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: ({ bookingId, status, notes }: { bookingId: string; status: string; notes?: string }) =>
      bookingService.updateBookingStatus(bookingId, status, notes),
    onSuccess: () => {
      toast.success('Booking status updated!');
      queryClient.invalidateQueries({ queryKey: ['barber-bookings'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update booking');
    },
  });

  // Block/unblock slots mutation
  const blockSlotsMutation = useMutation({
    mutationFn: ({ slots, action }: { slots: string[]; action: 'block' | 'unblock' }) => {
      if (action === 'block') {
        return availabilityService.blockSlots(user!._id, slots);
      } else {
        return availabilityService.unblockSlots(user!._id, slots);
      }
    },
    onSuccess: () => {
      toast.success('Availability updated!');
      queryClient.invalidateQueries({ queryKey: ['barber-availability'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update availability');
    },
  });

  // Notification mutations
  const markNotificationReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['barber-notification-count'] });
    },
  });

  const markAllNotificationsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['barber-notification-count'] });
    },
  });

  const handleBookingStatusChange = async (bookingId: string, status: string) => {
    await updateBookingMutation.mutateAsync({ bookingId, status });
  };

  const handlePaymentRecord = async (bookingId: string) => {
    toast('Payment recording feature coming soon!');
  };

  const handleBlockSlot = (slot: string) => {
    blockSlotsMutation.mutate({ slots: [slot], action: 'block' });
  };

  const handleUnblockSlot = (slot: string) => {
    blockSlotsMutation.mutate({ slots: [slot], action: 'unblock' });
  };

  if (!user || !['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager'].includes(user.role)) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <p className="text-red-600">{t('accessDenied', { language })}. {t('staffOnly', { language })}</p>
          </div>
        </div>
      </div>
    );
  }

  const todayBookings = bookings?.data?.bookings?.filter((booking: any) => {
    const bookingDate = new Date(booking.timeSlot).toDateString();
    const today = new Date().toDateString();
    return bookingDate === today;
  }) || [];

  const upcomingBookings = bookings?.data?.bookings?.filter((booking: any) => {
    const bookingDate = new Date(booking.timeSlot);
    const now = new Date();
    return bookingDate > now && booking.status !== 'completed' && booking.status !== 'cancelled';
  }) || [];

  const completedBookings = bookings?.data?.bookings?.filter((booking: any) => 
    booking.status === 'completed'
  ) || [];

  const totalEarnings = completedBookings.reduce((sum: number, booking: any) => 
    sum + booking.amountTotal, 0
  );

  return (
    <div className="min-h-screen py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Staff Dashboard</h1>
              <p className="text-base sm:text-lg text-gray-600">Welcome back, {user.name}!</p>
              <p className="text-xs sm:text-sm text-gray-500 capitalize truncate">{(user as any).staffCategory || user.role}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-xs sm:text-sm text-gray-500">Today</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm font-medium">Today's Bookings</p>
                <p className="text-xl sm:text-2xl font-bold">{todayBookings.length}</p>
                <p className="text-blue-200 text-xs mt-1 truncate">
                  {todayBookings.filter((b: any) => b.status === 'completed').length} completed
                </p>
              </div>
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs sm:text-sm font-medium">Upcoming</p>
                <p className="text-xl sm:text-2xl font-bold">{upcomingBookings.length}</p>
                <p className="text-green-200 text-xs mt-1 truncate">
                  {upcomingBookings.filter((b: any) => b.status === 'confirmed').length} confirmed
                </p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs sm:text-sm font-medium">Completed</p>
                <p className="text-xl sm:text-2xl font-bold">{completedBookings.length}</p>
                <p className="text-purple-200 text-xs mt-1 truncate">
                  This month: {completedBookings.length}
                </p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs sm:text-sm font-medium">Total Earnings</p>
                <p className="text-xl sm:text-2xl font-bold truncate">{totalEarnings.toLocaleString()} RWF</p>
                <p className="text-orange-200 text-xs mt-1 truncate">
                  Commission: {(totalEarnings * 0.7).toLocaleString()} RWF
                </p>
              </div>
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 sm:space-x-6 md:space-x-8 overflow-x-auto pb-2">
              {[
                { id: 'overview', label: 'Overview', icon: Calendar },
                { id: 'bookings', label: 'Bookings', icon: ClipboardList },
                { id: 'walkins', label: 'Walk-ins', icon: UserPlus },
                { id: 'earnings', label: 'Earnings', icon: BarChart3 },
                { id: 'schedule', label: 'Schedule', icon: Clock },
                { id: 'notifications', label: 'Notifications', icon: Bell, badge: notificationCount?.data?.unreadCount },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="truncate">{tab.label}</span>
                    {tab.badge && tab.badge > 0 && (
                      <span className="ml-1 sm:ml-2 px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Today's Summary */}
            <StaffDashboardSummary />

            {/* Today's Bookings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-600">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Today's Bookings</h2>
              </div>
              <div className="p-3 sm:p-4">
                {todayBookings.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">No bookings for today</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {todayBookings.map((booking: any) => (
                      <BookingCard
                        key={booking._id}
                        booking={booking}
                        onStatusChange={handleBookingStatusChange}
                        onPaymentRecord={handlePaymentRecord}
                        userRole={user.role}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Bookings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-600">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Upcoming Bookings</h2>
              </div>
              <div className="p-3 sm:p-4">
                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <Clock className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">No upcoming bookings</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {upcomingBookings.slice(0, 5).map((booking: any) => (
                      <BookingCard
                        key={booking._id}
                        booking={booking}
                        onStatusChange={handleBookingStatusChange}
                        onPaymentRecord={handlePaymentRecord}
                        userRole={user.role}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <StaffBookingManagement />
        )}

        {/* Walk-ins Tab */}
        {activeTab === 'walkins' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Walk-in Customers</h2>
              <button
                onClick={() => setShowWalkInForm(true)}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors flex items-center text-sm sm:text-base"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Add Walk-in Customer
              </button>
            </div>
            <WalkInCustomerList />
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <EarningsSummary />
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Manage Schedule</h2>
                <div className="flex items-center space-x-3">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input text-sm sm:text-base px-2 py-1 sm:px-3 sm:py-2"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 text-center py-6 sm:py-8">
              <Clock className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Schedule management coming soon!</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 sm:mt-3">
                You'll be able to block/unblock time slots and manage your availability.
              </p>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
              {notificationsData?.data?.notifications?.filter((n: any) => !n.read).length > 0 && (
                <button
                  onClick={() => markAllNotificationsReadMutation.mutate()}
                  className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="p-3 sm:p-4">
              {notificationsData?.data?.notifications?.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Bell className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">No notifications yet</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
                    You'll receive notifications about bookings, payments, and updates here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {notificationsData?.data?.notifications?.map((notification: any) => (
                    <div
                      key={notification._id}
                      className={`p-3 sm:p-4 rounded-lg border-l-4 ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' : 'bg-gray-50 dark:bg-gray-700/30 border-gray-300'
                      } cursor-pointer hover:shadow-md transition-all duration-200`}
                      onClick={() => !notification.read && markNotificationReadMutation.mutate(notification._id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                            {notification.payload.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.payload.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Barber Settings</h2>
            </div>
            <div className="p-4 sm:p-6 text-center py-6 sm:py-8">
              <Settings className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Settings panel coming soon!</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
                You'll be able to update your profile, services, and preferences.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Walk-in Customer Form Modal */}
      {showWalkInForm && (
        <WalkInCustomerForm onClose={() => setShowWalkInForm(false)} />
      )}
    </div>
  );
};

export default DashboardStaff;