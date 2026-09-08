import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLeads, useLeadStats, useCompanies, useContacts, useCreateLead, useCreateCompany, useCreateContact, useUpdateLeadStatus } from "@/hooks/useCRM";
import { Loader2, Search, Plus, Filter, MoreHorizontal, Mail, Building2, User } from "lucide-react";
import { formatZMW } from "@/lib/currency";

const stageColors: Record<string, string> = {
  new: "bg-muted text-muted-foreground",
  contacted: "bg-info/10 text-info border-info/20",
  qualified: "bg-warning/10 text-warning border-warning/20",
  proposal: "bg-primary/10 text-primary border-primary/20",
  negotiation: "bg-success/10 text-success border-success/20",
  won: "bg-success/10 text-success border-success/20",
  lost: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function CRM() {
  const { data: leads, isLoading: leadsLoading } = useLeads();
  const { data: stats } = useLeadStats();
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { data: contacts, isLoading: contactsLoading } = useContacts();
  const createLead = useCreateLead();
  const createCompany = useCreateCompany();
  const createContact = useCreateContact();
  const updateLeadStatus = useUpdateLeadStatus();
  const [searchTerm, setSearchTerm] = useState("");
  const [contactDialog, setContactDialog] = useState(false);
  const [contactForm, setContactForm] = useState({ first_name: "", last_name: "", email: "", phone: "", company_id: "" });

  const [leadDialog, setLeadDialog] = useState(false);
  const [companyDialog, setCompanyDialog] = useState(false);
  const [leadForm, setLeadForm] = useState({ title: "", description: "", value: "", source: "", company_id: "" });
  const [companyForm, setCompanyForm] = useState({ name: "", industry: "", phone: "", email: "", city: "" });

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLead.mutateAsync({
      ...leadForm,
      value: Number(leadForm.value) || undefined,
      company_id: leadForm.company_id || undefined,
    });
    setLeadDialog(false);
    setLeadForm({ title: "", description: "", value: "", source: "", company_id: "" });
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCompany.mutateAsync(companyForm);
    setCompanyDialog(false);
    setCompanyForm({ name: "", industry: "", phone: "", email: "", city: "" });
  };

  const q = searchTerm.toLowerCase();
  const filteredLeads = leads?.filter((l) => `${l.title} ${l.description || ""} ${l.source || ""} ${l.status}`.toLowerCase().includes(q));
  const filteredContacts = contacts?.filter((c) => `${c.first_name} ${c.last_name || ""} ${c.email || ""} ${c.companies?.name || ""}`.toLowerCase().includes(q));
  const filteredCompanies = companies?.filter((c) => `${c.name} ${c.industry || ""} ${c.city || ""}`.toLowerCase().includes(q));

  const stages = [
    { name: "new", count: stats?.new || 0 },
    { name: "contacted", count: stats?.contacted || 0 },
    { name: "qualified", count: stats?.qualified || 0 },
    { name: "proposal", count: stats?.proposal || 0 },
    { name: "negotiation", count: stats?.negotiation || 0 },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">CRM & Sales</h1>
            <p className="text-muted-foreground">Manage leads, opportunities, and customer relationships</p>
          </div>
          <Dialog open={leadDialog} onOpenChange={setLeadDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Add Lead</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Lead</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateLead} className="space-y-4">
                <div className="space-y-2">
                  <Label>Lead Title</Label>
                  <Input value={leadForm.title} onChange={(e) => setLeadForm({ ...leadForm, title: e.target.value })} required placeholder="e.g. Solar Installation Project" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={leadForm.description} onChange={(e) => setLeadForm({ ...leadForm, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Estimated Value (ZMW)</Label>
                    <Input type="number" value={leadForm.value} onChange={(e) => setLeadForm({ ...leadForm, value: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Source</Label>
                    <Input value={leadForm.source} onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })} placeholder="e.g. Referral, Website" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={leadForm.company_id}
                    onChange={(e) => setLeadForm({ ...leadForm, company_id: e.target.value })}
                  >
                    <option value="">None</option>
                    {companies?.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <Button type="submit" className="w-full" disabled={createLead.isPending}>
                  {createLead.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Create Lead
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          {stages.map((stage, index) => (
            <Card key={stage.name} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className={stageColors[stage.name]}>{stage.name}</Badge>
                  <span className="text-lg font-bold">{stage.count}</span>
                </div>
                <p className="text-sm text-muted-foreground">Pipeline value</p>
                <p className="text-xl font-semibold text-primary">{formatZMW(stats?.totalValue)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="leads" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="leads">Leads ({leads?.length || 0})</TabsTrigger>
              <TabsTrigger value="contacts">Contacts ({contacts?.length || 0})</TabsTrigger>
              <TabsTrigger value="companies">Companies ({companies?.length || 0})</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9 w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
          </div>

          <TabsContent value="leads">
            <Card>
              <CardContent className="p-0">
                {leadsLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : !filteredLeads?.length ? (
                  <div className="text-center py-12 text-muted-foreground">No leads yet. Add your first lead to get started.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left p-4 font-medium text-muted-foreground">Lead</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">Value</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">Stage</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">Source</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">Created</th>
                          <th className="p-4"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLeads.map((lead) => (
                          <tr key={lead.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Building2 className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">{lead.title}</p>
                                  <p className="text-sm text-muted-foreground">{lead.description || "-"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4"><span className="font-semibold">{formatZMW(lead.value || 0)}</span></td>
                            <td className="p-4"><Badge variant="outline" className={stageColors[lead.status || "new"]}>{lead.status}</Badge></td>
                            <td className="p-4 text-sm">{lead.source || "-"}</td>
                            <td className="p-4 text-sm text-muted-foreground">{new Date(lead.created_at).toLocaleDateString()}</td>
                            <td className="p-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {(["contacted", "qualified", "proposal", "negotiation", "won", "lost"] as const).map((s) => (
                                    <DropdownMenuItem key={s} onClick={() => updateLeadStatus.mutate({ id: lead.id, status: s })}>
                                      Mark {s}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <div className="flex justify-end mb-4">
              <Dialog open={contactDialog} onOpenChange={setContactDialog}>
                <DialogTrigger asChild><Button variant="outline" className="gap-2"><Plus className="h-4 w-4" />Add Contact</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Contact</DialogTitle></DialogHeader>
                  <form
                    className="space-y-4"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await createContact.mutateAsync({
                        ...contactForm,
                        company_id: contactForm.company_id || undefined,
                      });
                      setContactDialog(false);
                      setContactForm({ first_name: "", last_name: "", email: "", phone: "", company_id: "" });
                    }}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>First name</Label><Input required value={contactForm.first_name} onChange={(e) => setContactForm({ ...contactForm, first_name: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Last name</Label><Input value={contactForm.last_name} onChange={(e) => setContactForm({ ...contactForm, last_name: e.target.value })} /></div>
                    </div>
                    <div className="space-y-2"><Label>Email</Label><Input type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Phone</Label><Input value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} /></div>
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={contactForm.company_id}
                        onChange={(e) => setContactForm({ ...contactForm, company_id: e.target.value })}
                      >
                        <option value="">None</option>
                        {companies?.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <Button type="submit" className="w-full" disabled={createContact.isPending}>Save contact</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <Card>
              <CardContent className="p-0">
                {contactsLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : !filteredContacts?.length ? (
                  <div className="text-center py-12 text-muted-foreground">No contacts yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">Company</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">Phone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredContacts.map((contact) => (
                          <tr key={contact.id} className="border-b border-border hover:bg-muted/30">
                            <td className="p-4 font-medium">{contact.first_name} {contact.last_name}</td>
                            <td className="p-4 text-sm">{contact.companies?.name || "-"}</td>
                            <td className="p-4 text-sm">{contact.email || "-"}</td>
                            <td className="p-4 text-sm">{contact.phone || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies">
            <div className="flex justify-end mb-4">
              <Dialog open={companyDialog} onOpenChange={setCompanyDialog}>
                <DialogTrigger asChild><Button variant="outline" className="gap-2"><Plus className="h-4 w-4" />Add Company</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Company</DialogTitle></DialogHeader>
                  <form onSubmit={handleCreateCompany} className="space-y-4">
                    <div className="space-y-2"><Label>Company Name</Label><Input value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} required /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Industry</Label><Input value={companyForm.industry} onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })} /></div>
                      <div className="space-y-2"><Label>City</Label><Input value={companyForm.city} onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Phone</Label><Input value={companyForm.phone} onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Email</Label><Input value={companyForm.email} onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })} /></div>
                    </div>
                    <Button type="submit" className="w-full" disabled={createCompany.isPending}>
                      {createCompany.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Add Company
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <Card>
              <CardContent className="p-0">
                {companiesLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : !filteredCompanies?.length ? (
                  <div className="text-center py-12 text-muted-foreground">No companies yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left p-4 font-medium text-muted-foreground">Company</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">Industry</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">City</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">Contact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCompanies.map((company) => (
                          <tr key={company.id} className="border-b border-border hover:bg-muted/30">
                            <td className="p-4 font-medium">{company.name}</td>
                            <td className="p-4 text-sm">{company.industry || "-"}</td>
                            <td className="p-4 text-sm">{company.city || "-"}</td>
                            <td className="p-4 text-sm">{company.phone || company.email || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
