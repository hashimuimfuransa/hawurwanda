import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { availabilityService } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { 
  Calendar, 
  Clock, 
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Check,
  AlertCircle,
  Sparkles,
  User,
  Scissors,
  Coffee,
  Moon,
  Sun,
  Zap,
  Target,
  Activity,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone
} from 'lucide-react';
import toast from 'react-hot-toast';

const StaffSchedule: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [newSlot, setNewSlot] = useState({
    startTime: '',
    endTime: '',
    isAvailable: true,
    notes: ''
  });

  const { data: availabilityData, isLoading } = useQuery({
    queryKey: ['staff-availability', user?.id, selectedDate.toISOString().split('T')[0]],
    queryFn: () => availabilityService.getAvailability(user?.id!),
    enabled: !!user?.id,
  });

  const addAvailabilityMutation = useMutation({
    mutationFn: (data: any) => availabilityService.addAvailability(data),
    onSuccess: () => {
      toast.success('Availability added successfully!');
      queryClient.invalidateQueries({ queryKey: ['staff-availability'] });
      setShowAddModal(false);
      setNewSlot({ startTime: '', endTime: '', isAvailable: true, notes: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add availability');
    },
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => availabilityService.updateAvailability(id, data),
    onSuccess: () => {
      toast.success('Availability updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['staff-availability'] });
      setEditingSlot(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update availability');
    },
  });

  const deleteAvailabilityMutation = useMutation({
    mutationFn: (id: string) => availabilityService.deleteAvailability(id),
    onSuccess: () => {
      toast.success('Availability deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['staff-availability'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete availability');
    },
  });

  const handleAddSlot = () => {
    if (!newSlot.startTime || !newSlot.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }
    addAvailabilityMutation.mutate({
      staffId: user?.id,
      date: selectedDate.toISOString().split('T')[0],
      ...newSlot
    });
  };

  const handleUpdateSlot = (id: string, data: any) => {
    updateAvailabilityMutation.mutate({ id, data });
  };

  const handleDeleteSlot = (id: string) => {
    if (window.confirm('Are you sure you want to delete this availability slot?')) {
      deleteAvailabilityMutation.mutate(id);
    }
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour < 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getDateString = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const timeSlots = getTimeSlots();
  const availability = availabilityData?.data?.availability || [];

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Schedule Management
                <Sparkles className="h-4 w-4 text-blue-500" />
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your availability and working hours
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Add Availability
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getDayName(selectedDate)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getDateString(selectedDate)}
            </p>
          </div>
          
          <button
            onClick={() => navigateDate('next')}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Availability Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {timeSlots.map((time) => {
            const slot = availability.find((a: any) => 
              a.startTime === time && a.date === selectedDate.toISOString().split('T')[0]
            );
            
            return (
              <div
                key={time}
                className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                  slot
                    ? slot.isAvailable
                      ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-green-300 dark:border-green-700'
                      : 'bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 border-red-300 dark:border-red-700'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                onClick={() => {
                  if (slot) {
                    setEditingSlot(slot._id);
                  } else {
                    setNewSlot({ ...newSlot, startTime: time, endTime: time });
                    setShowAddModal(true);
                  }
                }}
              >
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {slot ? (
                      slot.isAvailable ? (
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{time}</p>
                  {slot && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {slot.isAvailable ? 'Available' : 'Busy'}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Availability List */}
      {availability.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Today's Schedule
          </h3>
          <div className="space-y-3">
            {availability
              .filter((a: any) => a.date === selectedDate.toISOString().split('T')[0])
              .map((slot: any) => (
                <div
                  key={slot._id}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    slot.isAvailable
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
                      : 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        slot.isAvailable
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        <Clock className={`h-4 w-4 ${
                          slot.isAvailable
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {slot.startTime} - {slot.endTime}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {slot.isAvailable ? 'Available for bookings' : 'Not available'}
                        </p>
                        {slot.notes && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {slot.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingSlot(slot._id)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSlot(slot._id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Add Availability Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Availability Slot
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Time
                  </label>
                  <select
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select time</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Time
                  </label>
                  <select
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select time</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={newSlot.isAvailable ? 'available' : 'busy'}
                  onChange={(e) => setNewSlot({ ...newSlot, isAvailable: e.target.value === 'available' })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={newSlot.notes}
                  onChange={(e) => setNewSlot({ ...newSlot, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Add any notes about this time slot..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSlot}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Add Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffSchedule;
