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
import { useCategoryStore } from '@/stores/categoryStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { Plus, MoreVertical, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { startOfMonth, endOfMonth } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import * as Icons from 'lucide-react';

const availableIcons = [
  'Wallet', 'Building2', 'CreditCard', 'TrendingUp', 'TrendingDown',
  'ShoppingBag', 'UtensilsCrossed', 'Car', 'Film', 'Receipt',
  'Heart', 'GraduationCap', 'MoreHorizontal', 'Briefcase', 'Laptop',
  'Gift', 'Home', 'Plane', 'Phone', 'Zap'
];

const availableColors = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#6366f1', '#14b8a6', '#f97316'
];

export function Categories() {
  const categories = useCategoryStore((state) => state.categories);
  const addCategory = useCategoryStore((state) => state.addCategory);
  const updateCategory = useCategoryStore((state) => state.updateCategory);
  const deleteCategory = useCategoryStore((state) => state.deleteCategory);
  const transactions = useTransactionStore((state) => state.transactions);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#10b981',
    icon: 'Wallet',
  });

  const handleSubmit = () => {
    if (editingCategory) {
      updateCategory(editingCategory, formData);
      setEditingCategory(null);
    } else {
      addCategory(formData);
    }
    setIsAddDialogOpen(false);
    setFormData({ name: '', type: 'expense', color: '#10b981', icon: 'Wallet' });
  };

  const handleEdit = (category: typeof categories[0]) => {
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
    });
    setEditingCategory(category.id);
    setIsAddDialogOpen(true);
  };

  const getCategoryStats = (categoryId: string) => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const categoryTransactions = transactions.filter(
      (t) =>
        t.categoryId === categoryId &&
        t.date >= monthStart &&
        t.date <= monthEnd
    );

    return categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
  };

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
    const IconComp = (Icons as unknown as Record<string, React.ElementType>)[name] || Icons.Wallet;
    return <IconComp className={className} />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kategori</h1>
          <p className="text-muted-foreground">
            Kelola kategori pemasukan dan pengeluaran
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kategori
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Tipe Kategori</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={formData.type === 'income' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                    className="flex-1"
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Pemasukan
                  </Button>
                  <Button
                    type="button"
                    variant={formData.type === 'expense' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                    className="flex-1"
                  >
                    <TrendingDown className="mr-2 h-4 w-4" />
                    Pengeluaran
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nama Kategori</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Contoh: Makanan, Transport"
                />
              </div>

              <div className="space-y-2">
                <Label>Ikon</Label>
                <div className="grid grid-cols-5 gap-2">
                  {availableIcons.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                        formData.icon === icon
                          ? 'ring-2 ring-primary bg-primary/10'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <DynamicIcon name={icon} className="h-5 w-5" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Warna</Label>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full transition-all ${
                        formData.color === color
                          ? 'ring-2 ring-offset-2 ring-primary'
                          : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'expense' ? 'default' : 'outline'}
          onClick={() => setActiveTab('expense')}
        >
          <TrendingDown className="mr-2 h-4 w-4" />
          Pengeluaran
        </Button>
        <Button
          variant={activeTab === 'income' ? 'default' : 'outline'}
          onClick={() => setActiveTab('income')}
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Pemasukan
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((category) => {
          const totalSpent = getCategoryStats(category.id);
          const DynamicCatIcon = (Icons as unknown as Record<string, React.ElementType>)[category.icon] || Icons.Wallet;

          return (
            <Card key={category.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <DynamicCatIcon
                        className="h-5 w-5"
                        style={{ color: category.color }}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base">{category.name}</CardTitle>
                      <p className="text-xs text-muted-foreground capitalize">
                        {category.type}
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
                      <DropdownMenuItem onClick={() => handleEdit(category)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteCategory(category.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {formatCurrency(totalSpent)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Bulan ini
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
