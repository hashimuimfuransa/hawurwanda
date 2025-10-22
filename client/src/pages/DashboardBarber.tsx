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
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Dashboard</h1>
              <p className="text-lg text-gray-600">Welcome back, {user.name}!</p>
              <p className="text-sm text-gray-500 capitalize">{(user as any).staffCategory || user.role}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Today</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Today's Bookings</p>
                <p className="text-2xl font-bold">{todayBookings.length}</p>
                <p className="text-blue-200 text-xs mt-1">
                  {todayBookings.filter((b: any) => b.status === 'completed').length} completed
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                <p className="text-green-200 text-xs mt-1">
                  {upcomingBookings.filter((b: any) => b.status === 'confirmed').length} confirmed
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold">{completedBookings.length}</p>
                <p className="text-purple-200 text-xs mt-1">
                  This month: {completedBookings.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Earnings</p>
                <p className="text-2xl font-bold">{totalEarnings.toLocaleString()} RWF</p>
                <p className="text-orange-200 text-xs mt-1">
                  Commission: {(totalEarnings * 0.7).toLocaleString()} RWF
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
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
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                    {tab.badge && tab.badge > 0 && (
                      <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
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
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Today's Bookings</h2>
              {todayBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No bookings for today</p>
                </div>
              ) : (
                <div className="space-y-4">
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

            {/* Upcoming Bookings */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Bookings</h2>
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No upcoming bookings</p>
                </div>
              ) : (
                <div className="space-y-4">
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
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <StaffBookingManagement />
        )}

        {/* Walk-ins Tab */}
        {activeTab === 'walkins' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Walk-in Customers</h2>
              <button
                onClick={() => setShowWalkInForm(true)}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
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
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Manage Schedule</h2>
              <div className="flex items-center space-x-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Schedule management coming soon!</p>
              <p className="text-sm text-gray-500 mt-2">
                You'll be able to block/unblock time slots and manage your availability.
              </p>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              {notificationsData?.data?.notifications?.filter((n: any) => !n.read).length > 0 && (
                <button
                  onClick={() => markAllNotificationsReadMutation.mutate()}
                  className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {notificationsData?.data?.notifications?.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No notifications yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  You'll receive notifications about bookings, payments, and updates here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notificationsData?.data?.notifications?.map((notification: any) => (
                  <div
                    key={notification._id}
                    className={`p-4 rounded-lg border-l-4 ${
                      !notification.read ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300'
                    } cursor-pointer hover:shadow-md transition-all duration-200`}
                    onClick={() => !notification.read && markNotificationReadMutation.mutate(notification._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.payload.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{notification.payload.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
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
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Barber Settings</h2>
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Settings panel coming soon!</p>
              <p className="text-sm text-gray-500 mt-2">
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