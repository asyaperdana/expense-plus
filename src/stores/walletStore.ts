import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Wallet } from '@/types';

interface WalletState {
  wallets: Wallet[];
  addWallet: (wallet: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWallet: (id: string, updates: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;
  getWalletById: (id: string) => Wallet | undefined;
  getTotalBalance: () => number;
  updateBalance: (id: string, amount: number) => void;
}

const defaultWallets: Wallet[] = [
  {
    id: 'wallet-1',
    name: 'Cash',
    type: 'cash',
    balance: 500000,
    currency: 'IDR',
    color: '#10b981',
    icon: 'Banknote',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'wallet-2',
    name: 'Bank BCA',
    type: 'bank',
    balance: 2500000,
    currency: 'IDR',
    color: '#3b82f6',
    icon: 'Building2',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'wallet-3',
    name: 'GoPay',
    type: 'ewallet',
    balance: 750000,
    currency: 'IDR',
    color: '#00aed6',
    icon: 'Wallet',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallets: defaultWallets,

      addWallet: (wallet) => {
        const newWallet: Wallet = {
          ...wallet,
          id: `wallet-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ wallets: [...state.wallets, newWallet] }));
      },

      updateWallet: (id, updates) => {
        set((state) => ({
          wallets: state.wallets.map((wallet) =>
            wallet.id === id
              ? { ...wallet, ...updates, updatedAt: new Date() }
              : wallet
          ),
        }));
      },

      deleteWallet: (id) => {
        set((state) => ({
          wallets: state.wallets.filter((wallet) => wallet.id !== id),
        }));
      },

      getWalletById: (id) => {
        return get().wallets.find((wallet) => wallet.id === id);
      },

      getTotalBalance: () => {
        return get().wallets.reduce((total, wallet) => total + wallet.balance, 0);
      },

      updateBalance: (id, amount) => {
        set((state) => ({
          wallets: state.wallets.map((wallet) =>
            wallet.id === id
              ? { ...wallet, balance: wallet.balance + amount, updatedAt: new Date() }
              : wallet
          ),
        }));
      },
    }),
    {
      name: 'wallet-storage',
    }
  )
);
