import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TransactionTemplate } from '@/types';

interface TemplateState {
  templates: TransactionTemplate[];
  addTemplate: (template: Omit<TransactionTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTemplate: (id: string, updates: Partial<TransactionTemplate>) => void;
  deleteTemplate: (id: string) => void;
  getTemplateById: (id: string) => TransactionTemplate | undefined;
  getTemplatesByType: (type: 'income' | 'expense') => TransactionTemplate[];
}

const defaultTemplates: TransactionTemplate[] = [
  {
    id: 'template-1',
    name: 'Monthly Salary',
    amount: 8500000,
    type: 'income',
    categoryId: 'cat-income-1',
    walletId: 'wallet-2',
    note: 'Monthly salary payment',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'template-2',
    name: 'Grocery Shopping',
    amount: 500000,
    type: 'expense',
    categoryId: 'cat-expense-1',
    walletId: 'wallet-1',
    note: 'Weekly groceries',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'template-3',
    name: 'Gasoline',
    amount: 300000,
    type: 'expense',
    categoryId: 'cat-expense-2',
    walletId: 'wallet-1',
    note: 'Fuel for car',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'template-4',
    name: 'Netflix Subscription',
    amount: 150000,
    type: 'expense',
    categoryId: 'cat-expense-4',
    walletId: 'wallet-3',
    note: 'Monthly Netflix subscription',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'template-5',
    name: 'Internet Bill',
    amount: 400000,
    type: 'expense',
    categoryId: 'cat-expense-5',
    walletId: 'wallet-2',
    note: 'Monthly internet bill',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: defaultTemplates,

      addTemplate: (template) => {
        const newTemplate: TransactionTemplate = {
          ...template,
          id: `template-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ templates: [...state.templates, newTemplate] }));
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id
              ? { ...template, ...updates, updatedAt: new Date() }
              : template
          ),
        }));
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== id),
        }));
      },

      getTemplateById: (id) => {
        return get().templates.find((template) => template.id === id);
      },

      getTemplatesByType: (type) => {
        return get().templates.filter((template) => template.type === type);
      },
    }),
    {
      name: 'template-storage',
    }
  )
);
