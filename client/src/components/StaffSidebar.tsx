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
  QrCode
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface StaffSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  salon?: any;
}

const StaffSidebar: React.FC<StaffSidebarProps> = ({ isOpen, onClose, salon }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const navigation = [
    { name: 'Inshamake', href: '/dashboard/staff', icon: LayoutDashboard, current: location.pathname === '/dashboard/staff' },
    { name: 'Ubusabe', href: '/dashboard/staff/bookings', icon: Calendar, current: location.pathname === '/dashboard/staff/bookings' },
    { name: 'Abakiriya', href: '/dashboard/staff/customers', icon: Users, current: location.pathname === '/dashboard/staff/customers' },
    { name: 'Abaza ku Isonga', href: '/dashboard/staff/walkins', icon: UserPlus, current: location.pathname === '/dashboard/staff/walkins' },
    { name: 'Amafaranga', href: '/dashboard/staff/earnings', icon: BarChart3, current: location.pathname === '/dashboard/staff/earnings' },
    { name: 'Igenamigambi', href: '/dashboard/staff/schedule', icon: Clock, current: location.pathname === '/dashboard/staff/schedule' },
    { name: 'Ikarita ya Dijitali', href: '/dashboard/staff/digital-card', icon: QrCode, current: location.pathname === '/dashboard/staff/digital-card' },
    { name: 'Amamenyesha', href: '/dashboard/staff/notifications', icon: Bell, current: location.pathname === '/dashboard/staff/notifications' },
    { name: 'Igenamiterere', href: '/dashboard/staff/settings', icon: Settings, current: location.pathname === '/dashboard/staff/settings' },
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
        fixed inset-y-0 left-0 z-30 w-72 sm:w-64 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-white">Urubuga rw'Abakozi</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info */}
          <div className="px-6 py-6 border-b border-slate-700">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-slate-300 capitalize">{user?.role}</p>
                {salon && (
                  <p className="text-xs text-slate-400">{salon.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                    ${item.current
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white hover:shadow-md'
                    }
                  `}
                >
                  <Icon
                    className={`
                      mr-4 h-5 w-5 flex-shrink-0
                      ${item.current ? 'text-white' : 'text-slate-400 group-hover:text-white'}
                    `}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-slate-700">
            <button
              onClick={handleLogout}
              className="group flex items-center w-full px-4 py-3 text-sm font-medium text-slate-300 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-200"
            >
              <LogOut className="mr-4 h-5 w-5 text-slate-400 group-hover:text-white" />
              Sohoka
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffSidebar;
