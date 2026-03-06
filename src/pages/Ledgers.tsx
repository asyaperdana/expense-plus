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
import { useLedgerStore } from '@/stores/ledgerStore';
import { formatCurrency, getInitials } from '@/lib/utils';
import {
  Plus,
  MoreVertical,
  Trash2,
  Users,
  ArrowRightLeft,
  UserPlus,
  Receipt,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function Ledgers() {
  const ledgers = useLedgerStore((state) => state.ledgers);
  const addLedger = useLedgerStore((state) => state.addLedger);
  const deleteLedger = useLedgerStore((state) => state.deleteLedger);
  const addMember = useLedgerStore((state) => state.addMember);
  const getMemberBalance = useLedgerStore((state) => state.getMemberBalance);
  const getSettlements = useLedgerStore((state) => state.getSettlements);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [ledgerForm, setLedgerForm] = useState({
    name: '',
    description: '',
  });

  const handleCreateLedger = () => {
    addLedger(ledgerForm);
    setIsAddDialogOpen(false);
    setLedgerForm({ name: '', description: '' });
  };

  const handleAddMember = (ledgerId: string) => {
    if (newMemberName.trim()) {
      addMember(ledgerId, { name: newMemberName.trim() });
      setNewMemberName('');
    }
  };

  const activeLedger = ledgers.find((l) => l.id === selectedLedger);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shared Ledger</h1>
          <p className="text-muted-foreground">
            Bagikan pengeluaran dengan teman dan keluarga
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Buat Ledger Baru
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Shared Ledger Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nama Ledger</Label>
                <Input
                  value={ledgerForm.name}
                  onChange={(e) =>
                    setLedgerForm({ ...ledgerForm, name: e.target.value })
                  }
                  placeholder="Contoh: Trip Bali, Rumah Bersama"
                />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi (Opsional)</Label>
                <Input
                  value={ledgerForm.description}
                  onChange={(e) =>
                    setLedgerForm({ ...ledgerForm, description: e.target.value })
                  }
                  placeholder="Deskripsi singkat"
                />
              </div>
              <Button onClick={handleCreateLedger} className="w-full">
                Buat Ledger
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Ledgers List */}
      {ledgers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              Belum ada shared ledger
            </p>
            <p className="text-sm text-muted-foreground">
              Buat ledger untuk mulai berbagi pengeluaran
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {ledgers.map((ledger) => (
            <Card
              key={ledger.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedLedger(ledger.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{ledger.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {ledger.members.length} anggota • {ledger.transactions.length} transaksi
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLedger(ledger.id);
                        }}
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
                <div className="flex -space-x-2">
                  {ledger.members.slice(0, 4).map((member) => (
                    <Avatar key={member.id} className="border-2 border-background">
                      <AvatarFallback className="text-xs bg-primary/10">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {ledger.members.length > 4 && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                      +{ledger.members.length - 4}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Ledger Detail Dialog */}
      <Dialog
        open={!!selectedLedger}
        onOpenChange={() => setSelectedLedger(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {activeLedger && (
            <>
              <DialogHeader>
                <DialogTitle>{activeLedger.name}</DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="members" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="members">Anggota</TabsTrigger>
                  <TabsTrigger value="transactions">Transaksi</TabsTrigger>
                  <TabsTrigger value="settlements">Settle</TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nama anggota baru"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                    />
                    <Button
                      onClick={() => handleAddMember(activeLedger.id)}
                      disabled={!newMemberName.trim()}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {activeLedger.members.map((member) => {
                      const balance = getMemberBalance(activeLedger.id, member.id);
                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{member.name}</span>
                          </div>
                          <Badge
                            variant={balance >= 0 ? 'default' : 'destructive'}
                          >
                            {balance >= 0 ? '+' : ''}
                            {formatCurrency(balance)}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="transactions" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Fitur transaksi akan segera hadir
                  </p>
                </TabsContent>

                <TabsContent value="settlements" className="space-y-4">
                  {getSettlements(activeLedger.id).length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Tidak ada settlement yang diperlukan
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {getSettlements(activeLedger.id).map((settlement, index) => {
                        const fromMember = activeLedger.members.find(
                          (m) => m.id === settlement.from
                        );
                        const toMember = activeLedger.members.find(
                          (m) => m.id === settlement.to
                        );
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{fromMember?.name}</span>
                              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{toMember?.name}</span>
                            </div>
                            <span className="font-semibold">
                              {formatCurrency(settlement.amount)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
