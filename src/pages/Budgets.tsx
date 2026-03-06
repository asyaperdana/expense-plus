import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBudgetStore } from '@/stores/budgetStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { Plus, MoreVertical, Edit2, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { startOfMonth, endOfMonth } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function Budgets() {
  const budgets = useBudgetStore((state) => state.budgets);
  const addBudget = useBudgetStore((state) => state.addBudget);
  const updateBudget = useBudgetStore((state) => state.updateBudget);
  const deleteBudget = useBudgetStore((state) => state.deleteBudget);
  const categories = useCategoryStore((state) => state.categories);
  const transactions = useTransactionStore((state) => state.transactions);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: 0,
    period: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    alertThreshold: 80,
  });

  const handleSubmit = () => {
    const budgetData = {
      ...formData,
      categoryId: formData.categoryId || undefined,
      startDate: startOfMonth(new Date()),
    };

    if (editingBudget) {
      updateBudget(editingBudget, budgetData);
      setEditingBudget(null);
    } else {
      addBudget(budgetData);
    }
    setIsAddDialogOpen(false);
    setFormData({
      categoryId: '',
      amount: 0,
      period: 'monthly',
      alertThreshold: 80,
    });
  };

  const handleEdit = (budget: typeof budgets[0]) => {
    setFormData({
      categoryId: budget.categoryId || '',
      amount: budget.amount,
      period: budget.period,
      alertThreshold: budget.alertThreshold,
    });
    setEditingBudget(budget.id);
    setIsAddDialogOpen(true);
  };

  const getBudgetStats = (budget: typeof budgets[0]) => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const spent = transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          t.date >= monthStart &&
          t.date <= monthEnd &&
          (budget.categoryId ? t.categoryId === budget.categoryId : true)
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const percentage = Math.min((spent / budget.amount) * 100, 100);
    const isOverBudget = spent > budget.amount;
    const isNearLimit = percentage >= budget.alertThreshold;

    return { spent, percentage, isOverBudget, isNearLimit };
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budget</h1>
          <p className="text-muted-foreground">
            Atur dan pantau batas pengeluaran Anda
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBudget ? 'Edit Budget' : 'Tambah Budget Baru'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Kategori (Opsional)</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Budget Global (semua kategori)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Budget Global</SelectItem>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Jumlah Budget</Label>
                <Input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: Number(e.target.value) })
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label>Periode</Label>
                <Select
                  value={formData.period}
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') =>
                    setFormData({ ...formData, period: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Harian</SelectItem>
                    <SelectItem value="weekly">Mingguan</SelectItem>
                    <SelectItem value="monthly">Bulanan</SelectItem>
                    <SelectItem value="yearly">Tahunan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Threshold Peringatan (%)</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={formData.alertThreshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      alertThreshold: Number(e.target.value),
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Anda akan menerima peringatan ketika pengeluaran mencapai {formData.alertThreshold}% dari budget
                </p>
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingBudget ? 'Simpan Perubahan' : 'Tambah Budget'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {budgets.map((budget) => {
          const stats = getBudgetStats(budget);
          const category = budget.categoryId
            ? categories.find((c) => c.id === budget.categoryId)
            : null;

          return (
            <Card key={budget.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        stats.isOverBudget
                          ? 'bg-destructive/10'
                          : stats.isNearLimit
                          ? 'bg-amber-500/10'
                          : 'bg-emerald-500/10'
                      }`}
                    >
                      {stats.isOverBudget ? (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      ) : stats.isNearLimit ? (
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {category?.name || 'Budget Global'}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground capitalize">
                        {budget.period}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(budget)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteBudget(budget.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(stats.spent)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      dari {formatCurrency(budget.amount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-semibold ${
                        stats.isOverBudget
                          ? 'text-destructive'
                          : stats.isNearLimit
                          ? 'text-amber-500'
                          : 'text-emerald-500'
                      }`}
                    >
                      {stats.percentage.toFixed(0)}%
                    </p>
                  </div>
                </div>

                <Progress
                  value={stats.percentage}
                  className={`h-2 ${
                    stats.isOverBudget
                      ? 'bg-destructive/20'
                      : stats.isNearLimit
                      ? 'bg-amber-500/20'
                      : 'bg-emerald-500/20'
                  }`}
                />

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Sisa: {formatCurrency(Math.max(budget.amount - stats.spent, 0))}
                  </span>
                  <span className="text-muted-foreground">
                    Threshold: {budget.alertThreshold}%
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
