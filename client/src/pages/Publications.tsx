import React, { useState } from 'react';
import { Download, Calendar, FileText, Search, Filter, Eye } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import { useTranslationStore } from '../stores/translationStore';
import Navbar from '../components/Navbar';

const Publications: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { isDarkMode } = useThemeStore();
  const { language, t } = useTranslationStore();

  const publications = [
    {
      id: 1,
      titleKey: 'hawuAnnualReport',
      descriptionKey: 'hawuAnnualReportDesc',
      category: 'annual-report',
      date: 'January 15, 2024',
      fileSize: '2.5 MB',
      downloads: 1250,
      image: '/images/image0.jpeg',
      fileUrl: '/documents/hawu-annual-report-2023.pdf'
    },
    {
      id: 2,
      titleKey: 'trainingManualHairDressers',
      descriptionKey: 'trainingManualHairDressersDesc',
      category: 'training',
      date: 'December 10, 2023',
      fileSize: '5.2 MB',
      downloads: 890,
      image: '/images/image1.jpeg',
      fileUrl: '/documents/training-manual-hairdressers.pdf'
    },
    {
      id: 3,
      titleKey: 'memberBenefitsGuide',
      descriptionKey: 'memberBenefitsGuideDesc',
      category: 'guide',
      date: 'November 20, 2023',
      fileSize: '1.8 MB',
      downloads: 2100,
      image: '/images/image2.jpeg',
      fileUrl: '/documents/member-benefits-guide.pdf'
    },
    {
      id: 4,
      titleKey: 'industryStandardsGuidelines',
      descriptionKey: 'industryStandardsGuidelinesDesc',
      category: 'standards',
      date: 'October 5, 2023',
      fileSize: '3.1 MB',
      downloads: 750,
      image: '/images/image3.jpeg',
      fileUrl: '/documents/industry-standards-guidelines.pdf'
    },
    {
      id: 5,
      titleKey: 'businessDevelopmentToolkit',
      descriptionKey: 'businessDevelopmentToolkitDesc',
      category: 'business',
      date: 'September 18, 2023',
      fileSize: '4.7 MB',
      downloads: 680,
      image: '/images/image4.jpeg',
      fileUrl: '/documents/business-development-toolkit.pdf'
    },
    {
      id: 6,
      titleKey: 'healthSafetyProtocols',
      descriptionKey: 'healthSafetyProtocolsDesc',
      category: 'safety',
      date: 'August 12, 2023',
      fileSize: '2.2 MB',
      downloads: 950,
      image: '/images/image5.jpeg',
      fileUrl: '/documents/health-safety-protocols.pdf'
    }
  ];

  const filteredPublications = publications.filter(pub => {
    const matchesFilter = filter === 'all' || pub.category === filter;
    const title = t(pub.titleKey, language).toLowerCase();
    const description = t(pub.descriptionKey, language).toLowerCase();
    const matchesSearch = title.includes(searchTerm.toLowerCase()) ||
                         description.includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'annual-report': return 'from-blue-500 to-blue-600';
      case 'training': return 'from-green-500 to-green-600';
      case 'guide': return 'from-purple-500 to-purple-600';
      case 'standards': return 'from-orange-500 to-orange-600';
      case 'business': return 'from-pink-500 to-pink-600';
      case 'safety': return 'from-teal-500 to-teal-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'annual-report': return t('annualReports', language);
      case 'training': return t('trainingMaterials', language);
      case 'guide': return t('guides', language);
      case 'standards': return t('standards', language);
      case 'business': return t('business', language);
      case 'safety': return t('safety', language);
      default: return 'Publication';
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar />
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              {t('publicationsTitle', language)}
            </h1>
            <p className="text-lg sm:text-xl text-emerald-100 max-w-3xl mx-auto">
              {t('publicationsDesc', language)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={t('searchPublications', language)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', translationKey: 'allPublications' },
                { key: 'annual-report', translationKey: 'annualReports' },
                { key: 'training', translationKey: 'trainingMaterials' },
                { key: 'guide', translationKey: 'guides' },
                { key: 'standards', translationKey: 'standards' },
                { key: 'business', translationKey: 'business' },
                { key: 'safety', translationKey: 'safety' }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === filterOption.key
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {t(filterOption.translationKey, language)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Publications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredPublications.map((publication) => (
            <div key={publication.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              {/* Publication Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={publication.image} 
                  alt={t(publication.titleKey, language)}
                  className="w-full h-full object-cover"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${getCategoryColor(publication.category)}`}>
                  {getCategoryLabel(publication.category)}
                </div>
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                  {publication.fileSize}
                </div>
              </div>

              {/* Publication Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                  {t(publication.titleKey, language)}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-sm">
                  {t(publication.descriptionKey, language)}
                </p>

                {/* Publication Details */}
                <div className="space-y-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {publication.date}
                  </div>
                  <div className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    {publication.downloads} {t('downloads', language)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center">
                    <Download className="h-4 w-4 mr-2" />
                    {t('download', language)}
                  </button>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" title={t('view', language)}>
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredPublications.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <FileText className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('noPublicationsFound', language)}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('noPublicationsFoundDesc', language)}
            </p>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="py-16 sm:py-20 bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t('needMoreResources', language)}
          </h2>
          <p className="text-lg sm:text-xl text-emerald-100 mb-8 max-w-3xl mx-auto">
            {t('needMoreResourcesDesc', language)}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-emerald-600 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
              {t('requestResource', language)}
            </button>
            <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-emerald-600 transition-all duration-300 transform hover:scale-105">
              {t('contactSupport', language)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Publications;
