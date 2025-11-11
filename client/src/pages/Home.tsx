import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useTranslationStore } from '../stores/translationStore';
import { 
  GraduationCap, 
  Megaphone, 
  Handshake, 
  Heart, 
  Briefcase, 
  Scale,
  Target,
  ArrowRight,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Award,
  Scissors,
  ChevronRight,
  Play,
  Sun,
  Moon,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Menu,
  X,
  Star,
  TrendingUp,
  Shield,
  CheckCircle,
  Sparkles,
  Store,
  Wand2
} from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { language, toggleLanguage, t } = useTranslationStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add scroll-triggered animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
        }
      });
    }, observerOptions);

    // Observe all sections
    const sections = document.querySelectorAll('section');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);


  const getLanguageDisplay = () => {
    return language === 'rw' ? '🇷🇼 RW' : '🇺🇸 EN';
  };

  const partners = [
    { name: 'MIFOTRA', description: 'Ministry of Public Service and Labour', logo: '/images/partners/mifotra.png', color: 'from-blue-500 to-blue-600' },
    { name: 'CESTRAR', description: 'Central Trade Union of Rwanda', logo: '/images/partners/cestrar.png', color: 'from-green-500 to-green-600' },
    { name: 'BMA', description: 'Beauty Makers Association', logo: '/images/partners/bma.png', color: 'from-pink-500 to-pink-600' },
    { name: 'RTB', description: 'Rwanda TVET Board', logo: '/images/partners/rtb.jpg', color: 'from-purple-500 to-purple-600' },
    { name: 'MINISP', description: 'Ministry of Infrastructure', logo: '/images/partners/minisport.png', color: 'from-orange-500 to-orange-600' }
  ];

  const updates = [
    {
      category: t('event', language),
      date: 'March 15, 2024',
      title: t('annualGeneralMeeting', language),
      description: t('annualGeneralMeetingDesc', language),
      image: '/images/new1.jpeg',
      color: 'from-blue-500 to-purple-600'
    },
    {
      category: t('news', language),
      date: 'February 28, 2024',
      title: t('trainingGraduationParty', language),
      description: t('trainingGraduationPartyDesc', language),
      image: '/images/image0.jpeg',
      color: 'from-green-500 to-teal-600'
    },
    {
      category: t('certification', language),
      date: 'February 10, 2024',
      title: t('certificationProgramLaunch', language),
      description: t('certificationProgramLaunchDesc', language),
      image: '/images/image1.jpeg',
      color: 'from-orange-500 to-red-600'
    }
  ];

  const testimonials = [
    {
      name: 'Marie Mukamana',
      role: t('salonOwner', language),
      location: 'Kigali',
      content: t('testimonialMarie', language),
      rating: 5,
      icon: Store
    },
    {
      name: 'Jean Baptiste',
      role: t('professionalBarber', language),
      location: 'Huye',
      content: t('testimonialJean', language),
      rating: 5,
      icon: Scissors
    },
    {
      name: 'Grace Uwimana',
      role: t('beautyTherapist', language),
      location: 'Musanze',
      content: t('testimonialGrace', language),
      rating: 5,
      icon: Wand2
    }
  ];

  return (
    <div className={`relative min-h-screen transition-all duration-500 ${isDarkMode ? 'dark bg-slate-950' : 'bg-transparent'}`}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-24 h-96 w-96 bg-emerald-300/30 blur-3xl rounded-full"></div>
        <div className="absolute top-20 right-0 h-[28rem] w-[28rem] bg-sky-300/30 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 bg-indigo-300/20 blur-3xl rounded-full"></div>
      </div>

      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-500 transform origin-left transition-transform duration-300" 
           style={{ transform: `scaleX(${Math.min(scrollY / (document.documentElement.scrollHeight - window.innerHeight), 1)})` }}>
      </div>

      {/* Dynamic Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrollY > 50 
          ? 'bg-white dark:bg-gray-800/95 backdrop-blur-md shadow-lg border-b border-gray-200/50' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
                   {/* Logo */}
                   <Link to="/" className="flex items-center">
                     <img
                       src="/images/logo.png"
                       alt="HAWU Logo"
                       className="h-20 sm:h-24 w-auto object-contain"
                     />
                   </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-8">
              {[
                { to: '/', label: t('home', language) },
                { to: '/about', label: t('about', language) },
                { to: '/salons', label: t('salons', language) },
                { to: '/programs', label: t('programs', language) },
                { to: '/publications', label: t('publications', language) },
                { to: '/contact', label: t('contact', language) }
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="relative text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition-colors duration-200 font-medium group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
                     {/* Theme Toggle */}
                     <button
                       onClick={toggleTheme}
                       className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                       title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                     >
                {isDarkMode ? (
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>

              {/* Language Selector */}
              <button
                onClick={toggleLanguage}
                className="hidden md:flex items-center space-x-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-colors cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Change Language"
              >
                <span className="text-sm">{getLanguageDisplay()}</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Auth Button */}
              {user ? (
                <Link 
                  to="/profile" 
                  className="hidden sm:inline-flex px-3 sm:px-6 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-full hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-xs sm:text-base"
                >
                  <span className="hidden sm:inline">{t('dashboard', language)}</span>
                  <span className="sm:hidden">{t('dashboard', language)}</span>
                </Link>
              ) : (
                <Link 
                  to="/login" 
                  className="hidden sm:inline-flex px-3 sm:px-6 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-full hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-xs sm:text-base"
                >
                  <span className="hidden sm:inline">{t('login', language)}</span>
                  <span className="sm:hidden">{t('login', language)}</span>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {isMobileMenuOpen ? (
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-lg">
              <nav className="px-4 py-6 space-y-4">
                {[
                  { to: '/', label: t('home', language) },
                  { to: '/about', label: t('about', language) },
                  { to: '/salons', label: t('salons', language) },
                  { to: '/programs', label: t('programs', language) },
                  { to: '/news', label: t('news', language) },
                  { to: '/publications', label: t('publications', language) },
                  { to: '/contact', label: t('contact', language) }
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                
                {/* Mobile Auth Button */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  {user ? (
                    <Link 
                      to="/profile" 
                      className="block w-full text-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('dashboard', language)}
                    </Link>
                  ) : (
                    <Link 
                      to="/login" 
                      className="block w-full text-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('login', language)}
                    </Link>
                  )}
                </div>
                
                {/* Mobile Theme Toggle */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                         <button
                           onClick={toggleTheme}
                           className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 font-medium py-2"
                         >
                    {isDarkMode ? (
                      <>
                        <Sun className="h-5 w-5 text-yellow-500" />
                        <span>{t('lightMode', language)}</span>
                      </>
                    ) : (
                      <>
                        <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        <span>{t('darkMode', language)}</span>
                      </>
                    )}
                  </button>
                  
                  {/* Mobile Language Toggle */}
                  <button
                    onClick={toggleLanguage}
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 font-medium py-2"
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

      <section className="relative overflow-hidden pt-32 pb-24 sm:pb-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-emerald-50/70 to-sky-50/70 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950"></div>
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.08'%3E%3Cpath d='M40 0l40 80H0z'/%3E%3C/g%3E%3Cg fill='%233b82f6' fill-opacity='0.05'%3E%3Ccircle cx='10' cy='10' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          <div className="absolute -top-24 -left-24 h-80 w-80 bg-emerald-400/20 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-24 right-10 h-96 w-96 bg-indigo-400/20 blur-3xl rounded-full"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.1fr_minmax(0,0.9fr)] gap-12 lg:gap-20 items-center">
            <div className="space-y-10">
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/70 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/60 shadow-lg shadow-emerald-500/10 backdrop-blur">
                <Sparkles className="w-4 h-4 text-emerald-500 mr-2" />
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.28em] text-slate-600 dark:text-slate-200">{t('affiliatedToCestrar', language)}</span>
              </div>

              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05]">
                  <span className="bg-gradient-to-r from-slate-900 via-emerald-600 to-indigo-700 bg-clip-text text-transparent dark:from-white dark:via-emerald-300 dark:to-sky-400">
                    {t('heroTitle', language)}
                  </span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl">
                  {t('heroSubtitle', language)}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center rounded-3xl px-8 py-4 text-sm font-semibold uppercase tracking-wide text-white bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-500 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:from-emerald-500 hover:via-sky-600 hover:to-indigo-600 transition-all duration-200"
                >
                  {t('becomeMember', language)}
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/salons"
                  className="group inline-flex items-center justify-center rounded-3xl px-8 py-4 text-sm font-semibold uppercase tracking-wide border border-emerald-300 bg-white/70 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-transparent transition-all duration-200 shadow-md shadow-emerald-500/15"
                >
                  {t('bookAppointment', language)}
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="flex flex-wrap gap-4 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-300">
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/60 shadow-sm">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span>{t('membersCount', language)}</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/60 shadow-sm">
                  <Shield className="h-5 w-5 text-sky-500" />
                  <span>{t('trustedUnion', language)}</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/60 shadow-sm">
                  <Award className="h-5 w-5 text-indigo-500" />
                  <span>{t('yearsCount', language)}</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400/40 to-sky-400/50 blur-2xl"></div>
              <div className="absolute -bottom-16 -left-8 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-400/30 to-purple-400/40 blur-3xl"></div>

              <div className="relative rounded-[2.5rem] border border-white/60 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.65)] backdrop-blur-xl p-6 sm:p-8">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
                  <img
                    src="/images/home.jpeg"
                    alt="HAWU Members at Graduation Ceremony"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/0 via-slate-900/30 to-slate-900/70"></div>

                  <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/90 dark:bg-slate-900/85 px-5 py-4 shadow-lg shadow-emerald-500/10">
                    <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-1">{t('graduationCeremony', language)}</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{t('hawumembersAchievement', language)}</p>
                  </div>

                  <div className="absolute top-6 right-6 flex flex-col gap-3">
                    <div className="rounded-2xl bg-white/90 dark:bg-slate-900/85 px-4 py-2 text-xs font-semibold text-emerald-500 shadow-md shadow-emerald-500/20">{t('membersCountShort', language)}</div>
                    <div className="rounded-2xl bg-white/90 dark:bg-slate-900/85 px-4 py-2 text-xs font-semibold text-sky-500 shadow-md shadow-sky-500/20">{t('districtsCount', language)}</div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 shadow-lg shadow-amber-400/40">
                <Star className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -bottom-6 -left-5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-rose-400 to-pink-500 shadow-lg shadow-rose-400/40">
                <Heart className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/90 to-emerald-50/80 dark:from-slate-950 dark:via-slate-900/90 dark:to-slate-950"></div>
          <div className="absolute -top-24 left-16 h-64 w-64 bg-emerald-400/15 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 right-0 h-72 w-72 bg-sky-400/10 blur-3xl rounded-full"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.05fr_minmax(0,0.95fr)] gap-16 items-center">
            <div className="space-y-10">
              <div className="space-y-6 max-w-2xl">
                <span className="inline-flex items-center justify-start px-6 py-2 rounded-full bg-white/70 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/60 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-500 shadow-sm">
                  {t('aboutHawu', language)}
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white">
                  {t('whoWeAre', language)}
                </h2>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
                  {t('whoWeAreDesc', language)}
                </p>
              </div>

              <div className="grid gap-6">
                <div className="group relative overflow-hidden rounded-[2rem] border border-white/60 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 p-8 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.85)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-2">
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-400 via-sky-500 to-indigo-500"></div>
                  <div className="relative flex gap-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-sky-500 to-indigo-500 text-white shadow-lg shadow-emerald-500/30">
                      <Target className="h-8 w-8" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                        {t('ourVisionHome', language)}
                      </h3>
                      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                        {t('ourVisionDescHome', language)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-[2rem] border border-white/60 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 p-8 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.85)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-2">
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-rose-400 via-pink-500 to-purple-500"></div>
                  <div className="relative flex gap-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 via-pink-500 to-purple-500 text-white shadow-lg shadow-rose-400/30">
                      <Heart className="h-8 w-8" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                        {t('ourMissionHome', language)}
                      </h3>
                      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                        {t('ourMissionDescHome', language)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-16 -right-10 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400/40 to-sky-400/40 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-gradient-to-br from-indigo-400/30 to-purple-400/40 blur-3xl"></div>

              <div className="relative rounded-[2.75rem] border border-white/60 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 p-6 sm:p-8 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.85)] backdrop-blur-xl">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
                  <img
                    src="/images/who.jpeg"
                    alt="HAWU Training and Professional Development"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-900/80"></div>

                  <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/90 dark:bg-slate-900/85 px-5 py-4 shadow-lg shadow-emerald-500/10">
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-500 mb-1">
                      {t('trainingGraduation', language)}
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {t('professionalDevelopment', language)}
                    </p>
                  </div>

                  <div className="absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 shadow-lg shadow-amber-400/40">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute bottom-6 left-6 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-rose-400 to-pink-500 shadow-lg shadow-rose-400/40">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/80 to-emerald-50/80 dark:from-slate-950 dark:via-slate-900/90 dark:to-slate-950"></div>
          <div className="absolute -top-24 right-16 h-64 w-64 bg-blue-400/15 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 h-72 w-72 bg-emerald-400/10 blur-3xl rounded-full"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-xs font-semibold uppercase tracking-[0.32em] text-white shadow-sm">
              {t('ourProgrammesLabel', language)}
            </span>
            <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white">
              {t('empoweringOurMembers', language)}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
              {t('empoweringOurMembersDesc', language)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="group relative overflow-hidden rounded-[2rem] border border-white/60 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 p-8 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.85)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-2">
              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-500/30 flex-shrink-0">
                  <span className="text-2xl">🎓</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {t('skillsDevelopment', language)}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {t('skillsDevelopmentDesc', language)}
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[2rem] border border-white/60 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 p-8 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.85)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-2">
              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 dark:bg-slate-700 text-white shadow-lg shadow-slate-800/30 flex-shrink-0">
                  <Megaphone className="h-6 w-6" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {t('advocacyRepresentation', language)}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {t('advocacyRepresentationDesc', language)}
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[2rem] border border-white/60 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 p-8 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.85)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-2">
              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg shadow-purple-500/30 flex-shrink-0">
                  <Handshake className="h-6 w-6" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {t('collectiveBargaining', language)}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {t('collectiveBarganiningDesc', language)}
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[2rem] border border-white/60 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 p-8 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.85)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-2">
              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg shadow-red-500/30 flex-shrink-0">
                  <Heart className="h-6 w-6" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {t('memberWelfare', language)}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {t('memberWelfareDesc', language)}
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[2rem] border border-white/60 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 p-8 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.85)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-2">
              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30 flex-shrink-0">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {t('businessSupport', language)}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {t('businessSupportDesc', language)}
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[2rem] border border-white/60 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 p-8 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.85)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-2">
              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/30 flex-shrink-0">
                  <Scale className="h-6 w-6" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {t('genderEquality', language)}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {t('genderEqualityDesc', language)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/80 to-slate-50/70 dark:from-slate-950 dark:via-slate-900/90 dark:to-slate-950"></div>
          <div className="absolute inset-y-0 left-0 w-[60%] bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_70%)]"></div>
          <div className="absolute inset-y-0 right-0 w-[60%] bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_70%)]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-white/70 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/60 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-500 shadow-sm">
              {t('partnerships', language)}
            </span>
            <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white">
              {t('strategicPartnerships', language)}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
              {t('partnershipsDesc', language)}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-[2rem] border border-white/60 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/75 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.8)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-2"
              >
                <div className="relative flex flex-col items-center text-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-lg shadow-emerald-500/20 p-4">
                    <img
                      src={partner.logo}
                      alt={`${partner.name} logo`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                      {partner.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {partner.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/80 to-indigo-50/70 dark:from-slate-950 dark:via-slate-900/90 dark:to-slate-950"></div>
          <div className="absolute inset-y-0 left-1/2 w-[120%] -translate-x-1/2 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_60%)]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-white/70 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/60 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-500 shadow-sm">
              {t('latestNews', language)}
            </span>
            <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white">
              {t('stayUpdated', language)}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
              {t('latestNewsDesc', language)}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {updates.map((update, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-[2rem] border border-white/60 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/75 shadow-[0_40px_100px_-65px_rgba(15,23,42,0.95)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-2"
              >
                <div className="relative">
                  <div className="aspect-video overflow-hidden rounded-t-[2rem]">
                    <img
                      src={update.image}
                      alt={update.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/10 to-slate-900/60"></div>
                    <div className="absolute top-6 left-6 flex items-center gap-3">
                      <span className="rounded-full bg-white/90 dark:bg-slate-900/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-700 dark:text-slate-200 shadow-md">
                        {update.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="relative p-6">
                  <div className="flex items-center text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
                    <Calendar className="mr-2 h-4 w-4 text-emerald-400" />
                    {update.date}
                  </div>
                  <h3 className="mt-4 text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
                    {update.title}
                  </h3>
                  <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    {update.description}
                  </p>
                  <Link
                    to={`/news/${index}`}
                    className="mt-6 inline-flex items-center text-emerald-500 font-semibold text-sm sm:text-base transition-colors duration-200 hover:text-emerald-400"
                  >
                    {t('readMore', language)}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/publications"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-500 px-8 py-4 text-sm font-semibold uppercase tracking-[0.28em] text-white shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:shadow-xl hover:from-emerald-500 hover:via-sky-600 hover:to-indigo-600"
            >
              {t('viewAllNews', language)}
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-600"></div>
          <div className="absolute inset-y-0 left-1/2 w-[120%] -translate-x-1/2 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_60%)]"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="inline-flex items-center justify-center rounded-full bg-white/15 px-6 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white shadow-sm">
            <Sparkles className="mr-3 h-4 w-4" />
            {t('joinUs', language)}
          </div>
          <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-bold">
            {t('readyToJoin', language)}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/90 max-w-3xl mx-auto">
            {t('readyToJoinDesc', language)}
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600 shadow-lg shadow-white/25 transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
            >
              {t('becomeMember', language)}
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="group inline-flex items-center justify-center rounded-full border border-white/80 px-8 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-white transition-all duration-200 hover:bg-white/15"
            >
              {t('contactUs', language)}
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
      {/* Member Stories / Testimonials Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/70 to-sky-50/70 dark:from-slate-950 dark:via-slate-900/90 dark:to-slate-950"></div>
          <div className="absolute inset-y-0 left-1/2 w-[120%] -translate-x-1/2 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.16),_transparent_60%)]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-white/70 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/60 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-500 shadow-sm">
              {t('memberStories', language)}
            </span>
            <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white">
              {t('whatOurMembersSay', language)}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
              {t('whatOurMembersSayDesc', language)}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-[2.25rem] border border-white/60 dark:border-slate-800/70 bg-white/85 dark:bg-slate-900/80 p-8 shadow-[0_40px_100px_-65px_rgba(15,23,42,0.9)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="absolute inset-x-8 -top-24 h-40 bg-gradient-to-br from-emerald-400/20 via-sky-400/15 to-indigo-400/0 blur-3xl"></div>
                <div className="relative flex items-center gap-4">
                  <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-sky-500 to-indigo-500 text-white shadow-lg shadow-emerald-500/30">
                    <testimonial.icon className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {testimonial.name}
                    </h3>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-500">
                      {testimonial.role}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {testimonial.location}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  {[...Array(testimonial.rating)].map((_, starIndex) => (
                    <Star key={starIndex} className="h-5 w-5 text-amber-400 fill-current" />
                  ))}
                </div>

                <p className="mt-6 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  “{testimonial.content}”
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50">
        <div className="flex flex-col space-y-3 sm:space-y-4">
          {/* Scroll to Top Button */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
            title="Scroll to Top"
          >
            <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 transform rotate-[-90deg] group-hover:rotate-[-90deg] group-hover:translate-y-[-2px] transition-transform" />
          </button>

          {/* Quick Contact Button */}
          <button
            onClick={() => window.open('tel:+250788224343', '_self')}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group animate-pulse"
            title="Call Us"
          >
            <Phone className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Loading Animation */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center z-50 opacity-0 pointer-events-none transition-opacity duration-500" id="loading-screen">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Scissors className="h-10 w-10 text-white" />
          </div>
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">{t('loadingHawu', language)}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;

