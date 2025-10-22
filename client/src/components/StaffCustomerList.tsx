import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService, walkInCustomerService } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useTranslationStore } from '../stores/translationStore';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Scissors,
  Star,
  Filter,
  Search,
  Sparkles,
  UserCheck,
  AlertCircle,
  Eye,
  Edit3,
  MessageSquare,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';

interface StaffCustomerListProps {
  showSalonView?: boolean;
}

const StaffCustomerList: React.FC<StaffCustomerListProps> = ({ showSalonView = false }) => {
  const { user } = useAuthStore();
  const { language, t } = useTranslationStore();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showServiceModal, setShowServiceModal] = useState<string | null>(null);

  // Get bookings for this staff member
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['staff-customer-bookings', user?.id, selectedDate, statusFilter],
    queryFn: () => {
      const params: any = {};
      if (selectedDate) {
        params.date = selectedDate;
      }
      if (statusFilter !== 'all') params.status = statusFilter;
      // Note: barberId is automatically handled by the backend based on user role
      
      return bookingService.getBookings(params);
    },
    enabled: !!user && !!user.id,
  });

  // Get walk-in customers for this staff member
  const { data: walkInsData, isLoading: walkInsLoading } = useQuery({
    queryKey: ['staff-walkin-customers', selectedDate, statusFilter, user?.id],
    queryFn: () => {
      const params: any = { date: selectedDate };
      if (statusFilter !== 'all') params.status = statusFilter;
      
      return showSalonView
        ? walkInCustomerService.getSalonWalkIns(params)
        : walkInCustomerService.getWalkIns(params);
    },
    enabled: !!user && !!user.id,
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: ({ bookingId, status, notes }: { bookingId: string; status: string; notes?: string }) =>
      bookingService.updateBookingStatus(bookingId, status, notes),
    onSuccess: () => {
      toast.success('Service status updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['staff-customer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['staff-walkin-customers'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update service status');
    },
  });

  // Update walk-in customer status mutation
  const updateWalkInMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      walkInCustomerService.updateWalkIn(id, data),
    onSuccess: () => {
      toast.success('Service status updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['staff-walkin-customers'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update service status');
    },
  });

  const handleServiceCompletion = (type: 'booking' | 'walkin', id: string, status: string) => {
    if (type === 'booking') {
      updateBookingMutation.mutate({
        bookingId: id,
        status: status,
        notes: status === 'completed' ? 'Service completed by staff' : 'Service cancelled by staff'
      });
    } else {
      updateWalkInMutation.mutate({
        id: id,
        data: { status: status }
      });
    }
  };

  const bookings = bookingsData?.data?.data?.bookings || [];
  const walkIns = walkInsData?.data?.walkInCustomers || [];

  // Combine and filter customers
  const allCustomers = [
    ...bookings.map((booking: any) => ({
      id: booking._id,
      type: 'booking',
      name: booking.clientId?.name || 'Unknown Client',
      phone: booking.clientId?.phone || 'N/A',
      email: booking.clientId?.email || 'N/A',
      service: booking.serviceId?.title || 'Unknown Service',
      amount: booking.amountTotal || 0,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      timeSlot: booking.timeSlot,
      notes: booking.notes || '',
      bookingId: booking.bookingId
    })),
    ...walkIns.map((walkIn: any) => ({
      id: walkIn._id,
      type: 'walkin',
      name: walkIn.clientName,
      phone: walkIn.clientPhone,
      email: walkIn.clientEmail || 'N/A',
      service: walkIn.serviceName,
      amount: walkIn.amount || 0,
      status: walkIn.status,
      paymentStatus: walkIn.paymentStatus,
      timeSlot: walkIn.createdAt,
      notes: walkIn.notes || '',
      bookingId: walkIn.walkInId
    }))
  ].filter(customer => 
    searchQuery === '' || 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    customer.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = bookingsLoading || walkInsLoading;

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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Customer List
                <Sparkles className="h-4 w-4 text-blue-500" />
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage all customers assigned to you
              </p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full sm:w-64"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Customers</p>
              <p className="text-2xl font-bold">{allCustomers.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold">{allCustomers.filter(c => c.status === 'completed').length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold">{allCustomers.filter(c => c.status === 'pending').length}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Revenue</p>
              <p className="text-2xl font-bold">{allCustomers.reduce((sum, c) => sum + c.amount, 0).toLocaleString()} RWF</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        {allCustomers.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800/30 dark:to-purple-800/30 rounded-full flex items-center justify-center">
                <UserCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No customers found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Customers will appear here when they book services with you or you add walk-in customers.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <AlertCircle className="h-4 w-4" />
              <span>Try adjusting your search or date filters</span>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid gap-4">
              {allCustomers.map((customer) => (
                <div key={`${customer.type}-${customer.id}`} className="group bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-700 dark:to-blue-900/20 rounded-xl p-6 border border-gray-100 dark:border-gray-600 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Customer Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                              {customer.name}
                            </h3>
                            <div className="flex gap-2">
                              <span className="px-3 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                                #{customer.bookingId}
                              </span>
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                customer.status === 'completed'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : customer.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                  : customer.status === 'confirmed'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                              }`}>
                                {customer.status === 'completed' && <CheckCircle className="h-3 w-3 inline mr-1" />}
                                {customer.status === 'cancelled' && <XCircle className="h-3 w-3 inline mr-1" />}
                                {customer.status === 'confirmed' && <Star className="h-3 w-3 inline mr-1" />}
                                {customer.status === 'pending' && <Clock className="h-3 w-3 inline mr-1" />}
                                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                              </span>
                              <span className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                {customer.type === 'booking' ? 'Booking' : 'Walk-in'}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Phone className="h-4 w-4 text-green-500" />
                              <span className="font-medium">{customer.phone}</span>
                            </div>
                            {customer.email !== 'N/A' && (
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Mail className="h-4 w-4 text-blue-500" />
                                <span className="font-medium">{customer.email}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Calendar className="h-4 w-4 text-purple-500" />
                              <span className="font-medium">{new Date(customer.timeSlot).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              <span className="font-bold text-green-600 dark:text-green-400">{customer.amount.toLocaleString()} RWF</span>
                            </div>
                          </div>

                          {/* Service Details */}
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-2 mb-2">
                              <Scissors className="h-4 w-4 text-purple-500" />
                              <span className="font-semibold text-gray-900 dark:text-white">Service Details</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Service: </span>
                                <span className="font-medium text-gray-900 dark:text-white">{customer.service}</span>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Payment: </span>
                                <span className={`font-medium ${
                                  customer.paymentStatus === 'paid' ? 'text-green-600 dark:text-green-400' :
                                  customer.paymentStatus === 'partial' ? 'text-yellow-600 dark:text-yellow-400' :
                                  'text-red-600 dark:text-red-400'
                                }`}>
                                  {customer.paymentStatus?.charAt(0).toUpperCase() + customer.paymentStatus?.slice(1) || 'None'}
                                </span>
                              </div>
                            </div>
                            {customer.notes && (
                              <div className="mt-2 text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Notes: </span>
                                <span className="text-gray-900 dark:text-white">{customer.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 lg:flex-col">
                      {/* Service Status Actions */}
                      <div className="flex gap-2">
                        {customer.status === 'pending' && (
                          <button
                            onClick={() => handleServiceCompletion(customer.type, customer.id, 'confirmed')}
                            className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                          >
                            <Star className="h-4 w-4" />
                            <span className="hidden sm:inline">Confirm</span>
                          </button>
                        )}

                        {customer.status !== 'completed' && customer.status !== 'cancelled' && (
                          <button
                            onClick={() => handleServiceCompletion(customer.type, customer.id, 'completed')}
                            className="flex-1 sm:flex-none px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Complete</span>
                          </button>
                        )}

                        {customer.status !== 'cancelled' && (
                          <button
                            onClick={() => handleServiceCompletion(customer.type, customer.id, 'cancelled')}
                            className="flex-1 sm:flex-none px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Cancel</span>
                          </button>
                        )}
                      </div>

                      {/* Additional Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowServiceModal(customer.id)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">View</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffCustomerList;
