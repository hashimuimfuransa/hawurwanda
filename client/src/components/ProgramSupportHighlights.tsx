import React from 'react';
import { Heart, Briefcase, Globe } from 'lucide-react';
import { useTranslationStore } from '../stores/translationStore';

type SupportKey = 'mentorshipSupport' | 'resourcesSupport' | 'communitySupport';

type IconType = React.ComponentType<{ className?: string }>;

interface SupportConfig {
  key: SupportKey;
  icon: IconType;
}

const supportHighlights: SupportConfig[] = [
  {
    key: 'mentorshipSupport',
    icon: Heart
  },
  {
    key: 'resourcesSupport',
    icon: Briefcase
  },
  {
    key: 'communitySupport',
    icon: Globe
  }
];

interface ProgramSupportHighlightsProps {
  className?: string;
}

const ProgramSupportHighlights: React.FC<ProgramSupportHighlightsProps> = ({ className = '' }) => {
  const { t } = useTranslationStore();

  return (
    <div className={`grid gap-10 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {supportHighlights.map(({ key, icon: Icon }) => (
        <div
          key={key}
          className="rounded-3xl border border-gray-100 bg-gray-50 p-8 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:bg-white hover:shadow-lg"
        >
          <div className="inline-flex rounded-2xl bg-emerald-100 p-4 text-emerald-600">
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="mt-6 text-xl font-semibold text-gray-900">
            {t(key)}
          </h3>
          <p className="mt-4 text-gray-600">
            {t(`${key}Desc`)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ProgramSupportHighlights;