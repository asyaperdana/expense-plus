import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SharedLedger, LedgerMember, SharedTransaction } from '@/types';

interface LedgerState {
  ledgers: SharedLedger[];
  addLedger: (ledger: Omit<SharedLedger, 'id' | 'createdAt' | 'updatedAt' | 'members' | 'transactions'>) => void;
  updateLedger: (id: string, updates: Partial<SharedLedger>) => void;
  deleteLedger: (id: string) => void;
  addMember: (ledgerId: string, member: Omit<LedgerMember, 'id' | 'joinedAt'>) => void;
  removeMember: (ledgerId: string, memberId: string) => void;
  addTransaction: (ledgerId: string, transaction: Omit<SharedTransaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (ledgerId: string, transactionId: string) => void;
  getLedgerById: (id: string) => SharedLedger | undefined;
  getMemberBalance: (ledgerId: string, memberId: string) => number;
  getSettlements: (ledgerId: string) => { from: string; to: string; amount: number }[];
}

export const useLedgerStore = create<LedgerState>()(
  persist(
    (set, get) => ({
      ledgers: [],

      addLedger: (ledger) => {
        const newLedger: SharedLedger = {
          ...ledger,
          id: `ledger-${Date.now()}`,
          members: [],
          transactions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ ledgers: [...state.ledgers, newLedger] }));
      },

      updateLedger: (id, updates) => {
        set((state) => ({
          ledgers: state.ledgers.map((ledger) =>
            ledger.id === id ? { ...ledger, ...updates, updatedAt: new Date() } : ledger
          ),
        }));
      },

      deleteLedger: (id) => {
        set((state) => ({
          ledgers: state.ledgers.filter((ledger) => ledger.id !== id),
        }));
      },

      addMember: (ledgerId, member) => {
        const newMember: LedgerMember = {
          ...member,
          id: `member-${Date.now()}`,
          joinedAt: new Date(),
        };
        set((state) => ({
          ledgers: state.ledgers.map((ledger) =>
            ledger.id === ledgerId
              ? { ...ledger, members: [...ledger.members, newMember], updatedAt: new Date() }
              : ledger
          ),
        }));
      },

      removeMember: (ledgerId, memberId) => {
        set((state) => ({
          ledgers: state.ledgers.map((ledger) =>
            ledger.id === ledgerId
              ? {
                  ...ledger,
                  members: ledger.members.filter((m) => m.id !== memberId),
                  updatedAt: new Date(),
                }
              : ledger
          ),
        }));
      },

      addTransaction: (ledgerId, transaction) => {
        const newTransaction: SharedTransaction = {
          ...transaction,
          id: `shared-trans-${Date.now()}`,
          createdAt: new Date(),
        };
        set((state) => ({
          ledgers: state.ledgers.map((ledger) =>
            ledger.id === ledgerId
              ? {
                  ...ledger,
                  transactions: [...ledger.transactions, newTransaction],
                  updatedAt: new Date(),
                }
              : ledger
          ),
        }));
      },

      deleteTransaction: (ledgerId, transactionId) => {
        set((state) => ({
          ledgers: state.ledgers.map((ledger) =>
            ledger.id === ledgerId
              ? {
                  ...ledger,
                  transactions: ledger.transactions.filter((t) => t.id !== transactionId),
                  updatedAt: new Date(),
                }
              : ledger
          ),
        }));
      },

      getLedgerById: (id) => {
        return get().ledgers.find((ledger) => ledger.id === id);
      },

      getMemberBalance: (ledgerId, memberId) => {
        const ledger = get().getLedgerById(ledgerId);
        if (!ledger) return 0;

        let balance = 0;
        ledger.transactions.forEach((trans) => {
          const memberSplit = trans.splits.find((s) => s.memberId === memberId);
          if (memberSplit) {
            if (trans.paidBy === memberId) {
              balance += trans.amount - memberSplit.amount;
            } else {
              balance -= memberSplit.amount;
            }
          }
        });
        return balance;
      },

      getSettlements: (ledgerId) => {
        const ledger = get().getLedgerById(ledgerId);
        if (!ledger) return [];

        const balances = new Map<string, number>();
        ledger.members.forEach((member) => {
          balances.set(member.id, get().getMemberBalance(ledgerId, member.id));
        });

        const settlements: { from: string; to: string; amount: number }[] = [];
        const debtors = Array.from(balances.entries())
          .filter(([, balance]) => balance < 0)
          .sort((a, b) => a[1] - b[1]);
        const creditors = Array.from(balances.entries())
          .filter(([, balance]) => balance > 0)
          .sort((a, b) => b[1] - a[1]);

        let i = 0,
          j = 0;
        while (i < debtors.length && j < creditors.length) {
          const [debtorId, debtorBalance] = debtors[i];
          const [creditorId, creditorBalance] = creditors[j];
          const amount = Math.min(Math.abs(debtorBalance), creditorBalance);

          if (amount > 0) {
            settlements.push({ from: debtorId, to: creditorId, amount });
          }

          debtors[i][1] += amount;
          creditors[j][1] -= amount;

          if (debtors[i][1] >= 0) i++;
          if (creditors[j][1] <= 0) j++;
        }

        return settlements;
      },
    }),
    {
      name: 'ledger-storage',
    }
  )
);
