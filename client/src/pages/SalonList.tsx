import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Filter, Star, Sparkles, Users, Award } from 'lucide-react';
import { salonService } from '../services/api';
import SalonCard from '../components/SalonCard';
import { useNavigate } from 'react-router-dom';
import { useTranslationStore } from '../stores/translationStore';
import { useThemeStore } from '../stores/themeStore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SalonList: React.FC = () => {
  const navigate = useNavigate();
  const { language, t } = useTranslationStore();
  const { isDarkMode } = useThemeStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [district, setDistrict] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['salons', { searchTerm, district, verifiedOnly, page }],
    queryFn: () => salonService.getSalons({
      name: searchTerm || undefined,
      district: district || undefined,
      verified: verifiedOnly || undefined,
      page,
      limit: 12,
    }),
  });

  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  const handleSalonClick = (salonId: string) => {
    navigate(`/salons/${salonId}`);
  };

  const districts = [
    'Kigali',
    'Musanze',
    'Huye',
    'Rubavu',
    'Nyagatare',
    'Rusizi',
    'Karongi',
    'Gicumbi',
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <Navbar />
      <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">{t('findSalons', language)}</h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('discoverBestSalons', language)}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-xl mb-8 overflow-hidden">
            <div className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Search */}
                <div className="relative sm:col-span-2 lg:col-span-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                  <input
                    type="text"
                    placeholder={t('searchSalons', language)}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                {/* District Filter */}
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">{t('allDistricts', language)}</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Verified Filter */}
                <div className="flex items-center justify-center sm:justify-start">
                  <div className="flex items-center bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3">
                    <input
                      type="checkbox"
                      id="verified"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="mr-3 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <label htmlFor="verified" className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {t('verifiedOnly', language)}
                    </label>
                  </div>
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
                >
                  <Search className="h-5 w-5 mr-2" />
                  {t('search', language)}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-lg">{t('loadingSalons', language)}</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('errorLoadingSalons', language)}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">{t('errorLoadingSalonsDesc', language)}</p>
              <button
                onClick={() => refetch()}
                className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {t('retry', language)}
              </button>
            </div>
          ) : !data?.salons || data.salons.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('noSalonsFound', language)}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">{t('noSalonsFoundDesc', language)}</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDistrict('');
                  setVerifiedOnly(false);
                  setPage(1);
                }}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {t('clearFilters', language)}
              </button>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-8">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-xl shadow-lg p-6">
                  <p className="text-gray-600 dark:text-gray-300 text-lg font-medium text-center">
                    {t('showingResults', language)} {data?.salons?.length || 0} {t('of', language)} {data?.pagination?.total || 0} {t('salons', language)}
                  </p>
                </div>
              </div>

              {/* Salon Grid */}
              {data?.salons && data.salons.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {data.salons.map((salon) => (
                    <SalonCard
                      key={salon._id}
                      salon={salon}
                      onClick={() => handleSalonClick(salon._id)}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {data?.pagination?.pages && data.pagination.pages > 1 && (
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-600 px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('previous', language)}
                  </button>
                  
                  <span className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-xl font-semibold">
                    {t('page', language)} {page} {t('of', language)} {data?.pagination?.pages || 0}
                  </span>
                  
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === (data?.pagination?.pages || 0)}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-600 px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('next', language)}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SalonList;
