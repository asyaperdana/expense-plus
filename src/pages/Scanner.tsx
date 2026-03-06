import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTransactionStore } from '@/stores/transactionStore';
import { useWalletStore } from '@/stores/walletStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { Camera, Upload, X, Check, RotateCcw } from 'lucide-react';
import { formatCurrency, readFileAsDataURL } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// Simulated OCR result
interface OCRResult {
  merchant?: string;
  amount?: number;
  date?: Date;
  items?: string[];
}

export function Scanner() {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [formData, setFormData] = useState({
    amount: 0,
    categoryId: '',
    walletId: '',
    note: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const updateBalance = useWalletStore((state) => state.updateBalance);
  const wallets = useWalletStore((state) => state.wallets);
  const categories = useCategoryStore((state) => state.categories);
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataURL(file);
      setImage(dataUrl);
      processImage(dataUrl);
    } catch (error) {
      toast.error('Gagal membaca gambar');
    }
  }, []);

  const processImage = useCallback((_imageData: string) => {
    setIsProcessing(true);

    // Simulate OCR processing
    setTimeout(() => {
      // Generate random but realistic receipt data
      const mockResult: OCRResult = {
        merchant: ['Indomaret', 'Alfamart', 'Superindo', 'Hypermart', 'Starbucks'][Math.floor(Math.random() * 5)],
        amount: Math.floor(Math.random() * 500000) + 50000,
        date: new Date(),
        items: ['Item 1', 'Item 2', 'Item 3'],
      };

      setOcrResult(mockResult);
      setFormData((prev) => ({
        ...prev,
        amount: mockResult.amount || 0,
        note: `Pembelian di ${mockResult.merchant}`,
      }));
      setIsProcessing(false);
      toast.success('Struk berhasil dipindai');
    }, 2000);
  }, []);

  const handleSubmit = () => {
    if (!formData.amount || !formData.categoryId || !formData.walletId) {
      toast.error('Mohon lengkapi semua field');
      return;
    }

    addTransaction({
      amount: formData.amount,
      type: 'expense',
      categoryId: formData.categoryId,
      walletId: formData.walletId,
      date: new Date(),
      note: formData.note,
      receiptImage: image || undefined,
    });

    updateBalance(formData.walletId, -formData.amount);

    toast.success('Transaksi berhasil ditambahkan');
    resetForm();
  };

  const resetForm = () => {
    setImage(null);
    setOcrResult(null);
    setFormData({
      amount: 0,
      categoryId: '',
      walletId: '',
      note: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Scan Struk</h1>
        <p className="text-muted-foreground">
          Pindai struk belanja untuk menambahkan transaksi otomatis
        </p>
      </div>

      {/* Upload Area */}
      {!image && (
        <Card>
          <CardContent className="p-8">
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload atau Ambil Foto</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Seret dan lepas file atau klik untuk memilih
              </p>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Pilih File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview and Form */}
      {image && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Image Preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Preview</CardTitle>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <img
                src={image}
                alt="Receipt"
                className="w-full rounded-lg object-contain max-h-[400px]"
              />
              {isProcessing && (
                <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  <span>Memproses struk...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detail Transaksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ocrResult && (
                <div className="p-4 rounded-lg bg-primary/5 space-y-2">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Merchant:</span>{' '}
                    <span className="font-medium">{ocrResult.merchant}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Total Terdeteksi:</span>{' '}
                    <span className="font-medium">
                      {formatCurrency(ocrResult.amount || 0)}
                    </span>
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Jumlah</Label>
                <Input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: Number(e.target.value) })
                  }
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
                    {expenseCategories.map((category) => (
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

              <div className="flex gap-2">
                <Button onClick={handleSubmit} className="flex-1">
                  <Check className="mr-2 h-4 w-4" />
                  Simpan
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Ulangi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tips Scanning</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Pastikan struk terlihat jelas dan tidak buram</li>
            <li>• Pencahayaan yang cukup akan meningkatkan akurasi</li>
            <li>• Posisikan struk agar seluruh teks terlihat</li>
            <li>• Hindari bayangan atau pantulan cahaya</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
