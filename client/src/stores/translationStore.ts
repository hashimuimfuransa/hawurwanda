import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { enTranslations } from './translations/en';
import { rwTranslations } from './translations/rw';

// Supported languages
export type Language = 'rw' | 'en';

interface TranslationState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, variables?: Record<string, any>) => string;
  plural: (key: string, count: number) => string;
  formatSentence: (key: string, values: Record<string, string | number>) => string;
}

// Zustand store with persistence
export const useTranslationStore = create<TranslationState>()(
  persist(
    (set, get) => ({
      language: 'rw',
      setLanguage: (lang: Language) => set({ language: lang }),
      toggleLanguage: () => {
        const currentLang = get().language;
        set({ language: currentLang === 'rw' ? 'en' : 'rw' });
      },

      // Basic translation getter
      t: (key, variables = {}) => {
        const lang = get().language;

        if (translations[lang][key]) {
          return translations[lang][key].replace(/\{(\w+)\}/g, (_, v) => variables[v] ?? '');
        }
// Define the fallback order for translations
      const fallbackOrder: Language[] = ['en', 'rw'];

        for (const fallbackLang of fallbackOrder) {
          if (translations[fallbackLang][key]) {
            return translations[fallbackLang][key].replace(/\{(\w+)\}/g, (_, v) => variables[v] ?? '');
          }
        }

        // Return the key if no translation is found in any language
        return key;
      },

      // Automatic pluralization
      plural: (key, count) => {
        const lang = get().language;
        const singular = translations[lang][`${key}_one`] || translations[lang][key] || key;
        const plural = translations[lang][`${key}_other`] || translations[lang][key] || key;

        if (lang === 'en') {
          return count === 1 ? singular.replace('{count}', String(count)) : plural.replace('{count}', String(count));
        } else if (lang === 'rw') {
          // Simple Kinyarwanda rule
          return count === 1
            ? singular.replace('{count}', String(count))
            : plural.replace('{count}', String(count));
        }
        return key;
      },

      // Sentence formatter for placeholders like "{name} joined {year}"
      formatSentence: (key: string, values: Record<string, string | number>) => {
        const lang = get().language;
        const text = translations[lang][key] || key;
        return text.replace(/\{(\w+)\}/g, (_, v) => 
          values[v] !== undefined ? String(values[v]) : ''
        );
      },
      
    }),
    { name: 'language-storage' }
  )
);

// Translations
export const translations: Record<Language, Record<string, string>> = {
  rw: rwTranslations as Record<string, string>,
  en: enTranslations as Record<string, string>,
};
