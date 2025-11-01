import React, { useState, useMemo } from 'react';
import { Calendar, Clock, User, Phone, Mail, ArrowRight, Star, CheckCircle, Zap, Users, Target, X, CheckCircle2, Circle } from 'lucide-react';

interface QuickBookingProps {
  salon: {
    _id: string;
    name: string;
    phone?: string;
    email?: string;
    services?: any[];
    barbers?: any[];
    verified?: boolean;
  };
  onBookNow: () => void;
}

const QuickBooking: React.FC<QuickBookingProps> = ({ salon, onBookNow }) => {
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [showBookingSteps, setShowBookingSteps] = useState<boolean>(false);

  // Get selected service details
  const selectedServiceDetails = salon.services?.find(service => service._id === selectedService);

  // Filter staff based on selected service
  const availableStaff = useMemo(() => {
    if (!selectedService || !salon.barbers) return [];
    
    return salon.barbers.filter(barber => 
      barber.assignedServices?.some((service: any) => service._id === selectedService)
    );
  }, [selectedService, salon.barbers]);

  // Reset barber when service changes
  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId);
    setSelectedBarber(''); // Reset barber selection
  };

  const handleQuickBook = () => {
    if (selectedService) {
      const bookingUrl = `/booking/${salon._id}${selectedBarber ? `/${selectedBarber}` : ''}${selectedService ? `/${selectedService}` : ''}`;
      window.location.href = bookingUrl;
    } else {
      onBookNow();
    }
  };

  const isBookingReady = selectedService && (availableStaff.length === 0 || selectedBarber || availableStaff.length > 0);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Quick Booking</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Book your appointment in seconds</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Service Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Service
          </label>
          <select
            value={selectedService}
            onChange={(e) => handleServiceChange(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Choose a service...</option>
            {salon.services?.slice(0, 5).map((service) => (
              <option key={service._id} value={service._id}>
                {service.title} - {service.durationMinutes}min - ${service.price}
              </option>
            ))}
          </select>
        </div>

        {/* Service Target Audience Display */}
        {selectedServiceDetails && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  {selectedServiceDetails.title}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                  {selectedServiceDetails.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Duration: {selectedServiceDetails.durationMinutes} minutes
                  </span>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Price: ${selectedServiceDetails.price}
                  </span>
                  {selectedServiceDetails.targetAudience && selectedServiceDetails.targetAudience.length > 0 && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      For: {selectedServiceDetails.targetAudience.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Barber Selection */}
        {selectedService && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Users className="h-4 w-4 inline mr-1" />
              Choose Stylist {availableStaff.length > 0 ? `(${availableStaff.length} available)` : '(None assigned)'}
            </label>
            {availableStaff.length > 0 ? (
              <select
                value={selectedBarber}
                onChange={(e) => setSelectedBarber(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Any available stylist for this service</option>
                {availableStaff.map((barber) => (
                  <option key={barber._id} value={barber._id}>
                    {barber.name} - Professional Stylist
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full p-3 border border-orange-300 dark:border-orange-600 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-sm">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  No stylists are currently assigned to this service. Please contact the salon directly.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Book Button */}
        <button
          onClick={handleQuickBook}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
            isBookingReady
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transform hover:scale-105 shadow-lg'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
          disabled={!isBookingReady}
        >
          {isBookingReady ? (
            <>
              <Calendar className="h-5 w-5 mr-2" />
              Continue to Booking
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          ) : (
            <>
              <Calendar className="h-5 w-5 mr-2" />
              Select a service first
            </>
          )}
        </button>

        {/* Alternative Booking Options */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowBookingSteps(true)}
              className="flex-1 py-2 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              <User className="h-4 w-4 mr-2 inline" />
              Full Booking Process
            </button>
            
            {salon.phone && (
              <a
                href={`tel:${salon.phone}`}
                className="flex-1 py-2 px-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm font-medium text-center"
              >
                <Phone className="h-4 w-4 mr-2 inline" />
                Call Now
              </a>
            )}
          </div>
        </div>

        {/* Salon Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">{salon.name}</h4>
            {salon.verified && (
              <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                Verified
              </div>
            )}
          </div>
          <div className="flex items-center text-yellow-500 mb-2">
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">4.8 (24 reviews)</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {salon.services?.length || 0} services • {salon.barbers?.length || 0} stylists
          </div>
        </div>
      </div>

      {/* Booking Steps Modal */}
      {showBookingSteps && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Booking Process</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Follow these steps to book your appointment</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBookingSteps(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Steps */}
              <div className="space-y-6">
                {/* Quick Selection Notice */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-1">Quick Start Tip</h4>
                      <p className="text-sm text-indigo-700 dark:text-indigo-300">
                        Use the quick booking form above to pre-select your service, stylist, date, and time. 
                        This will pre-fill the booking form and save you time!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 1 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Choose Your Service</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Select from our range of professional services including haircuts, styling, treatments, and more.
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <div className="flex items-center text-blue-700 dark:text-blue-300 text-sm">
                        <Target className="h-4 w-4 mr-2" />
                        <span>Each service shows duration, price, and target audience</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Select Your Stylist</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Choose from our professional stylists who are trained in your selected service.
                    </p>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <div className="flex items-center text-green-700 dark:text-green-300 text-sm">
                        <Users className="h-4 w-4 mr-2" />
                        <span>Only stylists assigned to your service will be shown</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Pick Date & Time</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      On the booking form, select your preferred date and available time slot.
                    </p>
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                      <div className="flex items-center text-purple-700 dark:text-purple-300 text-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Available slots are shown in real-time</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">4</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Confirm & Pay</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Review your booking details and complete payment to secure your appointment.
                    </p>
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                      <div className="flex items-center text-orange-700 dark:text-orange-300 text-sm">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        <span>You'll receive confirmation via email and SMS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowBookingSteps(false)}
                  className="px-8 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Current Selection Status */}
              {selectedService && (
                <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h5 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Your Current Selection
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-green-700 dark:text-green-300">
                      <Target className="h-4 w-4 mr-2" />
                      <span><strong>Service:</strong> {selectedServiceDetails?.title}</span>
                    </div>
                    {selectedBarber && (
                      <div className="flex items-center text-green-700 dark:text-green-300">
                        <Users className="h-4 w-4 mr-2" />
                        <span><strong>Stylist:</strong> {salon.barbers?.find(b => b._id === selectedBarber)?.name}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    Your selections will be pre-filled in the booking form
                  </p>
                </div>
              )}

              {/* Quick Start Info */}
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  How Quick Booking Works
                </h5>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                  Select your service and stylist here, then complete your booking with date and time selection in the next step.
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  This 2-step process makes booking faster and more convenient!
                </p>
              </div>

              {/* Quick Tips */}
              <div className="mt-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                  Quick Tips
                </h5>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Book in advance for better time slot availability</li>
                  <li>• You can modify or cancel your booking up to 2 hours before</li>
                  <li>• Arrive 10 minutes early for your appointment</li>
                  <li>• Contact us if you need to reschedule</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickBooking;
