import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { 
  Menu,
  X,
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  ChevronDown
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
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  sidebarItems = [],
  activeTab = '',
  onTabChange = () => {},
  headerActions
}) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="flex relative z-10">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 sm:w-72 lg:w-80 bg-white/95 backdrop-blur-xl border-r border-slate-200/60 shadow-2xl shadow-slate-900/10 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-300 ease-in-out lg:translate-x-0 lg:fixed overflow-y-auto`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-20 lg:h-24 px-6 border-b border-slate-200/60 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
            {/* Header background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-700/90 backdrop-blur-sm"></div>
            <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-gradient-to-br from-white/5 via-transparent to-white/10"></div>
            
            <div className="relative z-10 flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center mr-3 shadow-lg backdrop-blur-sm">
                <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-sm"></div>
                </div>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-white drop-shadow-sm">{title}</h1>
                <p className="text-blue-100/80 text-sm hidden lg:block">{subtitle || 'Dashboard'}</p>
              </div>
            </div>
            
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2.5 rounded-xl text-blue-100 hover:text-white hover:bg-white/20 transition-all duration-200 relative z-10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="mt-4 sm:mt-8 px-4 sm:px-6">
            <div className="space-y-1 sm:space-y-2">
              {sidebarItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setSidebarOpen(false); // Close sidebar on mobile after selection
                  }}
                  className={`w-full flex items-center px-3 sm:px-4 py-3 sm:py-4 text-left rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/30 scale-[1.02]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/50 hover:shadow-lg hover:scale-[1.01]'
                  }`}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animation: 'slideInLeft 0.5s ease-out forwards'
                  }}
                >
                  {activeTab === item.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-600/20 rounded-2xl blur-xl"></div>
                  )}
                  
                  <div className={`p-2.5 rounded-xl mr-4 transition-all duration-300 ${
                    activeTab === item.id 
                      ? 'bg-white/20 shadow-lg' 
                      : 'bg-slate-100 group-hover:bg-blue-100 group-hover:shadow-md'
                  }`}>
                    <item.icon className={`h-5 w-5 transition-colors ${
                      activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1 relative z-10">
                    <span className={`font-semibold text-sm lg:text-base ${activeTab === item.id ? 'text-white' : ''}`}>
                      {item.label}
                    </span>
                    {activeTab === item.id && (
                      <div className="w-full h-0.5 bg-white/30 rounded-full mt-1"></div>
                    )}
                  </div>
                  
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
            <div className="mt-8 sm:mt-12 mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-blue-50/80 rounded-2xl border border-slate-200/60">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize flex items-center justify-center mt-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  {user?.role}
                </p>
              </div>
            </div>
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
        <div className="flex-1 flex flex-col min-h-screen lg:ml-80">
          {/* Header */}
          <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-lg fixed top-0 right-0 left-0 lg:left-80 z-40">
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-blue-50/30 to-indigo-50/30"></div>
            
            <div className="relative z-10 flex items-center justify-between px-2 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6">
              <div className="flex items-center flex-1">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-3 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 mr-4 transition-all duration-200 shadow-sm"
                >
                  <Menu className="h-6 w-6" />
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent capitalize">
                        {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                      </h2>
                      <p className="text-sm lg:text-base text-slate-600 mt-1 flex items-center">
                        <span className="hidden sm:inline">Welcome back, </span>
                        <span className="font-medium text-slate-800">{user?.name?.split(' ')[0]}</span>
                        <span className="ml-2">👋</span>
                      </p>
                    </div>

                    {/* Mobile-optimized header actions */}
                    <div className="flex items-center space-x-1 sm:space-x-2 lg:hidden">
                      {/* Mobile search button */}
                      <button className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                        <Search className="h-5 w-5" />
                      </button>
                      
                      {/* Mobile notifications */}
                      <button className="relative p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full"></span>
                      </button>

                      {/* Mobile user menu */}
                      <div className="relative">
                        <button
                          onClick={() => setUserMenuOpen(!userMenuOpen)}
                          className="flex items-center p-1 rounded-xl hover:bg-slate-50 transition-all duration-200"
                        >
                          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white text-xs sm:text-sm font-semibold">
                              {user?.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </button>
                        
                        {/* Mobile User Dropdown */}
                        {userMenuOpen && (
                          <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 z-[99999] overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/50">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                  <span className="text-white font-bold text-sm">
                                    {user?.name?.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900 text-sm">{user?.name}</p>
                                  <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                                  <div className="flex items-center mt-1">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
                                    <span className="text-xs text-emerald-600 font-medium">Online</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="py-2">
                              <button
                                onClick={() => {
                                  navigate('/profile');
                                  setUserMenuOpen(false);
                                }}
                                className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors group"
                              >
                                <User className="h-4 w-4 mr-3 text-slate-400 group-hover:text-blue-600" />
                                Profile Settings
                              </button>
                              <button
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors group"
                              >
                                <Settings className="h-4 w-4 mr-3 text-slate-400 group-hover:text-blue-600" />
                                Preferences
                              </button>
                              <hr className="my-2 border-slate-100" />
                              <button
                                onClick={() => {
                                  handleLogout();
                                  setUserMenuOpen(false);
                                }}
                                className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                              >
                                <LogOut className="h-4 w-4 mr-3 group-hover:text-red-700" />
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

              {/* Desktop header actions */}
              <div className="hidden lg:flex items-center space-x-4">
                {headerActions}

                {/* Desktop Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search anything..."
                    className="pl-11 pr-6 py-3 w-80 bg-white/80 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm shadow-sm backdrop-blur-sm"
                  />
                </div>

                {/* Desktop Notifications */}
                <button className="relative p-3 text-slate-400 hover:text-slate-700 hover:bg-white/80 rounded-2xl transition-all duration-200 shadow-sm group">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">3</span>
                  </span>
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full animate-ping opacity-75"></span>
                </button>

                {/* Desktop User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-4 p-2 rounded-2xl hover:bg-white/80 transition-all duration-200 group shadow-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 text-right">{user?.name}</p>
                        <p className="text-xs text-slate-500 capitalize flex items-center justify-end">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                          {user?.role}
                        </p>
                      </div>
                      <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-semibold">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-4 w-64 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 z-[99999] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/50">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {user?.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{user?.name}</p>
                            <p className="text-sm text-slate-500 capitalize">{user?.role}</p>
                            <div className="flex items-center mt-1">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                              <span className="text-xs text-emerald-600 font-medium">Online</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="py-3">
                        <button
                          onClick={() => navigate('/profile')}
                          className="flex items-center w-full px-6 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors group"
                        >
                          <User className="h-4 w-4 mr-4 text-slate-400 group-hover:text-blue-600" />
                          Profile Settings
                        </button>
                        <button
                          onClick={() => {}}
                          className="flex items-center w-full px-6 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors group"
                        >
                          <Settings className="h-4 w-4 mr-4 text-slate-400 group-hover:text-blue-600" />
                          Preferences
                        </button>
                        <hr className="my-3 border-slate-100" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                        >
                          <LogOut className="h-4 w-4 mr-4 group-hover:text-red-700" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Main content area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-transparent via-slate-50/30 to-blue-50/40 relative z-0 pt-20 lg:pt-24">
            <div className="container mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-12 max-w-7xl relative z-1">
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