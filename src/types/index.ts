// Expense Tracker Types

export interface Wallet {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'ewallet';
  balance: number;
  currency: string;
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  budget?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  walletId: string;
  date: Date;
  note: string;
  receiptImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  categoryId?: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  alertThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionTemplate {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  walletId: string;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SharedLedger {
  id: string;
  name: string;
  description?: string;
  members: LedgerMember[];
  transactions: SharedTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LedgerMember {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  joinedAt: Date;
}

export interface SharedTransaction {
  id: string;
  amount: number;
  description: string;
  paidBy: string;
  splitType: 'equal' | 'percentage' | 'amount';
  splits: Split[];
  date: Date;
  createdAt: Date;
}

export interface Split {
  memberId: string;
  amount: number;
  percentage?: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  language: string;
  dateFormat: string;
  notifications: boolean;
  budgetAlerts: boolean;
}

export interface FinancialSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  periodIncome: number;
  periodExpense: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface CalendarTransaction {
  date: Date;
  income: number;
  expense: number;
  transactions: Transaction[];
}
