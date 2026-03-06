import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWalletStore } from '@/stores/walletStore';
import { formatCurrency } from '@/lib/utils';
import { 
  Plus, 
  Wallet, 
  Building2, 
  CreditCard, 
  MoreVertical, 
  Edit2, 
  Trash2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTransactionStore } from '@/stores/transactionStore';
import { startOfMonth, endOfMonth } from 'date-fns';

const walletIcons: Record<string, React.ElementType> = {
  cash: Wallet,
  bank: Building2,
  ewallet: CreditCard,
};

export function Wallets() {
  const wallets = useWalletStore((state) => state.wallets);
  const addWallet = useWalletStore((state) => state.addWallet);
  const updateWallet = useWalletStore((state) => state.updateWallet);
  const deleteWallet = useWalletStore((state) => state.deleteWallet);
  const transactions = useTransactionStore((state) => state.transactions);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'cash' as 'cash' | 'bank' | 'ewallet',
    balance: 0,
    color: '#10b981',
  });

  const handleSubmit = () => {
    if (editingWallet) {
      updateWallet(editingWallet, formData);
      setEditingWallet(null);
    } else {
      addWallet({
        ...formData,
        currency: 'IDR',
        icon: 'Wallet',
      });
    }
    setIsAddDialogOpen(false);
    setFormData({ name: '', type: 'cash', balance: 0, color: '#10b981' });
  };

  const handleEdit = (wallet: typeof wallets[0]) => {
    setFormData({
      name: wallet.name,
      type: wallet.type,
      balance: wallet.balance,
      color: wallet.color,
    });
    setEditingWallet(wallet.id);
    setIsAddDialogOpen(true);
  };

  const getWalletStats = (walletId: string) => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const walletTransactions = transactions.filter(
      (t) => t.walletId === walletId && t.date >= monthStart && t.date <= monthEnd
    );

    const income = walletTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = walletTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense };
  };

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">
            Kelola sumber dana Anda
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Wallet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingWallet ? 'Edit Wallet' : 'Tambah Wallet Baru'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nama Wallet</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Cash, Bank BCA"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipe</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'cash' | 'bank' | 'ewallet') =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="ewallet">E-Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Saldo Awal</Label>
                <Input
                  type="number"
                  value={formData.balance}
                  onChange={(e) =>
                    setFormData({ ...formData, balance: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Warna</Label>
                <div className="flex gap-2">
                  {['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'].map(
                    (color) => (
                      <button
                        key={color}
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-full transition-all ${
                          formData.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    )
                  )}
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingWallet ? 'Simpan Perubahan' : 'Tambah Wallet'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Total Balance Card */}
      <Card className="bg-gradient-to-r from-primary to-primary/80">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-foreground/80 text-sm">Total Saldo</p>
              <p className="text-3xl font-bold text-primary-foreground mt-1">
                {formatCurrency(totalBalance)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wallets.map((wallet) => {
          const Icon = walletIcons[wallet.type] || Wallet;
          const stats = getWalletStats(wallet.id);

          return (
            <Card key={wallet.id} className="group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${wallet.color}20` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: wallet.color }} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{wallet.name}</CardTitle>
                      <p className="text-xs text-muted-foreground capitalize">
                        {wallet.type}
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
                      <DropdownMenuItem onClick={() => handleEdit(wallet)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteWallet(wallet.id)}
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
                <p className="text-2xl font-bold">{formatCurrency(wallet.balance)}</p>
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-emerald-500">
                    <TrendingUp className="h-4 w-4" />
                    <span>+{formatCurrency(stats.income)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-rose-500">
                    <TrendingDown className="h-4 w-4" />
                    <span>-{formatCurrency(stats.expense)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
