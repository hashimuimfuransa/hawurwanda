import React from 'react';
import { Star, MapPin, Clock, Users, CheckCircle } from 'lucide-react';
import { useTranslationStore } from '../stores/translationStore';

interface SalonCardProps {
  salon: {
    _id: string;
    name: string;
    address: string;
    district: string;
    verified: boolean;
    gallery: string[];
    services: Array<{
      _id: string;
      title: string;
      price: number;
      durationMinutes: number;
    }>;
    barbers: Array<{
      _id: string;
      name: string;
      profilePhoto?: string;
    }>;
  };
  onClick?: () => void;
}

const SalonCard: React.FC<SalonCardProps> = ({ salon, onClick }) => {
  const { language } = useTranslationStore();
  const minPrice = salon.services.length > 0 
    ? Math.min(...salon.services.map(s => s.price))
    : 0;

  return (
    <div 
      className="card hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105 transition-transform duration-200"
      onClick={onClick}
    >
      {/* Salon Image */}
      <div className="h-40 sm:h-48 bg-gray-200 rounded-lg mb-3 sm:mb-4 relative overflow-hidden">
        {salon.gallery.length > 0 ? (
          <img
            src={salon.gallery[0]}
            alt={salon.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <span className="text-gray-500 text-lg font-medium">{salon.name.charAt(0)}</span>
          </div>
        )}
        
        {salon.verified && (
          <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
          </div>
        )}
      </div>

      {/* Salon Info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 line-clamp-1">{salon.name}</h3>
          <div className="flex items-center text-yellow-400 flex-shrink-0 ml-2">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
            <span className="ml-1 text-xs sm:text-sm text-gray-600">4.8</span>
          </div>
        </div>

        <div className="flex items-center text-gray-600 text-xs sm:text-sm">
          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{salon.address}, {salon.district}</span>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
          <div className="flex items-center">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span>{salon.barbers.length} barbers</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span>{salon.services.length} services</span>
          </div>
        </div>

        {minPrice > 0 && (
          <div className="text-xs sm:text-sm text-gray-600">
            Starting from <span className="font-semibold text-green-600">{minPrice.toLocaleString()} RWF</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalonCard;
