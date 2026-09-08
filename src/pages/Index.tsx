import { AppLayout } from "@/components/layout/AppLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { useInvoiceStats } from "@/hooks/useInvoices";
import { useLoanStats } from "@/hooks/useLoans";
import { useProjectStats } from "@/hooks/useProjects";
import { useComplianceStats } from "@/hooks/useCompliance";
import { useLeadStats } from "@/hooks/useCRM";
import { useAuth } from "@/contexts/AuthContext";
import { Wallet, FileText, Users, Landmark, AlertTriangle, Package, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { formatZMW } from "@/lib/currency";

export default function Index() {
  const { user } = useAuth();
  const { data: invoiceStats } = useInvoiceStats();
  const { data: loanStats } = useLoanStats();
  const { data: projectStats } = useProjectStats();
  const { data: complianceStats } = useComplianceStats();
  const { data: leadStats } = useLeadStats();

  const kpis = [
    {
      title: "Total Invoiced",
      value: formatZMW(invoiceStats?.totalInvoiced),
      change: 0,
      changeLabel: "this period",
      icon: <Wallet className="h-5 w-5" />,
      iconBgClass: "bg-primary/10 text-primary",
    },
    {
      title: "Outstanding Invoices",
      value: formatZMW(invoiceStats?.outstanding),
      change: 0,
      changeLabel: "pending collection",
      icon: <FileText className="h-5 w-5" />,
      iconBgClass: "bg-warning/10 text-warning",
    },
    {
      title: "Active Projects",
      value: `${projectStats?.active || 0}`,
      change: 0,
      changeLabel: "in progress",
      icon: <Users className="h-5 w-5" />,
      iconBgClass: "bg-info/10 text-info",
    },
    {
      title: "Loan Portfolio",
      value: formatZMW(loanStats?.outstanding),
      change: 0,
      changeLabel: "outstanding",
      icon: <Landmark className="h-5 w-5" />,
      iconBgClass: "bg-success/10 text-success",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back{user?.email ? `, ${user.email}` : ""}. Here's what's happening.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>{new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi, index) => (
            <KPICard key={kpi.title} {...kpi} delay={index * 50} />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <RevenueChart />
          <Card className="animate-slide-up" style={{ animationDelay: "300ms" }}>
            <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Link to="/crm"><Button variant="outline" className="w-full justify-start">Add New Lead</Button></Link>
              <Link to="/invoicing"><Button variant="outline" className="w-full justify-start">Create Invoice</Button></Link>
              <Link to="/loans"><Button variant="outline" className="w-full justify-start">New Loan Application</Button></Link>
              <Link to="/projects"><Button variant="outline" className="w-full justify-start">Start Project</Button></Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="animate-slide-up" style={{ animationDelay: "350ms" }}>
            <CardHeader><CardTitle className="text-lg">Sales Pipeline</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">New Leads</span><span className="font-semibold">{leadStats?.new || 0}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Qualified</span><span className="font-semibold">{leadStats?.qualified || 0}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Proposals</span><span className="font-semibold">{leadStats?.proposal || 0}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Won</span><span className="font-semibold text-success">{leadStats?.won || 0}</span></div>
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="text-sm font-medium">Pipeline Value</span>
                <span className="font-bold text-primary">{formatZMW(leadStats?.totalValue)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: "400ms" }}>
            <CardHeader><CardTitle className="text-lg">Loan Portfolio</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Active Loans</span><span className="font-semibold">{loanStats?.activeLoans || 0}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Disbursed</span><span className="font-semibold">{formatZMW(loanStats?.totalDisbursed)}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Collected</span><span className="font-semibold text-success">{formatZMW(loanStats?.collected)}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">In Arrears</span><span className="font-semibold text-destructive">{formatZMW(loanStats?.arrears)}</span></div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {(complianceStats?.expiringSoon || 0) > 0 && (
              <div className="p-4 rounded-xl border border-warning/30 bg-warning/5 animate-slide-up" style={{ animationDelay: "450ms" }}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-warning/10"><AlertTriangle className="h-5 w-5 text-warning" /></div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">Compliance Alerts</h4>
                    <p className="text-sm text-muted-foreground mt-1">{complianceStats?.expiringSoon || 0} documents expiring within 30 days.</p>
                    <Link to="/compliance" className="text-sm text-primary font-medium mt-2 hover:underline inline-block">View details →</Link>
                  </div>
                </div>
              </div>
            )}
            {(complianceStats?.expired || 0) > 0 && (
              <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 animate-slide-up" style={{ animationDelay: "500ms" }}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10"><Package className="h-5 w-5 text-destructive" /></div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">Expired Documents</h4>
                    <p className="text-sm text-muted-foreground mt-1">{complianceStats?.expired || 0} expired documents require immediate attention.</p>
                    <Link to="/compliance" className="text-sm text-primary font-medium mt-2 hover:underline inline-block">View expired →</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
