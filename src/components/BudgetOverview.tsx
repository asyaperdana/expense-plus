import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useBudgetStore } from "@/stores/budgetStore";
import { useTransactionStore } from "@/stores/transactionStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { formatCurrency } from "@/lib/utils";
import { startOfMonth, endOfMonth } from "date-fns";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function BudgetOverview() {
  const budgets = useBudgetStore((state) => state.budgets);
  const transactions = useTransactionStore((state) => state.transactions);
  const categories = useCategoryStore((state) => state.categories);

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const activeBudgets = budgets.filter(
    (b) => !b.endDate || b.endDate >= monthStart,
  );

  const budgetData = activeBudgets.map((budget) => {
    const spent = transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          t.date >= monthStart &&
          t.date <= monthEnd &&
          (budget.categoryId ? t.categoryId === budget.categoryId : true),
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const percentage = Math.min((spent / budget.amount) * 100, 100);
    const isOverBudget = spent > budget.amount;
    const isNearLimit = percentage >= budget.alertThreshold;

    const category = budget.categoryId
      ? categories.find((c) => c.id === budget.categoryId)
      : null;

    return {
      ...budget,
      spent,
      percentage,
      isOverBudget,
      isNearLimit,
      categoryName: category?.name || "Total Budget",
    };
  });

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Ringkasan Budget</CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <div className="space-y-6">
          {budgetData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium tracking-tight">
                Belum ada budget
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Buat budget untuk mengontrol pengeluaran
              </p>
            </div>
          ) : (
            budgetData.map((budget) => (
              <div key={budget.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {budget.categoryName}
                    </span>
                    {budget.isOverBudget && (
                      <AlertCircle className="h-4 w-4 text-rose-500" />
                    )}
                    {!budget.isOverBudget && budget.isNearLimit && (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                    {!budget.isOverBudget && !budget.isNearLimit && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-500">
                    <span
                      className={
                        budget.isOverBudget ? "text-rose-600" : "text-slate-900"
                      }
                    >
                      {formatCurrency(budget.spent)}
                    </span>{" "}
                    <span className="text-slate-400 font-normal">
                      / {formatCurrency(budget.amount)}
                    </span>
                  </span>
                </div>
                <Progress
                  value={budget.percentage}
                  className="h-2.5 transition-all w-full bg-slate-100 [&>div]:bg-primary"
                />
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>
                    {budget.percentage.toFixed(0)}%{" "}
                    <span className="font-normal text-slate-400">
                      digunakan
                    </span>
                  </span>
                  <span
                    className={
                      budget.isOverBudget ? "text-rose-600" : "text-emerald-600"
                    }
                  >
                    Sisa:{" "}
                    {formatCurrency(Math.max(budget.amount - budget.spent, 0))}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
