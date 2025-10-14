import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle } from 'lucide-react';
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

  // Fetch salon data
  const { data: salon, isLoading: salonLoading } = useQuery({
    queryKey: ['salon', salonId],
    queryFn: () => salonService.getSalon(salonId!),
    enabled: !!salonId,
  });

  // Find the specific service and barber
  const service = salon?.data?.services?.find((s: any) => s._id === serviceId);
  const barber = salon?.data?.barbers?.find((b: any) => b._id === barberId);

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
                  <span className="font-medium">{salon?.data?.name}</span>
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
          salon={salon?.data}
          onSubmit={handleBookingSubmit}
        />
      </div>
    </div>
  );
};

export default Booking;
