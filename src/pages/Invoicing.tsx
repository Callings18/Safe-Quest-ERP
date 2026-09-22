import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useInvoices, useInvoiceStats, useUpdateInvoiceStatus, useConvertProformaToInvoice } from "@/hooks/useInvoices";
import { useQuotations, useConvertQuotationToInvoice, useUpdateQuotationStatus } from "@/hooks/useQuotations";
import { useDeliveryNotes, useCreateDeliveryNoteFromInvoice, useUpdateDeliveryNoteStatus } from "@/hooks/useDeliveryNotes";
import { usePayments } from "@/hooks/usePayments";
import { useInvoiceTemplates, useDefaultTemplate, useDeleteTemplate, InvoiceTemplate } from "@/hooks/useInvoiceTemplates";
import { QuotationForm } from "@/components/invoicing/QuotationForm";
import { InvoiceForm } from "@/components/invoicing/InvoiceForm";
import { PaymentForm } from "@/components/invoicing/PaymentForm";
import { TemplateForm } from "@/components/invoicing/TemplateForm";
import { DocumentViewDialog } from "@/components/invoicing/DocumentViewDialog";
import { Loader2, Plus, Search, FileText, Send, CheckCircle2, AlertTriangle, XCircle, Wallet, TrendingUp, Eye, MoreHorizontal, ArrowRight, Truck, Receipt, Calendar, Pencil } from "lucide-react";
import { formatZMW } from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";

const quotationStatusConfig: Record<string, { color: string; label: string }> = {
  draft: { color: "bg-muted text-muted-foreground border-border", label: "Draft" },
  sent: { color: "bg-info/10 text-info border-info/20", label: "Sent" },
  accepted: { color: "bg-success/10 text-success border-success/20", label: "Accepted" },
  rejected: { color: "bg-destructive/10 text-destructive border-destructive/20", label: "Rejected" },
  expired: { color: "bg-muted text-muted-foreground border-border", label: "Expired" },
  converted: { color: "bg-primary/10 text-primary border-primary/20", label: "Converted" },
};

const invoiceStatusConfig: Record<string, { color: string; label: string }> = {
  draft: { color: "bg-muted text-muted-foreground border-border", label: "Draft" },
  sent: { color: "bg-info/10 text-info border-info/20", label: "Sent" },
  paid: { color: "bg-success/10 text-success border-success/20", label: "Paid" },
  partial: { color: "bg-warning/10 text-warning border-warning/20", label: "Partial" },
  overdue: { color: "bg-destructive/10 text-destructive border-destructive/20", label: "Overdue" },
  cancelled: { color: "bg-muted text-muted-foreground border-border", label: "Cancelled" },
};

const deliveryStatusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: "bg-muted text-muted-foreground border-border", label: "Pending" },
  dispatched: { color: "bg-info/10 text-info border-info/20", label: "Dispatched" },
  delivered: { color: "bg-success/10 text-success border-success/20", label: "Delivered" },
  cancelled: { color: "bg-muted text-muted-foreground border-border", label: "Cancelled" },
};

export default function Invoicing() {
  const { data: invoices, isLoading: invoicesLoading } = useInvoices();
  const { data: stats } = useInvoiceStats();
  const { data: quotations, isLoading: quotationsLoading } = useQuotations();
  const { data: deliveryNotes, isLoading: deliveryLoading } = useDeliveryNotes();
  const { data: payments, isLoading: paymentsLoading } = usePayments();
  const { data: templates } = useInvoiceTemplates();
  const { data: defaultTemplate } = useDefaultTemplate();

  const convertToInvoice = useConvertQuotationToInvoice();
  const convertProforma = useConvertProformaToInvoice();
  const updateQuotationStatus = useUpdateQuotationStatus();
  const updateInvoiceStatus = useUpdateInvoiceStatus();
  const createDeliveryNote = useCreateDeliveryNoteFromInvoice();
  const updateDeliveryStatus = useUpdateDeliveryNoteStatus();

  const [searchTerm, setSearchTerm] = useState("");
  const [quotationDialogOpen, setQuotationDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [proformaDialogOpen, setProformaDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplate | null>(null);
  const deleteTemplate = useDeleteTemplate();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [editQuotation, setEditQuotation] = useState<any>(null);
  const [editInvoice, setEditInvoice] = useState<any>(null);
  const [viewDialog, setViewDialog] = useState<{ open: boolean; type: any; doc: any; items: any[]; payments?: any[] }>({ open: false, type: "invoice", doc: null, items: [] });

  const handleRecordPayment = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPaymentDialogOpen(true);
  };

  const handleEditQuotation = async (qt: any) => {
    const { data: items } = await supabase.from("quotation_items").select("*").eq("quotation_id", qt.id);
    setEditQuotation({ ...qt, quotation_items: items || [] });
    setQuotationDialogOpen(true);
  };

  const handleEditInvoice = async (inv: any) => {
    const { data: items } = await supabase.from("invoice_items").select("*").eq("invoice_id", inv.id);
    setEditInvoice({ ...inv, invoice_items: items || [] });
    setInvoiceDialogOpen(true);
  };

  const handleViewDocument = async (type: "invoice" | "quotation" | "delivery_note" | "receipt" | "proforma", doc: any) => {
    let items: any[] = [];
    let paymentsList: any[] = [];
    if (type === "quotation") {
      const { data } = await supabase.from("quotation_items").select("*").eq("quotation_id", doc.id);
      items = data || [];
    } else if (type === "invoice" || type === "receipt" || type === "proforma") {
      const { data } = await supabase.from("invoice_items").select("*").eq("invoice_id", doc.id);
      items = data || [];
      if (type === "receipt") {
        const { data: pays } = await supabase.from("payments").select("*").eq("invoice_id", doc.id).order("payment_date", { ascending: false });
        paymentsList = pays || [];
      }
    } else if (type === "delivery_note") {
      const { data } = await supabase.from("delivery_note_items").select("*").eq("delivery_note_id", doc.id);
      items = data || [];
    }
    setViewDialog({ open: true, type, doc, items, payments: paymentsList });
  };

  const closeQuotationDialog = () => {
    setQuotationDialogOpen(false);
    setEditQuotation(null);
  };

  const closeInvoiceDialog = () => {
    setInvoiceDialogOpen(false);
    setEditInvoice(null);
    setProformaDialogOpen(false);
  };

  const q = searchTerm.toLowerCase();
  const filteredQuotations = quotations?.filter((qt: any) =>
    `${qt.quotation_number} ${qt.companies?.name || ""}`.toLowerCase().includes(q)
  );
  const taxInvoices = invoices?.filter((inv: any) => !inv.is_proforma) || [];
  const proformas = invoices?.filter((inv: any) => inv.is_proforma) || [];
  const filteredInvoices = taxInvoices.filter((inv: any) =>
    `${inv.invoice_number} ${inv.companies?.name || ""}`.toLowerCase().includes(q)
  );
  const filteredProformas = proformas.filter((inv: any) =>
    `${inv.invoice_number} ${inv.companies?.name || ""}`.toLowerCase().includes(q)
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoicing & Documents</h1>
          <p className="text-muted-foreground">Quotations, proformas, tax invoices, delivery notes & receipts</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Invoiced</p><p className="text-2xl font-bold">{formatZMW(stats?.totalInvoiced || 0)}</p></div><div className="p-3 rounded-xl bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Collected</p><p className="text-2xl font-bold text-success">{formatZMW(stats?.paid || 0)}</p></div><div className="p-3 rounded-xl bg-success/10"><Wallet className="h-5 w-5 text-success" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Outstanding</p><p className="text-2xl font-bold text-primary">{formatZMW(stats?.outstanding || 0)}</p></div><div className="p-3 rounded-xl bg-primary/10"><TrendingUp className="h-5 w-5 text-primary" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Overdue</p><p className="text-2xl font-bold text-destructive">{formatZMW(stats?.overdue || 0)}</p></div><div className="p-3 rounded-xl bg-destructive/10"><AlertTriangle className="h-5 w-5 text-destructive" /></div></div></CardContent></Card>
        </div>

        <Tabs defaultValue="quotations" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList className="flex flex-wrap h-auto">
              <TabsTrigger value="quotations">Quotations</TabsTrigger>
              <TabsTrigger value="proformas">Proformas</TabsTrigger>
              <TabsTrigger value="invoices">Tax Invoices</TabsTrigger>
              <TabsTrigger value="delivery">Delivery Notes</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." className="pl-9 w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          </div>

          <TabsContent value="quotations">
            <Card><CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Quotations</h3>
                <Dialog open={quotationDialogOpen} onOpenChange={(open) => { if (!open) closeQuotationDialog(); else setQuotationDialogOpen(true); }}>
                  <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Quotation</Button></DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{editQuotation ? "Edit Quotation" : "Create Quotation"}</DialogTitle></DialogHeader>
                    <QuotationForm onSuccess={closeQuotationDialog} editData={editQuotation} />
                  </DialogContent>
                </Dialog>
              </div>
              {quotationsLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : !filteredQuotations?.length ? <div className="text-center py-12 text-muted-foreground">No quotations yet.</div> : (
                <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b bg-muted/50"><th className="text-left p-3 font-medium text-muted-foreground">Quotation #</th><th className="text-left p-3 font-medium text-muted-foreground">Customer</th><th className="text-right p-3 font-medium text-muted-foreground">Amount</th><th className="text-left p-3 font-medium text-muted-foreground">Valid Until</th><th className="text-left p-3 font-medium text-muted-foreground">Status</th><th className="p-3"></th></tr></thead>
                  <tbody>{filteredQuotations.map((qt: any) => (
                    <tr key={qt.id} className="border-b hover:bg-muted/30">
                      <td className="p-3"><p className="font-medium text-primary cursor-pointer hover:underline" onClick={() => handleViewDocument("quotation", qt)}>{qt.quotation_number}</p></td>
                      <td className="p-3">{qt.companies?.name || "-"}</td>
                      <td className="p-3 text-right font-semibold">{formatZMW(qt.total)}</td>
                      <td className="p-3"><div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" />{qt.valid_until ? new Date(qt.valid_until).toLocaleDateString() : "-"}</div></td>
                      <td className="p-3"><Badge variant="outline" className={quotationStatusConfig[qt.status || "draft"]?.color}>{quotationStatusConfig[qt.status || "draft"]?.label}</Badge></td>
                      <td className="p-3"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDocument("quotation", qt)}><Eye className="h-4 w-4 mr-2" />View/Print</DropdownMenuItem>
                        {qt.status === "draft" && <DropdownMenuItem onClick={() => handleEditQuotation(qt)}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>}
                        {qt.status === "draft" && <DropdownMenuItem onClick={() => updateQuotationStatus.mutate({ id: qt.id, status: "sent" })}><Send className="h-4 w-4 mr-2" />Mark Sent</DropdownMenuItem>}
                        {qt.status === "sent" && <><DropdownMenuItem onClick={() => updateQuotationStatus.mutate({ id: qt.id, status: "accepted" })}><CheckCircle2 className="h-4 w-4 mr-2" />Mark Accepted</DropdownMenuItem><DropdownMenuItem onClick={() => updateQuotationStatus.mutate({ id: qt.id, status: "rejected" })}><XCircle className="h-4 w-4 mr-2" />Mark Rejected</DropdownMenuItem></>}
                        {(qt.status === "accepted" || qt.status === "sent") && qt.status !== "converted" && <DropdownMenuItem onClick={() => convertToInvoice.mutate(qt.id)}><ArrowRight className="h-4 w-4 mr-2" />Convert to Invoice</DropdownMenuItem>}
                      </DropdownMenuContent></DropdownMenu></td>
                    </tr>
                  ))}</tbody></table></div>
              )}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="proformas">
            <Card><CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold">Proforma invoices</h3>
                  <p className="text-sm text-muted-foreground">Deposit requests and provisional pricing. Convert to a tax invoice when ready.</p>
                </div>
                <Dialog open={proformaDialogOpen} onOpenChange={(open) => { if (!open) closeInvoiceDialog(); else setProformaDialogOpen(true); }}>
                  <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Proforma</Button></DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{editInvoice?.is_proforma ? "Edit Proforma" : "Create Proforma"}</DialogTitle></DialogHeader>
                    <InvoiceForm onSuccess={closeInvoiceDialog} editData={editInvoice} defaultProforma />
                  </DialogContent>
                </Dialog>
              </div>
              {invoicesLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : !filteredProformas.length ? <div className="text-center py-12 text-muted-foreground">No proformas yet.</div> : (
                <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b bg-muted/50"><th className="text-left p-3 font-medium text-muted-foreground">Proforma #</th><th className="text-left p-3 font-medium text-muted-foreground">Customer</th><th className="text-right p-3 font-medium text-muted-foreground">Amount</th><th className="text-left p-3 font-medium text-muted-foreground">Status</th><th className="p-3"></th></tr></thead>
                  <tbody>{filteredProformas.map((inv: any) => (
                    <tr key={inv.id} className="border-b hover:bg-muted/30">
                      <td className="p-3"><p className="font-medium text-primary cursor-pointer hover:underline" onClick={() => handleViewDocument("proforma", inv)}>{inv.invoice_number}</p></td>
                      <td className="p-3">{inv.companies?.name || "-"}</td>
                      <td className="p-3 text-right font-semibold">{formatZMW(inv.total)}</td>
                      <td className="p-3"><Badge variant="outline" className={invoiceStatusConfig[inv.status || "draft"]?.color}>{invoiceStatusConfig[inv.status || "draft"]?.label}</Badge></td>
                      <td className="p-3"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDocument("proforma", inv)}><Eye className="h-4 w-4 mr-2" />View/Print</DropdownMenuItem>
                        {inv.status === "draft" && <DropdownMenuItem onClick={async () => { await handleEditInvoice(inv); setProformaDialogOpen(true); }}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>}
                        {inv.status === "draft" && <DropdownMenuItem onClick={() => updateInvoiceStatus.mutate({ id: inv.id, status: "sent" })}><Send className="h-4 w-4 mr-2" />Mark Sent</DropdownMenuItem>}
                        {inv.status !== "cancelled" && <DropdownMenuItem onClick={() => convertProforma.mutate(inv.id)}><ArrowRight className="h-4 w-4 mr-2" />Convert to Tax Invoice</DropdownMenuItem>}
                      </DropdownMenuContent></DropdownMenu></td>
                    </tr>
                  ))}</tbody></table></div>
              )}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="invoices">
            <Card><CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Tax invoices</h3>
                <Dialog open={invoiceDialogOpen} onOpenChange={(open) => { if (!open) closeInvoiceDialog(); else setInvoiceDialogOpen(true); }}>
                  <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Tax Invoice</Button></DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{editInvoice ? "Edit Invoice" : "Create Tax Invoice"}</DialogTitle></DialogHeader>
                    <InvoiceForm onSuccess={closeInvoiceDialog} editData={editInvoice} />
                  </DialogContent>
                </Dialog>
              </div>
              {invoicesLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : !filteredInvoices?.length ? <div className="text-center py-12 text-muted-foreground">No tax invoices yet.</div> : (
                <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b bg-muted/50"><th className="text-left p-3 font-medium text-muted-foreground">Invoice #</th><th className="text-left p-3 font-medium text-muted-foreground">Customer</th><th className="text-right p-3 font-medium text-muted-foreground">Amount</th><th className="text-left p-3 font-medium text-muted-foreground">Due Date</th><th className="text-left p-3 font-medium text-muted-foreground">Status</th><th className="p-3"></th></tr></thead>
                  <tbody>{filteredInvoices.map((inv: any) => (
                    <tr key={inv.id} className="border-b hover:bg-muted/30">
                      <td className="p-3"><p className="font-medium text-primary cursor-pointer hover:underline" onClick={() => handleViewDocument("invoice", inv)}>{inv.invoice_number}</p></td>
                      <td className="p-3">{inv.companies?.name || "-"}</td>
                      <td className="p-3 text-right"><p className="font-semibold">{formatZMW(inv.total)}</p>{Number(inv.amount_paid) > 0 && <p className="text-xs text-success">Paid: {formatZMW(inv.amount_paid)}</p>}</td>
                      <td className="p-3"><div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" />{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "-"}</div></td>
                      <td className="p-3"><Badge variant="outline" className={invoiceStatusConfig[inv.status || "draft"]?.color}>{invoiceStatusConfig[inv.status || "draft"]?.label}</Badge></td>
                      <td className="p-3"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDocument("invoice", inv)}><Eye className="h-4 w-4 mr-2" />View/Print</DropdownMenuItem>
                        {inv.status === "draft" && <DropdownMenuItem onClick={() => handleEditInvoice(inv)}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>}
                        {inv.status === "draft" && <DropdownMenuItem onClick={() => updateInvoiceStatus.mutate({ id: inv.id, status: "sent" })}><Send className="h-4 w-4 mr-2" />Mark Sent (posts to ledger)</DropdownMenuItem>}
                        {inv.status !== "paid" && inv.status !== "cancelled" && !inv.is_proforma && <DropdownMenuItem onClick={() => handleRecordPayment(inv)}><Wallet className="h-4 w-4 mr-2" />Record Payment</DropdownMenuItem>}
                        {inv.status !== "cancelled" && <DropdownMenuItem onClick={() => createDeliveryNote.mutate(inv.id)}><Truck className="h-4 w-4 mr-2" />Create Delivery Note</DropdownMenuItem>}
                        {(inv.status === "paid" || Number(inv.amount_paid) > 0) && <DropdownMenuItem onClick={() => handleViewDocument("receipt", inv)}><Receipt className="h-4 w-4 mr-2" />View Receipt</DropdownMenuItem>}
                      </DropdownMenuContent></DropdownMenu></td>
                    </tr>
                  ))}</tbody></table></div>
              )}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="delivery">
            <Card><CardContent className="p-4">
              <h3 className="font-semibold mb-4">Delivery Notes</h3>
              {deliveryLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : !deliveryNotes?.length ? <div className="text-center py-12 text-muted-foreground">No delivery notes yet. Create one from an invoice.</div> : (
                <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b bg-muted/50"><th className="text-left p-3 font-medium text-muted-foreground">Delivery #</th><th className="text-left p-3 font-medium text-muted-foreground">Invoice</th><th className="text-left p-3 font-medium text-muted-foreground">Customer</th><th className="text-left p-3 font-medium text-muted-foreground">Status</th><th className="p-3"></th></tr></thead>
                  <tbody>{deliveryNotes.map((dn: any) => (
                    <tr key={dn.id} className="border-b hover:bg-muted/30">
                      <td className="p-3"><p className="font-medium text-primary cursor-pointer hover:underline" onClick={() => handleViewDocument("delivery_note", dn)}>{dn.delivery_number}</p></td>
                      <td className="p-3">{dn.invoices?.invoice_number || "-"}</td>
                      <td className="p-3">{dn.companies?.name || "-"}</td>
                      <td className="p-3"><Badge variant="outline" className={deliveryStatusConfig[dn.status || "pending"]?.color}>{deliveryStatusConfig[dn.status || "pending"]?.label}</Badge></td>
                      <td className="p-3"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => handleViewDocument("delivery_note", dn)}><Eye className="h-4 w-4 mr-2" />View/Print</DropdownMenuItem>{dn.status === "pending" && <DropdownMenuItem onClick={() => updateDeliveryStatus.mutate({ id: dn.id, status: "dispatched" })}><Truck className="h-4 w-4 mr-2" />Mark Dispatched</DropdownMenuItem>}{dn.status === "dispatched" && <DropdownMenuItem onClick={() => updateDeliveryStatus.mutate({ id: dn.id, status: "delivered" })}><CheckCircle2 className="h-4 w-4 mr-2" />Mark Delivered</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu></td>
                    </tr>
                  ))}</tbody></table></div>
              )}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card><CardContent className="p-4">
              <h3 className="font-semibold mb-4">Payment History</h3>
              {paymentsLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : !payments?.length ? <div className="text-center py-12 text-muted-foreground">No payments recorded yet.</div> : (
                <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b bg-muted/50"><th className="text-left p-3 font-medium text-muted-foreground">Date</th><th className="text-left p-3 font-medium text-muted-foreground">Invoice</th><th className="text-left p-3 font-medium text-muted-foreground">Customer</th><th className="text-right p-3 font-medium text-muted-foreground">Amount</th><th className="text-left p-3 font-medium text-muted-foreground">Method</th></tr></thead>
                  <tbody>{payments.map((p: any) => (
                    <tr key={p.id} className="border-b hover:bg-muted/30">
                      <td className="p-3">{p.payment_date ? new Date(p.payment_date).toLocaleDateString() : "-"}</td>
                      <td className="p-3 text-primary">{p.invoices?.invoice_number || "-"}</td>
                      <td className="p-3">{p.invoices?.companies?.name || "-"}</td>
                      <td className="p-3 text-right font-semibold text-success">{formatZMW(p.amount)}</td>
                      <td className="p-3"><Badge variant="outline">{p.payment_method?.replace("_", " ")}</Badge></td>
                    </tr>
                  ))}</tbody></table></div>
              )}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card><CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold">Document styles</h3>
                  <p className="text-sm text-muted-foreground">Edit letterhead, logo, colors, and font for every printed document.</p>
                </div>
                <Dialog open={templateDialogOpen} onOpenChange={(open) => { setTemplateDialogOpen(open); if (!open) setEditingTemplate(null); }}>
                  <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> New style</Button></DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingTemplate ? "Edit document style" : "Create document style"}</DialogTitle></DialogHeader><TemplateForm key={editingTemplate?.id || "new"} template={editingTemplate || undefined} onSuccess={() => { setTemplateDialogOpen(false); setEditingTemplate(null); }} /></DialogContent>
                </Dialog>
              </div>
              {!templates?.length ? <div className="text-center py-12 text-muted-foreground">No styles yet. Create one to customize invoices, quotations, and other documents.</div> : (
                <div className="grid gap-4 md:grid-cols-3">{templates.map((t) => (
                  <Card key={t.id}><CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded" style={{ backgroundColor: t.primary_color }} />
                      <div><p className="font-medium">{t.name}</p>{t.is_default && <Badge variant="outline" className="text-xs">Default</Badge>}</div>
                    </div>
                    <p className="text-sm text-muted-foreground">{t.company_name || "Company name"} · {t.font_family}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditingTemplate(t); setTemplateDialogOpen(true); }}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteTemplate.mutate(t.id)}>Delete</Button>
                    </div>
                  </CardContent></Card>
                ))}</div>
              )}
            </CardContent></Card>
          </TabsContent>
        </Tabs>

        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}><DialogContent><DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>{selectedInvoice && <PaymentForm invoiceId={selectedInvoice.id} balanceDue={Number(selectedInvoice.total || 0) - Number(selectedInvoice.amount_paid || 0)} onSuccess={() => { setPaymentDialogOpen(false); setSelectedInvoice(null); }} />}</DialogContent></Dialog>

        {viewDialog.doc && <DocumentViewDialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ ...viewDialog, open })} type={viewDialog.type} document={viewDialog.doc} items={viewDialog.items} payments={viewDialog.payments} template={defaultTemplate} />}
      </div>
    </AppLayout>
  );
}