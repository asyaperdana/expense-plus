import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Budget } from '@/types';
import { startOfMonth } from 'date-fns';

interface BudgetState {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  getBudgetById: (id: string) => Budget | undefined;
  getBudgetByCategory: (categoryId: string) => Budget | undefined;
  getGlobalBudget: () => Budget | undefined;
  getActiveBudgets: () => Budget[];
}

const defaultBudgets: Budget[] = [
  {
    id: 'budget-global',
    amount: 5000000,
    period: 'monthly',
    startDate: startOfMonth(new Date()),
    alertThreshold: 80,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'budget-1',
    categoryId: 'cat-expense-1',
    amount: 1500000,
    period: 'monthly',
    startDate: startOfMonth(new Date()),
    alertThreshold: 85,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'budget-2',
    categoryId: 'cat-expense-2',
    amount: 800000,
    period: 'monthly',
    startDate: startOfMonth(new Date()),
    alertThreshold: 90,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'budget-3',
    categoryId: 'cat-expense-3',
    amount: 1000000,
    period: 'monthly',
    startDate: startOfMonth(new Date()),
    alertThreshold: 75,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      budgets: defaultBudgets,

      addBudget: (budget) => {
        const newBudget: Budget = {
          ...budget,
          id: `budget-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ budgets: [...state.budgets, newBudget] }));
      },

      updateBudget: (id, updates) => {
        set((state) => ({
          budgets: state.budgets.map((budget) =>
            budget.id === id ? { ...budget, ...updates, updatedAt: new Date() } : budget
          ),
        }));
      },

      deleteBudget: (id) => {
        set((state) => ({
          budgets: state.budgets.filter((budget) => budget.id !== id),
        }));
      },

      getBudgetById: (id) => {
        return get().budgets.find((budget) => budget.id === id);
      },

      getBudgetByCategory: (categoryId) => {
        return get().budgets.find((budget) => budget.categoryId === categoryId);
      },

      getGlobalBudget: () => {
        return get().budgets.find((budget) => !budget.categoryId);
      },

      getActiveBudgets: () => {
        const now = new Date();
        return get().budgets.filter((budget) => {
          if (budget.endDate) {
            return now >= budget.startDate && now <= budget.endDate;
          }
          return now >= budget.startDate;
        });
      },
    }),
    {
      name: 'budget-storage',
    }
  )
);
