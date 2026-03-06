import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useTransactionStore } from "@/stores/transactionStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { startOfMonth, endOfMonth } from "date-fns";
import { formatCurrency } from "@/lib/utils";

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { color: string };
  }>;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export function ExpenseChart() {
  const transactions = useTransactionStore((state) => state.transactions);
  const categories = useCategoryStore((state) => state.categories);

  const data = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const expenseTransactions = transactions.filter(
      (t) => t.type === "expense" && t.date >= monthStart && t.date <= monthEnd,
    );

    const categoryTotals = expenseTransactions.reduce(
      (acc, transaction) => {
        const category = categories.find(
          (c) => c.id === transaction.categoryId,
        );
        if (category) {
          acc[category.name] = (acc[category.name] || 0) + transaction.amount;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(categoryTotals)
      .map(([name, value]) => {
        const category = categories.find((c) => c.name === name);
        return {
          name,
          value,
          color: category?.color || "#6b7280",
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [transactions, categories]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col h-[300px] items-center justify-center text-center">
        <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-slate-500 font-medium tracking-tight">
          Belum ada pengeluaran
        </p>
        <p className="text-slate-400 text-sm mt-1">Data akan muncul di sini</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          formatter={(value: string) => (
            <span className="text-sm font-medium text-slate-600 ml-1">
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
