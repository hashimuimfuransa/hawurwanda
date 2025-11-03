import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { walkInCustomerService, staffEarningsService, bookingService } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';

const StaffDashboardSummary: React.FC = () => {
  const { user } = useAuthStore();

  const todayKey = new Date().toISOString().split('T')[0];
  const todayLabel = React.useMemo(() => new Date().toDateString(), []);

  const { data: allBookings } = useQuery({
    queryKey: ['staff-bookings-all', user?.id],
    queryFn: () => bookingService.getBookings({}),
    enabled: !!user && !!user.id,
  });

  const { data: todayBookings } = useQuery({
    queryKey: ['staff-bookings-today', todayKey, user?.id],
    queryFn: () => bookingService.getBookings({
      date: todayKey
    }),
    enabled: !!user && !!user.id,
  });

  const { data: todayWalkIns } = useQuery({
    queryKey: ['walk-in-customers-today', todayKey, user?.id],
    queryFn: () => walkInCustomerService.getWalkIns({ date: todayKey }),
    enabled: !!user && !!user.id,
  });

  const { data: todayEarnings } = useQuery({
    queryKey: ['staff-earnings-today', todayKey, user?.id],
    queryFn: () => staffEarningsService.getEarningsSummary(user?.id!, { period: 'today' }),
    enabled: !!user && !!user.id,
  });

  const startOfToday = React.useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return start;
  }, []);

  const endOfToday = React.useMemo(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return end;
  }, []);

  const isWithinToday = React.useCallback((value: any) => {
    if (!value) return false;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return false;
    return parsed >= startOfToday && parsed <= endOfToday;
  }, [startOfToday, endOfToday]);

  const allBookingsData = allBookings?.data?.data?.bookings || [];
  const todayBookingsData = React.useMemo(() => {
    const apiBookings = todayBookings?.data?.data?.bookings;
    if (apiBookings && apiBookings.length > 0) return apiBookings;
    return allBookingsData.filter((booking: any) => isWithinToday(booking.timeSlot || booking.date));
  }, [todayBookings, allBookingsData, isWithinToday]);
  const walkIns = todayWalkIns?.data?.walkInCustomers || [];
  const earnings = todayEarnings?.data?.summary;

  const completedBookingsTotal = React.useMemo(() => {
    return allBookingsData.filter((booking: any) => booking.status === 'completed');
  }, [allBookingsData]);
  const todayCompletedBookings = React.useMemo(() => {
    return allBookingsData.filter((booking: any) => {
      if (booking.status !== 'completed') return false;
      return isWithinToday(booking.completedAt || booking.updatedAt || booking.timeSlot || booking.date);
    });
  }, [allBookingsData, isWithinToday]);
  const todayPendingBookings = todayBookingsData.filter((b: any) => b.status === 'pending');
  const todayConfirmedBookings = todayBookingsData.filter((b: any) => b.status === 'confirmed');
  const completedWalkIns = walkIns.filter((w: any) => (w.status === 'completed' || w.paymentStatus === 'paid') && isWithinToday(w.completedAt || w.updatedAt || w.createdAt));
  const todayRevenue = [...todayCompletedBookings, ...completedWalkIns].reduce((sum: number, item: any) =>
    sum + (item.amountTotal || item.totalAmount || item.paymentAmount || item.amount || 0), 0
  );

  // All-time metrics
  const totalBookings = allBookingsData.length;
  const totalWalkIns = walkIns.length;
  const allConfirmedBookings = allBookingsData.filter((b: any) => b.status === 'confirmed');
  const totalCompletedServices = completedBookingsTotal.length + walkIns.filter((w: any) => w.status === 'completed' || w.paymentStatus === 'paid').length;

  // Debug logging
  console.log('StaffDashboardSummary - All bookings:', allBookingsData.length);
  console.log('StaffDashboardSummary - Today bookings:', todayBookingsData.length);
  console.log('StaffDashboardSummary - Today completed:', todayCompletedBookings.length);
  console.log('StaffDashboardSummary - Today pending:', todayPendingBookings.length);
  console.log('StaffDashboardSummary - Today confirmed:', todayConfirmedBookings.length);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Bookings */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
              <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-blue-100 text-xs sm:text-sm font-medium">Ubusabe Bwose</div>
              <div className="text-lg sm:text-2xl font-bold">{totalBookings}</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-blue-100 text-xs">
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Ubusabe Bwose</span>
            <span className="sm:hidden">Byose</span>
          </div>
        </div>

        {/* Completed Services */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
              <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-green-100 text-xs sm:text-sm font-medium">Byarangiye</div>
              <div className="text-lg sm:text-2xl font-bold">{completedBookingsTotal.length + walkIns.filter((w: any) => w.status === 'completed' || w.paymentStatus === 'paid').length}</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-green-100 text-xs">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Serivisi Zarangiye</span>
            <span className="sm:hidden">Byarangiye</span>
          </div>
        </div>

        {/* Pending Bookings */}
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
              <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-yellow-100 text-xs sm:text-sm font-medium">Bitegerejwe</div>
              <div className="text-lg sm:text-2xl font-bold">{todayPendingBookings.length}</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-yellow-100 text-xs">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Bitegerejwe Kwemezwa</span>
            <span className="sm:hidden">Kwinjira</span>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
              <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-purple-100 text-xs sm:text-sm font-medium">Inyungu</div>
              <div className="text-lg sm:text-2xl font-bold">{todayRevenue.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-purple-100 text-xs">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Amafaranga RWF yinjijwe uyu munsi</span>
            <span className="sm:hidden">RWF</span>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Confirmed Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Confirmed Bookings</div>
              <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{allConfirmedBookings.length}</div>
            </div>
          </div>
        </div>

        {/* Walk-in Customers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-lg">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Walk-in Customers</div>
              <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{totalWalkIns}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Earned - Full Width */}
      {earnings && (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Commission Earned Today</p>
              <p className="text-xl sm:text-3xl font-bold">{earnings.totalCommission.toLocaleString()} RWF</p>
              <p className="text-indigo-200 text-xs sm:text-sm mt-1">
                From {earnings.totalBookings + earnings.totalWalkIns} services
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-white/20 rounded-xl backdrop-blur-sm">
              <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboardSummary;
