import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useComplianceDocuments, useComplianceStats, useCreateComplianceDocument, useRenewComplianceDocument } from "@/hooks/useCompliance";
import { useContracts, useSaveContract } from "@/hooks/useContracts";
import { Loader2, Plus, Search, ShieldCheck, AlertTriangle, Clock, CheckCircle2, Calendar, FileText } from "lucide-react";
import { differenceInDays } from "date-fns";
import { formatZMW } from "@/lib/currency";

const statusConfig: Record<string, { color: string; icon: any }> = {
  valid: { color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  expiring: { color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  expired: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
};

export default function Compliance() {
  const { data: documents, isLoading } = useComplianceDocuments();
  const { data: stats } = useComplianceStats();
  const { data: contracts, isLoading: contractsLoading } = useContracts();
  const createDocument = useCreateComplianceDocument();
  const renewDocument = useRenewComplianceDocument();
  const saveContract = useSaveContract();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [contractDialog, setContractDialog] = useState(false);
  const [viewDoc, setViewDoc] = useState<{
    id: string;
    name: string;
    document_type: string;
    description: string | null;
    expiry_date: string | null;
    issue_date: string | null;
  } | null>(null);
  const [tab, setTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({ name: "", document_type: "", description: "", issue_date: "", expiry_date: "", reminder_days: "30" });
  const [contractForm, setContractForm] = useState({ title: "", contract_type: "client", value: "", start_date: "", end_date: "", status: "draft" as const });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDocument.mutateAsync({ ...form, reminder_days: Number(form.reminder_days) || 30 });
    setDialogOpen(false);
    setForm({ name: "", document_type: "", description: "", issue_date: "", expiry_date: "", reminder_days: "30" });
  };

  const getDocStatus = (expiryDate: string | null) => {
    if (!expiryDate) return "valid";
    const days = differenceInDays(new Date(expiryDate), new Date());
    if (days < 0) return "expired";
    if (days <= 30) return "expiring";
    return "valid";
  };

  const q = searchTerm.toLowerCase();
  const filteredDocs = documents?.filter((d) => `${d.name} ${d.document_type} ${d.description || ""}`.toLowerCase().includes(q)) || [];
  const expiringDocs = filteredDocs.filter((d) => getDocStatus(d.expiry_date) === "expiring");
  const expiredDocs = filteredDocs.filter((d) => getDocStatus(d.expiry_date) === "expired");
  const filteredContracts = contracts?.filter((c) => `${c.title} ${c.contract_number} ${c.contract_type} ${c.status}`.toLowerCase().includes(q)) || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Compliance & Reminders</h1>
            <p className="text-muted-foreground">Track licenses, permits, and statutory filing deadlines</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Add Document</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Compliance Document</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2"><Label>Document Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. PACRA Business Registration" /></div>
                <div className="space-y-2"><Label>Document Type</Label><Input value={form.document_type} onChange={(e) => setForm({ ...form, document_type: e.target.value })} required placeholder="e.g. Business License, Tax, Insurance" /></div>
                <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Issue Date</Label><Input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Reminder Days Before Expiry</Label><Input type="number" value={form.reminder_days} onChange={(e) => setForm({ ...form, reminder_days: e.target.value })} /></div>
                <Button type="submit" className="w-full" disabled={createDocument.isPending}>
                  {createDocument.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Add Document
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="animate-slide-up">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Total Documents</p><p className="text-2xl font-bold">{stats?.total || 0}</p></div>
                <div className="p-3 rounded-xl bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "50ms" }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Valid</p><p className="text-2xl font-bold text-success">{stats?.valid || 0}</p></div>
                <div className="p-3 rounded-xl bg-success/10"><CheckCircle2 className="h-5 w-5 text-success" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Expiring Soon</p><p className="text-2xl font-bold text-warning">{stats?.expiringSoon || 0}</p></div>
                <div className="p-3 rounded-xl bg-warning/10"><Clock className="h-5 w-5 text-warning" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "150ms" }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Expired</p><p className="text-2xl font-bold text-destructive">{stats?.expired || 0}</p></div>
                <div className="p-3 rounded-xl bg-destructive/10"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {(stats?.expired || 0) > 0 && (
          <Card className="border-destructive/30 bg-destructive/5 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-destructive">Action Required</h4>
                  <p className="text-sm text-muted-foreground mt-1">You have {stats?.expired} expired documents that require immediate attention.</p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => setTab("expired")}>View Expired</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="all">All ({documents?.length || 0})</TabsTrigger>
              <TabsTrigger value="expiring">Expiring ({expiringDocs.length})</TabsTrigger>
              <TabsTrigger value="expired">Expired ({expiredDocs.length})</TabsTrigger>
              <TabsTrigger value="contracts">Contracts ({contracts?.length || 0})</TabsTrigger>
            </TabsList>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search documents..." className="pl-9 w-48" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <TabsContent value="all" className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : !filteredDocs.length ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No compliance documents yet. Add your first document.</CardContent></Card>
            ) : (
              filteredDocs.map((doc, index) => {
                const status = getDocStatus(doc.expiry_date);
                const config = statusConfig[status];
                const StatusIcon = config.icon;
                const daysRemaining = doc.expiry_date ? differenceInDays(new Date(doc.expiry_date), new Date()) : null;
                
                return (
                  <Card key={doc.id} className={`hover:border-primary/30 transition-colors animate-slide-up ${status === "expired" ? "border-destructive/30" : ""}`} style={{ animationDelay: `${250 + index * 50}ms` }}>
                    <CardContent className="py-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${status === "valid" ? "bg-success/10" : status === "expiring" ? "bg-warning/10" : "bg-destructive/10"}`}>
                          <ShieldCheck className={`h-5 w-5 ${status === "valid" ? "text-success" : status === "expiring" ? "text-warning" : "text-destructive"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-semibold truncate">{doc.name}</h4>
                              <p className="text-sm text-muted-foreground">{doc.document_type}</p>
                            </div>
                            <Badge variant="outline" className={config.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />{status === "valid" ? "Valid" : status === "expiring" ? "Expiring" : "Expired"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            {doc.expiry_date && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Expires: {new Date(doc.expiry_date).toLocaleDateString()}</span>
                              </div>
                            )}
                            {daysRemaining !== null && (
                              <span className={daysRemaining <= 30 ? (daysRemaining < 0 ? "text-destructive font-medium" : "text-warning font-medium") : "text-muted-foreground"}>
                                {daysRemaining >= 0 ? `${daysRemaining} days remaining` : `Expired ${Math.abs(daysRemaining)} days ago`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setViewDoc(doc)}>View</Button>
                          <Button size="sm" onClick={() => renewDocument.mutate(doc.id)} disabled={renewDocument.isPending}>Renew</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="expiring" className="space-y-3">
            {expiringDocs.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No expiring documents.</CardContent></Card>
            ) : (
              expiringDocs.map((doc) => (
                <Card key={doc.id} className="border-warning/30">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-warning/10"><Clock className="h-5 w-5 text-warning" /></div>
                      <div className="flex-1"><h4 className="font-semibold">{doc.name}</h4><p className="text-sm text-warning">Expires {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : "-"}</p></div>
                      <Button size="sm" onClick={() => renewDocument.mutate(doc.id)} disabled={renewDocument.isPending}>Renew Now</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="expired" className="space-y-3">
            {expiredDocs.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No expired documents.</CardContent></Card>
            ) : (
              expiredDocs.map((doc) => (
                <Card key={doc.id} className="border-destructive/30">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-destructive/10"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
                      <div className="flex-1"><h4 className="font-semibold">{doc.name}</h4><p className="text-sm text-destructive">Expired</p></div>
                      <Button variant="destructive" size="sm" onClick={() => renewDocument.mutate(doc.id)} disabled={renewDocument.isPending}>Urgent: Renew</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="contracts" className="space-y-3">
            <div className="flex justify-end">
              <Dialog open={contractDialog} onOpenChange={setContractDialog}>
                <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Add Contract</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Contract</DialogTitle></DialogHeader>
                  <form
                    className="space-y-4"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await saveContract.mutateAsync({
                        title: contractForm.title,
                        contract_type: contractForm.contract_type,
                        value: Number(contractForm.value) || 0,
                        start_date: contractForm.start_date || null,
                        end_date: contractForm.end_date || null,
                        status: contractForm.status,
                      });
                      setContractDialog(false);
                      setContractForm({ title: "", contract_type: "client", value: "", start_date: "", end_date: "", status: "draft" });
                    }}
                  >
                    <div className="space-y-2"><Label>Title</Label><Input required value={contractForm.title} onChange={(e) => setContractForm({ ...contractForm, title: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Input value={contractForm.contract_type} onChange={(e) => setContractForm({ ...contractForm, contract_type: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Value (ZMW)</Label>
                        <Input type="number" value={contractForm.value} onChange={(e) => setContractForm({ ...contractForm, value: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Start</Label><Input type="date" value={contractForm.start_date} onChange={(e) => setContractForm({ ...contractForm, start_date: e.target.value })} /></div>
                      <div className="space-y-2"><Label>End</Label><Input type="date" value={contractForm.end_date} onChange={(e) => setContractForm({ ...contractForm, end_date: e.target.value })} /></div>
                    </div>
                    <Button type="submit" className="w-full" disabled={saveContract.isPending}>Save contract</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {contractsLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : !filteredContracts.length ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No contracts yet.</CardContent></Card>
            ) : (
              filteredContracts.map((c) => (
                <Card key={c.id}>
                  <CardContent className="py-4 flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{c.title}</h4>
                      <p className="text-sm text-muted-foreground">{c.contract_number} · {c.contract_type} · {c.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatZMW(c.value)}</p>
                      {c.end_date && <p className="text-xs text-muted-foreground">Ends {new Date(c.end_date).toLocaleDateString()}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={!!viewDoc} onOpenChange={(open) => !open && setViewDoc(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{viewDoc?.name}</DialogTitle></DialogHeader>
            {viewDoc && (
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Type:</span> {viewDoc.document_type}</p>
                {viewDoc.issue_date && <p><span className="text-muted-foreground">Issued:</span> {new Date(viewDoc.issue_date).toLocaleDateString()}</p>}
                {viewDoc.expiry_date && <p><span className="text-muted-foreground">Expires:</span> {new Date(viewDoc.expiry_date).toLocaleDateString()}</p>}
                {viewDoc.description && <p>{viewDoc.description}</p>}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
