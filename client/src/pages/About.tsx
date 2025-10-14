import React from 'react';
import { Users, Target, Heart, Award, CheckCircle, Globe, Shield, Zap } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import { useTranslationStore, t } from '../stores/translationStore';
import Navbar from '../components/Navbar';

const About: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const { language } = useTranslationStore();
  const stats = [
    { number: '8000+', label: t('activeMembers', language), icon: Users, color: 'text-blue-600' },
    { number: '30', label: t('districtsCovered', language), icon: Globe, color: 'text-green-600' },
    { number: '7+', label: t('yearsOfService', language), icon: Award, color: 'text-purple-600' },
    { number: '50+', label: t('trainingPrograms', language), icon: Zap, color: 'text-orange-600' }
  ];

  const values = [
    {
      title: 'Unity',
      description: 'We believe in the power of collective action and solidarity among hairdressers and allied workers.',
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Excellence',
      description: 'We strive for excellence in all our training programs and professional development initiatives.',
      icon: Award,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Integrity',
      description: 'We maintain the highest standards of honesty, transparency, and ethical conduct.',
      icon: Shield,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Innovation',
      description: 'We embrace new technologies and modern techniques to improve our services.',
      icon: Zap,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const achievements = [
    'Successfully negotiated better working conditions for 5000+ members',
    'Launched comprehensive training programs in 15 districts',
    'Established partnerships with 20+ government institutions',
    'Provided health insurance coverage for 3000+ members',
    'Organized 100+ professional development workshops',
    'Advocated for policy changes benefiting the beauty industry'
  ];

  const leadership = [
    {
      name: 'Jean Baptiste Nkurunziza',
      position: 'President',
      image: '👨‍💼',
      description: 'Leading HAWU with 10+ years of experience in labor advocacy and union management.'
    },
    {
      name: 'Marie Claire Mukamana',
      position: 'Vice President',
      image: '👩‍💼',
      description: 'Expert in women\'s rights and gender equality in the workplace.'
    },
    {
      name: 'Paul Nsengimana',
      position: 'Secretary General',
      image: '👨‍💼',
      description: 'Specialized in organizational development and member relations.'
    },
    {
      name: 'Grace Uwimana',
      position: 'Treasurer',
      image: '👩‍💼',
      description: 'Financial management expert with extensive experience in union finances.'
    }
  ];

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              {t('aboutHawu', language)}
            </h1>
            <p className="text-lg sm:text-xl text-emerald-100 max-w-3xl mx-auto">
              {t('aboutHawuDesc', language)}
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Mission */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {t('ourMission', language)}
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                {t('ourMissionDesc', language)}
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {t('ourVision', language)}
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                {t('ourVisionDesc', language)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="py-16 sm:py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Building a stronger community through dedicated service and continuous growth
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className={`w-12 h-12 bg-gradient-to-r ${value.color} rounded-xl flex items-center justify-center mb-4`}>
                  <value.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="py-16 sm:py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Our Achievements
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Milestones that demonstrate our commitment to our members
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 dark:text-gray-300">
                  {achievement}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leadership Team */}
      <div className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Leadership Team
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Meet the dedicated leaders driving HAWU's mission forward
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {leadership.map((leader, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  {leader.image}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {leader.name}
                </h3>
                <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-3">
                  {leader.position}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {leader.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 sm:py-20 bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Join Our Mission
          </h2>
          <p className="text-lg sm:text-xl text-emerald-100 mb-8 max-w-3xl mx-auto">
            Be part of Rwanda's largest community of hairdressers and allied workers. 
            Together, we can build a stronger, more prosperous future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-emerald-600 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Become a Member
            </button>
            <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-emerald-600 transition-all duration-300 transform hover:scale-105">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;