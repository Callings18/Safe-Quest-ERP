import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Landmark,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Calendar,
  DollarSign,
} from "lucide-react";

const portfolioStats = {
  totalDisbursed: 2100000,
  outstanding: 1450000,
  collected: 650000,
  activeLoans: 28,
  arrears: 85000,
  parRate: 5.8,
};

const loans = [
  {
    id: 1,
    borrower: "Grace Mwila",
    phone: "+260 977 234 567",
    principal: 50000,
    outstanding: 35000,
    monthlyPayment: 5500,
    nextDue: "2024-12-05",
    status: "current",
    product: "Business Loan",
    term: "12 months",
    rate: 25,
  },
  {
    id: 2,
    borrower: "Charles Banda",
    phone: "+260 966 345 678",
    principal: 25000,
    outstanding: 22000,
    monthlyPayment: 2800,
    nextDue: "2024-12-01",
    status: "overdue",
    product: "Personal Loan",
    term: "12 months",
    rate: 30,
    daysOverdue: 5,
  },
  {
    id: 3,
    borrower: "Mary Chipimo",
    phone: "+260 955 456 789",
    principal: 100000,
    outstanding: 45000,
    monthlyPayment: 12000,
    nextDue: "2024-12-10",
    status: "current",
    product: "Solar Financing",
    term: "18 months",
    rate: 20,
  },
  {
    id: 4,
    borrower: "David Mulenga",
    phone: "+260 978 567 890",
    principal: 35000,
    outstanding: 0,
    monthlyPayment: 4200,
    nextDue: null,
    status: "completed",
    product: "Business Loan",
    term: "10 months",
    rate: 25,
  },
];

const applications = [
  {
    id: 1,
    applicant: "Peter Zimba",
    amount: 75000,
    purpose: "Solar panel installation",
    status: "pending",
    submittedDate: "2024-11-28",
  },
  {
    id: 2,
    applicant: "Sarah Tembo",
    amount: 40000,
    purpose: "Business expansion",
    status: "under-review",
    submittedDate: "2024-11-25",
  },
];

const statusConfig = {
  current: { color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  overdue: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
  completed: { color: "bg-muted text-muted-foreground border-border", icon: CheckCircle2 },
  pending: { color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  "under-review": { color: "bg-info/10 text-info border-info/20", icon: Clock },
};

export default function Loans() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Loans & Lending</h1>
            <p className="text-muted-foreground">
              Manage loan applications, disbursements, and collections
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Application
          </Button>
        </div>

        {/* Portfolio Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card className="animate-slide-up">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Disbursed</p>
              <p className="text-2xl font-bold">K{(portfolioStats.totalDisbursed / 1000000).toFixed(2)}M</p>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "50ms" }}>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-2xl font-bold text-primary">K{(portfolioStats.outstanding / 1000000).toFixed(2)}M</p>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Collected</p>
              <p className="text-2xl font-bold text-success">K{(portfolioStats.collected / 1000).toFixed(0)}K</p>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "150ms" }}>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Active Loans</p>
              <p className="text-2xl font-bold">{portfolioStats.activeLoans}</p>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "200ms" }}>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">In Arrears</p>
              <p className="text-2xl font-bold text-destructive">K{(portfolioStats.arrears / 1000).toFixed(0)}K</p>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "250ms" }}>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">PAR Rate</p>
              <p className="text-2xl font-bold">{portfolioStats.parRate}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active Loans</TabsTrigger>
            <TabsTrigger value="applications">Applications (2)</TabsTrigger>
            <TabsTrigger value="products">Loan Products</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-4 font-medium text-muted-foreground">Borrower</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                        <th className="text-right p-4 font-medium text-muted-foreground">Principal</th>
                        <th className="text-right p-4 font-medium text-muted-foreground">Outstanding</th>
                        <th className="text-right p-4 font-medium text-muted-foreground">Monthly</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Next Due</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                        <th className="p-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {loans.map((loan) => {
                        const StatusIcon = statusConfig[loan.status as keyof typeof statusConfig].icon;
                        return (
                          <tr key={loan.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">{loan.borrower}</p>
                                  <p className="text-sm text-muted-foreground">{loan.phone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="text-sm font-medium">{loan.product}</p>
                              <p className="text-xs text-muted-foreground">{loan.term} @ {loan.rate}%</p>
                            </td>
                            <td className="p-4 text-right font-medium">K{loan.principal.toLocaleString()}</td>
                            <td className="p-4 text-right">
                              <span className={loan.outstanding > 0 ? "font-semibold text-primary" : "text-muted-foreground"}>
                                K{loan.outstanding.toLocaleString()}
                              </span>
                              {loan.principal > 0 && (
                                <div className="w-20 h-1.5 bg-muted rounded-full mt-1 ml-auto">
                                  <div
                                    className="h-full bg-success rounded-full"
                                    style={{ width: `${((loan.principal - loan.outstanding) / loan.principal) * 100}%` }}
                                  />
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-right">K{loan.monthlyPayment.toLocaleString()}</td>
                            <td className="p-4">
                              {loan.nextDue ? (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{new Date(loan.nextDue).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="p-4">
                              <Badge
                                variant="outline"
                                className={statusConfig[loan.status as keyof typeof statusConfig].color}
                              >
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {loan.status}
                                {loan.daysOverdue && ` (${loan.daysOverdue}d)`}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Button variant="ghost" size="sm">Record Payment</Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <div className="grid gap-4 md:grid-cols-2">
              {applications.map((app) => {
                const StatusIcon = statusConfig[app.status as keyof typeof statusConfig].icon;
                return (
                  <Card key={app.id} className="hover:border-primary/30 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{app.applicant}</h3>
                            <p className="text-sm text-muted-foreground">Applied {new Date(app.submittedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={statusConfig[app.status as keyof typeof statusConfig].color}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {app.status.replace("-", " ")}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Amount Requested</span>
                          <span className="font-semibold">K{app.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Purpose</span>
                          <span className="text-sm">{app.purpose}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">Review</Button>
                        <Button size="sm" className="flex-1">Approve</Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Landmark className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">Business Loan</h3>
                    <p className="text-2xl font-bold text-primary">25%</p>
                    <p className="text-sm text-muted-foreground">K5,000 - K500,000 • 6-24 months</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-success" />
                    </div>
                    <h3 className="font-semibold">Solar Financing</h3>
                    <p className="text-2xl font-bold text-success">20%</p>
                    <p className="text-sm text-muted-foreground">K10,000 - K200,000 • 12-36 months</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-info" />
                    </div>
                    <h3 className="font-semibold">Personal Loan</h3>
                    <p className="text-2xl font-bold text-info">30%</p>
                    <p className="text-sm text-muted-foreground">K1,000 - K50,000 • 3-12 months</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
