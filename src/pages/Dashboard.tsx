import { SummaryCards } from "@/components/SummaryCards";
import { ExpenseChart } from "@/components/charts/ExpenseChart";
import { MonthlyTrendChart } from "@/components/charts/MonthlyTrendChart";
import { RecentTransactions } from "@/components/RecentTransactions";
import { BudgetOverview } from "@/components/BudgetOverview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Ringkasan kondisi kesehatan keuangan Anda saat ini.
          </p>
        </div>
        <Button
          onClick={() => navigate("/transactions")}
          className="w-full sm:w-auto rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-1"
        >
          <Plus className="mr-2 h-5 w-5" />
          Tambah Transaksi Baru
        </Button>
      </div>

      {/* Summary Cards */}
      <SummaryCards />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2 mt-8">
        <Card className="premium-card p-2">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <CardTitle className="text-xl font-bold">
              Pengeluaran per Kategori
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/analytics")}
              className="text-primary hover:bg-primary/10 rounded-xl"
            >
              Lihat Detail
              <ArrowRight className="ml-2 h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <ExpenseChart />
          </CardContent>
        </Card>

        <Card className="premium-card p-2">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <CardTitle className="text-xl font-bold">Tren Bulanan</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/analytics")}
              className="text-primary hover:bg-primary/10 rounded-xl"
            >
              Lihat Detail
              <ArrowRight className="ml-2 h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <MonthlyTrendChart />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentTransactions />
        <BudgetOverview />
      </div>
    </div>
  );
}
