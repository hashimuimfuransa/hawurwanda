import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Bell, 
  User,
  Search,
  LogOut,
  Settings,
  ChevronDown,
  Sparkles,
  Building2,
  Shield,
  Activity,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Calendar,
  Clock,
  DollarSign,
  MessageSquare,
  Globe
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useTranslationStore } from '../stores/translationStore';

interface StaffMainContentProps {
  children: React.ReactNode;
  onMenuClick: () => void;
  title: string;
  subtitle?: string;
  salon?: any;
}

const StaffMainContent: React.FC<StaffMainContentProps> = ({ 
  children, 
  onMenuClick, 
  title, 
  subtitle,
  salon
}) => {
  const { user, logout } = useAuthStore();
  const { language, toggleLanguage, t } = useTranslationStore();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'booking',
      title: 'New Booking Received',
      message: 'You have a new booking for 2:00 PM today',
      time: '5 minutes ago',
      read: false,
      icon: Calendar,
      color: 'blue'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of 15,000 RWF received for service',
      time: '1 hour ago',
      read: false,
      icon: DollarSign,
      color: 'green'
    },
    {
      id: 3,
      type: 'schedule',
      title: 'Schedule Updated',
      message: 'Your schedule has been updated for tomorrow',
      time: '2 hours ago',
      read: true,
      icon: Clock,
      color: 'purple'
    },
    {
      id: 4,
      type: 'message',
      title: 'New Message',
      message: 'You have a new message from salon management',
      time: '3 hours ago',
      read: true,
      icon: MessageSquare,
      color: 'orange'
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
  };

  const handleNotificationClick = (notificationId: number) => {
    // Handle notification click - navigate to relevant page
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      switch (notification.type) {
        case 'booking':
          navigate('/dashboard/staff/bookings');
          break;
        case 'payment':
          navigate('/dashboard/staff/earnings');
          break;
        case 'schedule':
          navigate('/dashboard/staff/schedule');
          break;
        case 'message':
          navigate('/dashboard/staff/messages');
          break;
        default:
          break;
      }
    }
    setNotificationMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) {
        setNotificationMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <header className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-3 sm:px-4 lg:px-6 xl:px-8">
          {/* Left Section */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden transition-all duration-200 flex-shrink-0"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg flex-shrink-0">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent truncate">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
            {/* Search - Hidden on mobile, visible on md+ */}
            <div className="hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Shakisha..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-48 lg:w-64 pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl leading-5 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all duration-200"
                />
              </form>
            </div>

            {/* Mobile Search Button */}
            <button className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200">
              <Search className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationMenuRef}>
              <button
                onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 group"
              >
                <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 ring-2 ring-white dark:ring-gray-800 shadow-lg animate-pulse flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setNotificationMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-xl py-2 z-50 border border-gray-200 dark:border-gray-700 max-h-96 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Amamenyesha</h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{unreadCount} unread</span>
                      </div>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => {
                          const IconComponent = notification.icon;
                          return (
                            <button
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification.id)}
                              className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group ${
                                !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${
                                  notification.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                  notification.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                                  notification.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                                  'bg-orange-100 dark:bg-orange-900/30'
                                }`}>
                                  <IconComponent className={`h-4 w-4 ${
                                    notification.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                                    notification.color === 'green' ? 'text-green-600 dark:text-green-400' :
                                    notification.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                                    'text-orange-600 dark:text-orange-400'
                                  }`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                      {notification.title}
                                    </p>
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {notification.time}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 dark:text-gray-400">No notifications yet</p>
                        </div>
                      )}
                    </div>
                    
                    {notifications.length > 0 && (
                      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
                        <button className="w-full text-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Language Toggle Button */}
            <button
              onClick={() => toggleLanguage()}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg transition-all duration-200 whitespace-nowrap font-medium text-sm"
              title={t('languageToggle')}
            >
              <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">{language === 'en' ? 'EN' : 'RW'}</span>
            </button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 sm:gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-24">
                    {user?.name}
                  </p>
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                    {user?.role === 'barber' && <Shield className="h-3 w-3 text-blue-500 flex-shrink-0" />}
                    {user?.role === 'hairstylist' && <Activity className="h-3 w-3 text-purple-500 flex-shrink-0" />}
                  </div>
                  {salon && (
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <p className="text-xs text-gray-400 truncate max-w-20">{salon.name}</p>
                    </div>
                  )}
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform flex-shrink-0">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''} hidden sm:block`} />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-xl py-2 z-50 border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                          {salon && (
                            <p className="text-xs text-gray-400 truncate">{salon.name}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/dashboard/staff/settings');
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                    >
                      <Settings className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                    >
                      <LogOut className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6 xl:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default StaffMainContent;