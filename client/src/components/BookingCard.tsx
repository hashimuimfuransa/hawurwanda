import React from 'react';
import { Calendar, Clock, User, CreditCard, MapPin } from 'lucide-react';
import { useTranslationStore } from '../stores/translationStore';

interface BookingCardProps {
  booking: {
    _id: string;
    bookingId: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    timeSlot: string;
    amountTotal: number;
    depositPaid: number;
    balanceRemaining: number;
    paymentStatus: 'none' | 'partial' | 'paid';
    paymentMethod: 'airtel' | 'cash';
    clientId: {
      _id: string;
      name: string;
      phone: string;
    } | null;
    barberId: {
      _id: string;
      name: string;
      profilePhoto?: string;
    } | null;
    salonId: {
      _id: string;
      name: string;
      address: string;
    } | null;
    serviceId: {
      _id: string;
      title: string;
      durationMinutes: number;
    } | null;
  };
  onStatusChange?: (bookingId: string, status: string) => void;
  onPaymentRecord?: (bookingId: string) => void;
  userRole?: string;
}

const BookingCard: React.FC<BookingCardProps> = ({ 
  booking, 
  onStatusChange, 
  onPaymentRecord, 
  userRole 
}) => {
  const { language, t } = useTranslationStore();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'none': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
            {booking.serviceId?.title || 'Service Not Available'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('bookingNumber', language)} #{booking.bookingId}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
            {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
          </span>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {/* Date and Time */}
        <div className="flex flex-col sm:flex-row sm:items-center text-gray-600 dark:text-gray-400 gap-1 sm:gap-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{formatDate(booking.timeSlot)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{formatTime(booking.timeSlot)}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="text-sm truncate">{booking.salonId?.name || 'Salon Not Available'}</span>
        </div>

        {/* Barber */}
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <User className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="text-sm truncate">{booking.barberId?.name || 'Barber Not Available'}</span>
        </div>

        {/* Client (for barbers/owners) */}
        {userRole !== 'client' && (
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <User className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm truncate">{booking.clientId?.name || 'Client Not Available'} - {booking.clientId?.phone || 'N/A'}</span>
          </div>
        )}

        {/* Payment Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-gray-600 dark:text-gray-400 gap-2">
          <div className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{booking.paymentMethod.toUpperCase()}</span>
          </div>
          <div className="text-left sm:text-right">
            <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
              {booking.amountTotal.toLocaleString()} RWF
            </div>
            {booking.paymentStatus === 'partial' && (
              <div className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400">
                Paid: {booking.depositPaid.toLocaleString()} RWF
                <br />
                Balance: {booking.balanceRemaining.toLocaleString()} RWF
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {(userRole === 'barber' || userRole === 'owner') && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
          {booking.status === 'pending' && (
            <button
              onClick={() => onStatusChange?.(booking._id, 'confirmed')}
              className="btn btn-primary text-sm"
            >
              Confirm
            </button>
          )}
          {booking.status === 'confirmed' && (
            <button
              onClick={() => onStatusChange?.(booking._id, 'completed')}
              className="btn btn-success text-sm"
            >
              Mark Complete
            </button>
          )}
          {booking.paymentStatus !== 'paid' && (
            <button
              onClick={() => onPaymentRecord?.(booking._id)}
              className="btn btn-secondary text-sm"
            >
              Record Payment
            </button>
          )}
          <button
            onClick={() => onStatusChange?.(booking._id, 'cancelled')}
            className="btn btn-danger text-sm"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
