import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { walkInCustomerService, salonService } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useTranslationStore } from '../stores/translationStore';
import { Plus, X, User, Phone, Mail, CreditCard, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface WalkInCustomerFormProps {
  onClose: () => void;
}

const WalkInCustomerForm: React.FC<WalkInCustomerFormProps> = ({ onClose }) => {
  const { user } = useAuthStore();
  const { language, t } = useTranslationStore();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    serviceId: '',
    amount: '',
    paymentMethod: 'cash' as 'cash' | 'airtel',
    notes: '',
  });

  // Get salon services
  const { data: salonData } = useQuery({
    queryKey: ['salon-services', user?.salonId],
    queryFn: () => salonService.getServices(user?.salonId || ''),
    enabled: !!user?.salonId,
  });

  // Create walk-in customer mutation
  const createWalkInMutation = useMutation({
    mutationFn: walkInCustomerService.createWalkIn,
    onSuccess: () => {
      toast.success('Walk-in customer added successfully!');
      queryClient.invalidateQueries({ queryKey: ['walk-in-customers'] });
      queryClient.invalidateQueries({ queryKey: ['staff-earnings-summary'] });
      queryClient.invalidateQueries({ queryKey: ['staff-earnings-today'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add walk-in customer');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.clientPhone || !formData.serviceId || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const normalizedPhone = formData.clientPhone.replace(/\s|-/g, '');
    const normalizedName = formData.clientName.trim();
    const amountValue = parseFloat(formData.amount);

    if (!/^((\+250)|250|0)?[0-9]{9}$/.test(normalizedPhone)) {
      toast.error('Please enter a valid Rwandan phone number');
      return;
    }

    if (Number.isNaN(amountValue) || amountValue < 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const payload: any = {
      clientName: normalizedName,
      clientPhone: normalizedPhone,
      serviceId: formData.serviceId,
      amount: amountValue,
      paymentMethod: formData.paymentMethod,
    };

    if (formData.clientEmail.trim()) {
      payload.clientEmail = formData.clientEmail.trim();
    }

    if (formData.notes.trim()) {
      payload.notes = formData.notes.trim();
    }

    createWalkInMutation.mutate(payload);
  };

  const handleServiceChange = (serviceId: string) => {
    const selectedService = salonData?.data?.services?.find((s: any) => s._id === serviceId);
    setFormData(prev => ({
      ...prev,
      serviceId,
      amount: selectedService?.price?.toString() || '',
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add Walk-in Customer</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Client Name *
            </label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter client name"
              required
            />
          </div>

          {/* Client Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="h-4 w-4 inline mr-2" />
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.clientPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+250 123 456 789"
              required
            />
          </div>

          {/* Client Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="h-4 w-4 inline mr-2" />
              Email (Optional)
            </label>
            <input
              type="email"
              value={formData.clientEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="client@example.com"
            />
          </div>

          {/* Service Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service *
            </label>
            <select
              value={formData.serviceId}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a service</option>
              {salonData?.data?.services?.map((service: any) => (
                <option key={service._id} value={service._id}>
                  {service.name} - {service.price} RWF
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="h-4 w-4 inline mr-2" />
              Amount (RWF) *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
              step="100"
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="h-4 w-4 inline mr-2" />
              Payment Method *
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as 'cash' | 'airtel' }))}
                  className="mr-2"
                />
                Cash
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="airtel"
                  checked={formData.paymentMethod === 'airtel'}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as 'cash' | 'airtel' }))}
                  className="mr-2"
                />
                Airtel Money
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Any additional notes..."
              maxLength={300}
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createWalkInMutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {createWalkInMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalkInCustomerForm;
