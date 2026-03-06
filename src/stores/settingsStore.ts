import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings } from '@/types';

type Theme = 'light' | 'dark' | 'system';

interface SettingsState extends AppSettings {
  setTheme: (theme: Theme) => void;
  setCurrency: (currency: string) => void;
  setLanguage: (language: string) => void;
  setDateFormat: (format: string) => void;
  toggleNotifications: () => void;
  toggleBudgetAlerts: () => void;
  isDarkMode: () => boolean;
}

const defaultSettings: AppSettings = {
  theme: 'system',
  currency: 'IDR',
  language: 'id',
  dateFormat: 'dd/MM/yyyy',
  notifications: true,
  budgetAlerts: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setTheme: (theme) => {
        set({ theme });
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
          root.classList.add(systemTheme);
        } else {
          root.classList.add(theme);
        }
      },

      setCurrency: (currency) => set({ currency }),

      setLanguage: (language) => set({ language }),

      setDateFormat: (dateFormat) => set({ dateFormat }),

      toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),

      toggleBudgetAlerts: () => set((state) => ({ budgetAlerts: !state.budgetAlerts })),

      isDarkMode: () => {
        const { theme } = get();
        if (theme === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return theme === 'dark';
      },
    }),
    {
      name: 'settings-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const root = window.document.documentElement;
          root.classList.remove('light', 'dark');
          
          if (state.theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light';
            root.classList.add(systemTheme);
          } else {
            root.classList.add(state.theme);
          }
        }
      },
    }
  )
);
