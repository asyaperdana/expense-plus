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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTransactionStore } from '@/stores/transactionStore';
import { useWalletStore } from '@/stores/walletStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useTemplateStore } from '@/stores/templateStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

export function Transactions() {
  const transactions = useTransactionStore((state) => state.transactions);
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const updateTransaction = useTransactionStore((state) => state.updateTransaction);
  const deleteTransaction = useTransactionStore((state) => state.deleteTransaction);
  const wallets = useWalletStore((state) => state.wallets);
  const categories = useCategoryStore((state) => state.categories);
  const templates = useTemplateStore((state) => state.templates);
  const updateBalance = useWalletStore((state) => state.updateBalance);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [formData, setFormData] = useState({
    amount: 0,
    type: 'expense' as 'income' | 'expense',
    categoryId: '',
    walletId: '',
    date: new Date(),
    note: '',
  });

  const handleSubmit = () => {
    const amountChange = formData.type === 'income' ? formData.amount : -formData.amount;
    
    if (editingTransaction) {
      const oldTransaction = transactions.find((t) => t.id === editingTransaction);
      if (oldTransaction) {
        const oldAmountChange = oldTransaction.type === 'income' ? -oldTransaction.amount : oldTransaction.amount;
        updateBalance(formData.walletId, amountChange + oldAmountChange);
      }
      updateTransaction(editingTransaction, formData);
      setEditingTransaction(null);
    } else {
      addTransaction(formData);
      updateBalance(formData.walletId, amountChange);
    }
    setIsAddDialogOpen(false);
    setFormData({
      amount: 0,
      type: 'expense',
      categoryId: '',
      walletId: '',
      date: new Date(),
      note: '',
    });
  };

  const handleEdit = (transaction: typeof transactions[0]) => {
    setFormData({
      amount: transaction.amount,
      type: transaction.type,
      categoryId: transaction.categoryId,
      walletId: transaction.walletId,
      date: transaction.date,
      note: transaction.note,
    });
    setEditingTransaction(transaction.id);
    setIsAddDialogOpen(true);
  };

  const applyTemplate = (template: typeof templates[0]) => {
    setFormData({
      amount: template.amount,
      type: template.type,
      categoryId: template.categoryId,
      walletId: template.walletId,
      date: new Date(),
      note: template.note,
    });
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categories.find((c) => c.id === transaction.categoryId)?.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesType;
  });

  const filteredCategories = categories.filter((c) => c.type === formData.type);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transaksi</h1>
          <p className="text-muted-foreground">
            Kelola pemasukan dan pengeluaran Anda
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Transaksi
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Template Selection */}
              {!editingTransaction && templates.length > 0 && (
                <div className="space-y-2">
                  <Label>Pilih dari Template</Label>
                  <div className="flex flex-wrap gap-2">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => applyTemplate(template)}
                        className="px-3 py-1.5 text-xs rounded-full bg-muted hover:bg-muted/80 transition-colors"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Tipe Transaksi</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={formData.type === 'income' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                    className="flex-1"
                  >
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Pemasukan
                  </Button>
                  <Button
                    type="button"
                    variant={formData.type === 'expense' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                    className="flex-1"
                  >
                    <ArrowDownRight className="mr-2 h-4 w-4" />
                    Pengeluaran
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Jumlah</Label>
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
                <Label>Kategori</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Wallet</Label>
                <Select
                  value={formData.walletId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, walletId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name} ({formatCurrency(wallet.balance)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? (
                        format(formData.date, 'PPP', { locale: id })
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) =>
                        date && setFormData({ ...formData, date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Catatan</Label>
                <Input
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  placeholder="Tambahkan catatan (opsional)"
                />
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingTransaction ? 'Simpan Perubahan' : 'Tambah Transaksi'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari transaksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
            size="sm"
          >
            <Filter className="mr-2 h-4 w-4" />
            Semua
          </Button>
          <Button
            variant={filterType === 'income' ? 'default' : 'outline'}
            onClick={() => setFilterType('income')}
            size="sm"
          >
            Pemasukan
          </Button>
          <Button
            variant={filterType === 'expense' ? 'default' : 'outline'}
            onClick={() => setFilterType('expense')}
            size="sm"
          >
            Pengeluaran
          </Button>
        </div>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  Belum ada transaksi
                </p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => {
                const category = categories.find((c) => c.id === transaction.categoryId);
                const wallet = wallets.find((w) => w.id === transaction.walletId);
                const isIncome = transaction.type === 'income';

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
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
                        <p className="text-sm text-muted-foreground">
                          {wallet?.name} • {formatDate(transaction.date)}
                        </p>
                        {transaction.note && (
                          <p className="text-sm text-muted-foreground">
                            {transaction.note}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p
                        className={`font-semibold ${
                          isIncome ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteTransaction(transaction.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
