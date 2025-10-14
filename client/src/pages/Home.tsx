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
  Users,
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
  Zap,
  Globe,
  CheckCircle,
  Sparkles
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
      category: 'event',
      date: 'March 15, 2024',
      title: t('annualGeneralMeeting', language),
      description: t('annualGeneralMeetingDesc', language),
      image: '/images/new1.jpeg',
      color: 'from-blue-500 to-purple-600'
    },
    {
      category: 'news',
      date: 'February 28, 2024',
      title: t('trainingGraduationParty', language),
      description: t('trainingGraduationPartyDesc', language),
      image: '/images/image0.jpeg',
      color: 'from-green-500 to-teal-600'
    },
    {
      category: 'certification',
      date: 'February 10, 2024',
      title: t('certificationProgramLaunch', language),
      description: t('certificationProgramLaunchDesc', language),
      image: '/images/image1.jpeg',
      color: 'from-orange-500 to-red-600'
    }
  ];

  const stats = [
    { number: '8000+', label: t('activeMembers', language), icon: Users, color: 'text-blue-600' },
    { number: '30', label: t('districtsCovered', language), icon: Globe, color: 'text-green-600' },
    { number: '7+', label: t('yearsOfService', language), icon: Award, color: 'text-purple-600' }
  ];

  const programs = [
    {
      title: t('skillsDevelopment', language),
      description: t('skillsDevelopmentDesc', language),
      icon: GraduationCap,
      color: 'from-emerald-500 to-teal-600',
      features: [t('modernTechniques', language), t('businessManagement', language), t('customerService', language)]
    },
    {
      title: t('advocacyRepresentation', language),
      description: t('advocacyRepresentationDesc', language),
      icon: Megaphone,
      color: 'from-blue-500 to-indigo-600',
      features: [t('policyMaking', language), t('governmentRelations', language), t('industryNegotiations', language)]
    },
    {
      title: t('collectiveBargaining', language),
      description: t('collectiveBargainingDesc', language),
      icon: Handshake,
      color: 'from-purple-500 to-pink-600',
      features: [t('fairWages', language), t('betterConditions', language), t('memberBenefits', language)]
    },
    {
      title: t('memberWelfare', language),
      description: t('memberWelfareDesc', language),
      icon: Heart,
      color: 'from-red-500 to-rose-600',
      features: [t('healthInsurance', language), t('emergencySupport', language), t('socialWelfare', language)]
    },
    {
      title: t('businessSupport', language),
      description: t('businessSupportDesc', language),
      icon: Briefcase,
      color: 'from-orange-500 to-amber-600',
      features: [t('salonManagement', language), t('licensingHelp', language), t('businessDevelopment', language)]
    },
    {
      title: t('genderEquality', language),
      description: t('genderEqualityDesc', language),
      icon: Scale,
      color: 'from-cyan-500 to-blue-600',
      features: [t('equalOpportunities', language), t('antiDiscrimination', language), t('workplaceRights', language)]
    }
  ];

  const testimonials = [
    {
      name: 'Marie Mukamana',
      role: t('salonOwner', language),
      location: 'Kigali',
      content: 'HAWU has transformed my business. The training programs and support have helped me grow from a small salon to a thriving business with 5 employees.',
      rating: 5,
      image: '👩‍💼'
    },
    {
      name: 'Jean Baptiste',
      role: t('professionalBarber', language),
      location: 'Huye',
      content: 'The union has been my voice in advocating for better working conditions. Thanks to HAWU, I now have health insurance and fair wages.',
      rating: 5,
      image: '👨‍💼'
    },
    {
      name: 'Grace Uwimana',
      role: t('beautyTherapist', language),
      location: 'Musanze',
      content: 'Being part of HAWU has opened so many opportunities. The networking events and training sessions have been invaluable for my career growth.',
      rating: 5,
      image: '👩‍🎨'
    }
  ];

  const features = [
    {
      title: t('digitalPlatform', language),
      description: t('digitalPlatformDesc', language),
      icon: Globe,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: t('mobileApp', language),
      description: t('mobileAppDesc', language),
      icon: '📱',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: t('support247', language),
      description: t('support247Desc', language),
      icon: '🛡️',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: t('trainingHub', language),
      description: t('trainingHubDesc', language),
      icon: '🎓',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 transform origin-left transition-transform duration-300" 
           style={{ transform: `scaleX(${Math.min(scrollY / (document.documentElement.scrollHeight - window.innerHeight), 1)})` }}>
      </div>

      {/* Dynamic Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrollY > 50 
          ? 'bg-white dark:bg-gray-800/95 backdrop-blur-md shadow-lg border-b border-gray-200/50' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
                   {/* Logo */}
                   <Link to="/" className="flex items-center space-x-3 group">
                     <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg overflow-hidden">
                       <img 
                         src="/images/logo.png" 
                         alt="HAWU Logo" 
                         className="w-full h-full object-contain"
                         onError={(e) => {
                           e.currentTarget.style.display = 'none';
                           (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                         }}
                       />
                       <Scissors className="h-6 w-6 text-white hidden" />
                     </div>
                     <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                       HAWU
                     </span>
                   </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-8">
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

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e0f2fe' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full opacity-20 animate-bounce delay-1000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8 animate-fade-in-up">
              {/* Badge */}
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-800 rounded-full text-sm font-semibold shadow-lg transform hover:scale-105 transition-all duration-300">
                <Sparkles className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                Affiliated to CESTRAR
              </div>
              
              {/* Main Headline */}
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    {t('heroTitle', language)}
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                  {t('heroSubtitle', language)}
                </p>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-full hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {t('becomeMember', language)}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/booking"
                  className="group inline-flex items-center justify-center px-8 py-4 border-2 border-emerald-500 text-emerald-600 font-semibold rounded-full hover:bg-emerald-500 hover:text-white transition-all duration-300 transform hover:scale-105"
                >
                  {t('bookAppointment', language)}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">8000+ Members</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t('trustedUnion', language)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">7+ Years</span>
                </div>
              </div>
            </div>
            
            {/* Right Column - Hero Image */}
            <div className="relative animate-fade-in-right">
              <div className="relative">
                {/* Main Hero Image */}
                <div className="relative bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-4 sm:p-8 shadow-2xl border border-white/20 dark:border-gray-700/20 transform hover:scale-105 transition-all duration-500">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
                    <img 
                      src="/images/home.jpeg" 
                      alt="HAWU Members at Graduation Ceremony" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    
                    {/* Overlay Content */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-lg sm:text-xl font-semibold mb-1">{t('graduationCeremony', language)}</h3>
                      <p className="text-sm opacity-90">{t('hawumembersAchievement', language)}</p>
                    </div>

                    {/* Floating Stats */}
                    <div className="absolute top-4 right-4 bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                      <span className="text-sm font-semibold text-emerald-600">8000+</span>
                    </div>
                    <div className="absolute top-4 left-4 bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                      <span className="text-sm font-semibold text-blue-600">30 Districts</span>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce delay-500">
                  <Star className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

             {/* Statistics Section */}
             <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.3'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20s-20-8.954-20-20 8.954-20 20-20 20 8.954 20 20z'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center mb-16">
                   <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-4">{t('statsTitle', language)}</h2>
                   <p className="text-xl text-gray-600 dark:text-gray-300 dark:text-gray-300 max-w-3xl mx-auto">
                     {t('statsSubtitle', language)}
                   </p>
                 </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="group text-center p-8 bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20 dark:border-gray-700/20">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
                <div className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
            </div>
                <div className="text-lg text-gray-600 dark:text-gray-300 dark:text-gray-300 font-medium">{stat.label}</div>
            </div>
            ))}
          </div>
        </div>
      </section>

             {/* Who We Are Section */}
             <section className="py-20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-gray-700/50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900 dark:to-blue-900 text-emerald-800 dark:text-emerald-200 rounded-full text-sm font-semibold mb-6 shadow-lg">
              <Sparkles className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
              About HAWU
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-6">
              {t('whoWeAre', language)}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 dark:text-gray-300 max-w-3xl mx-auto">
              {t('whoWeAreDesc', language)}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Vision and Mission */}
            <div className="space-y-12">
              {/* Vision */}
              <div className="group flex gap-6 p-6 bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-4">{t('ourVisionHome', language)}</h3>
                  <p className="text-gray-600 dark:text-gray-300 dark:text-gray-300 leading-relaxed">
                    {t('ourVisionDescHome', language)}
                  </p>
                </div>
              </div>

              {/* Mission */}
              <div className="group flex gap-6 p-6 bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-4">{t('ourMissionHome', language)}</h3>
                  <p className="text-gray-600 dark:text-gray-300 dark:text-gray-300 leading-relaxed">
                    {t('ourMissionDescHome', language)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - About Image */}
            <div className="relative">
              <div className="relative bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-4 sm:p-8 shadow-2xl border border-white/20 dark:border-gray-700/20 transform hover:scale-105 transition-all duration-500">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
                  <img 
                    src="/images/who.jpeg" 
                    alt="HAWU Training and Professional Development" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  
                  {/* Overlay Content */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-lg sm:text-xl font-semibold mb-1">{t('trainingGraduation', language)}</h3>
                    <p className="text-sm opacity-90">{t('professionalDevelopment', language)}</p>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute top-4 right-4 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce delay-300">
                    <Award className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Programs Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e0f2fe' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900 dark:to-blue-900 text-emerald-800 dark:text-emerald-200 rounded-full text-sm font-semibold mb-6 shadow-lg">
              <Zap className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
{t('ourPrograms', language)}
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {t('comprehensivePrograms', language)}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              {t('comprehensiveProgramsDesc', language)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <div key={index} className="group bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-white/20 dark:border-gray-700/20 transform hover:scale-105 hover:-translate-y-2">
                <div className={`w-16 h-16 bg-gradient-to-r ${program.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <program.icon className="h-8 w-8 text-white" />
              </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-emerald-600 transition-colors">
                  {program.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  {program.description}
                </p>
                
                {/* Features */}
                <div className="space-y-2">
                  {program.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0" />
                      {feature}
              </div>
                  ))}
            </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-blue-50/30 dark:from-gray-800/30 dark:to-gray-700/30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900 dark:to-blue-900 text-emerald-800 dark:text-emerald-200 rounded-full text-sm font-semibold mb-6 shadow-lg">
              <Star className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
              {t('memberStories', language)}
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {t('whatOurMembersSay', language)}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('whatOurMembersSayDesc', language)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-white/20 dark:border-gray-700/20 transform hover:scale-105 hover:-translate-y-2">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-2xl mr-4">
                    {testimonial.image}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{testimonial.role}</p>
                    <p className="text-xs text-emerald-600">{testimonial.location}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e0f2fe' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900 dark:to-blue-900 text-emerald-800 dark:text-emerald-200 rounded-full text-sm font-semibold mb-6 shadow-lg">
              <Zap className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
              {t('modernFeatures', language)}
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {t('whyChooseHawu', language)}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('whyChooseHawuDesc', language)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group text-center p-8 bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-white/20 dark:border-gray-700/20">
                <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {typeof feature.icon === 'string' ? (
                    <span className="text-3xl">{feature.icon}</span>
                  ) : (
                    <feature.icon className="h-10 w-10 text-white" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-emerald-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Partnerships Section */}
      <section className="py-20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-blue-50/30 dark:from-gray-800/30 dark:to-gray-700/30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900 dark:to-blue-900 text-emerald-800 dark:text-emerald-200 rounded-full text-sm font-semibold mb-6 shadow-lg">
              <Handshake className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
              Partnerships
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Strategic Partnerships
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Working together with key organizations to strengthen our impact and reach
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 sm:gap-8">
            {partners.map((partner, index) => (
              <div key={index} className="group">
                <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 text-center border border-white/20 dark:border-gray-700/20 transform hover:scale-105 hover:-translate-y-2">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg p-2">
                    <img 
                      src={partner.logo} 
                      alt={`${partner.name} logo`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-emerald-600 transition-colors">
                    {partner.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {partner.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e0f2fe' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900 dark:to-blue-900 text-emerald-800 dark:text-emerald-200 rounded-full text-sm font-semibold mb-6 shadow-lg">
              <TrendingUp className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
              Latest News
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Stay Updated
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Latest news, events, and updates from the Hair Dressers and Allied Works Union
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {updates.map((update, index) => (
              <div key={index} className="group">
                <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 dark:border-gray-700/20 transform hover:scale-105 hover:-translate-y-2">
                  <div className="relative">
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={update.image} 
                        alt={update.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white dark:bg-gray-800/90 backdrop-blur-sm text-gray-800 text-xs font-medium rounded-full shadow-lg">
                          {update.category}
                        </span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 bg-white dark:bg-gray-800/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Play className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-3">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      {update.date}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-emerald-600 transition-colors">
                      {update.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                      {update.description}
                    </p>
                    <Link
                      to={`/news/${index}`}
                      className="inline-flex items-center text-emerald-600 font-medium hover:text-emerald-700 transition-colors group text-sm sm:text-base"
                    >
                      Read More
                      <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/news"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-full hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              View All News
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-blue-50/30 dark:from-gray-800/30 dark:to-gray-700/30"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-800 rounded-full text-sm font-semibold mb-6 shadow-lg">
            <Mail className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
{t('stayConnected', language)}
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {t('joinOurCommunity', language)}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            {t('joinOurCommunityDesc', language)}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder={t('enterEmailAddress', language)}
              className="flex-1 px-6 py-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500"
            />
            <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-full hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
{t('subscribe', language)}
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
{t('privacyNotice', language)}
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-700 dark:from-emerald-600 dark:via-blue-600 dark:to-purple-700"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 dark:bg-gray-800/10 rounded-full animate-bounce"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-white/20 dark:bg-gray-800/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-white/20 dark:bg-gray-800/10 rounded-full animate-bounce delay-1000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            {t('joinUs', language)}
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold mb-6 text-white">
            {t('readyToJoin', language)}
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto">
            {t('readyToJoinDesc', language)}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="group inline-flex items-center px-8 py-4 bg-white text-emerald-600 dark:text-emerald-600 font-semibold rounded-full hover:bg-gray-100 dark:hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {t('becomeMember', language)}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/contact"
              className="group inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-emerald-600 transition-all duration-300 transform hover:scale-105"
            >
              {t('contactUs', language)}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
      {/* Footer Section */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* HAWU Info */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Scissors className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">HAWU</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Empowering hair dressers and allied workers across Rwanda through advocacy, training, and collective representation.
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: Facebook, href: "#" },
                  { icon: Twitter, href: "#" },
                  { icon: Instagram, href: "#" },
                  { icon: Youtube, href: "#" }
                ].map((social, index) => (
                  <a key={index} href={social.href} className="w-10 h-10 bg-white dark:bg-gray-800/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-emerald-500 transition-all duration-300 transform hover:scale-110">
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">{t('quickLinks', language)}</h3>
              <ul className="space-y-3">
                {[
                  { to: "/about", label: t('about', language) },
                  { to: "/programs", label: t('programs', language) },
                  { to: "/news", label: t('newsEvents', language) },
                  { to: "/contact", label: t('contact', language) }
                ].map((link, index) => (
                  <li key={index}>
                    <Link to={link.to} className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 flex items-center group">
                      <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">{t('resources', language)}</h3>
              <ul className="space-y-3">
                {[
                  { to: "/publications", label: t('publications', language) },
                  { to: "/training", label: t('trainingMaterials', language) },
                  { to: "/guidelines", label: t('guidelines', language) },
                  { to: "/forms", label: t('forms', language) }
                ].map((link, index) => (
                  <li key={index}>
                    <Link to={link.to} className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 flex items-center group">
                      <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">{t('connect', language)}</h3>
            <div className="space-y-4">
                {[
                  { icon: Mail, text: "info@hawurwanda.com", href: "mailto:info@hawurwanda.com" },
                  { icon: Phone, text: "+250 788 224 343", href: "tel:+250788224343" },
                  { icon: Phone, text: "+250 788 462 363", href: "tel:+250788462363" },
                  { icon: MapPin, text: "Kigali, Rwanda", href: null }
                ].map((contact, index) => (
                  <div key={index} className="flex items-center space-x-3 group">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center group-hover:bg-emerald-500 transition-colors duration-200">
                      <contact.icon className="h-4 w-4 text-emerald-400" />
                </div>
                    {contact.href ? (
                      <a href={contact.href} className="text-gray-300 hover:text-emerald-400 transition-colors duration-200">
                        {contact.text}
                      </a>
                    ) : (
                      <span className="text-gray-300">{contact.text}</span>
                    )}
                </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 HAWU Rwanda. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link to="/privacy" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors duration-200">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors duration-200">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

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
