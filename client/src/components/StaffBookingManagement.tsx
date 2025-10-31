import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService, transactionService } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useTranslationStore } from '../stores/translationStore';
import { 
  Calendar, 
  Clock, 
  User, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  CreditCard,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Filter,
  Sparkles,
  Scissors,
  Star,
  TrendingUp,
  Eye,
  Edit3,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface StaffBookingManagementProps {
  showSalonView?: boolean;
}

const StaffBookingManagement: React.FC<StaffBookingManagementProps> = ({ showSalonView = false }) => {
  const { user } = useAuthStore();
  const { language, t } = useTranslationStore();
  const queryClient = useQueryClient();
  
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'cash' as 'cash' | 'airtel',
    note: '',
  });

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['staff-bookings', user?.id, selectedDate, statusFilter, showSalonView],
    queryFn: () => {
      const params: any = {};
      // Only apply date filter if a specific date is selected
      if (selectedDate && selectedDate.trim() !== '') {
        params.date = selectedDate;
      }
      if (statusFilter !== 'all') params.status = statusFilter;
      // Note: barberId is automatically handled by the backend based on user role
      
      return bookingService.getBookings(params);
    },
    enabled: !!user && !!user.id,
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: ({ bookingId, status, notes }: { bookingId: string; status: string; notes?: string }) => 
      bookingService.updateBookingStatus(bookingId, status, notes),
    onSuccess: async () => {
      toast.success('Booking status updated successfully!');
      await queryClient.invalidateQueries({ queryKey: ['staff-bookings', user?.id, selectedDate, statusFilter, showSalonView], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['staff-bookings'] });
      await queryClient.invalidateQueries({ queryKey: ['staff-bookings-all'] });
      await queryClient.invalidateQueries({ queryKey: ['staff-bookings-today'] });
      await queryClient.invalidateQueries({ queryKey: ['walk-in-customers-all'] });
      await queryClient.invalidateQueries({ queryKey: ['walk-in-customers-today'] });
      await queryClient.invalidateQueries({ queryKey: ['staff-customer-bookings'] });
      await queryClient.invalidateQueries({ queryKey: ['staff-walkin-customers'] });
      await queryClient.invalidateQueries({ queryKey: ['staff-earnings-summary'] });
      await queryClient.invalidateQueries({ queryKey: ['staff-earnings-today'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update booking status');
    },
  });

  // Record payment mutation
  const recordPaymentMutation = useMutation({
    mutationFn: ({ bookingId, amount, method, note }: { bookingId: string; amount: number; method: string; note: string }) => 
      transactionService.recordManualPayment({ bookingId, amount, method, note }),
    onSuccess: async () => {
      toast.success('Payment recorded successfully!');
      await queryClient.invalidateQueries({ queryKey: ['staff-bookings', user?.id, selectedDate, statusFilter, showSalonView], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['staff-bookings'] });
      await queryClient.invalidateQueries({ queryKey: ['staff-bookings-all'] });
      await queryClient.invalidateQueries({ queryKey: ['staff-bookings-today'] });
      await queryClient.invalidateQueries({ queryKey: ['walk-in-customers-all'] });
      await queryClient.invalidateQueries({ queryKey: ['walk-in-customers-today'] });
      await queryClient.invalidateQueries({ queryKey: ['staff-customer-bookings'] });
      await queryClient.invalidateQueries({ queryKey: ['staff-walkin-customers'] });
      await queryClient.invalidateQueries({ queryKey: ['staff-earnings-summary'] });
      await queryClient.invalidateQueries({ queryKey: ['staff-earnings-today'] });
      setShowPaymentModal(null);
      setPaymentData({ amount: '', method: 'cash', note: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    },
  });

  const handleStatusChange = (bookingId: string, status: string) => {
    updateBookingMutation.mutate({ bookingId, status });
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPaymentModal) return;

    // Validate amount
    const amount = parseFloat(paymentData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    if (!paymentData.method) {
      toast.error('Please select a payment method');
      return;
    }

    recordPaymentMutation.mutate({
      bookingId: showPaymentModal,
      amount,
      method: paymentData.method,
      note: paymentData.note,
    });
  };

  const bookings = bookingsData?.data?.data?.bookings || [];

  // Debug logging
  console.log('StaffBookingManagement - User:', user);
  console.log('StaffBookingManagement - Bookings data:', bookingsData);
  console.log('StaffBookingManagement - Bookings data.data:', bookingsData?.data);
  console.log('StaffBookingManagement - Bookings data.data.data:', bookingsData?.data?.data);
  console.log('StaffBookingManagement - Bookings array:', bookings);
  console.log('StaffBookingManagement - Bookings count:', bookings.length);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Booking Management
                <Sparkles className="h-4 w-4 text-purple-500" />
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Manage all your assigned bookings and appointments
              </p>
            </div>
          </div>
          
          {/* Filters - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="All dates"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['staff-bookings', user?.id] })}
              className="w-full px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
              title="Refresh bookings"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        {bookings.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-purple-200 to-blue-200 dark:from-purple-800/30 dark:to-blue-800/30 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Bookings will appear here when assigned to you. Check back later or try adjusting your filters.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <AlertCircle className="h-4 w-4" />
              <span>Try adjusting your date or status filters</span>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <div className="grid gap-4 sm:gap-6">
              {bookings.map((booking: any) => (
                <div key={booking._id} className="group bg-gradient-to-r from-gray-50 to-purple-50/30 dark:from-gray-700 dark:to-purple-900/20 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-600 hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col gap-4">
                    {/* Mobile Header */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg flex-shrink-0">
                        {booking.clientId?.name?.charAt(0)?.toUpperCase() || 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-2">
                          <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg truncate">
                            {booking.clientId?.name || 'Unknown Client'}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                              #{booking.bookingId}
                            </span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              booking.status === 'completed' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                : booking.status === 'cancelled'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                : booking.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            }`}>
                              {booking.status === 'completed' && <CheckCircle className="h-3 w-3 inline mr-1" />}
                              {booking.status === 'cancelled' && <XCircle className="h-3 w-3 inline mr-1" />}
                              {booking.status === 'confirmed' && <Star className="h-3 w-3 inline mr-1" />}
                              {booking.status === 'pending' && <Clock className="h-3 w-3 inline mr-1" />}
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Booking Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 text-purple-500 flex-shrink-0" />
                        <span className="font-medium truncate">{new Date(booking.timeSlot).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="font-medium">{booking.serviceId?.durationMinutes || 0} min</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="font-medium truncate">{booking.clientId?.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <DollarSign className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="font-bold text-green-600 dark:text-green-400">{booking.amountTotal?.toLocaleString()} RWF</span>
                      </div>
                    </div>
                    
                    {/* Service Details */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-2 mb-3">
                        <Scissors className="h-4 w-4 text-purple-500" />
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">Service Details</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Service:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{booking.serviceId?.title || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Salon:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{booking.salonId?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Payment:</span>
                          <span className={`font-medium ${
                            booking.paymentStatus === 'paid' 
                              ? 'text-green-600 dark:text-green-400' 
                              : booking.paymentStatus === 'partial'
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {booking.paymentStatus?.charAt(0).toUpperCase() + booking.paymentStatus?.slice(1) || 'None'}
                          </span>
                        </div>
                        {booking.notes && (
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                            <span className="text-gray-600 dark:text-gray-400">Notes: </span>
                            <span className="text-gray-900 dark:text-white">{booking.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons - Mobile Optimized */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => updateBookingMutation.mutate({ 
                            bookingId: booking._id, 
                            status: 'confirmed',
                            notes: 'Confirmed by staff'
                          })}
                          className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                        >
                          <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Confirm</span>
                        </button>
                      )}
                      
                      {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                        <button
                          onClick={() => updateBookingMutation.mutate({ 
                            bookingId: booking._id, 
                            status: 'completed',
                            notes: 'Service completed'
                          })}
                          className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Complete</span>
                        </button>
                      )}
                      
                      {booking.status !== 'cancelled' && (
                        <button
                          onClick={() => updateBookingMutation.mutate({ 
                            bookingId: booking._id, 
                            status: 'cancelled',
                            notes: 'Cancelled by staff'
                          })}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                        >
                          <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Cancel</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => setShowPaymentModal(booking._id)}
                        className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                      >
                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Payment</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Record Payment
            </h3>
            {(() => {
              const booking = bookings.find(b => b._id === showPaymentModal);
              return (
                <>
                  {booking && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Booking Details</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{booking.clientId?.name || 'Unknown'}</p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Total: </span>
                          <span className="font-bold text-gray-900 dark:text-white">{booking.amountTotal} RWF</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Paid: </span>
                          <span className="font-bold text-green-600 dark:text-green-400">{booking.depositPaid} RWF</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600 dark:text-gray-400">Balance: </span>
                          <span className="font-bold text-orange-600 dark:text-orange-400">{booking.balanceRemaining} RWF</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Amount (RWF)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={paymentData.amount}
                        onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                        placeholder="Enter amount"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Remaining balance: {booking?.balanceRemaining} RWF
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Payment Method
                      </label>
                      <select
                        value={paymentData.method}
                        onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value as 'cash' | 'airtel' })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="cash">Cash</option>
                        <option value="airtel">Airtel Money</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={paymentData.note}
                        onChange={(e) => setPaymentData({ ...paymentData, note: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowPaymentModal(null)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                      >
                        Record Payment
                      </button>
                    </div>
                  </form>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffBookingManagement;