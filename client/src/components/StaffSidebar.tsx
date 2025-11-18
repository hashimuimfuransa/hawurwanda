import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  UserPlus, 
  BarChart3, 
  Clock, 
  Bell, 
  Settings,
  LogOut,
  Home,
  QrCode,
  X
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useTranslationStore } from '../stores/translationStore';

interface StaffSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  salon?: any;
}

const StaffSidebar: React.FC<StaffSidebarProps> = ({ isOpen, onClose, salon }) => {
  const { user, logout } = useAuthStore();
  const { language, t } = useTranslationStore();
  const location = useLocation();

  const navigation = [
    { name: t('overview'), href: '/dashboard/staff', icon: LayoutDashboard, current: location.pathname === '/dashboard/staff' },
    { name: t('bookings'), href: '/dashboard/staff/bookings', icon: Calendar, current: location.pathname === '/dashboard/staff/bookings' },
    { name: t('customers'), href: '/dashboard/staff/customers', icon: Users, current: location.pathname === '/dashboard/staff/customers' },
    { name: t('walkInCustomers'), href: '/dashboard/staff/walkins', icon: UserPlus, current: location.pathname === '/dashboard/staff/walkins' },
    { name: t('earnings'), href: '/dashboard/staff/earnings', icon: BarChart3, current: location.pathname === '/dashboard/staff/earnings' },
    { name: t('schedule'), href: '/dashboard/staff/schedule', icon: Clock, current: location.pathname === '/dashboard/staff/schedule' },
    { name: t('notifications'), href: '/dashboard/staff/notifications', icon: Bell, current: location.pathname === '/dashboard/staff/notifications' },
    { name: t('settings'), href: '/dashboard/staff/settings', icon: Settings, current: location.pathname === '/dashboard/staff/settings' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 sm:w-72 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-slate-700">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                <Home className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="ml-2 sm:ml-3 text-sm sm:text-xl font-bold text-white truncate">{t('staffDashboard')}</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 sm:p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-slate-700">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-base sm:text-lg font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-300 capitalize truncate">{user?.role}</p>
                {salon && (
                  <p className="text-xs text-slate-400 truncate">{salon.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    group flex items-center px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-200
                    ${item.current
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white hover:shadow-md'
                    }
                  `}
                >
                  <Icon
                    className={`
                      mr-2 sm:mr-4 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0
                      ${item.current ? 'text-white' : 'text-slate-400 group-hover:text-white'}
                    `}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-2 sm:px-4 py-3 sm:py-4 border-t border-slate-700">
            <button
              onClick={handleLogout}
              className="group flex items-center w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-slate-300 rounded-lg sm:rounded-xl hover:bg-red-600 hover:text-white transition-all duration-200"
            >
              <LogOut className="mr-2 sm:mr-4 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-hover:text-white" />
              <span className="truncate">{t('logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffSidebar;