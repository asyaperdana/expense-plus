import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useWalletStore } from '@/stores/walletStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { id } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { startOfMonth, endOfMonth, isSameDay, format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function Calendar() {
  const transactions = useTransactionStore((state) => state.transactions);
  const categories = useCategoryStore((state) => state.categories);
  const wallets = useWalletStore((state) => state.wallets);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const dailyTotals = useMemo(() => {
    const totals = new Map<string, { income: number; expense: number }>();

    transactions.forEach((transaction) => {
      const dateKey = format(transaction.date, 'yyyy-MM-dd');
      const current = totals.get(dateKey) || { income: 0, expense: 0 };

      if (transaction.type === 'income') {
        current.income += transaction.amount;
      } else {
        current.expense += transaction.amount;
      }

      totals.set(dateKey, current);
    });

    return totals;
  }, [transactions]);

  const selectedDateTransactions = useMemo(() => {
    if (!selectedDate) return [];
    return transactions.filter((t) => isSameDay(t.date, selectedDate));
  }, [transactions, selectedDate]);

  const monthStats = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const monthTransactions = transactions.filter(
      (t) => t.date >= monthStart && t.date <= monthEnd
    );

    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense };
  }, [transactions, currentMonth]);

  const modifiers = useMemo(() => {
    const incomeDays: Date[] = [];
    const expenseDays: Date[] = [];
    const bothDays: Date[] = [];

    dailyTotals.forEach((totals, dateKey) => {
      const date = new Date(dateKey);
      if (totals.income > 0 && totals.expense > 0) {
        bothDays.push(date);
      } else if (totals.income > 0) {
        incomeDays.push(date);
      } else if (totals.expense > 0) {
        expenseDays.push(date);
      }
    });

    return {
      income: incomeDays,
      expense: expenseDays,
      both: bothDays,
    };
  }, [dailyTotals]);

  const modifiersStyles = {
    income: {
      backgroundColor: '#10b98120',
      color: '#10b981',
      fontWeight: 'bold',
    },
    expense: {
      backgroundColor: '#ef444420',
      color: '#ef4444',
      fontWeight: 'bold',
    },
    both: {
      backgroundColor: '#8b5cf620',
      color: '#8b5cf6',
      fontWeight: 'bold',
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kalender</h1>
        <p className="text-muted-foreground">
          Lihat aktivitas finansial berdasarkan tanggal
        </p>
      </div>

      {/* Month Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pemasukan {format(currentMonth, 'MMMM yyyy', { locale: id })}
            </CardTitle>
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {formatCurrency(monthStats.income)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pengeluaran {format(currentMonth, 'MMMM yyyy', { locale: id })}
            </CardTitle>
            <div className="rounded-lg bg-rose-500/10 p-2">
              <ArrowDownRight className="h-4 w-4 text-rose-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">
              {formatCurrency(monthStats.expense)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {format(currentMonth, 'MMMM yyyy', { locale: id })}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newDate = new Date(currentMonth);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setCurrentMonth(newDate);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newDate = new Date(currentMonth);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setCurrentMonth(newDate);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              if (date) setIsDialogOpen(true);
            }}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-md border"
            locale={id}
          />

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500/20" />
              <span className="text-sm text-muted-foreground">Pemasukan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-rose-500/20" />
              <span className="text-sm text-muted-foreground">Pengeluaran</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-violet-500/20" />
              <span className="text-sm text-muted-foreground">Keduanya</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Transaksi {selectedDate && formatDate(selectedDate)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {selectedDateTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Tidak ada transaksi pada tanggal ini
              </p>
            ) : (
              selectedDateTransactions.map((transaction) => {
                const category = categories.find((c) => c.id === transaction.categoryId);
                const wallet = wallets.find((w) => w.id === transaction.walletId);
                const isIncome = transaction.type === 'income';

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          isIncome ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-rose-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{category?.name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{wallet?.name}</p>
                        {transaction.note && (
                          <p className="text-sm text-muted-foreground">
                            {transaction.note}
                          </p>
                        )}
                      </div>
                    </div>
                    <p
                      className={`font-semibold ${
                        isIncome ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
