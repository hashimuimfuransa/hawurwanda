import React, { useEffect } from 'react';
import { Users, Target, Heart, Award, Shield, Zap, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../stores/themeStore';
import { useTranslationStore } from '../stores/translationStore';
import Navbar from '../components/Navbar';

const About: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const { language, t } = useTranslationStore();

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

    const sections = document.querySelectorAll('section');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);
  const stats = [
    { number: '8000+', label: t('activeMembers', language), icon: Users, color: 'from-blue-500 to-blue-600' },
    { number: '30', label: t('districtsCovered', language), icon: Shield, color: 'from-green-500 to-green-600' },
    { number: '7+', label: t('yearsOfService', language), icon: Award, color: 'from-purple-500 to-purple-600' },
    { number: '50+', label: t('trainingPrograms', language), icon: Zap, color: 'from-orange-500 to-orange-600' }
  ];

  const values = [
    {
      title: t('valueUnity', language),
      description: t('valueUnityDesc', language),
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: t('valueProfessionalism', language),
      description: t('valueProfessionalismDesc', language),
      icon: Target,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: t('valueIntegrity', language),
      description: t('valueIntegrityDesc', language),
      icon: Shield,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: t('valueInnovation', language),
      description: t('valueInnovationDesc', language),
      icon: Zap,
      color: 'from-orange-500 to-orange-600'
    }
  ];



  const objectives = [
    {
      title: t('protectMemberInterests', language),
      description: t('protectMemberInterestsDesc', language)
    },
    {
      title: t('promoteSolidarity', language),
      description: t('promoteSolidarityDesc', language)
    },
    {
      title: t('improveMembersLivelihoods', language),
      description: t('improveMembersLivelihoodsDesc', language)
    },
    {
      title: t('engageInCollectiveBargaining', language),
      description: t('engageInCollectiveBarganiningDesc2', language)
    },
    {
      title: t('advocateForGenderEquality', language),
      description: t('advocateForGenderEqualityDesc', language)
    },
    {
      title: t('professionalDevelopmentObj', language),
      description: t('professionalDevelopmentObjDesc', language)
    }
  ];

  const leadership = [
    {
      name: t('leaderNameOne', language),
      position: t('leaderPositionOne', language),
      image: '/leaders/haruna.jpeg',
      description: t('leaderDescOne', language)
    },
    {
      name: t('leaderNameTwo', language),
      position: t('leaderPositionTwo', language),
      image: '/leaders/martin.jpeg',
      description: t('leaderDescTwo', language)
    },
    {
      name: t('leaderNameThree', language),
      position: t('leaderPositionThree', language),
      image: '/leaders/jeanpaul.jpeg',
      description: t('leaderDescThree', language)
    }
  ];

  return (
    <div className={`relative min-h-screen transition-all duration-500 ${isDarkMode ? 'dark bg-slate-950' : 'bg-transparent'}`}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-24 h-96 w-96 bg-emerald-300/30 blur-3xl rounded-full"></div>
        <div className="absolute top-20 right-0 h-[28rem] w-[28rem] bg-sky-300/30 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 bg-indigo-300/20 blur-3xl rounded-full"></div>
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-sky-500 to-indigo-600"></div>
          <div className="absolute inset-y-0 left-1/2 w-[120%] -translate-x-1/2 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_60%)]"></div>
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="inline-flex items-center justify-center rounded-full bg-white/15 px-6 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white shadow-sm mb-6">
            <Sparkles className="mr-3 h-4 w-4" />
            {t('whoWeAre', language)}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            {t('aboutHawu', language)}
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto">
            {t('aboutHawuDesc', language)}
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/75 to-indigo-50/70 dark:from-slate-950 dark:via-slate-900/90 dark:to-slate-950"></div>
          <div className="absolute inset-y-0 left-1/2 w-[120%] -translate-x-1/2 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_60%)]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Mission */}
            <div className="group relative overflow-hidden rounded-[2.25rem] border border-white/60 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/75 p-8 shadow-[0_40px_100px_-70px_rgba(15,23,42,0.95)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute inset-x-8 -top-24 h-40 bg-gradient-to-br from-emerald-400/15 via-sky-400/15 to-indigo-400/0 blur-3xl"></div>
              <div className="relative">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Target className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    {t('ourMissionHome', language)}
                  </h2>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                  {t('ourMissionDescHome', language)}
                </p>
              </div>
            </div>

            {/* Vision */}
            <div className="group relative overflow-hidden rounded-[2.25rem] border border-white/60 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/75 p-8 shadow-[0_40px_100px_-70px_rgba(15,23,42,0.95)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute inset-x-8 -top-24 h-40 bg-gradient-to-br from-purple-400/15 via-pink-400/15 to-indigo-400/0 blur-3xl"></div>
              <div className="relative">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Heart className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    {t('ourVisionHome', language)}
                  </h2>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                  {t('ourVisionDescHome', language)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/70 to-indigo-50/70 dark:from-slate-950 dark:via-slate-900/90 dark:to-slate-950"></div>
          <div className="absolute inset-y-0 right-1/2 w-[120%] translate-x-1/2 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_65%)]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-white/70 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/60 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-500 shadow-sm mb-4">
              <TrendingUp className="mr-3 h-4 w-4" />
              {t('impactInNumbers', language)}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              {t('ourImpact', language)}
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              {t('ourImpactDesc', language)}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="group relative overflow-hidden rounded-[2rem] border border-white/60 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/75 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.8)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2">
                <div className="relative flex flex-col items-center text-center gap-4">
                  <div className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${stat.color} text-white shadow-lg shadow-emerald-500/25`}>
                    <stat.icon className="h-10 w-10" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                      {stat.number}
                    </div>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/80 to-slate-50/70 dark:from-slate-950 dark:via-slate-900/90 dark:to-slate-950"></div>
          <div className="absolute inset-y-0 left-0 w-[60%] bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_70%)]"></div>
          <div className="absolute inset-y-0 right-0 w-[60%] bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_70%)]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-white/70 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/60 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-500 shadow-sm mb-4">
              <Sparkles className="mr-3 h-4 w-4" />
              {t('coreValues', language)}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              {t('ourValues', language)}
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              {t('valuesDesc', language)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {values.map((value, index) => (
              <div key={index} className="group relative overflow-hidden rounded-[2rem] border border-white/60 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/75 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.8)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2">
                <div className="relative flex flex-col items-center text-center gap-4">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${value.color} text-white shadow-lg`}>
                    <value.icon className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {value.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Objectives */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/70 to-slate-50/70 dark:from-slate-950 dark:via-slate-900/90 dark:to-slate-950"></div>
          <div className="absolute inset-y-0 left-1/2 w-[120%] -translate-x-1/2 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_65%)]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-white/70 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/60 text-xs font-semibold uppercase tracking-[0.32em] text-blue-600 dark:text-blue-400 shadow-sm mb-4">
              <Target className="mr-3 h-4 w-4" />
              {t('detailedObjectives', language)}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              {t('ourDetailedObjectives', language)}
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              {t('objectivesDesc', language)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {objectives.map((objective, index) => (
              <div key={index} className="group relative overflow-hidden rounded-[2rem] border border-white/60 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/75 p-8 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.8)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2">
                <div className="relative space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {objective.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                    {objective.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/75 to-indigo-50/70 dark:from-slate-950 dark:via-slate-900/90 dark:to-slate-950"></div>
          <div className="absolute inset-y-0 left-1/2 w-[120%] -translate-x-1/2 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_60%)]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-white/70 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/60 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-500 shadow-sm mb-4">
              <Users className="mr-3 h-4 w-4" />
              {t('leadershipTeam', language)}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              {t('meetOurLeaders', language)}
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              {t('meetOurLeadersDesc', language)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {leadership.map((leader, index) => (
              <div key={index} className="group relative overflow-hidden rounded-[2rem] border border-white/60 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/75 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.8)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 text-center">
                <div className="relative flex flex-col items-center gap-4">
                  <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-4 border-white dark:border-slate-800">
                    <img src={leader.image} alt={leader.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {leader.name}
                    </h3>
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                      {leader.position}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                      {leader.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-600"></div>
          <div className="absolute inset-y-0 left-1/2 w-[120%] -translate-x-1/2 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_60%)]"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="inline-flex items-center justify-center rounded-full bg-white/15 px-6 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white shadow-sm mb-6">
            <Sparkles className="mr-3 h-4 w-4" />
            {t('joinUs', language)}
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            {t('readyToJoin', language)}
          </h2>
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto mb-12">
            {t('readyToJoinDesc', language)}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
    </div>
  );
};

export default About;