import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useTranslationStore } from '../stores/translationStore';
import { bookingService, availabilityService, notificationService, walkInCustomerService, staffEarningsService, salonService } from '../services/api';
import BookingCard from '../components/BookingCard';
import WalkInCustomerForm from '../components/WalkInCustomerForm';
import WalkInCustomerList from '../components/WalkInCustomerList';
import StaffBookingManagement from '../components/StaffBookingManagement';
import StaffCustomerList from '../components/StaffCustomerList';
import EarningsSummary from '../components/EarningsSummary';
import StaffDashboardSummary from '../components/StaffDashboardSummary';
import StaffSidebar from '../components/StaffSidebar';
import StaffMainContent from '../components/StaffMainContent';
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
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardStaff: React.FC = () => {
  const { user } = useAuthStore();
  const { language, t } = useTranslationStore();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWalkInForm, setShowWalkInForm] = useState(false);

  // Get staff's bookings (including pending ones)
  const { data: bookings, isLoading: bookingsLoading, error: bookingsError } = useQuery({
    queryKey: ['staff-bookings', user?.id],
    queryFn: () => bookingService.getBookings({}), // Backend automatically filters by user role
    enabled: !!user && !!user.id,
  });


  // Get availability
  useQuery({
    queryKey: ['staff-availability', user?.id],
    queryFn: () => availabilityService.getAvailability(user!.id),
    enabled: !!user && !!user.id,
  });

  // Get salon information
  const { data: salon } = useQuery({
    queryKey: ['salon', user?.salonId],
    queryFn: () => salonService.getSalon(user!.salonId),
    enabled: !!user && !!user.salonId,
  });

  // Get notifications
  const { data: notificationsData } = useQuery({
    queryKey: ['staff-notifications'],
    queryFn: () => notificationService.getNotifications(),
    enabled: !!user,
  });

  // Get notification count
  const { data: notificationCount } = useQuery({
    queryKey: ['staff-notification-count'],
    queryFn: () => notificationService.getNotificationCount(),
    enabled: !!user,
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: ({ bookingId, status, notes }: { bookingId: string; status: string; notes?: string }) =>
      bookingService.updateBookingStatus(bookingId, status, notes),
    onSuccess: () => {
      toast.success('Booking status updated!');
      queryClient.invalidateQueries({ queryKey: ['staff-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['staff-earnings-summary'] });
      queryClient.invalidateQueries({ queryKey: ['staff-earnings-today'] });
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
      queryClient.invalidateQueries({ queryKey: ['staff-availability'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update availability');
    },
  });

  // Notification mutations
  const markNotificationReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['staff-notification-count'] });
    },
  });

  const markAllNotificationsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['staff-notification-count'] });
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
            <p className="text-red-600">Access denied. Staff members only.</p>
          </div>
        </div>
      </div>
    );
  }

  const allBookings = bookings?.data?.data?.bookings || [];
  
  // Debug logging
  console.log('Staff Dashboard - User:', user);
  console.log('Staff Dashboard - Bookings response:', bookings);
  console.log('Staff Dashboard - All bookings:', allBookings);
  
  const todayBookings = allBookings.filter((booking: any) => {
    const bookingDate = new Date(booking.timeSlot).toDateString();
    const today = new Date().toDateString();
    return bookingDate === today;
  });

  const upcomingBookings = allBookings.filter((booking: any) => {
    const bookingDate = new Date(booking.timeSlot);
    const now = new Date();
    return bookingDate > now && booking.status !== 'completed' && booking.status !== 'cancelled';
  });

  const completedBookings = allBookings.filter((booking: any) => 
    booking.status === 'completed'
  );

  const pendingBookings = allBookings.filter((booking: any) => 
    booking.status === 'pending'
  );

  const totalEarnings = completedBookings.reduce((sum: number, booking: any) => 
    sum + booking.amountTotal, 0
  );

  const renderOverview = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Today's Summary */}
      <StaffDashboardSummary />

      {/* Loading State */}
      {bookingsLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {bookingsError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-600 dark:text-red-400">Error loading bookings: {bookingsError.message}</p>
        </div>
      )}

      {/* Today's Bookings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2 sm:mr-3" />
            Today's Bookings
          </h2>
        </div>
        <div className="p-4 sm:p-6">
          {todayBookings.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg font-medium">No bookings for today</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">You have {allBookings.length} total bookings</p>
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
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 mr-2 sm:mr-3" />
            Upcoming Bookings
          </h2>
        </div>
        <div className="p-4 sm:p-6">
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-purple-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg font-medium">No upcoming bookings</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Check back later for new appointments</p>
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

      {/* Pending Bookings */}
      {pendingBookings.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 mr-2 sm:mr-3" />
              Pending Bookings
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {pendingBookings.map((booking: any) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onStatusChange={handleBookingStatusChange}
                  onPaymentRecord={handlePaymentRecord}
                  userRole={user.role}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderBookings = () => (
    <StaffBookingManagement />
  );

  const renderWalkIns = () => (
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
  );

  const renderCustomers = () => (
    <StaffCustomerList />
  );

  const renderEarnings = () => (
    <EarningsSummary />
  );

  const renderSchedule = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Manage Schedule</h2>
      </div>
      <div className="p-6">
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Schedule management coming soon!</p>
          <p className="text-sm text-gray-500 mt-2">
            You'll be able to block/unblock time slots and manage your availability.
          </p>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          {notificationsData?.data?.notifications?.filter((n: any) => !n.read).length > 0 && (
            <button
              onClick={() => markAllNotificationsReadMutation.mutate()}
              className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>
      <div className="p-6">
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
    </div>
  );

  const renderSettings = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Staff Settings</h2>
      </div>
      <div className="p-6">
        <div className="text-center py-8">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Settings panel coming soon!</p>
          <p className="text-sm text-gray-500 mt-2">
            You'll be able to update your profile, services, and preferences.
          </p>
        </div>
      </div>
    </div>
  );

  const getCurrentView = () => {
    const path = window.location.pathname;
    if (path.includes('/bookings')) return renderBookings();
    if (path.includes('/walkins')) return renderWalkIns();
    if (path.includes('/customers')) return renderCustomers();
    if (path.includes('/earnings')) return renderEarnings();
    if (path.includes('/schedule')) return renderSchedule();
    if (path.includes('/notifications')) return renderNotifications();
    if (path.includes('/settings')) return renderSettings();
    return renderOverview();
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <StaffSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} salon={salon?.data} />
      
      {/* Main Content */}
      <StaffMainContent 
        onMenuClick={() => setSidebarOpen(true)}
        title="Staff Dashboard"
        subtitle={`Welcome back, ${user.name}!`}
        salon={salon?.data}
      >
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {getCurrentView()}
        </div>
      </StaffMainContent>

      {/* Walk-in Customer Form Modal */}
      {showWalkInForm && (
        <WalkInCustomerForm onClose={() => setShowWalkInForm(false)} />
      )}
    </div>
  );
};

export default DashboardStaff;