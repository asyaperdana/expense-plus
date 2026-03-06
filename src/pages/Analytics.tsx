import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useWalletStore } from '@/stores/walletStore';
import { formatCurrency, getShortMonthName } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export function Analytics() {
  const transactions = useTransactionStore((state) => state.transactions);
  const categories = useCategoryStore((state) => state.categories);
  const wallets = useWalletStore((state) => state.wallets);

  const [period, setPeriod] = useState<'6months' | '1year' | 'all'>('6months');

  const stats = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '6months':
        startDate = subMonths(now, 6);
        break;
      case '1year':
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = new Date(0);
    }

    const filteredTransactions = transactions.filter(
      (t) => t.date >= startDate
    );

    const totalIncome = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { totalIncome, totalExpense };
  }, [transactions, period]);

  const categoryData = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const expenseTransactions = transactions.filter(
      (t) => t.type === 'expense' && t.date >= monthStart && t.date <= monthEnd
    );

    const categoryTotals = expenseTransactions.reduce((acc, transaction) => {
      const category = categories.find((c) => c.id === transaction.categoryId);
      if (category) {
        acc[category.name] = (acc[category.name] || 0) + transaction.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .map(([name, value]) => {
        const category = categories.find((c) => c.name === name);
        return {
          name,
          value,
          color: category?.color || '#6b7280',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();
    const monthCount = period === '6months' ? 6 : period === '1year' ? 12 : 12;

    for (let i = monthCount - 1; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const monthTransactions = transactions.filter((t) =>
        isWithinInterval(t.date, { start: monthStart, end: monthEnd })
      );

      const income = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      months.push({
        name: getShortMonthName(date.getMonth()),
        income,
        expense,
      });
    }

    return months;
  }, [transactions, period]);

  const walletData = useMemo(() => {
    return wallets.map((wallet) => {
      const walletTransactions = transactions.filter((t) => t.walletId === wallet.id);
      const income = walletTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = walletTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        name: wallet.name,
        balance: wallet.balance,
        income,
        expense,
        color: wallet.color,
      };
    });
  }, [wallets, transactions]);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm">
              {entry.dataKey === 'income' ? 'Pemasukan' : 
               entry.dataKey === 'expense' ? 'Pengeluaran' : 
               entry.dataKey === 'balance' ? 'Saldo' : entry.dataKey}: 
              {' '}{formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analitik</h1>
          <p className="text-muted-foreground">
            Analisis mendalam tentang keuangan Anda
          </p>
        </div>
        <Select value={period} onValueChange={(value: '6months' | '1year' | 'all') => setPeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6months">6 Bulan Terakhir</SelectItem>
            <SelectItem value="1year">1 Tahun Terakhir</SelectItem>
            <SelectItem value="all">Semua Waktu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pemasukan
            </CardTitle>
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pengeluaran
            </CardTitle>
            <div className="rounded-lg bg-rose-500/10 p-2">
              <TrendingDown className="h-4 w-4 text-rose-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalExpense)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Selisih
            </CardTitle>
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Wallet className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              stats.totalIncome - stats.totalExpense >= 0 ? 'text-emerald-500' : 'text-rose-500'
            }`}>
              {formatCurrency(stats.totalIncome - stats.totalExpense)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tren Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `Rp${(value / 1000000).toFixed(0)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Pemasukan" />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Pengeluaran" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pengeluaran per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Wallet Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Performa Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={walletData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `Rp${(value / 1000000).toFixed(0)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Pemasukan" />
                <Bar dataKey="expense" fill="#ef4444" name="Pengeluaran" />
                <Bar dataKey="balance" fill="#3b82f6" name="Saldo" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
