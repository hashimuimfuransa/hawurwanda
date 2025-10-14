import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDarkMode: false,
      toggleTheme: () => {
        const newTheme = !get().isDarkMode;
        set({ isDarkMode: newTheme });
        
        // Apply theme to document immediately
        if (newTheme) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      setTheme: (isDark: boolean) => {
        set({ isDarkMode: isDark });
        
        // Apply theme to document immediately
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Apply theme immediately when store is rehydrated
        if (state?.isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }
  )
);

// Apply theme immediately on module load to prevent flash
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('theme-storage');
  if (savedTheme) {
    try {
      const parsed = JSON.parse(savedTheme);
      if (parsed?.state?.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      // If parsing fails, default to light mode
      document.documentElement.classList.remove('dark');
    }
  }
}
