import { TrendingUp, TrendingDown, Wallet, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWalletStore } from "@/stores/walletStore";
import { useTransactionStore } from "@/stores/transactionStore";
import { formatCurrency } from "@/lib/utils";
import { startOfMonth, endOfMonth } from "date-fns";

export function SummaryCards() {
  const wallets = useWalletStore((state) => state.wallets);
  const { getIncomeByPeriod, getExpenseByPeriod } = useTransactionStore();

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const monthlyIncome = getIncomeByPeriod(monthStart, monthEnd);
  const monthlyExpense = getExpenseByPeriod(monthStart, monthEnd);

  const cards = [
    {
      title: "Total Balance",
      value: totalBalance,
      icon: Scale,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      trend: null,
    },
    {
      title: "Total Wallet",
      value: wallets.length,
      icon: Wallet,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      trend: null,
      isCount: true,
    },
    {
      title: "Pemasukan Bulan Ini",
      value: monthlyIncome,
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Pengeluaran Bulan Ini",
      value: monthlyExpense,
      icon: TrendingDown,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      trend: "-5%",
      trendUp: false,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={index}
            className="premium-card relative overflow-hidden p-2"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                {card.title}
              </CardTitle>
              <div className={`rounded-xl ${card.bgColor} p-3`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight">
                {card.isCount
                  ? card.value
                  : formatCurrency(card.value as number)}
              </div>
              {card.trend && (
                <p
                  className={`text-xs ${card.trendUp ? "text-emerald-500" : "text-rose-500"}`}
                >
                  {card.trend} dari bulan lalu
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
