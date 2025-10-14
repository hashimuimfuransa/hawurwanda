import React from 'react';
import Navbar from '../components/Navbar';
import { useThemeStore } from '../stores/themeStore';
import { useTranslationStore } from '../stores/translationStore';
import { ArrowRight } from 'lucide-react';
import ProgramCards from '../components/ProgramCards';
import ProgramSupportHighlights from '../components/ProgramSupportHighlights';

const Programs: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const { t } = useTranslationStore();

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-blue-500 to-slate-900 py-32 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_transparent_60%)] opacity-70" />
        <div className="relative mx-auto max-w-6xl px-4">
          <span className="inline-flex items-center rounded-full bg-white/20 px-5 py-1 text-sm font-semibold backdrop-blur-sm">
            {t('programsTitle')}
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {t('programsSupportTitle')}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            {t('programsIntro')}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#programs"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-emerald-600 shadow-lg transition hover:translate-y-1 hover:bg-white/90"
            >
              {t('programsTitle')}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#support"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
            >
              {t('programsSupportTitle')}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section id="programs" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">
            {t('programsTitle')}
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            {t('programsIntro')}
          </p>
        </div>

        <ProgramCards />
      </section>

      {/* Support Highlights */}
      <section id="support" className="bg-white dark:bg-gray-800 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">
              {t('programsSupportTitle')}
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              {t('programsSupportSubtitle')}
            </p>
          </div>

          <ProgramSupportHighlights className="mt-16" />
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-blue-600 to-purple-600 opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.15),_transparent_55%)]" />
        <div className="relative mx-auto max-w-5xl px-4 text-center text-white">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/10 shadow-lg">
            <ArrowRight className="h-10 w-10" />
          </div>
          <h2 className="mt-8 text-3xl font-semibold sm:text-4xl">
            {t('readyToJoin')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            {t('readyToJoinDesc')}
          </p>
          <a
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-base font-semibold text-emerald-600 shadow-lg transition hover:-translate-y-1 hover:bg-white/90"
          >
            {t('becomeMember')}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
};

export default Programs;