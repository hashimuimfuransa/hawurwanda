import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Users, 
  CheckCircle,
  Filter,
  Calendar,
  ArrowRight,
  Scissors,
  Sparkles
} from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import { useTranslationStore } from '../stores/translationStore';
import Navbar from '../components/Navbar';
import { api } from '../services/api';

interface Salon {
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
}

const BookingSelection: React.FC = () => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [filteredSalons, setFilteredSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const { isDarkMode } = useThemeStore();
  const { language } = useTranslationStore();

  const districts = [
    'Kigali', 'Huye', 'Musanze', 'Rubavu', 'Nyagatare', 'Karongi',
    'Rusizi', 'Gisagara', 'Nyanza', 'Nyaruguru', 'Nyamagabe', 'Ruhango',
    'Muhanga', 'Kamonyi', 'Rulindo', 'Gakenke', 'Burera', 'Gicumbi',
    'Rwamagana', 'Kayonza', 'Kirehe', 'Ngoma', 'Bugesera', 'Gatsibo',
    'Nyamasheke', 'Rusizi', 'Nyabihu', 'Rutsiro', 'Ngororero', 'Rubavu'
  ];


  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const response = await api.get('/salons');
        setSalons(response.data);
        setFilteredSalons(response.data);
      } catch (error) {
        console.error('Error fetching salons:', error);
        // Mock data for demo
        const mockSalons: Salon[] = [
          {
            _id: '1',
            name: 'Elite Hair Studio',
            address: 'KG 123 St, Kacyiru',
            district: 'Kigali',
            verified: true,
            gallery: ['/images/salon1.jpg'],
            services: [
              { _id: '1', title: 'Hair Cut', price: 5000, durationMinutes: 30 },
              { _id: '2', title: 'Hair Wash', price: 3000, durationMinutes: 20 }
            ],
            barbers: [
              { _id: '1', name: 'John Doe', profilePhoto: '/images/barber1.jpg' },
              { _id: '2', name: 'Jane Smith', profilePhoto: '/images/barber2.jpg' }
            ]
          },
          {
            _id: '2',
            name: 'Modern Barber Shop',
            address: 'KG 456 St, Nyamirambo',
            district: 'Kigali',
            verified: true,
            gallery: ['/images/salon2.jpg'],
            services: [
              { _id: '3', title: 'Beard Trim', price: 4000, durationMinutes: 25 },
              { _id: '4', title: 'Hair Styling', price: 6000, durationMinutes: 45 }
            ],
            barbers: [
              { _id: '3', name: 'Mike Johnson', profilePhoto: '/images/barber3.jpg' }
            ]
          },
          {
            _id: '3',
            name: 'Beauty Corner',
            address: 'Main St, Huye',
            district: 'Huye',
            verified: false,
            gallery: ['/images/salon3.jpg'],
            services: [
              { _id: '5', title: 'Hair Treatment', price: 8000, durationMinutes: 60 },
              { _id: '6', title: 'Hair Coloring', price: 12000, durationMinutes: 90 }
            ],
            barbers: [
              { _id: '4', name: 'Sarah Wilson', profilePhoto: '/images/barber4.jpg' },
              { _id: '5', name: 'David Brown', profilePhoto: '/images/barber5.jpg' }
            ]
          }
        ];
        setSalons(mockSalons);
        setFilteredSalons(mockSalons);
      } finally {
        setLoading(false);
      }
    };

    fetchSalons();
  }, []);

  useEffect(() => {
    let filtered = salons;

    if (searchTerm) {
      filtered = filtered.filter(salon =>
        salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salon.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salon.district.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDistrict) {
      filtered = filtered.filter(salon => salon.district === selectedDistrict);
    }

    if (verifiedOnly) {
      filtered = filtered.filter(salon => salon.verified);
    }

    setFilteredSalons(filtered);
  }, [salons, searchTerm, selectedDistrict, verifiedOnly]);

  const getMinPrice = (salon: Salon) => {
    return salon.services.length > 0 
      ? Math.min(...salon.services.map(s => s.price))
      : 0;
  };

  if (loading) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">{t('loadingSalons', language)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              {t('bookAppointment', language)}
            </h1>
            <p className="text-lg sm:text-xl text-emerald-100 max-w-3xl mx-auto">
              {t('bookAppointmentDesc', language)}
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold mt-6">
              <Sparkles className="w-4 h-4 mr-2" />
              {salons.length} {t('salonsAvailable', language)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={t('searchSalons', language)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* District Filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-w-[200px]"
              >
                <option value="">{t('allDistricts', language)}</option>
                {districts.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            {/* Verified Filter */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="verified"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="mr-2 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <label htmlFor="verified" className="text-sm text-gray-700 dark:text-gray-300">
                Verified Only
              </label>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredSalons.length} of {salons.length} salons
          </p>
        </div>

        {/* Salons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredSalons.map((salon) => (
            <div key={salon._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              {/* Salon Image */}
              <div className="relative h-48 overflow-hidden">
                {salon.gallery.length > 0 ? (
                  <img
                    src={salon.gallery[0]}
                    alt={salon.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900 dark:to-blue-900 flex items-center justify-center">
                    <Scissors className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
                  </div>
                )}
                
                {salon.verified && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full shadow-lg">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                )}
                
                <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                  <div className="flex items-center text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-sm font-semibold text-gray-700 dark:text-gray-300">4.8</span>
                  </div>
                </div>
              </div>

              {/* Salon Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {salon.name}
                </h3>
                
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">{salon.address}, {salon.district}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{salon.barbers.length} staff</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{salon.services.length} services</span>
                  </div>
                </div>

                {getMinPrice(salon) > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Starting from <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {getMinPrice(salon).toLocaleString()} RWF
                    </span>
                  </div>
                )}

                {/* Book Button */}
                <Link
                  to={`/booking/${salon._id}`}
                  className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center group"
                >
                  Book Appointment
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredSalons.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No salons found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSelection;
