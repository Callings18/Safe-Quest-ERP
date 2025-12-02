import { AppLayout } from "@/components/layout/AppLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { ProjectsOverview } from "@/components/dashboard/ProjectsOverview";
import {
  Wallet,
  FileText,
  Users,
  TrendingUp,
  Landmark,
  Package,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";

const kpis = [
  {
    title: "Total Revenue (YTD)",
    value: "K4.89M",
    change: 12.5,
    changeLabel: "vs last year",
    icon: <Wallet className="h-5 w-5" />,
    iconBgClass: "bg-primary/10 text-primary",
  },
  {
    title: "Outstanding Invoices",
    value: "K892K",
    change: -8.2,
    changeLabel: "vs last month",
    icon: <FileText className="h-5 w-5" />,
    iconBgClass: "bg-warning/10 text-warning",
  },
  {
    title: "Active Clients",
    value: "156",
    change: 5.3,
    changeLabel: "this quarter",
    icon: <Users className="h-5 w-5" />,
    iconBgClass: "bg-info/10 text-info",
  },
  {
    title: "Loan Portfolio",
    value: "K2.1M",
    change: 18.7,
    changeLabel: "growth",
    icon: <Landmark className="h-5 w-5" />,
    iconBgClass: "bg-success/10 text-success",
  },
];

export default function Index() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, John. Here's what's happening today.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>December 2, 2024</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi, index) => (
            <KPICard key={kpi.title} {...kpi} delay={index * 50} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <RevenueChart />
          <RecentActivity />
        </div>

        {/* Stats & Tasks Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <QuickStats />
          <UpcomingTasks />
          <div className="space-y-6">
            {/* Alert Card */}
            <div className="p-4 rounded-xl border border-warning/30 bg-warning/5 animate-slide-up" style={{ animationDelay: "450ms" }}>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">Compliance Alerts</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    3 documents expiring within 30 days. Review and renew to avoid penalties.
                  </p>
                  <button className="text-sm text-primary font-medium mt-2 hover:underline">
                    View details →
                  </button>
                </div>
              </div>
            </div>

            {/* Stock Alert */}
            <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 animate-slide-up" style={{ animationDelay: "500ms" }}>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Package className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">Low Stock Alert</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    5 items below reorder level. Create purchase orders to restock.
                  </p>
                  <button className="text-sm text-primary font-medium mt-2 hover:underline">
                    View inventory →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="grid gap-6 lg:grid-cols-3">
          <ProjectsOverview />
          <div className="space-y-6">
            {/* Payroll Summary */}
            <div className="kpi-card animate-slide-up" style={{ animationDelay: "550ms" }}>
              <h4 className="font-semibold text-sm mb-4">Payroll Summary (Nov)</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Gross Payroll</span>
                  <span className="font-semibold">K485,200</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">PAYE</span>
                  <span className="font-medium text-destructive">-K72,450</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">NAPSA</span>
                  <span className="font-medium text-destructive">-K24,260</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">NHIMA</span>
                  <span className="font-medium text-destructive">-K4,852</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="text-sm font-medium">Net Payroll</span>
                  <span className="font-bold text-success">K383,638</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
