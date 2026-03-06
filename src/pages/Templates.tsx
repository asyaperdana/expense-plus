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
import { useTemplateStore } from '@/stores/templateStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useWalletStore } from '@/stores/walletStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { Plus, MoreVertical, Edit2, Trash2, FileText, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function Templates() {
  const templates = useTemplateStore((state) => state.templates);
  const addTemplate = useTemplateStore((state) => state.addTemplate);
  const updateTemplate = useTemplateStore((state) => state.updateTemplate);
  const deleteTemplate = useTemplateStore((state) => state.deleteTemplate);
  const categories = useCategoryStore((state) => state.categories);
  const wallets = useWalletStore((state) => state.wallets);
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const updateBalance = useWalletStore((state) => state.updateBalance);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: 0,
    type: 'expense' as 'income' | 'expense',
    categoryId: '',
    walletId: '',
    note: '',
  });

  const handleSubmit = () => {
    if (editingTemplate) {
      updateTemplate(editingTemplate, formData);
      setEditingTemplate(null);
    } else {
      addTemplate(formData);
    }
    setIsAddDialogOpen(false);
    setFormData({
      name: '',
      amount: 0,
      type: 'expense',
      categoryId: '',
      walletId: '',
      note: '',
    });
  };

  const handleEdit = (template: typeof templates[0]) => {
    setFormData({
      name: template.name,
      amount: template.amount,
      type: template.type,
      categoryId: template.categoryId,
      walletId: template.walletId,
      note: template.note,
    });
    setEditingTemplate(template.id);
    setIsAddDialogOpen(true);
  };

  const handleQuickAdd = (template: typeof templates[0]) => {
    addTransaction({
      amount: template.amount,
      type: template.type,
      categoryId: template.categoryId,
      walletId: template.walletId,
      date: new Date(),
      note: template.note,
    });

    const amountChange = template.type === 'income' ? template.amount : -template.amount;
    updateBalance(template.walletId, amountChange);
  };

  const filteredCategories = categories.filter((c) => c.type === formData.type);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Template Transaksi</h1>
          <p className="text-muted-foreground">
            Buat template untuk transaksi rutin
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Template' : 'Tambah Template Baru'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nama Template</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Contoh: Gaji Bulanan, Tagihan Listrik"
                />
              </div>

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
                        {wallet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                {editingTemplate ? 'Simpan Perubahan' : 'Tambah Template'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          const category = categories.find((c) => c.id === template.categoryId);
          const wallet = wallets.find((w) => w.id === template.walletId);
          const isIncome = template.type === 'income';

          return (
            <Card key={template.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        isIncome ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                      }`}
                    >
                      <FileText
                        className={`h-5 w-5 ${
                          isIncome ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <p className="text-xs text-muted-foreground capitalize">
                        {template.type}
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
                      <DropdownMenuItem onClick={() => handleEdit(template)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteTemplate(template.id)}
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
                <div>
                  <p
                    className={`text-2xl font-bold ${
                      isIncome ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(template.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {category?.name} • {wallet?.name}
                  </p>
                </div>

                {template.note && (
                  <p className="text-sm text-muted-foreground truncate">
                    {template.note}
                  </p>
                )}

                <Button
                  onClick={() => handleQuickAdd(template)}
                  className="w-full"
                  variant="outline"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Tambah Cepat
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
