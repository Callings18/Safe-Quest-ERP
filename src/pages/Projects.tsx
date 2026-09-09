import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects, useProjectStats, useCreateProject } from "@/hooks/useProjects";
import { useBOQs, useSaveBOQ, useBOQStats } from "@/hooks/useBOQ";
import { useProjectTypes, useCreateProjectType } from "@/hooks/useProjectTypes";
import { CustomerPicker } from "@/components/crm/CustomerPicker";
import { Loader2, Plus, MapPin, Calendar, Users, DollarSign, MoreHorizontal, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { formatZMW } from "@/lib/currency";

const statusConfig: Record<string, { color: string; icon: any }> = {
  planning: { color: "bg-muted text-muted-foreground border-border", icon: Clock },
  in_progress: { color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  on_hold: { color: "bg-warning/10 text-warning border-warning/20", icon: AlertCircle },
  completed: { color: "bg-info/10 text-info border-info/20", icon: CheckCircle2 },
  cancelled: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertCircle },
};

export default function Projects() {
  const { data: projects, isLoading } = useProjects();
  const { data: stats } = useProjectStats();
  const createProject = useCreateProject();
  const { data: projectTypes } = useProjectTypes();
  const createType = useCreateProjectType();
  const [typeName, setTypeName] = useState("");
  const { data: boqs } = useBOQs();
  const { data: boqStats } = useBOQStats();
  const saveBOQ = useSaveBOQ();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", project_type: "construction", company_id: "", site_address: "", city: "", budget: "", start_date: "", end_date: "",
  });
  const [boqOpen, setBoqOpen] = useState(false);
  const [boqForm, setBoqForm] = useState({
    title: "",
    project_id: "",
    markup_percent: "10",
    contingency_percent: "5",
    description: "",
    quantity: "1",
    unit: "each",
    rate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProject.mutateAsync({
      ...form,
      budget: Number(form.budget) || undefined,
      company_id: form.company_id || undefined,
    });
    setDialogOpen(false);
    setForm({ name: "", description: "", project_type: "construction", company_id: "", site_address: "", city: "", budget: "", start_date: "", end_date: "" });
  };

  const constructionProjects = projects?.filter(p => p.project_type === "construction") || [];
  const solarProjects = projects?.filter(p => p.project_type === "solar") || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projects & Sites</h1>
            <p className="text-muted-foreground">Manage construction and solar installation projects</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />New Project</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create New Project</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Project Type</Label>
                    <Select value={form.project_type} onValueChange={(v) => setForm({ ...form, project_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(projectTypes || []).map((t) => (
                          <SelectItem key={t.slug} value={t.slug}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Budget (ZMW)</Label>
                    <Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
                  </div>
                </div>
                <CustomerPicker value={form.company_id} onChange={(company_id) => setForm({ ...form, company_id })} />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Site Address</Label><Input value={form.site_address} onChange={(e) => setForm({ ...form, site_address: e.target.value })} /></div>
                  <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
                  <div className="space-y-2"><Label>End Date</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
                </div>
                <Button type="submit" className="w-full" disabled={createProject.isPending}>
                  {createProject.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Create Project
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Active Projects</p><p className="text-2xl font-bold">{stats?.active || 0}</p></div>
                <div className="p-3 rounded-xl bg-primary/10"><CheckCircle2 className="h-5 w-5 text-primary" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Total Budget</p><p className="text-2xl font-bold">{formatZMW(stats?.totalBudget || 0)}</p></div>
                <div className="p-3 rounded-xl bg-success/10"><DollarSign className="h-5 w-5 text-success" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Construction</p><p className="text-2xl font-bold">{stats?.construction || 0}</p></div>
                <div className="p-3 rounded-xl bg-warning/10"><AlertCircle className="h-5 w-5 text-warning" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Solar</p><p className="text-2xl font-bold">{stats?.solar || 0}</p></div>
                <div className="p-3 rounded-xl bg-info/10"><Users className="h-5 w-5 text-info" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Projects ({projects?.length || 0})</TabsTrigger>
            <TabsTrigger value="construction">Construction ({constructionProjects.length})</TabsTrigger>
            <TabsTrigger value="solar">Solar ({solarProjects.length})</TabsTrigger>
            <TabsTrigger value="boq">BOQ ({boqs?.length || 0})</TabsTrigger>
            <TabsTrigger value="types">Project types</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : !projects?.length ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No projects yet. Create your first project to get started.</CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {projects.map((project, index) => {
                  const config = statusConfig[project.status || "planning"];
                  const StatusIcon = config.icon;
                  return (
                    <Card key={project.id} className="group hover:border-primary/30 transition-all cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{project.project_type}</Badge>
                              <Badge variant="outline" className={config.color}><StatusIcon className="h-3 w-3 mr-1" />{project.status?.replace("_", " ")}</Badge>
                            </div>
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">{project.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{project.companies?.name || "No client assigned"}</p>
                          </div>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Progress</span><span className="font-medium">{project.progress || 0}%</span></div>
                          <Progress value={project.progress || 0} className="h-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" /><span>{project.city || "No location"}</span>
                          </div>
                          {project.end_date && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" /><span>Due {new Date(project.end_date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        {project.budget && (
                          <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                            <div><p className="text-xs text-muted-foreground">Budget</p><p className="font-semibold">{formatZMW(project.budget)}</p></div>
                            <div className="text-right"><p className="text-xs text-muted-foreground">Spent</p><p className="font-semibold text-primary">{formatZMW(project.actual_cost || 0)}</p></div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="construction">
            {constructionProjects.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No construction projects.</CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {constructionProjects.map((project) => (
                  <Card key={project.id}><CardContent className="pt-6"><h3 className="font-semibold">{project.name}</h3><p className="text-sm text-muted-foreground">{project.city}</p></CardContent></Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="solar">
            {solarProjects.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No solar projects.</CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {solarProjects.map((project) => (
                  <Card key={project.id}><CardContent className="pt-6"><h3 className="font-semibold">{project.name}</h3><p className="text-sm text-muted-foreground">{project.city}</p></CardContent></Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="boq" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {boqStats?.total || 0} bills · {formatZMW(boqStats?.value || 0)} priced
              </p>
              <Dialog open={boqOpen} onOpenChange={setBoqOpen}>
                <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="h-4 w-4" />New BOQ</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Bill of quantities</DialogTitle></DialogHeader>
                  <form
                    className="space-y-3"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await saveBOQ.mutateAsync({
                        title: boqForm.title,
                        project_id: boqForm.project_id || null,
                        markup_percent: Number(boqForm.markup_percent) || 0,
                        contingency_percent: Number(boqForm.contingency_percent) || 0,
                        items: [{
                          description: boqForm.description,
                          unit: boqForm.unit,
                          quantity: Number(boqForm.quantity) || 0,
                          rate: Number(boqForm.rate) || 0,
                        }],
                      });
                      setBoqOpen(false);
                    }}
                  >
                    <Label>Title</Label>
                    <Input required value={boqForm.title} onChange={(e) => setBoqForm({ ...boqForm, title: e.target.value })} />
                    <Label>Project</Label>
                    <Select value={boqForm.project_id} onValueChange={(v) => setBoqForm({ ...boqForm, project_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                      <SelectContent>
                        {(projects || []).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Label>Line description</Label>
                    <Input required value={boqForm.description} onChange={(e) => setBoqForm({ ...boqForm, description: e.target.value })} />
                    <div className="grid grid-cols-3 gap-2">
                      <div><Label>Qty</Label><Input type="number" value={boqForm.quantity} onChange={(e) => setBoqForm({ ...boqForm, quantity: e.target.value })} /></div>
                      <div><Label>Unit</Label><Input value={boqForm.unit} onChange={(e) => setBoqForm({ ...boqForm, unit: e.target.value })} /></div>
                      <div><Label>Rate (ZMW)</Label><Input type="number" value={boqForm.rate} onChange={(e) => setBoqForm({ ...boqForm, rate: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label>Markup %</Label><Input type="number" value={boqForm.markup_percent} onChange={(e) => setBoqForm({ ...boqForm, markup_percent: e.target.value })} /></div>
                      <div><Label>Contingency %</Label><Input type="number" value={boqForm.contingency_percent} onChange={(e) => setBoqForm({ ...boqForm, contingency_percent: e.target.value })} /></div>
                    </div>
                    <Button type="submit" className="w-full" disabled={saveBOQ.isPending}>Save BOQ</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <Card>
              <CardContent className="p-0">
                {!boqs?.length ? (
                  <p className="p-8 text-center text-muted-foreground">No BOQs yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead><tr className="border-b bg-muted/50"><th className="text-left p-3">Number</th><th className="text-left p-3">Title</th><th className="text-left p-3">Project</th><th className="text-right p-3">Total</th><th className="text-left p-3">Status</th></tr></thead>
                    <tbody>
                      {boqs.map((b: any) => (
                        <tr key={b.id} className="border-b">
                          <td className="p-3 font-medium">{b.boq_number}</td>
                          <td className="p-3">{b.title}</td>
                          <td className="p-3">{b.projects?.name || "—"}</td>
                          <td className="p-3 text-right">{formatZMW(b.total)}</td>
                          <td className="p-3"><Badge variant="outline">{b.status}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="types">
            <Card>
              <CardHeader>
                <CardTitle>Project types</CardTitle>
                <p className="text-sm text-muted-foreground">These appear on New Project. Construction and Solar stay as filters for existing work.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <form
                  className="flex gap-2"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!typeName.trim()) return;
                    await createType.mutateAsync(typeName);
                    setTypeName("");
                  }}
                >
                  <Input placeholder="e.g. Electrical, Civil, Security" value={typeName} onChange={(e) => setTypeName(e.target.value)} />
                  <Button type="submit" disabled={createType.isPending}>{createType.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add type"}</Button>
                </form>
                <div className="flex flex-wrap gap-2">
                  {(projectTypes || []).map((t) => (
                    <Badge key={t.id} variant="outline">{t.name}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
