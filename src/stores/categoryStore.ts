import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Category } from '@/types';

interface CategoryState {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
  getCategoriesByType: (type: 'income' | 'expense') => Category[];
}

const defaultCategories: Category[] = [
  // Income categories
  {
    id: 'cat-income-1',
    name: 'Salary',
    type: 'income',
    color: '#10b981',
    icon: 'Briefcase',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cat-income-2',
    name: 'Freelance',
    type: 'income',
    color: '#22c55e',
    icon: 'Laptop',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cat-income-3',
    name: 'Investment',
    type: 'income',
    color: '#16a34a',
    icon: 'TrendingUp',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cat-income-4',
    name: 'Gift',
    type: 'income',
    color: '#15803d',
    icon: 'Gift',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Expense categories
  {
    id: 'cat-expense-1',
    name: 'Food & Dining',
    type: 'expense',
    color: '#ef4444',
    icon: 'UtensilsCrossed',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cat-expense-2',
    name: 'Transportation',
    type: 'expense',
    color: '#f97316',
    icon: 'Car',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cat-expense-3',
    name: 'Shopping',
    type: 'expense',
    color: '#eab308',
    icon: 'ShoppingBag',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cat-expense-4',
    name: 'Entertainment',
    type: 'expense',
    color: '#8b5cf6',
    icon: 'Film',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cat-expense-5',
    name: 'Bills & Utilities',
    type: 'expense',
    color: '#06b6d4',
    icon: 'Receipt',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cat-expense-6',
    name: 'Healthcare',
    type: 'expense',
    color: '#ec4899',
    icon: 'Heart',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cat-expense-7',
    name: 'Education',
    type: 'expense',
    color: '#6366f1',
    icon: 'GraduationCap',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cat-expense-8',
    name: 'Others',
    type: 'expense',
    color: '#6b7280',
    icon: 'MoreHorizontal',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: defaultCategories,

      addCategory: (category) => {
        const newCategory: Category = {
          ...category,
          id: `cat-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ categories: [...state.categories, newCategory] }));
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, ...updates, updatedAt: new Date() } : cat
          ),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
        }));
      },

      getCategoryById: (id) => {
        return get().categories.find((cat) => cat.id === id);
      },

      getCategoriesByType: (type) => {
        return get().categories.filter((cat) => cat.type === type);
      },
    }),
    {
      name: 'category-storage',
    }
  )
);
