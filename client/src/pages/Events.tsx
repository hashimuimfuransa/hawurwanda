import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, ArrowRight, Filter, Search } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import { useTranslationStore } from '../stores/translationStore';
import Navbar from '../components/Navbar';

const Events: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { isDarkMode } = useThemeStore();
  const { language, t } = useTranslationStore();

  const events = [
    {
      id: 1,
      title: 'Annual General Meeting 2024',
      description: 'Join us for our annual general meeting to discuss achievements, challenges, and future plans for HAWU.',
      date: 'March 15, 2024',
      time: '9:00 AM - 5:00 PM',
      location: 'Kigali Convention Centre',
      attendees: 500,
      category: 'meeting',
      image: '/images/new1.jpeg',
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Training Graduation Ceremony',
      description: 'Celebrate the achievements of our members who have completed professional training programs.',
      date: 'February 28, 2024',
      time: '2:00 PM - 6:00 PM',
      location: 'Huye District Hall',
      attendees: 200,
      category: 'graduation',
      image: '/images/image0.jpeg',
      status: 'past'
    },
    {
      id: 3,
      title: 'Certification Program Launch',
      description: 'Launch of our new certification program in partnership with leading beauty schools.',
      date: 'February 10, 2024',
      time: '10:00 AM - 3:00 PM',
      location: 'Musanze Training Centre',
      attendees: 150,
      category: 'launch',
      image: '/images/image1.jpeg',
      status: 'past'
    },
    {
      id: 4,
      title: 'Skills Development Workshop',
      description: 'Hands-on workshop on modern hair styling techniques and business management.',
      date: 'April 20, 2024',
      time: '8:00 AM - 4:00 PM',
      location: 'Rubavu Community Centre',
      attendees: 100,
      category: 'workshop',
      image: '/images/image2.jpeg',
      status: 'upcoming'
    },
    {
      id: 5,
      title: 'Networking Conference',
      description: 'Connect with industry professionals and explore new business opportunities.',
      date: 'May 5, 2024',
      time: '9:00 AM - 6:00 PM',
      location: 'Nyagatare Business Hub',
      attendees: 300,
      category: 'conference',
      image: '/images/image3.jpeg',
      status: 'upcoming'
    },
    {
      id: 6,
      title: 'Health & Safety Training',
      description: 'Essential health and safety training for salon workers and barbers.',
      date: 'January 25, 2024',
      time: '9:00 AM - 5:00 PM',
      location: 'Karongi Health Centre',
      attendees: 80,
      category: 'training',
      image: '/images/image4.jpeg',
      status: 'past'
    }
  ];

  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'all' || event.category === filter || event.status === filter;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'meeting': return 'from-blue-500 to-blue-600';
      case 'graduation': return 'from-green-500 to-green-600';
      case 'launch': return 'from-purple-500 to-purple-600';
      case 'workshop': return 'from-orange-500 to-orange-600';
      case 'conference': return 'from-pink-500 to-pink-600';
      case 'training': return 'from-teal-500 to-teal-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'upcoming' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar />
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              {t('eventsActivities', language)}
            </h1>
            <p className="text-lg sm:text-xl text-emerald-100 max-w-3xl mx-auto">
              {t('eventsActivitiesDesc', language)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={t('searchEvents', language)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: t('allEvents', language) },
                { key: 'upcoming', label: t('upcoming', language) },
                { key: 'past', label: t('pastEvents', language) },
                { key: 'meeting', label: t('meetings', language) },
                { key: 'workshop', label: t('workshops', language) },
                { key: 'training', label: t('training', language) }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === filterOption.key
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              {/* Event Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                  {event.status === 'upcoming' ? 'Upcoming' : 'Past'}
                </div>
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${getCategoryColor(event.category)}`}>
                  {event.category}
                </div>
              </div>

              {/* Event Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {event.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-2" />
                    {event.date}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-2" />
                    {event.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Users className="h-4 w-4 mr-2" />
                    {event.attendees} attendees
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center">
                  {event.status === 'upcoming' ? 'Register Now' : 'View Details'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Calendar className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No events found
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

export default Events;
