import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactionStore } from "@/stores/transactionStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { useWalletStore } from "@/stores/walletStore";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export function RecentTransactions() {
  const transactions = useTransactionStore((state) => state.transactions);
  const categories = useCategoryStore((state) => state.categories);
  const wallets = useWalletStore((state) => state.wallets);

  const recentTransactions = transactions.slice(0, 10);

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Transaksi Terbaru</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        <ScrollArea className="h-[400px] px-4">
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <ArrowUpRight className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium tracking-tight">
                  Belum ada transaksi
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Mulai catat transaksi pertamamu
                </p>
              </div>
            ) : (
              recentTransactions.map((transaction) => {
                const category = categories.find(
                  (c) => c.id === transaction.categoryId,
                );
                const wallet = wallets.find(
                  (w) => w.id === transaction.walletId,
                );
                const isIncome = transaction.type === "income";

                return (
                  <div
                    key={transaction.id}
                    className="group flex flex-row items-center justify-between p-3 rounded-2xl border border-transparent bg-slate-50/50 hover:bg-white hover:border-slate-100 hover:shadow-sm transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 ${
                          isIncome
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {isIncome ? (
                          <ArrowUpRight className="h-6 w-6 text-emerald-500" />
                        ) : (
                          <ArrowDownRight className="h-6 w-6 text-rose-500" />
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                          {category?.name || "Lainnya"}
                        </p>
                        <div className="flex items-center text-xs text-slate-500">
                          <span className="font-medium mr-1">
                            {wallet?.name}
                          </span>
                          <span className="mx-1">•</span>
                          <span>{formatRelativeDate(transaction.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold text-sm sm:text-base ${
                          isIncome ? "text-emerald-600" : "text-slate-900"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      {transaction.note && (
                        <p className="text-xs text-slate-400 truncate max-w-[100px] inline-block sm:max-w-[150px]">
                          {transaction.note}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
