import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSuppliers, useCreateSupplier, usePurchaseOrders, useCreatePurchaseOrder, useUpdatePOStatus, useProcurementStats } from "@/hooks/useProcurement";
import { Loader2, Plus, ShoppingCart, Users, TrendingUp, Package, MoreHorizontal, Search } from "lucide-react";
import { format } from "date-fns";

const poStatusConfig: Record<string, { color: string; label: string }> = {
  draft: { color: "bg-muted text-muted-foreground", label: "Draft" },
  approved: { color: "bg-info/10 text-info", label: "Approved" },
  ordered: { color: "bg-warning/10 text-warning", label: "Ordered" },
  received: { color: "bg-success/10 text-success", label: "Received" },
  cancelled: { color: "bg-destructive/10 text-destructive", label: "Cancelled" },
};

export default function Procurement() {
  const { data: suppliers, isLoading: suppliersLoading } = useSuppliers();
  const { data: purchaseOrders, isLoading: posLoading } = usePurchaseOrders();
  const { data: stats } = useProcurementStats();
  const createSupplier = useCreateSupplier();
  const createPO = useCreatePurchaseOrder();
  const updatePOStatus = useUpdatePOStatus();

  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [poDialogOpen, setPODialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [supplierForm, setSupplierForm] = useState({ name: "", contact_person: "", email: "", phone: "", address: "", city: "", tax_id: "", notes: "" });
  const [poForm, setPOForm] = useState({ order_number: "", supplier_id: "", expected_date: "", notes: "", total: "" });

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSupplier.mutateAsync(supplierForm);
    setSupplierDialogOpen(false);
    setSupplierForm({ name: "", contact_person: "", email: "", phone: "", address: "", city: "", tax_id: "", notes: "" });
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPO.mutateAsync({ ...poForm, total: Number(poForm.total) || 0 });
    setPODialogOpen(false);
    setPOForm({ order_number: "", supplier_id: "", expected_date: "", notes: "", total: "" });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Procurement</h1>
            <p className="text-muted-foreground">Manage suppliers and purchase orders</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSupplierDialogOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Add Supplier</Button>
            <Button onClick={() => setPODialogOpen(true)} className="gap-2"><Plus className="h-4 w-4" />New Purchase Order</Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: "Active Suppliers", value: stats?.activeSuppliers || 0, icon: Users },
            { title: "Total Orders", value: stats?.totalOrders || 0, icon: ShoppingCart },
            { title: "Pending Orders", value: stats?.pendingOrders || 0, icon: Package },
            { title: "Total Spend", value: `K${((stats?.totalSpend || 0) / 1000).toFixed(0)}K`, icon: TrendingUp },
          ].map((kpi) => (
            <Card key={kpi.title}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <kpi.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <p className="text-xl font-bold">{kpi.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search orders..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            {posLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrders?.filter(po => po.order_number.toLowerCase().includes(searchTerm.toLowerCase()) || (po.suppliers as any)?.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(po => {
                      const sc = poStatusConfig[po.status || "draft"] || poStatusConfig.draft;
                      return (
                        <TableRow key={po.id}>
                          <TableCell className="font-medium">{po.order_number}</TableCell>
                          <TableCell>{(po.suppliers as any)?.name || "—"}</TableCell>
                          <TableCell>{po.order_date ? format(new Date(po.order_date), "dd MMM yyyy") : "—"}</TableCell>
                          <TableCell>{po.expected_date ? format(new Date(po.expected_date), "dd MMM yyyy") : "—"}</TableCell>
                          <TableCell>K{Number(po.total || 0).toLocaleString()}</TableCell>
                          <TableCell><Badge variant="outline" className={sc.color}>{sc.label}</Badge></TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => updatePOStatus.mutate({ id: po.id, status: "approved" })}>Approve</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updatePOStatus.mutate({ id: po.id, status: "ordered" })}>Mark Ordered</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updatePOStatus.mutate({ id: po.id, status: "received" })}>Mark Received</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updatePOStatus.mutate({ id: po.id, status: "cancelled" })} className="text-destructive">Cancel</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {(!purchaseOrders || purchaseOrders.length === 0) && (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No purchase orders yet</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-4">
            {suppliersLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {suppliers?.map(s => (
                  <Card key={s.id}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{s.name}</h3>
                        <Badge variant={s.is_active ? "default" : "secondary"}>{s.is_active ? "Active" : "Inactive"}</Badge>
                      </div>
                      {s.contact_person && <p className="text-sm text-muted-foreground">Contact: {s.contact_person}</p>}
                      {s.phone && <p className="text-sm text-muted-foreground">📞 {s.phone}</p>}
                      {s.email && <p className="text-sm text-muted-foreground">✉️ {s.email}</p>}
                      {s.city && <p className="text-sm text-muted-foreground">📍 {s.city}</p>}
                    </CardContent>
                  </Card>
                ))}
                {(!suppliers || suppliers.length === 0) && (
                  <Card className="col-span-full"><CardContent className="py-8 text-center text-muted-foreground">No suppliers yet. Add your first supplier.</CardContent></Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Supplier Dialog */}
        <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add Supplier</DialogTitle></DialogHeader>
            <form onSubmit={handleCreateSupplier} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><Label>Company Name *</Label><Input required value={supplierForm.name} onChange={e => setSupplierForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div><Label>Contact Person</Label><Input value={supplierForm.contact_person} onChange={e => setSupplierForm(f => ({ ...f, contact_person: e.target.value }))} /></div>
                <div><Label>Phone</Label><Input value={supplierForm.phone} onChange={e => setSupplierForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div><Label>Email</Label><Input type="email" value={supplierForm.email} onChange={e => setSupplierForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div><Label>City</Label><Input value={supplierForm.city} onChange={e => setSupplierForm(f => ({ ...f, city: e.target.value }))} /></div>
                <div><Label>TPIN</Label><Input value={supplierForm.tax_id} onChange={e => setSupplierForm(f => ({ ...f, tax_id: e.target.value }))} /></div>
                <div><Label>Address</Label><Input value={supplierForm.address} onChange={e => setSupplierForm(f => ({ ...f, address: e.target.value }))} /></div>
              </div>
              <Button type="submit" className="w-full" disabled={createSupplier.isPending}>{createSupplier.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Add Supplier</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* PO Dialog */}
        <Dialog open={poDialogOpen} onOpenChange={setPODialogOpen}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New Purchase Order</DialogTitle></DialogHeader>
            <form onSubmit={handleCreatePO} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Order Number *</Label><Input required value={poForm.order_number} onChange={e => setPOForm(f => ({ ...f, order_number: e.target.value }))} placeholder="PO-2026-001" /></div>
                <div>
                  <Label>Supplier *</Label>
                  <Select value={poForm.supplier_id} onValueChange={v => setPOForm(f => ({ ...f, supplier_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                    <SelectContent>{suppliers?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Expected Delivery</Label><Input type="date" value={poForm.expected_date} onChange={e => setPOForm(f => ({ ...f, expected_date: e.target.value }))} /></div>
                <div><Label>Total Amount (K)</Label><Input type="number" value={poForm.total} onChange={e => setPOForm(f => ({ ...f, total: e.target.value }))} /></div>
                <div className="col-span-2"><Label>Notes</Label><Input value={poForm.notes} onChange={e => setPOForm(f => ({ ...f, notes: e.target.value }))} /></div>
              </div>
              <Button type="submit" className="w-full" disabled={createPO.isPending || !poForm.supplier_id}>{createPO.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Create Purchase Order</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
