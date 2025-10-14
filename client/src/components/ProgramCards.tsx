import React from 'react';
import {
  GraduationCap,
  Coins,
  Shield,
  Handshake,
  Users,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useTranslationStore } from '../stores/translationStore';

type ProgramKey =
  | 'training'
  | 'financialSupport'
  | 'healthInsurance'
  | 'legalSupport'
  | 'partnerships'
  | 'innovation';

type ProgramDescriptionKey =
  | 'trainingDesc'
  | 'financialSupportDesc'
  | 'healthInsuranceDesc'
  | 'legalSupportDesc'
  | 'partnershipsDesc'
  | 'innovationDesc';

interface ProgramConfig {
  key: ProgramKey;
  descriptionKey: ProgramDescriptionKey;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

const programs: ProgramConfig[] = [
  {
    key: 'training',
    descriptionKey: 'trainingDesc',
    icon: GraduationCap,
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    key: 'financialSupport',
    descriptionKey: 'financialSupportDesc',
    icon: Coins,
    gradient: 'from-amber-500 to-orange-500'
  },
  {
    key: 'healthInsurance',
    descriptionKey: 'healthInsuranceDesc',
    icon: Shield,
    gradient: 'from-blue-500 to-indigo-500'
  },
  {
    key: 'legalSupport',
    descriptionKey: 'legalSupportDesc',
    icon: Handshake,
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    key: 'partnerships',
    descriptionKey: 'partnershipsDesc',
    icon: Users,
    gradient: 'from-rose-500 to-red-500'
  },
  {
    key: 'innovation',
    descriptionKey: 'innovationDesc',
    icon: Sparkles,
    gradient: 'from-cyan-500 to-sky-500'
  }
];

interface ProgramCardsProps {
  className?: string;
}

const ProgramCards: React.FC<ProgramCardsProps> = ({ className = '' }) => {
  const { t } = useTranslationStore();

  return (
    <div className={`grid gap-8 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {programs.map(({ key, descriptionKey, icon: Icon, gradient }) => (
        <div
          key={key}
          className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-md transition hover:-translate-y-2 hover:shadow-xl"
        >
          <div
            className={`absolute inset-x-6 top-0 h-32 rounded-b-full bg-gradient-to-r ${gradient} opacity-20 transition group-hover:opacity-30`}
          />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-lg">
            <Icon className="h-7 w-7" />
          </div>
          <h3 className="mt-6 text-xl font-semibold text-gray-900">
            {t(key)}
          </h3>
          <p className="mt-4 text-gray-600">
            {t(descriptionKey)}
          </p>
          <div className="mt-6 inline-flex items-center text-sm font-medium text-emerald-600">
            {t('learnMore')}
            <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgramCards;