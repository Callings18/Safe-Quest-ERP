import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useInvoices, useInvoiceStats, useCreateInvoice } from "@/hooks/useInvoices";
import { Loader2, Plus, Search, FileText, Send, Download, Eye, MoreHorizontal, CheckCircle2, Clock, AlertTriangle, XCircle, Wallet, TrendingUp, Calendar } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  draft: { color: "bg-muted text-muted-foreground border-border", icon: FileText, label: "Draft" },
  sent: { color: "bg-info/10 text-info border-info/20", icon: Send, label: "Sent" },
  paid: { color: "bg-success/10 text-success border-success/20", icon: CheckCircle2, label: "Paid" },
  partial: { color: "bg-warning/10 text-warning border-warning/20", icon: Clock, label: "Partial" },
  overdue: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle, label: "Overdue" },
  cancelled: { color: "bg-muted text-muted-foreground border-border", icon: XCircle, label: "Cancelled" },
};

export default function Invoicing() {
  const { data: invoices, isLoading } = useInvoices();
  const { data: stats } = useInvoiceStats();
  const createInvoice = useCreateInvoice();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ due_date: "", notes: "", item_description: "", item_quantity: "1", item_price: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createInvoice.mutateAsync({
      due_date: form.due_date || undefined,
      notes: form.notes || undefined,
      items: [{ description: form.item_description, quantity: Number(form.item_quantity), unit_price: Number(form.item_price) }],
    });
    setDialogOpen(false);
    setForm({ due_date: "", notes: "", item_description: "", item_quantity: "1", item_price: "" });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Invoicing</h1>
            <p className="text-muted-foreground">Create quotes, invoices, and track payments in ZMW</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />New Invoice</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
                <div className="space-y-2"><Label>Item Description</Label><Input value={form.item_description} onChange={(e) => setForm({ ...form, item_description: e.target.value })} required placeholder="e.g. Solar Panel Installation" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={form.item_quantity} onChange={(e) => setForm({ ...form, item_quantity: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Unit Price (K)</Label><Input type="number" value={form.item_price} onChange={(e) => setForm({ ...form, item_price: e.target.value })} required /></div>
                </div>
                <div className="space-y-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                <Button type="submit" className="w-full" disabled={createInvoice.isPending}>
                  {createInvoice.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Create Invoice
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="animate-slide-up">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Total Invoiced</p><p className="text-2xl font-bold">K{((stats?.totalInvoiced || 0) / 1000).toFixed(0)}K</p></div>
                <div className="p-3 rounded-xl bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "50ms" }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Collected</p><p className="text-2xl font-bold text-success">K{((stats?.paid || 0) / 1000).toFixed(0)}K</p></div>
                <div className="p-3 rounded-xl bg-success/10"><Wallet className="h-5 w-5 text-success" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Outstanding</p><p className="text-2xl font-bold text-primary">K{((stats?.outstanding || 0) / 1000).toFixed(0)}K</p></div>
                <div className="p-3 rounded-xl bg-primary/10"><TrendingUp className="h-5 w-5 text-primary" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "150ms" }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Overdue</p><p className="text-2xl font-bold text-destructive">K{((stats?.overdue || 0) / 1000).toFixed(0)}K</p></div>
                <div className="p-3 rounded-xl bg-destructive/10"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="invoices" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="invoices">Invoices ({invoices?.length || 0})</TabsTrigger>
              <TabsTrigger value="drafts">Drafts ({stats?.draftCount || 0})</TabsTrigger>
            </TabsList>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search invoices..." className="pl-9 w-64" />
            </div>
          </div>

          <TabsContent value="invoices">
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : !invoices?.length ? (
                  <div className="text-center py-12 text-muted-foreground">No invoices yet. Create your first invoice.</div>
                ) : (
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
                          const config = statusConfig[invoice.status || "draft"];
                          const StatusIcon = config.icon;
                          return (
                            <tr key={invoice.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                              <td className="p-4">
                                <div>
                                  <p className="font-medium text-primary hover:underline cursor-pointer">{invoice.invoice_number}</p>
                                  <p className="text-xs text-muted-foreground">{invoice.notes || "-"}</p>
                                </div>
                              </td>
                              <td className="p-4 text-sm font-medium">{invoice.companies?.name || "-"}</td>
                              <td className="p-4 text-right">
                                <p className="font-semibold">K{Number(invoice.total || 0).toLocaleString()}</p>
                                {Number(invoice.amount_paid) > 0 && <p className="text-xs text-success">Paid: K{Number(invoice.amount_paid).toLocaleString()}</p>}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  {invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : "-"}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "-"}
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge variant="outline" className={config.color}>
                                  <StatusIcon className="h-3 w-3 mr-1" />{config.label}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>View Invoice</DropdownMenuItem>
                                      <DropdownMenuItem>Download PDF</DropdownMenuItem>
                                      <DropdownMenuItem>Send via Email</DropdownMenuItem>
                                      <DropdownMenuItem>Record Payment</DropdownMenuItem>
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
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drafts">
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {invoices?.filter(i => i.status === "draft").length === 0 ? "No draft invoices." : `${invoices?.filter(i => i.status === "draft").length} draft invoices`}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
