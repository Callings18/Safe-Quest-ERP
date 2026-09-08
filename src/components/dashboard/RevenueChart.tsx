import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatZMW, formatZMWAxis } from "@/lib/currency";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function RevenueChart() {
  const { data } = useQuery({
    queryKey: ["revenue_chart"],
    queryFn: async () => {
      const year = new Date().getFullYear();
      const [{ data: invoices }, { data: expenses }] = await Promise.all([
        supabase.from("invoices").select("total, amount_paid, issue_date, status"),
        supabase.from("expenses").select("total, expense_date, status"),
      ]);
      const rows = MONTHS.map((month, i) => ({ month, revenue: 0, expenses: 0 }));
      invoices?.forEach((inv) => {
        if (!inv.issue_date || inv.status === "cancelled" || inv.status === "draft") return;
        const d = new Date(inv.issue_date);
        if (d.getFullYear() !== year) return;
        rows[d.getMonth()].revenue += Number(inv.amount_paid) || 0;
      });
      expenses?.forEach((exp) => {
        if (!exp.expense_date || exp.status === "rejected") return;
        const d = new Date(exp.expense_date);
        if (d.getFullYear() !== year) return;
        rows[d.getMonth()].expenses += Number(exp.total) || 0;
      });
      return rows;
    },
  });

  const chartData = data || MONTHS.map((month) => ({ month, revenue: 0, expenses: 0 }));

  return (
    <Card className="col-span-2 animate-slide-up" style={{ animationDelay: "100ms" }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Collected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-muted-foreground/30" />
              <span className="text-muted-foreground">Expenses</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(value) => formatZMWAxis(value)} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [formatZMW(value), ""]}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorRevenue)" />
              <Area type="monotone" dataKey="expenses" stroke="hsl(var(--muted-foreground))" strokeWidth={2} fill="url(#colorExpenses)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
