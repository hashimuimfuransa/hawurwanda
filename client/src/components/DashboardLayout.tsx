import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useTranslationStore } from '../stores/translationStore';
import { 
  Menu,
  X,
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Globe
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: number;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  sidebarItems?: SidebarItem[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  headerActions?: React.ReactNode;
  onNotificationClick?: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  sidebarItems = [],
  activeTab = '',
  onTabChange = () => {},
  headerActions,
  onNotificationClick
}) => {
  const { user, logout } = useAuthStore();
  const { language, toggleLanguage, t } = useTranslationStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  // Keyboard shortcut for toggling sidebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'e') {
        event.preventDefault();
        setSidebarMinimized(!sidebarMinimized);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [sidebarMinimized]);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 relative overflow-hidden">
      {/* No floating button animation needed anymore */}
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="flex relative z-10">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 ${sidebarMinimized ? 'w-12' : 'w-48 sm:w-56 lg:w-64'} bg-white/95 backdrop-blur-xl border-r border-slate-200/60 ${sidebarMinimized ? 'shadow-2xl shadow-slate-900/20' : 'shadow-2xl shadow-slate-900/10'} transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-300 ease-in-out lg:translate-x-0 lg:fixed overflow-y-auto`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-12 sm:h-14 px-2 sm:px-3 border-b border-slate-200/60 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
            {/* Header background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-700/90 backdrop-blur-sm"></div>
            <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-gradient-to-br from-white/5 via-transparent to-white/10"></div>
            
            <div className="relative z-10 flex items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center mr-1.5 sm:mr-2 shadow-sm sm:shadow-md backdrop-blur-sm">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-sm sm:rounded-md flex items-center justify-center">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-sm"></div>
                </div>
              </div>
              {!sidebarMinimized && (
                <div>
                  <h1 className="text-lg lg:text-xl font-bold text-white drop-shadow-sm">{title}</h1>
                  <p className="text-blue-100/80 text-xs hidden lg:block">{subtitle || 'Dashboard'}</p>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2.5 rounded-xl text-blue-100 hover:text-white hover:bg-white/20 transition-all duration-200 relative z-10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="mt-3 sm:mt-5 px-2.5 sm:px-4">
            <div className="space-y-0.5 sm:space-y-1">
              {sidebarItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setSidebarOpen(false); // Close sidebar on mobile after selection
                  }}
                  className={`w-full flex items-center px-2 py-2 text-left rounded-lg transition-all duration-300 group relative overflow-hidden ${activeTab === item.id ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/30 scale-[1.01]' : 'text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/50 hover:shadow-sm hover:scale-[1.005]'} ${sidebarMinimized ? 'justify-center' : ''}`}
                  title={sidebarMinimized ? item.label : undefined}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animation: 'slideInLeft 0.5s ease-out forwards'
                  }}
                >
                  {/* Active indicator for minimized sidebar */}
                  {sidebarMinimized && activeTab === item.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r"></div>
                  )}
                  {activeTab === item.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-600/20 rounded-2xl blur-xl"></div>
                  )}
                  
                  <div className={`p-1.5 rounded-md mr-2 transition-all duration-300 ${
                    activeTab === item.id 
                      ? 'bg-white/20 shadow-sm' 
                      : 'bg-slate-100 group-hover:bg-blue-100 group-hover:shadow-xs'
                  }`}>
                    <item.icon className={`h-3.5 w-3.5 transition-colors ${
                      activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'
                    }`} />
                  </div>
                  
                  {!sidebarMinimized && (
                    <div className="flex-1 relative z-10">
                      <span className={`font-medium text-xs lg:text-sm ${activeTab === item.id ? 'text-white' : ''}`}>
                        {item.label}
                      </span>
                      {activeTab === item.id && (
                        <div className="w-full h-0.5 bg-white/30 rounded-full mt-0.5"></div>
                      )}
                    </div>
                  )}
                                     
                  {item.badge && (
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                      activeTab === item.id 
                        ? 'bg-white/25 text-white shadow-lg backdrop-blur-sm' 
                        : 'bg-red-100 text-red-600 group-hover:bg-red-200 group-hover:scale-110'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Sidebar Footer */}
            {!sidebarMinimized && (
              <div className="mt-4 sm:mt-6 mb-2 sm:mb-3 p-2 bg-gradient-to-r from-slate-50 to-blue-50/80 rounded-lg border border-slate-200/60">
                <div className="text-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mx-auto mb-1.5 flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-xs">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 capitalize flex items-center justify-center mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1"></span>
                    {user?.role}
                  </p>
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className={`flex-1 flex flex-col min-h-screen ${sidebarMinimized ? 'lg:ml-12' : 'lg:ml-64'} transition-all duration-300 ease-in-out`}>
          
          {/* Removed floating expand button - now in header */}
          {/* Header */}
          <header className={`bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-lg fixed top-0 right-0 left-0 ${sidebarMinimized ? 'lg:left-12' : 'lg:left-64'} transition-all duration-300 ease-in-out z-40`}>
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-blue-50/30 to-indigo-50/30"></div>
            
            <div className="relative z-10 flex items-center justify-between px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1">
              <div className="flex items-center flex-1">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 mr-2 transition-all duration-200 shadow-xs"
                >
                  <Menu className="h-5 w-5" />
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <button
                        onClick={() => setSidebarMinimized(!sidebarMinimized)}
                        className={`hidden lg:block p-2 rounded-lg transition-all duration-300 relative z-10 transform hover:scale-110 mr-2 ${sidebarMinimized ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 shadow-xs' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                        title={sidebarMinimized ? 'Expand sidebar (Ctrl+E)' : 'Collapse sidebar (Ctrl+E)'}
                      >
                        {sidebarMinimized ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <div>
                        <h2 className="text-base md:text-lg lg:text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent capitalize">
                          {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                        </h2>
                        <p className="text-xs text-slate-600 mt-0.5 flex items-center">
                          <span className="font-medium text-slate-800">{user?.name?.split(' ')[0]}</span>
                          <span className="ml-1 text-xs">👋</span>
                        </p>
                      </div>
                    </div>

                    {/* Unified header actions for both mobile and desktop */}
                    <div className="flex items-center space-x-1">
                      {/* Search button - unified for all devices */}
                      <button className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                        <Search className="h-4 w-4" />
                      </button>
                      
                      {/* Notifications - unified for all devices */}
                      <button 
                        onClick={onNotificationClick}
                        className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Bell className="h-4 w-4" />
                        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full"></span>
                      </button>

                      {/* User menu - unified for all devices */}
                      <div className="relative">
                        <button
                          onClick={() => setUserMenuOpen(!userMenuOpen)}
                          className="flex items-center p-0.5 rounded-lg hover:bg-slate-50 transition-all duration-200"
                        >
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-md flex items-center justify-center shadow-xs">
                            <span className="text-white text-xs font-semibold">
                              {user?.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </button>
                        
                        {/* Unified User Dropdown */}
                        {userMenuOpen && (
                          <div className="absolute right-0 mt-1 w-48 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-slate-200/60 z-[99999] overflow-hidden lg:w-56 lg:rounded-2xl">
                            <div className="p-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/50 lg:p-4">
                              <div className="flex items-center space-x-2 lg:space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md lg:w-10 lg:h-10 lg:rounded-xl">
                                  <span className="text-white font-bold text-xs lg:text-sm">
                                    {user?.name?.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900 text-xs lg:text-sm">{user?.name}</p>
                                  <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                                  <div className="flex items-center mt-0.5">
                                    <span className="w-1 h-1 bg-emerald-500 rounded-full mr-1 lg:w-1.5 lg:h-1.5"></span>
                                    <span className="text-xs text-emerald-600 font-medium">Online</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="py-1.5 lg:py-2">
                              <button
                                onClick={() => {
                                  navigate('/profile');
                                  setUserMenuOpen(false);
                                }}
                                className="flex items-center w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors group lg:px-4 lg:py-2.5"
                              >
                                <User className="h-3.5 w-3.5 mr-2.5 text-slate-400 group-hover:text-blue-600" />
                                Profile Settings
                              </button>
                              <button
                                onClick={() => {
                                  toggleLanguage();
                                  setUserMenuOpen(false);
                                }}
                                className="flex items-center w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors group lg:px-4 lg:py-2.5"
                              >
                                <Globe className="h-3.5 w-3.5 mr-2.5 text-slate-400 group-hover:text-blue-600" />
                                {t('languageToggle')} ({language === 'en' ? 'EN' : 'RW'})
                              </button>
                              <hr className="my-1 border-slate-100" />
                              <button
                                onClick={() => {
                                  handleLogout();
                                  setUserMenuOpen(false);
                                }}
                                className="flex items-center w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors group lg:px-4 lg:py-2.5"
                              >
                                <LogOut className="h-3.5 w-3.5 mr-2.5 group-hover:text-red-700" />
                                Sign Out
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main content area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-transparent via-slate-50/30 to-blue-50/40 relative z-0 pt-8 lg:pt-10">
            <div className="container mx-auto px-1.5 sm:px-2 lg:px-4 py-2 sm:py-3 lg:py-6 max-w-7xl relative z-1">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Add custom CSS animations */}
      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;