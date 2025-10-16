import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Star, Clock, Users, ArrowRight, Building2 } from 'lucide-react';
import { salonService } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface RelatedSalonsProps {
  currentSalon: {
    _id: string;
    district: string;
    province?: string;
  };
}

const RelatedSalons: React.FC<RelatedSalonsProps> = ({ currentSalon }) => {
  const navigate = useNavigate();

  const { data: relatedSalonsData, isLoading } = useQuery({
    queryKey: ['related-salons', currentSalon.district, currentSalon.province],
    queryFn: () => salonService.getSalons({
      district: currentSalon.district,
      verified: true,
      page: 1,
      limit: 4
    }),
    enabled: !!currentSalon.district
  });

  const relatedSalons = relatedSalonsData?.data?.salons?.filter(
    salon => salon._id !== currentSalon._id
  ) || [];

  if (isLoading) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Related Salons</h2>
              <p className="text-gray-600 dark:text-gray-400">Loading nearby salons...</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (relatedSalons.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Related Salons</h2>
              <p className="text-gray-600 dark:text-gray-400">Other salons in {currentSalon.district}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/salons')}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm flex items-center"
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatedSalons.slice(0, 3).map((salon) => (
            <div
              key={salon._id}
              onClick={() => navigate(`/salons/${salon._id}`)}
              className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-600"
            >
              {/* Salon Image */}
              <div className="relative mb-4">
                {salon.gallery && salon.gallery.length > 0 ? (
                  <img
                    src={salon.gallery[0]}
                    alt={salon.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {salon.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {salon.verified && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                    <Star className="h-3 w-3" />
                  </div>
                )}
              </div>

              {/* Salon Info */}
              <div className="space-y-2">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">
                  {salon.name}
                </h3>
                
                <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{salon.address}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{salon.barbers?.length || 0} stylists</span>
                  </div>
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{salon.services?.length || 0} services</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">4.8</span>
                  </div>
                  <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedSalons;
