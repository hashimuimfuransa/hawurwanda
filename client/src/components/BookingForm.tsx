import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, CreditCard, User } from 'lucide-react';
import { useTranslationStore } from '../stores/translationStore';
import toast from 'react-hot-toast';

interface BookingFormProps {
  salonId: string;
  barberId: string;
  serviceId: string;
  service: {
    _id: string;
    title: string;
    price: number;
    durationMinutes: number;
  };
  barber: {
    _id: string;
    name: string;
    profilePhoto?: string;
  };
  salon: {
    _id: string;
    name: string;
    address: string;
  };
  onSubmit: (data: BookingFormData) => Promise<void>;
}

interface BookingFormData {
  timeSlot: string;
  paymentOption: 'full' | 'deposit' | 'cash';
  depositAmount?: number;
  notes?: string;
}

const BookingForm: React.FC<BookingFormProps> = ({
  salonId,
  barberId,
  serviceId,
  service,
  barber,
  salon,
  onSubmit,
}) => {
  const { language, t } = useTranslationStore();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>();

  const paymentOption = watch('paymentOption');

  // Fetch available slots when date is selected
  const fetchAvailableSlots = async (date: string) => {
    if (!date) return;
    
    setLoadingSlots(true);
    try {
      const response = await fetch(
        `/api/bookings/availability/${barberId}?date=${date}`
      );
      const data = await response.json();
      
      if (response.ok) {
        setAvailableSlots(data.availableSlots);
      } else {
        toast.error(data.message || 'Failed to fetch available slots');
      }
    } catch (error) {
      toast.error('Failed to fetch available slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setValue('timeSlot', '');
    fetchAvailableSlots(date);
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const onFormSubmit = async (data: BookingFormData) => {
    try {
      await onSubmit({
        ...data,
        salonId,
        barberId,
        serviceId,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="card-header">
          <h2 className="text-2xl font-bold text-gray-900">{t('bookAppointment', language)}</h2>
        </div>

        {/* Service and Barber Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">{service.title}</h3>
              <p className="text-sm text-gray-600">
                {t('duration', language)}: {service.durationMinutes} {t('minutes', language)}
              </p>
              <p className="text-lg font-semibold text-green-600">
                {service.price.toLocaleString()} RWF
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{barber.name}</h3>
              <p className="text-sm text-gray-600">{salon.name}</p>
              <p className="text-sm text-gray-600">{salon.address}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
{t('selectDate', language)}
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => handleDateChange(e.target.value)}
              className="input"
              required
            />
          </div>

          {/* Time Slot Selection */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
{t('selectTimeSlot', language)}
              </label>
              {loadingSlots ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading available slots...</p>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setValue('timeSlot', slot)}
                      className={`p-2 text-sm rounded border ${
                        watch('timeSlot') === slot
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {formatTime(slot)}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No available slots for this date</p>
              )}
              {errors.timeSlot && (
                <p className="mt-1 text-sm text-red-600">Please select a time slot</p>
              )}
            </div>
          )}

          {/* Payment Option */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="h-4 w-4 inline mr-1" />
              Payment Option
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="full"
                  {...register('paymentOption', { required: true })}
                  className="mr-2"
                />
                <span>Pay Full Amount ({service.price.toLocaleString()} RWF)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="deposit"
                  {...register('paymentOption', { required: true })}
                  className="mr-2"
                />
                <span>Pay Deposit</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="cash"
                  {...register('paymentOption', { required: true })}
                  className="mr-2"
                />
                <span>Pay Cash at Salon</span>
              </label>
            </div>
            {errors.paymentOption && (
              <p className="mt-1 text-sm text-red-600">Please select a payment option</p>
            )}
          </div>

          {/* Deposit Amount */}
          {paymentOption === 'deposit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deposit Amount (RWF)
              </label>
              <input
                type="number"
                min="0"
                max={service.price}
                {...register('depositAmount', {
                  required: paymentOption === 'deposit',
                  min: { value: 0, message: 'Deposit must be at least 0' },
                  max: { value: service.price, message: 'Deposit cannot exceed service price' },
                })}
                className="input"
                placeholder={`Maximum: ${service.price.toLocaleString()} RWF`}
              />
              {errors.depositAmount && (
                <p className="mt-1 text-sm text-red-600">{errors.depositAmount.message}</p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="input"
              placeholder="Any special requests or notes..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !selectedDate || !watch('timeSlot')}
            className="w-full btn btn-primary"
          >
            {isSubmitting ? 'Creating Booking...' : 'Book Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
