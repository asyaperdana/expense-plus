import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useWalletStore } from '@/stores/walletStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useTemplateStore } from '@/stores/templateStore';
import { useLedgerStore } from '@/stores/ledgerStore';
import { Sun, Moon, Laptop, Upload, Trash2, FileJson, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { downloadFile, readFileAsText } from '@/lib/utils';

export function Settings() {
  const {
    theme,
    setTheme,
    notifications,
    toggleNotifications,
    budgetAlerts,
    toggleBudgetAlerts,
  } = useSettingsStore();

  const transactions = useTransactionStore((state) => state.transactions);
  const wallets = useWalletStore((state) => state.wallets);
  const categories = useCategoryStore((state) => state.categories);
  const budgets = useBudgetStore((state) => state.budgets);
  const templates = useTemplateStore((state) => state.templates);
  const ledgers = useLedgerStore((state) => state.ledgers);

  const handleExportJSON = () => {
    const data = {
      transactions,
      wallets,
      categories,
      budgets,
      templates,
      ledgers,
      exportedAt: new Date().toISOString(),
    };
    downloadFile(
      JSON.stringify(data, null, 2),
      `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`,
      'application/json'
    );
    toast.success('Data berhasil diekspor');
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Wallet', 'Amount', 'Note'];
    const rows = transactions.map((t) => [
      t.date.toISOString(),
      t.type,
      categories.find((c) => c.id === t.categoryId)?.name || '',
      wallets.find((w) => w.id === t.walletId)?.name || '',
      t.amount,
      t.note,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadFile(
      csv,
      `expense-tracker-transactions-${new Date().toISOString().split('T')[0]}.csv`,
      'text/csv'
    );
    toast.success('Data berhasil diekspor');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFileAsText(file);
      const data = JSON.parse(content);

      // Import data to stores
      if (data.transactions) {
        // Reset and import transactions
        useTransactionStore.setState({ transactions: data.transactions });
      }
      if (data.wallets) {
        useWalletStore.setState({ wallets: data.wallets });
      }
      if (data.categories) {
        useCategoryStore.setState({ categories: data.categories });
      }
      if (data.budgets) {
        useBudgetStore.setState({ budgets: data.budgets });
      }
      if (data.templates) {
        useTemplateStore.setState({ templates: data.templates });
      }
      if (data.ledgers) {
        useLedgerStore.setState({ ledgers: data.ledgers });
      }

      toast.success('Data berhasil diimpor');
    } catch (error) {
      toast.error('Gagal mengimpor data');
    }
  };

  const handleClearData = () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.')) {
      useTransactionStore.setState({ transactions: [] });
      useWalletStore.setState({ wallets: [] });
      useCategoryStore.setState({ categories: [] });
      useBudgetStore.setState({ budgets: [] });
      useTemplateStore.setState({ templates: [] });
      useLedgerStore.setState({ ledgers: [] });
      toast.success('Semua data telah dihapus');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">
          Atur preferensi aplikasi Anda
        </p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tampilan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Tema</Label>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className="flex-1"
              >
                <Sun className="mr-2 h-4 w-4" />
                Terang
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className="flex-1"
              >
                <Moon className="mr-2 h-4 w-4" />
                Gelap
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                onClick={() => setTheme('system')}
                className="flex-1"
              >
                <Laptop className="mr-2 h-4 w-4" />
                Sistem
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notifikasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifikasi Umum</Label>
              <p className="text-sm text-muted-foreground">
                Terima notifikasi tentang aktivitas aplikasi
              </p>
            </div>
            <Switch checked={notifications} onCheckedChange={toggleNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Peringatan Budget</Label>
              <p className="text-sm text-muted-foreground">
                Terima peringatan ketika mendekati batas budget
              </p>
            </div>
            <Switch checked={budgetAlerts} onCheckedChange={toggleBudgetAlerts} />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Manajemen Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Ekspor Data</Label>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportJSON} className="flex-1">
                <FileJson className="mr-2 h-4 w-4" />
                Ekspor JSON
              </Button>
              <Button variant="outline" onClick={handleExportCSV} className="flex-1">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Ekspor CSV
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Impor Data</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => document.getElementById('import-file')?.click()}
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                Pilih File JSON
              </Button>
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="space-y-2">
              <Label className="text-destructive">Zona Berbahaya</Label>
              <Button variant="destructive" onClick={handleClearData} className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus Semua Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tentang</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Versi:</span>{' '}
              <span className="font-medium">1.0.0</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Dibuat dengan:</span>{' '}
              <span className="font-medium">React + Vite + Tailwind CSS</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Expense Tracker adalah aplikasi manajemen keuangan pribadi yang membantu Anda melacak pengeluaran, mengelola budget, dan mencapai tujuan finansial.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
