import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInvoiceStats } from "@/hooks/useInvoices";
import { useLoanStats } from "@/hooks/useLoans";
import { useProjectStats } from "@/hooks/useProjects";
import { useEmployeeStats } from "@/hooks/useHR";
import { useProcurementStats } from "@/hooks/useProcurement";
import { useAssetStats } from "@/hooks/useAssets";
import { useAgedReceivables, useVatSummary } from "@/hooks/useAccounting";
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
  const { data: aged } = useAgedReceivables();
  const { data: vat } = useVatSummary();

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

  const arBuckets = ["current", "1-30", "31-60", "61-90", "90+"].map((bucket) => ({
    name: bucket,
    value: (aged || []).filter((r: any) => r.bucket === bucket).reduce((s: number, r: any) => s + (Number(r.balance) || 0), 0),
  }));

  const vatData = [
    { name: "Output VAT", value: vat?.outputVat || 0 },
    { name: "Input VAT", value: vat?.inputVat || 0 },
    { name: "Net payable", value: Math.max(0, vat?.netVat || 0) },
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
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="receivables">Aged AR</TabsTrigger>
            <TabsTrigger value="vat">VAT</TabsTrigger>
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

          <TabsContent value="receivables" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Aged receivables by bucket</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={arBuckets}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={v => formatZMWAxis(v)} />
                    <Tooltip formatter={(v: number) => formatZMW(v)} />
                    <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Outstanding invoices</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Bucket</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(aged || []).map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.invoice_number}</TableCell>
                        <TableCell>{r.customer}</TableCell>
                        <TableCell>{r.due_date || r.issue_date}</TableCell>
                        <TableCell><Badge variant="outline">{r.bucket}</Badge></TableCell>
                        <TableCell className="text-right font-semibold">{formatZMW(r.balance)}</TableCell>
                      </TableRow>
                    ))}
                    {!aged?.length && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No outstanding invoices</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vat" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Output VAT (sales)</p>
                  <p className="text-2xl font-bold">{formatZMW(vat?.outputVat || 0)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Input VAT (purchases)</p>
                  <p className="text-2xl font-bold">{formatZMW(vat?.inputVat || 0)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Net payable to ZRA</p>
                  <p className="text-2xl font-bold">{formatZMW(vat?.netVat || 0)}</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader><CardTitle>VAT summary</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={vatData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={v => formatZMWAxis(v)} />
                    <Tooltip formatter={(v: number) => formatZMW(v)} />
                    <Bar dataKey="value" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-sm text-muted-foreground mt-3">
                  Output VAT from sent/paid tax invoices; input VAT from expenses. Remit using ZRA VAT bank in Settings → Tax.
                </p>
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
