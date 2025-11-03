import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useTranslationStore } from '../stores/translationStore';
import { 
  Scissors, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ChevronRight 
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { language, toggleLanguage, t } = useTranslationStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getLanguageDisplay = () => {
    return language === 'rw' ? '🇷🇼 RW' : '🇺🇸 EN';
  };

  const navItems = [
    { to: '/', label: t('home', language) },
    { to: '/about', label: t('about', language) },
    { to: '/salons', label: t('salons', language) },
    { to: '/programs', label: t('programs', language) },
    { to: '/publications', label: t('publications', language) },
    { to: '/contact', label: t('contact', language) }
  ];

  const getDashboardPath = () => {
    if (!user) return '/login';
    const normalizedRole = (user.role as string | undefined)?.toLowerCase?.();
    const roleDashboardMap: Record<string, string> = {
      client: '/profile',
      barber: '/dashboard/staff',
      hairstylist: '/dashboard/staff',
      nail_technician: '/dashboard/staff',
      massage_therapist: '/dashboard/staff',
      esthetician: '/dashboard/staff',
      receptionist: '/dashboard/staff',
      manager: '/dashboard/staff',
      owner: '/dashboard/owner',
      admin: '/admin',
      superadmin: '/superadmin'
    };
    if (!normalizedRole) return '/profile';
    return roleDashboardMap[normalizedRole] || '/profile';
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      scrollY > 50 
        ? 'bg-white/75 dark:bg-slate-900/70 backdrop-blur-2xl shadow-[0_20px_50px_-20px_rgba(15,23,42,0.45)] border-b border-white/40 dark:border-slate-800/60'
        : 'bg-gradient-to-r from-emerald-400/20 via-sky-500/20 to-indigo-600/20 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center">
            <img
              src="/images/logo.png"
              alt="HAWU Logo"
              className={`h-16 sm:h-20 w-auto object-contain transition-all duration-300 ${
                scrollY > 50 
                  ? isDarkMode 
                    ? 'drop-shadow-lg brightness-150' 
                    : 'drop-shadow-lg'
                  : isDarkMode
                  ? 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] brightness-150'
                  : 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
              }`}
            />
          </Link>

          <nav className="hidden lg:flex items-center space-x-10">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`relative text-sm tracking-wide uppercase transition-colors duration-200 font-semibold group ${
                  scrollY > 50
                    ? isActive(item.to)
                      ? 'text-emerald-600 dark:text-emerald-300'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-300'
                    : isActive(item.to)
                    ? 'text-white'
                    : 'text-white/90 hover:text-white'
                }`}
              >
                {item.label}
                <span className={`absolute -bottom-2 left-0 h-[2px] rounded-full transition-all duration-300 ${
                  isActive(item.to)
                    ? 'w-full bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-500'
                    : 'w-0 bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-500 group-hover:w-full'
                }`}></span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-3 sm:space-x-5">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors duration-200 ${
                scrollY > 50
                  ? 'bg-white/80 dark:bg-slate-800/80 border border-white/40 dark:border-slate-700/60 shadow-sm hover:bg-white dark:hover:bg-slate-700'
                  : 'bg-white/20 border border-white/30 hover:bg-white/30 shadow-sm'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-amber-300" />
              ) : (
                <Moon className={`h-5 w-5 ${scrollY > 50 ? 'text-slate-600' : 'text-white'}`} />
              )}
            </button>

            <button
              onClick={toggleLanguage}
              className={`hidden md:flex items-center space-x-2 transition-colors cursor-pointer px-3 py-2 rounded-full ${
                scrollY > 50
                  ? 'text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white bg-white/60 dark:bg-slate-800/70 border border-white/40 dark:border-slate-700/60'
                  : 'text-white/90 hover:text-white bg-white/20 border border-white/30'
              }`}
              title="Change Language"
            >
              <span className="text-xs font-semibold tracking-widest">{getLanguageDisplay()}</span>
              <ChevronRight className="h-4 w-4" />
            </button>

            {user ? (
              <Link 
                to={getDashboardPath()} 
                className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold text-white transition-all duration-300 ${
                  scrollY > 50
                    ? 'bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-500 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:from-emerald-500 hover:via-sky-600 hover:to-indigo-600'
                    : 'bg-white/20 border border-white/30 hover:bg-white/30'
                }`}
              >
                <span className="hidden sm:inline">{t('dashboard', language)}</span>
                <span className="sm:hidden">{t('dashboard', language)}</span>
              </Link>
            ) : (
              <Link 
                to="/login" 
                className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold text-white transition-all duration-300 ${
                  scrollY > 50
                    ? 'bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-500 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:from-emerald-500 hover:via-sky-600 hover:to-indigo-600'
                    : 'bg-white/20 border border-white/30 hover:bg-white/30'
                }`}
              >
                <span className="hidden sm:inline">{t('login', language)}</span>
                <span className="sm:hidden">{t('login', language)}</span>
              </Link>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-full transition-colors duration-200 ${
                scrollY > 50
                  ? 'bg-white/80 dark:bg-slate-800/80 border border-white/40 dark:border-slate-700/60 shadow-sm'
                  : 'bg-white/20 border border-white/30 hover:bg-white/30 shadow-sm'
              }`}
            >
              {isMobileMenuOpen ? (
                <X className={`h-5 w-5 ${scrollY > 50 ? 'text-slate-600 dark:text-slate-200' : 'text-white'}`} />
              ) : (
                <Menu className={`h-5 w-5 ${scrollY > 50 ? 'text-slate-600 dark:text-slate-200' : 'text-white'}`} />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className={`lg:hidden absolute top-16 left-0 right-0 backdrop-blur-2xl border rounded-3xl shadow-2xl transition-all duration-300 ${
            scrollY > 50
              ? 'bg-white/80 dark:bg-slate-900/80 border-white/40 dark:border-slate-800/60'
              : 'bg-slate-900/90 border-white/20'
          }`}>
            <nav className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`block transition-colors duration-200 font-semibold uppercase tracking-wide py-2 ${
                    scrollY > 50
                      ? isActive(item.to)
                        ? 'text-emerald-500'
                        : 'text-slate-600 dark:text-slate-200 hover:text-emerald-500'
                      : isActive(item.to)
                      ? 'text-emerald-400'
                      : 'text-white/80 hover:text-white'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              <div className={`pt-4 space-y-3 border-t ${scrollY > 50 ? 'border-white/40 dark:border-slate-800/60' : 'border-white/20'}`}>
                <button
                  onClick={toggleTheme}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-colors duration-200 ${
                    scrollY > 50
                      ? 'bg-white/70 dark:bg-slate-800/80 border border-white/40 dark:border-slate-700/60 text-slate-600 dark:text-slate-200'
                      : 'bg-white/10 border border-white/20 text-white/90 hover:bg-white/20'
                  }`}
                >
                  <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  {isDarkMode ? <Sun className="h-5 w-5 text-amber-300" /> : <Moon className={`h-5 w-5 ${scrollY > 50 ? 'text-slate-500' : 'text-white'}`} />}
                </button>
                
                <button
                  onClick={toggleLanguage}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-colors duration-200 ${
                    scrollY > 50
                      ? 'bg-white/70 dark:bg-slate-800/80 border border-white/40 dark:border-slate-700/60 text-slate-600 dark:text-slate-200'
                      : 'bg-white/10 border border-white/20 text-white/90 hover:bg-white/20'
                  }`}
                >
                  <span>{getLanguageDisplay()}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

