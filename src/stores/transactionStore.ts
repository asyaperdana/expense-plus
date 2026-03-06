import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Transaction } from '@/types';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionById: (id: string) => Transaction | undefined;
  getTransactionsByDateRange: (start: Date, end: Date) => Transaction[];
  getTransactionsByWallet: (walletId: string) => Transaction[];
  getTransactionsByCategory: (categoryId: string) => Transaction[];
  getTransactionsByMonth: (date: Date) => Transaction[];
  getIncomeByPeriod: (start: Date, end: Date) => number;
  getExpenseByPeriod: (start: Date, end: Date) => number;
  getRecentTransactions: (limit: number) => Transaction[];
}

// Generate some sample transactions
const generateSampleTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const today = new Date();

  // Sample data for the last 3 months
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));

    const isIncome = Math.random() < 0.3;
    const amount = isIncome 
      ? Math.floor(Math.random() * 5000000) + 1000000
      : Math.floor(Math.random() * 500000) + 50000;

    transactions.push({
      id: `trans-${Date.now()}-${i}`,
      amount,
      type: isIncome ? 'income' : 'expense',
      categoryId: isIncome 
        ? `cat-income-${Math.floor(Math.random() * 4) + 1}`
        : `cat-expense-${Math.floor(Math.random() * 8) + 1}`,
      walletId: `wallet-${Math.floor(Math.random() * 3) + 1}`,
      date,
      note: isIncome ? 'Income transaction' : 'Expense transaction',
      createdAt: date,
      updatedAt: date,
    });
  }

  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: generateSampleTransactions(),

      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: `trans-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((trans) =>
            trans.id === id ? { ...trans, ...updates, updatedAt: new Date() } : trans
          ),
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((trans) => trans.id !== id),
        }));
      },

      getTransactionById: (id) => {
        return get().transactions.find((trans) => trans.id === id);
      },

      getTransactionsByDateRange: (start, end) => {
        return get().transactions.filter((trans) =>
          isWithinInterval(trans.date, { start, end })
        );
      },

      getTransactionsByWallet: (walletId) => {
        return get().transactions.filter((trans) => trans.walletId === walletId);
      },

      getTransactionsByCategory: (categoryId) => {
        return get().transactions.filter((trans) => trans.categoryId === categoryId);
      },

      getTransactionsByMonth: (date) => {
        const start = startOfMonth(date);
        const end = endOfMonth(date);
        return get().transactions.filter((trans) =>
          isWithinInterval(trans.date, { start, end })
        );
      },

      getIncomeByPeriod: (start, end) => {
        return get()
          .transactions.filter(
            (trans) =>
              trans.type === 'income' && isWithinInterval(trans.date, { start, end })
          )
          .reduce((total, trans) => total + trans.amount, 0);
      },

      getExpenseByPeriod: (start, end) => {
        return get()
          .transactions.filter(
            (trans) =>
              trans.type === 'expense' && isWithinInterval(trans.date, { start, end })
          )
          .reduce((total, trans) => total + trans.amount, 0);
      },

      getRecentTransactions: (limit) => {
        return get().transactions.slice(0, limit);
      },
    }),
    {
      name: 'transaction-storage',
    }
  )
);
