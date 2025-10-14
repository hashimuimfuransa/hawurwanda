import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  rw: {
    // Navigation
    home: 'Ahabanza',
    about: 'Ibyacu',
    salons: 'Amasaluni',
    programs: 'Porogaramu',
    events: 'Ibikorwa',
    news: 'Amakuru',
    publications: 'Ibitangazamakuru',
    contact: 'Twandikire',
    login: 'Injira',
    register: 'Iyandikishe',
    dashboard: 'Ikibaho',

    // Home Page
    heroTitle: "Umuryango w’Abakora Imisatsi n’Abandi Bakora mu Rwanda",
    heroSubtitle:
      "HAWU ni umuryango uhuriza hamwe abakora imisatsi n’abandi bakora mu Rwanda, ugamije kubafasha kwiteza imbere no kurengera uburenganzira bwabo.",
    joinUs: 'Injira mu Muryango',
    learnMore: 'Menya Birenzeho',

    // Statistics
    statsTitle: 'Imibare y’Iterambere',
    statsSubtitle: "Turi kubaka umuryango ukomeye kandi wiyubashye.",
    activeMembers: 'Abanyamuryango Bakora',
    districtsCovered: 'Uturere Duhagarariwe',
    yearsOfService: 'Imyaka y’Ubukorikori',
    trainingPrograms: 'Porogaramu z’Amahugurwa',

    members_one: 'Umunyamuryango {count} ukora',
    members_other: 'Abanyamuryango {count} bakora',

    // About
    whoWeAre: 'Turi Bande',
    missionText:
      'Guteza imbere abakora imisatsi n’abandi bakora, kubaha amahirwe yo kwiyungura ubumenyi no guharanira uburenganzira bwabo.',
    ourVision: 'Icyerekezo cyacu',
    visionText:
      'Kubaka umuryango w’abanyamwuga ushoboye kandi ushishikajwe n’ubuvumbuzi.',
    ourValues: 'Indangagaciro zacu',
    valueProfessionalism: 'Ubunyamwuga',
    valueIntegrity: 'Ubunyangamugayo',
    valueUnity: 'Ubumwe n’Ubufatanye',
    valueInnovation: 'Ubuvumbuzi',

    ourVisionHome: 'Icyerekezo cyacu',
    ourVisionDescHome: 'Intego yacu ni uguteza imbere no gufasha abari mu mwuga wo gutunganya ubwiza mu Rwanda.',
    ourMissionHome: 'Ubutumwa bwacu',
    ourMissionDescHome: 'Dutanga porogaramu zituma abanyamuryango bagira ubumenyi n’imibereho myiza irambye.',
    trainingGraduation: 'Umuhango w’itangira cyangwa isoza amahugurwa',
    professionalDevelopment: 'Iterambere ry’Ubumenyi' ,


    // Programs
    programsTitle: 'Porogaramu zacu',
    training: 'Amahugurwa n’Iterambere',
    financialSupport: 'Ubufasha bw’Imari',
    healthInsurance: 'Ubwishingizi bw’Ubuzima',
    legalSupport: 'Ubuvugizi n’Amategeko',
    partnerships: 'Ubufatanye',
    innovation: 'Ikoranabuhanga n’Ubuvumbuzi',

    // Call to Action
    readyToJoin: 'Witeguye Kwinjira muri HAWU?',
    readyToJoinDesc:
      'Ba umwe mu banyamuryango kugira ngo ubone amahugurwa n’amahirwe.',
    becomeMember: 'Ba Umunyamuryango',

    // Contact
    address: 'Aderesi',
    phone: 'Telefoni',
    email: 'Imeli',
    message: 'Ubutumwa',
    sendMessage: 'Ohereza Ubutumwa',

    // Footer
    empoweringHairdressers:
      'Dufasha abakora imisatsi n’abandi bakora mu Rwanda kwiyubaka no guhanga udushya.',
    rightsReserved: 'Uburenganzira bwose burabitswe © 2025 HAWU.',
    followUs: 'Dukurikire',
    quickLinks: 'Amahuzanyo y’ihuse',
  },

  en: {
    // Navigation
    home: 'Home',
    about: 'About Us',
    salons: 'Salons',
    programs: 'Programs',
    events: 'Events',
    news: 'News',
    publications: 'Publications',
    contact: 'Contact',
    login: 'Login',
    register: 'Register',
    dashboard: 'Dashboard',

    // Home Page
    heroTitle: 'Association of Hairdressers and Other Workers in Rwanda',
    heroSubtitle:
      'HAWU empowers and unites professionals across Rwanda through advocacy, skills training, and innovation.',
    joinUs: 'Join Us',
    learnMore: 'Learn More',

    // Statistics
    statsTitle: 'Progress in Numbers',
    statsSubtitle: 'We are growing stronger together.',
    activeMembers: 'Active Members',
    districtsCovered: 'Districts Covered',
    yearsOfService: 'Years of Service',
    trainingPrograms: 'Training Programs',

    members_one: '{count} active member',
    members_other: '{count} active members',

    // About
    whoWeAre: 'Who We Are',
    missionText:
      'To promote the growth, education, and empowerment of hairdressers and other workers.',
    ourVision: 'Our Vision',
    visionText: 'To build a skilled, innovative, and professional community.',
    ourValues: 'Our Values',
    valueProfessionalism: 'Professionalism',
    valueIntegrity: 'Integrity',
    valueUnity: 'Unity and Collaboration',
    valueInnovation: 'Innovation',

    ourVisionHome: 'Our Vision',
    ourVisionDescHome: 'We aim to empower and uplift the hair and beauty community across Rwanda.',
    ourMissionHome: 'Our Mission',
    ourMissionDescHome: 'We deliver programs that promote professional growth and sustainable livelihoods.',
    trainingGraduation: 'Training Graduation',
    professionalDevelopment: 'Professional Development',


    // Programs
    programsTitle: 'Our Programs',
    training: 'Training and Development',
    financialSupport: 'Financial Support',
    healthInsurance: 'Health Insurance',
    legalSupport: 'Legal Support and Advocacy',
    partnerships: 'Partnerships',
    innovation: 'Innovation and Technology',

    // Call to Action
    readyToJoin: 'Ready to Join HAWU?',
    readyToJoinDesc:
      'Become a member and access development opportunities.',
    becomeMember: 'Become a Member',

    // Contact
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    message: 'Message',
    sendMessage: 'Send Message',

    // Footer
    empoweringHairdressers:
      'Empowering hairdressers and other workers across Rwanda.',
    rightsReserved: 'All rights reserved © 2025 HAWU.',
    followUs: 'Follow Us',
    quickLinks: 'Quick Links',
  },
};
