import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walkInCustomerService } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useTranslationStore } from '../stores/translationStore';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Filter,
  Search,
  Plus,
  Sparkles,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface WalkInCustomerListProps {
  showSalonView?: boolean;
}

const WalkInCustomerList: React.FC<WalkInCustomerListProps> = ({ showSalonView = false }) => {
  const { user } = useAuthStore();
  const { language, t } = useTranslationStore();
  const queryClient = useQueryClient();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: walkInsData, isLoading } = useQuery({
    queryKey: ['walk-in-customers', selectedDate, statusFilter, showSalonView, user?.id],
    queryFn: () => {
      const params: any = { date: selectedDate };
      if (statusFilter !== 'all') params.status = statusFilter;
      
      return showSalonView 
        ? walkInCustomerService.getSalonWalkIns(params)
        : walkInCustomerService.getWalkIns(params);
    },
    enabled: !!user && !!user.id,
  });

  // Update walk-in customer mutation
  const updateWalkInMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      walkInCustomerService.updateWalkIn(id, data),
    onSuccess: () => {
      toast.success('Walk-in customer updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['walk-in-customers'] });
      queryClient.invalidateQueries({ queryKey: ['staff-earnings-summary'] });
      queryClient.invalidateQueries({ queryKey: ['staff-earnings-today'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update walk-in customer');
    },
  });

  // Delete walk-in customer mutation
  const deleteWalkInMutation = useMutation({
    mutationFn: (id: string) => walkInCustomerService.deleteWalkIn(id),
    onSuccess: () => {
      toast.success('Walk-in customer deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['walk-in-customers'] });
      queryClient.invalidateQueries({ queryKey: ['staff-earnings-summary'] });
      queryClient.invalidateQueries({ queryKey: ['staff-earnings-today'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete walk-in customer');
    },
  });

  const handleStatusChange = (id: string, status: string) => {
    updateWalkInMutation.mutate({ id, data: { status } });
  };

  const handlePaymentStatusChange = (id: string, paymentStatus: string) => {
    updateWalkInMutation.mutate({ id, data: { paymentStatus } });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this walk-in customer?')) {
      deleteWalkInMutation.mutate(id);
    }
  };

  const walkIns = walkInsData?.data?.walkInCustomers || [];

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
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
                Abakiriya Baza Ku Isonga
                <Sparkles className="h-4 w-4 text-purple-500" />
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cunga serivisi z'abakiriya baza ku isonga
              </p>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
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
                <option value="all">Imiterere Yose</option>
                <option value="pending">Bitegerejwe</option>
                <option value="completed">Byarangiye</option>
                <option value="cancelled">Byahagaritswe</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        {walkIns.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800/30 dark:to-purple-800/30 rounded-full flex items-center justify-center">
                <UserCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nta bakiriya baza ku isonga babonetse
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Abakiriya baza ku isonga bazagaragara hano iyo bongeyewe. Tangira wongeraho umukiriya wa mbere uje ku isonga!
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <AlertCircle className="h-4 w-4" />
              <span>Gerageza guhindura muyunguruzi w'itariki cyangwa imiterere</span>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid gap-4">
              {walkIns.map((walkIn: any) => (
                <div key={walkIn._id} className="group bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-700 dark:to-blue-900/20 rounded-xl p-6 border border-gray-100 dark:border-gray-600 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Customer Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {walkIn.clientName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{walkIn.clientName}</h3>
                            <span className="px-3 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                              #{walkIn.walkInId}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Phone className="h-4 w-4 text-green-500" />
                              <span className="font-medium">{walkIn.clientPhone}</span>
                            </div>
                            {walkIn.clientEmail && (
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Mail className="h-4 w-4 text-blue-500" />
                                <span className="font-medium">{walkIn.clientEmail}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Clock className="h-4 w-4 text-purple-500" />
                              <span className="font-medium">{new Date(walkIn.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              <span className="font-bold text-green-600 dark:text-green-400">{walkIn.amount.toLocaleString()} RWF</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Service Info */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="h-4 w-4 text-purple-500" />
                          <span className="font-semibold text-gray-900 dark:text-white">Service Details</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Service: </span>
                            <span className="font-medium text-gray-900 dark:text-white">{walkIn.serviceName}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Payment: </span>
                            <span className="font-medium text-gray-900 dark:text-white capitalize">{walkIn.paymentMethod}</span>
                          </div>
                        </div>
                        {walkIn.notes && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Notes: </span>
                            <span className="text-gray-900 dark:text-white">{walkIn.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 lg:flex-col">
                      {/* Status Badge */}
                      <div className="flex justify-center lg:justify-start">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          walkIn.status === 'completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                            : walkIn.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {walkIn.status === 'completed' && <CheckCircle className="h-4 w-4 inline mr-1" />}
                          {walkIn.status === 'pending' && <Clock className="h-4 w-4 inline mr-1" />}
                          {walkIn.status === 'cancelled' && <XCircle className="h-4 w-4 inline mr-1" />}
                          {walkIn.status.charAt(0).toUpperCase() + walkIn.status.slice(1)}
                        </span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusChange(walkIn._id, 'completed')}
                          disabled={walkIn.status === 'completed'}
                          className="flex-1 sm:flex-none px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span className="hidden sm:inline">Complete</span>
                        </button>
                        
                        <button
                          onClick={() => handleStatusChange(walkIn._id, 'cancelled')}
                          disabled={walkIn.status === 'cancelled'}
                          className="flex-1 sm:flex-none px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          <span className="hidden sm:inline">Hagarika</span>
                        </button>
                        
                        <button
                          onClick={() => handleDelete(walkIn._id)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Siba</span>
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

export default WalkInCustomerList;