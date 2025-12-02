import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Send,
  Download,
  Eye,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Wallet,
  TrendingUp,
  Calendar,
} from "lucide-react";

const invoiceStats = {
  totalInvoiced: 2450000,
  collected: 1558000,
  outstanding: 892000,
  overdue: 245000,
};

const invoices = [
  {
    id: 1,
    number: "INV-2024-092",
    client: "Zambia Energy Corporation",
    project: "Kafue Solar Farm - Phase 2",
    amount: 450000,
    issueDate: "2024-11-28",
    dueDate: "2024-12-28",
    status: "sent",
  },
  {
    id: 2,
    number: "INV-2024-091",
    client: "Premier Properties Ltd",
    project: "Lusaka Office Complex",
    amount: 285000,
    issueDate: "2024-11-25",
    dueDate: "2024-12-25",
    status: "paid",
    paidDate: "2024-11-30",
  },
  {
    id: 3,
    number: "INV-2024-089",
    client: "Zambia Solar Ltd",
    project: "Residential Solar Installation",
    amount: 45000,
    issueDate: "2024-11-15",
    dueDate: "2024-11-30",
    status: "overdue",
  },
  {
    id: 4,
    number: "INV-2024-088",
    client: "Copper Mining Corporation",
    project: "Solar Panel Installation",
    amount: 320000,
    issueDate: "2024-11-10",
    dueDate: "2024-12-10",
    status: "partial",
    paidAmount: 200000,
  },
  {
    id: 5,
    number: "INV-2024-087",
    client: "Multiple Clients",
    project: "Various Solar Installations",
    amount: 125000,
    issueDate: "2024-11-05",
    dueDate: "2024-12-05",
    status: "draft",
  },
];

const quotes = [
  {
    id: 1,
    number: "QUO-2024-045",
    client: "National Bank of Zambia",
    description: "Solar power system installation",
    amount: 850000,
    validUntil: "2024-12-15",
    status: "pending",
  },
  {
    id: 2,
    number: "QUO-2024-044",
    client: "Sunshine Farms Ltd",
    description: "Agricultural solar pumping system",
    amount: 180000,
    validUntil: "2024-12-10",
    status: "accepted",
  },
];

const statusConfig = {
  draft: { color: "bg-muted text-muted-foreground border-border", icon: FileText, label: "Draft" },
  sent: { color: "bg-info/10 text-info border-info/20", icon: Send, label: "Sent" },
  paid: { color: "bg-success/10 text-success border-success/20", icon: CheckCircle2, label: "Paid" },
  partial: { color: "bg-warning/10 text-warning border-warning/20", icon: Clock, label: "Partial" },
  overdue: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle, label: "Overdue" },
  cancelled: { color: "bg-muted text-muted-foreground border-border", icon: XCircle, label: "Cancelled" },
  pending: { color: "bg-warning/10 text-warning border-warning/20", icon: Clock, label: "Pending" },
  accepted: { color: "bg-success/10 text-success border-success/20", icon: CheckCircle2, label: "Accepted" },
};

export default function Invoicing() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Invoicing</h1>
            <p className="text-muted-foreground">
              Create quotes, invoices, and track payments in ZMW
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              New Quote
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Invoice
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="animate-slide-up">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Invoiced</p>
                  <p className="text-2xl font-bold">K{(invoiceStats.totalInvoiced / 1000000).toFixed(2)}M</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "50ms" }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Collected</p>
                  <p className="text-2xl font-bold text-success">K{(invoiceStats.collected / 1000000).toFixed(2)}M</p>
                </div>
                <div className="p-3 rounded-xl bg-success/10">
                  <Wallet className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding</p>
                  <p className="text-2xl font-bold text-primary">K{(invoiceStats.outstanding / 1000).toFixed(0)}K</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "150ms" }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-destructive">K{(invoiceStats.overdue / 1000).toFixed(0)}K</p>
                </div>
                <div className="p-3 rounded-xl bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="invoices" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="quotes">Quotes</TabsTrigger>
              <TabsTrigger value="recurring">Recurring</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search invoices..." className="pl-9 w-64" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="invoices">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-4 font-medium text-muted-foreground">Invoice</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Client</th>
                        <th className="text-right p-4 font-medium text-muted-foreground">Amount</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Issue Date</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Due Date</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                        <th className="p-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => {
                        const StatusIcon = statusConfig[invoice.status as keyof typeof statusConfig].icon;
                        return (
                          <tr key={invoice.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                              <div>
                                <p className="font-medium text-primary hover:underline cursor-pointer">{invoice.number}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{invoice.project}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="text-sm font-medium">{invoice.client}</p>
                            </td>
                            <td className="p-4 text-right">
                              <p className="font-semibold">K{invoice.amount.toLocaleString()}</p>
                              {invoice.paidAmount && (
                                <p className="text-xs text-success">Paid: K{invoice.paidAmount.toLocaleString()}</p>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {new Date(invoice.issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {new Date(invoice.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline" className={statusConfig[invoice.status as keyof typeof statusConfig].color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig[invoice.status as keyof typeof statusConfig].label}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>View Invoice</DropdownMenuItem>
                                    <DropdownMenuItem>Download PDF</DropdownMenuItem>
                                    <DropdownMenuItem>Send via Email</DropdownMenuItem>
                                    <DropdownMenuItem>Send via WhatsApp</DropdownMenuItem>
                                    <DropdownMenuItem>Record Payment</DropdownMenuItem>
                                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
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

          <TabsContent value="quotes">
            <div className="grid gap-4 md:grid-cols-2">
              {quotes.map((quote) => {
                const StatusIcon = statusConfig[quote.status as keyof typeof statusConfig].icon;
                return (
                  <Card key={quote.id} className="hover:border-primary/30 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">{quote.number}</p>
                          <h3 className="font-semibold">{quote.client}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{quote.description}</p>
                        </div>
                        <Badge variant="outline" className={statusConfig[quote.status as keyof typeof statusConfig].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[quote.status as keyof typeof statusConfig].label}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">Quote Amount</p>
                          <p className="text-xl font-bold text-primary">K{quote.amount.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Valid until</p>
                          <p className="text-sm">{new Date(quote.validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">View</Button>
                        <Button size="sm" className="flex-1">Convert to Invoice</Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="recurring">
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-semibold mb-2">No recurring invoices yet</h3>
                <p className="text-sm mb-4">Set up recurring invoices for regular clients</p>
                <Button>Create Recurring Invoice</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
