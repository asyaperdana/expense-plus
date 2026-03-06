import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTransactionStore } from "@/stores/transactionStore";
import { getShortMonthName, formatCurrency } from "@/lib/utils";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  isWithinInterval,
} from "date-fns";

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm">
            <span
              className="inline-block w-3 h-3 rounded-full mr-2"
              style={{
                backgroundColor:
                  entry.dataKey === "income" ? "#10b981" : "#ef4444",
              }}
            />
            {entry.dataKey === "income" ? "Pemasukan" : "Pengeluaran"}:{" "}
            {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function MonthlyTrendChart() {
  const transactions = useTransactionStore((state) => state.transactions);

  const data = useMemo(() => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const monthTransactions = transactions.filter((t) =>
        isWithinInterval(t.date, { start: monthStart, end: monthEnd }),
      );

      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      months.push({
        name: getShortMonthName(date.getMonth()),
        income,
        expense,
      });
    }

    return months;
  }, [transactions]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#e2e8f0"
        />
        <XAxis
          dataKey="name"
          tick={{ fill: "#64748b", fontSize: 13, fontWeight: 500 }}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `Rp${(value / 1000000).toFixed(0)}M`}
          dx={-10}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "rgba(241, 245, 249, 0.4)" }}
        />
        <Legend
          verticalAlign="top"
          height={36}
          iconType="circle"
          formatter={(value: string) => (
            <span className="text-sm font-medium text-slate-600">
              {value === "income" ? "Pemasukan" : "Pengeluaran"}
            </span>
          )}
        />
        <Bar dataKey="income" fill="url(#colorIncome)" radius={[6, 6, 0, 0]} />
        <Bar
          dataKey="expense"
          fill="url(#colorExpense)"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
