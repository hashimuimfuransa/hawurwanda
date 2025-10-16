import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Filter, Star, Sparkles, Users, Award, Grid, Map, List, Navigation, Clock, Phone, Mail, CheckCircle, Play, Heart, Share2, ArrowRight, Zap, Crown, Shield } from 'lucide-react';
import { salonService } from '../services/api';
import SalonCard from '../components/SalonCard';
import { useNavigate } from 'react-router-dom';
import { useTranslationStore } from '../stores/translationStore';
import { useThemeStore } from '../stores/themeStore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GoogleMap from '../components/GoogleMap';
import { getAllDistricts, getAllSectors, getDistrictsByProvince } from '../data/rwandaLocations';



const SalonList: React.FC = () => {
  const navigate = useNavigate();
  const { language, t } = useTranslationStore();
  const { isDarkMode } = useThemeStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [sector, setSector] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('map');
  const [selectedSalon, setSelectedSalon] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['salons', { searchTerm, province, district, sector, verifiedOnly, page }],
    queryFn: () => salonService.getSalons({
      name: searchTerm || undefined,
      province: province || undefined,
      district: district || undefined,
      sector: sector || undefined,
      verified: verifiedOnly || undefined,
      page,
      limit: 50, // Increased for map view
    }),
  });

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Default to Kigali if location access denied
          setUserLocation({ lat: -1.9441, lng: 30.0619 });
        }
      );
    } else {
      // Default to Kigali if geolocation not supported
      setUserLocation({ lat: -1.9441, lng: 30.0619 });
    }
  }, []);


  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  const handleSalonClick = (salonId: string) => {
    navigate(`/salons/${salonId}`);
  };

  const handleSalonSelect = (salon: any) => {
    setSelectedSalon(salon);
  };



  const salons = data?.data?.salons || [];

  const provinces = ['Kigali City', 'Eastern Province', 'Northern Province', 'Southern Province', 'Western Province'];
  const allDistricts = getAllDistricts();
  const availableDistricts = province ? getDistrictsByProvince(province) : allDistricts;
  const availableSectors = district ? getAllSectors().filter(s => {
    // Filter sectors that belong to the selected district
    return true; // We'll implement proper filtering based on district
  }) : [];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <Navbar />
      <div className="pt-20 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
            <div className="text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-4 sm:mb-0 sm:mr-6">
                  <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">{t('findSalons', { language })}</h1>
                  <p className="text-base sm:text-lg lg:text-xl text-blue-100">{t('discoverBestSalons', { language })}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 mt-6 sm:mt-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{salons.length}</div>
                  <div className="text-blue-200 text-sm sm:text-base">Salons</div>
                </div>
                <div className="hidden sm:block w-px h-12 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{salons.filter(s => s.verified).length}</div>
                  <div className="text-blue-200 text-sm sm:text-base">Verified</div>
                </div>
                <div className="hidden sm:block w-px h-12 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{salons.reduce((sum, s) => sum + (s.barbers?.length || 0), 0)}</div>
                  <div className="text-blue-200 text-sm sm:text-base">Stylists</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Search and Filters */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 rounded-3xl shadow-2xl mb-8 overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Find Your Perfect Salon</h2>
                <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1 w-full sm:w-auto">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 flex-1 sm:flex-none ${
                      viewMode === 'grid' 
                        ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                    <span className="text-sm sm:text-base">Grid</span>
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 flex-1 sm:flex-none ${
                      viewMode === 'map' 
                        ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <Map className="h-4 w-4" />
                    <span className="text-sm sm:text-base">Map</span>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                {/* Search */}
                <div className="relative sm:col-span-2 lg:col-span-1">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                  <input
                    type="text"
                    placeholder={t('searchSalons', { language })}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl sm:rounded-2xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-sm sm:text-base"
                  />
                </div>

                {/* Province Filter */}
                <div className="relative">
                  <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                  <select
                    value={province}
                    onChange={(e) => {
                      setProvince(e.target.value);
                      setDistrict('');
                      setSector('');
                    }}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl sm:rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-sm sm:text-base"
                  >
                    <option value="">All Provinces</option>
                    {provinces.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* District Filter */}
                <div className="relative">
                  <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                  <select
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setSector('');
                    }}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl sm:rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-sm sm:text-base"
                  >
                    <option value="">All Districts</option>
                    {availableDistricts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Sector Filter */}
                <div className="relative">
                  <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl sm:rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-sm sm:text-base"
                    disabled={!district}
                  >
                    <option value="">All Sectors</option>
                    {availableSectors.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Verified Filter */}
                <div className="flex items-center justify-center sm:justify-start">
                  <div className="flex items-center bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-sm w-full sm:w-auto">
                    <input
                      type="checkbox"
                      id="verified"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <label htmlFor="verified" className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {t('verifiedOnly', { language })}
                    </label>
                  </div>
                  </div>
                </div>

                {/* Search Button */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center text-sm sm:text-base"
                >
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {t('search', { language })}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="text-center py-12 sm:py-20">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-indigo-600"></div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">{t('loadingSalons', { language })}</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 sm:py-20">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Award className="h-8 w-8 sm:h-12 sm:w-12 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">{t('errorLoadingSalons', { language })}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base px-4">{t('errorLoadingSalonsDesc', { language })}</p>
              <button
                onClick={() => refetch()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
              >
                {t('retry', { language })}
              </button>
            </div>
          ) : salons.length === 0 ? (
            <div className="text-center py-12 sm:py-20">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Users className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">{t('noSalonsFound', { language })}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base px-4">{t('noSalonsFoundDesc', { language })}</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setProvince('');
                  setDistrict('');
                  setSector('');
                  setVerifiedOnly(false);
                  setPage(1);
                }}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {t('clearFilters', { language })}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Salon List */}
              <div className={`${viewMode === 'map' ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
              {/* Results Count */}
                <div className="mb-4 sm:mb-6">
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                      <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base lg:text-lg font-medium">
                        {t('showingResults', { language })} {salons.length} {t('of', { language })} {data?.data?.pagination?.total || 0} {t('salons', { language })}
                      </p>
                      {viewMode === 'map' && (
                        <button
                          onClick={() => setViewMode('grid')}
                          className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors text-sm"
                        >
                          <List className="h-4 w-4" />
                          <span>List View</span>
                        </button>
                      )}
                    </div>
                </div>
              </div>

                {/* Salon Cards */}
                <div className="space-y-3 sm:space-y-4">
                  {salons.map((salon) => (
                    <div
                      key={salon._id}
                      className={`bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.01] sm:hover:scale-[1.02] ${
                        selectedSalon?._id === salon._id ? 'ring-2 ring-indigo-500' : ''
                      }`}
                      onClick={() => handleSalonSelect(salon)}
                    >
                      <div className="p-4 sm:p-6">
                        <div className="flex items-start space-x-3 sm:space-x-4">
                          {/* Salon Image */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0">
                            {salon.gallery && salon.gallery.length > 0 ? (
                              <img
                                src={salon.gallery[0]}
                                alt={salon.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-bold text-xl">{salon.name.charAt(0)}</span>
                              </div>
                            )}
                          </div>

                          {/* Salon Info */}
                          <div className="flex-1 min-w-0">
                            {/* Salon Name - Always visible */}
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 truncate pr-2">{salon.name}</h3>
                            
                            {/* Address */}
                            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
                              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              <span className="text-xs sm:text-sm truncate">{salon.address}, {salon.district}</span>
                            </div>
                            
                            {/* Stats Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3">
                              <div className="flex items-center">
                                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                                <span>{salon.barbers?.length || 0} stylists</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                                <span>{salon.services?.length || 0} services</span>
                              </div>
                            </div>
                            
                            {/* Badges and Button Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                              <div className="flex items-center space-x-2">
                                {salon.verified && (
                                  <div className="flex items-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    <span className="hidden sm:inline">Verified</span>
                                    <span className="sm:hidden">✓</span>
                                  </div>
                                )}
                                <div className="flex items-center text-yellow-400">
                                  <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                                  <span className="ml-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">4.8</span>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSalonClick(salon._id);
                                }}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 shadow-sm w-full sm:w-auto"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              {/* Pagination */}
                {data?.data?.pagination?.pages && data.data.pagination.pages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto"
                  >
                      {t('previous', { language })}
                  </button>
                  
                    <span className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base">
                      {t('page', { language })} {page} {t('of', { language })} {data?.data?.pagination?.pages || 0}
                  </span>
                  
                  <button
                    onClick={() => setPage(page + 1)}
                      disabled={page === (data?.data?.pagination?.pages || 0)}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto"
                  >
                      {t('next', { language })}
                  </button>
                  </div>
                )}
              </div>

              {/* Map View */}
              {viewMode === 'map' && (
                <div className="w-full lg:col-span-2">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden h-[500px] sm:h-[600px]">
                    <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Salon Locations</h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Click on markers to view salon details</p>
                    </div>
                    <div className="h-[calc(100%-60px)] sm:h-[calc(100%-80px)]">
                      <GoogleMap
                        center={userLocation || { lat: -1.9441, lng: 30.0619 }}
                        zoom={13}
                        salons={salons}
                        onSalonSelect={handleSalonSelect}
                        selectedSalon={selectedSalon}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SalonList;
