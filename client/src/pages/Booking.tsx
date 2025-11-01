import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, LogIn, UserPlus } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { salonService, bookingService } from '../services/api';
import BookingForm from '../components/BookingForm';
import toast from 'react-hot-toast';

const Booking: React.FC = () => {
  const { salonId, barberId, serviceId } = useParams<{
    salonId: string;
    barberId: string;
    serviceId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const { user } = useAuthStore();

  // Fetch salon data
  const { data: salonResponse, isLoading: salonLoading } = useQuery({
    queryKey: ['salon', salonId],
    queryFn: () => salonService.getSalon(salonId!),
    enabled: !!salonId,
  });

  const salon = salonResponse?.data?.salon || salonResponse?.salon;

  // Find the specific service and barber
  const service = salon?.services?.find((s: any) => s._id === serviceId);
  const barber = salon?.barbers?.find((b: any) => b._id === barberId);

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (data: any) => bookingService.createBooking(data),
    onSuccess: () => {
      toast.success('Booking created successfully!');
      setBookingSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    },
  });

  const handleBookingSubmit = async (data: any) => {
    await createBookingMutation.mutateAsync(data);
  };

  if (salonLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!salon || !service || !barber) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <p className="text-red-600">Invalid booking parameters.</p>
            <button
              onClick={() => navigate('/salons')}
              className="btn btn-primary mt-4"
            >
              Back to Salons
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(`/salons/${salonId}`)}
            className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Salon
          </button>

          <div className="max-w-2xl mx-auto">
            <div className="card">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                  <LogIn className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
                <p className="text-gray-600">
                  Please log in or create an account to book your appointment at <strong>{salon.name}</strong>
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Service Details</h3>
                    <p className="text-sm text-gray-600 mb-1"><strong>Service:</strong> {service.title}</p>
                    <p className="text-sm text-gray-600 mb-1"><strong>Duration:</strong> {service.durationMinutes} mins</p>
                    <p className="text-lg font-bold text-green-600 mt-2">{service.price.toLocaleString()} RWF</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Staff Member</h3>
                    <p className="text-sm text-gray-600 mb-1"><strong>{barber.name}</strong></p>
                    <p className="text-sm text-gray-600">{salon.name}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => navigate('/login', { state: { from: location.pathname } })}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center group"
                >
                  <LogIn className="h-5 w-5 mr-2 group-hover:-translate-x-0.5 transition-transform" />
                  Log In to Your Account
                </button>
                <button
                  onClick={() => navigate('/register', { state: { from: location.pathname } })}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center group"
                >
                  <UserPlus className="h-5 w-5 mr-2 group-hover:translate-x-0.5 transition-transform" />
                  Create New Account
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  After logging in or registering, you'll be able to book this appointment immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card text-center">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Booking Confirmed!
              </h1>
              <p className="text-gray-600">
                Your appointment has been successfully booked.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h2>
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{service.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Barber:</span>
                  <span className="font-medium">{barber.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Salon:</span>
                  <span className="font-medium">{salon?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium text-green-600">
                    {service.price.toLocaleString()} RWF
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/profile')}
                className="btn btn-primary w-full"
              >
                View My Bookings
              </button>
              <button
                onClick={() => navigate('/salons')}
                className="btn btn-secondary w-full"
              >
                Book Another Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/salons/${salonId}`)}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Salon
        </button>

        {/* Booking Form */}
        <BookingForm
          salonId={salonId!}
          barberId={barberId!}
          serviceId={serviceId!}
          service={service}
          barber={barber}
          salon={salon}
          onSubmit={handleBookingSubmit}
        />
      </div>
    </div>
  );
};

export default Booking;
