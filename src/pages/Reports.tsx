import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInvoiceStats } from "@/hooks/useInvoices";
import { useLoanStats } from "@/hooks/useLoans";
import { useProjectStats } from "@/hooks/useProjects";
import { useEmployeeStats } from "@/hooks/useHR";
import { useProcurementStats } from "@/hooks/useProcurement";
import { useAssetStats } from "@/hooks/useAssets";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Wallet, Users, FolderKanban, Landmark, Truck, ShoppingCart } from "lucide-react";
import { formatZMW, formatZMWAxis } from "@/lib/currency";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function Reports() {
  const { data: invoiceStats } = useInvoiceStats();
  const { data: loanStats } = useLoanStats();
  const { data: projectStats } = useProjectStats();
  const { data: employeeStats } = useEmployeeStats();
  const { data: procurementStats } = useProcurementStats();
  const { data: assetStats } = useAssetStats();

  const revenueData = [
    { name: "Invoiced", value: invoiceStats?.totalInvoiced || 0 },
    { name: "Collected", value: invoiceStats?.paid || 0 },
    { name: "Outstanding", value: invoiceStats?.outstanding || 0 },
  ];

  const projectData = [
    { name: "Active", value: projectStats?.active || 0 },
    { name: "Completed", value: projectStats?.completed || 0 },
    { name: "Construction", value: projectStats?.construction || 0 },
    { name: "Solar", value: projectStats?.solar || 0 },
  ];

  const loanData = [
    { name: "Disbursed", value: loanStats?.totalDisbursed || 0 },
    { name: "Outstanding", value: loanStats?.outstanding || 0 },
    { name: "Collected", value: loanStats?.collected || 0 },
  ];

  const overviewCards = [
    { title: "Total Revenue", value: formatZMW(invoiceStats?.totalInvoiced || 0), icon: Wallet, color: "text-primary" },
    { title: "Active Projects", value: projectStats?.active || 0, icon: FolderKanban, color: "text-info" },
    { title: "Loan Portfolio", value: formatZMW(loanStats?.outstanding || 0), icon: Landmark, color: "text-warning" },
    { title: "Employees", value: employeeStats?.active || 0, icon: Users, color: "text-success" },
    { title: "Asset Value", value: formatZMW(assetStats?.totalAssetValue || 0), icon: Truck, color: "text-destructive" },
    { title: "Procurement Spend", value: formatZMW(procurementStats?.totalSpend || 0), icon: ShoppingCart, color: "text-primary" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Business intelligence and performance metrics</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {overviewCards.map(c => (
            <Card key={c.title}>
              <CardContent className="p-4 text-center">
                <c.icon className={`h-6 w-6 mx-auto mb-2 ${c.color}`} />
                <p className="text-lg font-bold">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="financial">
          <TabsList>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="loans">Loans</TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Revenue Overview</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={v => formatZMWAxis(v)} />
                    <Tooltip formatter={(v: number) => formatZMW(v)} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Project Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={projectData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {projectData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loans" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Loan Portfolio</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={loanData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={v => formatZMWAxis(v)} />
                    <Tooltip formatter={(v: number) => formatZMW(v)} />
                    <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
