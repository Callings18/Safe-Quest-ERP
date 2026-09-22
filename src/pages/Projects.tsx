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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useProjects, useProjectStats, useCreateProject, useUpdateProject, useProjectDocuments } from "@/hooks/useProjects";
import { useBOQs, useSaveBOQ, useBOQStats, useConvertBOQToQuotation } from "@/hooks/useBOQ";
import { useProjectTypes, useCreateProjectType } from "@/hooks/useProjectTypes";
import { CustomerPicker } from "@/components/crm/CustomerPicker";
import { Loader2, Plus, MapPin, Calendar, Users, DollarSign, Pencil, Clock, CheckCircle2, AlertCircle, FileText, Trash2 } from "lucide-react";
import { formatZMW } from "@/lib/currency";

const statusConfig: Record<string, { color: string; icon: any }> = {
  planning: { color: "bg-muted text-muted-foreground border-border", icon: Clock },
  in_progress: { color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  on_hold: { color: "bg-warning/10 text-warning border-warning/20", icon: AlertCircle },
  completed: { color: "bg-info/10 text-info border-info/20", icon: CheckCircle2 },
  cancelled: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertCircle },
};

type BoqLine = { description: string; quantity: string; unit: string; rate: string };

const emptyBoqLine = (): BoqLine => ({ description: "", quantity: "1", unit: "each", rate: "" });

export default function Projects() {
  const { data: projects, isLoading } = useProjects();
  const { data: stats } = useProjectStats();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const { data: projectTypes } = useProjectTypes();
  const createType = useCreateProjectType();
  const [typeName, setTypeName] = useState("");
  const { data: boqs } = useBOQs();
  const { data: boqStats } = useBOQStats();
  const saveBOQ = useSaveBOQ();
  const convertBOQ = useConvertBOQToQuotation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", project_type: "construction", company_id: "", site_address: "", city: "", budget: "", start_date: "", end_date: "",
  });
  const [editProject, setEditProject] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: "", description: "", project_type: "construction", company_id: "", site_address: "", city: "",
    budget: "", start_date: "", end_date: "", status: "planning", progress: "0",
  });
  const { data: linkedDocs } = useProjectDocuments(editProject?.id);

  const [boqOpen, setBoqOpen] = useState(false);
  const [boqForm, setBoqForm] = useState({
    title: "",
    project_id: "",
    company_id: "",
    markup_percent: "10",
    contingency_percent: "5",
    lines: [emptyBoqLine()] as BoqLine[],
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

  const openEdit = (project: any) => {
    setEditProject(project);
    setEditForm({
      name: project.name || "",
      description: project.description || "",
      project_type: project.project_type || "construction",
      company_id: project.company_id || "",
      site_address: project.site_address || "",
      city: project.city || "",
      budget: project.budget != null ? String(project.budget) : "",
      start_date: project.start_date || "",
      end_date: project.end_date || "",
      status: project.status || "planning",
      progress: String(project.progress ?? 0),
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProject) return;
    await updateProject.mutateAsync({
      id: editProject.id,
      name: editForm.name,
      description: editForm.description || null,
      project_type: editForm.project_type,
      company_id: editForm.company_id || null,
      site_address: editForm.site_address || null,
      city: editForm.city || null,
      budget: editForm.budget ? Number(editForm.budget) : null,
      start_date: editForm.start_date || null,
      end_date: editForm.end_date || null,
      status: editForm.status,
      progress: Math.min(100, Math.max(0, Number(editForm.progress) || 0)),
    });
    setEditProject(null);
  };

  const resetBoqForm = () =>
    setBoqForm({
      title: "",
      project_id: "",
      company_id: "",
      markup_percent: "10",
      contingency_percent: "5",
      lines: [emptyBoqLine()],
    });

  const constructionProjects = projects?.filter(p => p.project_type === "construction") || [];
  const solarProjects = projects?.filter(p => p.project_type === "solar") || [];

  const renderProjectCard = (project: any) => {
    const config = statusConfig[project.status || "planning"] || statusConfig.planning;
    const StatusIcon = config.icon;
    return (
      <Card key={project.id} className="group hover:border-primary/30 transition-all">
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
            <Button variant="ghost" size="icon" onClick={() => openEdit(project)} aria-label="Edit project">
              <Pencil className="h-4 w-4" />
            </Button>
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
          {project.budget != null && Number(project.budget) > 0 && (
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <div><p className="text-xs text-muted-foreground">Budget</p><p className="font-semibold">{formatZMW(project.budget)}</p></div>
              <div className="text-right"><p className="text-xs text-muted-foreground">Spent</p><p className="font-semibold text-primary">{formatZMW(project.actual_cost || 0)}</p></div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

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
                {projects.map((project) => renderProjectCard(project))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="construction">
            {constructionProjects.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No construction projects.</CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {constructionProjects.map((project) => renderProjectCard(project))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="solar">
            {solarProjects.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No solar projects.</CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {solarProjects.map((project) => renderProjectCard(project))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="boq" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {boqStats?.total || 0} bills · {formatZMW(boqStats?.value || 0)} priced
              </p>
              <Dialog open={boqOpen} onOpenChange={(open) => { setBoqOpen(open); if (!open) resetBoqForm(); }}>
                <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="h-4 w-4" />New BOQ</Button></DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Bill of quantities</DialogTitle></DialogHeader>
                  <form
                    className="space-y-3"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const items = boqForm.lines
                        .filter((l) => l.description.trim())
                        .map((l) => ({
                          description: l.description,
                          unit: l.unit || "each",
                          quantity: Number(l.quantity) || 0,
                          rate: Number(l.rate) || 0,
                        }));
                      if (!items.length) return;
                      await saveBOQ.mutateAsync({
                        title: boqForm.title,
                        project_id: boqForm.project_id || null,
                        company_id: boqForm.company_id || null,
                        markup_percent: Number(boqForm.markup_percent) || 0,
                        contingency_percent: Number(boqForm.contingency_percent) || 0,
                        items,
                      });
                      setBoqOpen(false);
                      resetBoqForm();
                    }}
                  >
                    <Label>Title</Label>
                    <Input required value={boqForm.title} onChange={(e) => setBoqForm({ ...boqForm, title: e.target.value })} />
                    <CustomerPicker
                      value={boqForm.company_id}
                      onChange={(company_id) => setBoqForm({ ...boqForm, company_id })}
                    />
                    <Label>Project</Label>
                    <Select
                      value={boqForm.project_id || "__none__"}
                      onValueChange={(v) => {
                        const project_id = v === "__none__" ? "" : v;
                        const proj = projects?.find((p) => p.id === project_id);
                        setBoqForm({
                          ...boqForm,
                          project_id,
                          company_id: boqForm.company_id || proj?.company_id || "",
                        });
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        {(projects || []).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Line items</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setBoqForm({ ...boqForm, lines: [...boqForm.lines, emptyBoqLine()] })}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />Add line
                        </Button>
                      </div>
                      {boqForm.lines.map((line, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-end border-b border-border pb-2">
                          <div className="col-span-5">
                            <Label className="text-xs">Description</Label>
                            <Input
                              required={idx === 0}
                              value={line.description}
                              onChange={(e) => {
                                const lines = [...boqForm.lines];
                                lines[idx] = { ...lines[idx], description: e.target.value };
                                setBoqForm({ ...boqForm, lines });
                              }}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">Qty</Label>
                            <Input
                              type="number"
                              value={line.quantity}
                              onChange={(e) => {
                                const lines = [...boqForm.lines];
                                lines[idx] = { ...lines[idx], quantity: e.target.value };
                                setBoqForm({ ...boqForm, lines });
                              }}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">Unit</Label>
                            <Input
                              value={line.unit}
                              onChange={(e) => {
                                const lines = [...boqForm.lines];
                                lines[idx] = { ...lines[idx], unit: e.target.value };
                                setBoqForm({ ...boqForm, lines });
                              }}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">Rate</Label>
                            <Input
                              type="number"
                              value={line.rate}
                              onChange={(e) => {
                                const lines = [...boqForm.lines];
                                lines[idx] = { ...lines[idx], rate: e.target.value };
                                setBoqForm({ ...boqForm, lines });
                              }}
                            />
                          </div>
                          <div className="col-span-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={boqForm.lines.length <= 1}
                              onClick={() => setBoqForm({ ...boqForm, lines: boqForm.lines.filter((_, i) => i !== idx) })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
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
                    <thead><tr className="border-b bg-muted/50"><th className="text-left p-3">Number</th><th className="text-left p-3">Title</th><th className="text-left p-3">Customer</th><th className="text-left p-3">Project</th><th className="text-right p-3">Total</th><th className="text-left p-3">Status</th><th className="p-3"></th></tr></thead>
                    <tbody>
                      {boqs.map((b: any) => (
                        <tr key={b.id} className="border-b">
                          <td className="p-3 font-medium">{b.boq_number}</td>
                          <td className="p-3">{b.title}</td>
                          <td className="p-3">{b.companies?.name || "—"}</td>
                          <td className="p-3">{b.projects?.name || "—"}</td>
                          <td className="p-3 text-right">{formatZMW(b.total)}</td>
                          <td className="p-3"><Badge variant="outline">{b.status}</Badge></td>
                          <td className="p-3">
                            {!b.quotation_id && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                disabled={convertBOQ.isPending || !b.company_id}
                                title={!b.company_id ? "Assign a customer on the BOQ first" : undefined}
                                onClick={() => convertBOQ.mutate(b.id)}
                              >
                                <FileText className="h-3.5 w-3.5" />
                                Create quotation
                              </Button>
                            )}
                            {b.quotation_id && <span className="text-xs text-muted-foreground">Quoted</span>}
                          </td>
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
              <CardHeader><CardTitle>Project types</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <form
                  className="flex gap-2"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!typeName.trim()) return;
                    await createType.mutateAsync(typeName.trim());
                    setTypeName("");
                  }}
                >
                  <Input placeholder="New type name" value={typeName} onChange={(e) => setTypeName(e.target.value)} />
                  <Button type="submit" disabled={createType.isPending}>Add</Button>
                </form>
                <ul className="space-y-1 text-sm">
                  {(projectTypes || []).map((t) => (
                    <li key={t.id} className="flex justify-between border-b py-2">
                      <span>{t.name}</span>
                      <span className="text-muted-foreground">{t.slug}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Sheet open={!!editProject} onOpenChange={(open) => { if (!open) setEditProject(null); }}>
          <SheetContent className="sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit project</SheetTitle>
            </SheetHeader>
            {editProject && (
              <form onSubmit={handleUpdate} className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="in_progress">In progress</SelectItem>
                        <SelectItem value="on_hold">On hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Progress %</Label>
                    <Input type="number" min={0} max={100} value={editForm.progress} onChange={(e) => setEditForm({ ...editForm, progress: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={editForm.project_type} onValueChange={(v) => setEditForm({ ...editForm, project_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(projectTypes || []).map((t) => (
                        <SelectItem key={t.slug} value={t.slug}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <CustomerPicker value={editForm.company_id} onChange={(company_id) => setEditForm({ ...editForm, company_id })} />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>City</Label><Input value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Budget</Label><Input type="number" value={editForm.budget} onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })} /></div>
                </div>
                <div className="space-y-2">
                  <Label>Site address</Label>
                  <Input value={editForm.site_address} onChange={(e) => setEditForm({ ...editForm, site_address: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Start</Label><Input type="date" value={editForm.start_date} onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })} /></div>
                  <div className="space-y-2"><Label>End</Label><Input type="date" value={editForm.end_date} onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })} /></div>
                </div>
                <Button type="submit" className="w-full" disabled={updateProject.isPending}>
                  {updateProject.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Save changes
                </Button>

                <div className="pt-4 border-t space-y-3">
                  <p className="text-sm font-medium">Linked documents</p>
                  {!linkedDocs?.quotations?.length && !linkedDocs?.invoices?.length && !linkedDocs?.boqs?.length && (
                    <p className="text-xs text-muted-foreground">No quotations, invoices, or BOQs linked yet.</p>
                  )}
                  {(linkedDocs?.boqs || []).map((b: any) => (
                    <div key={b.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">BOQ {b.boq_number}</span>
                      <span>{formatZMW(b.total)}</span>
                    </div>
                  ))}
                  {(linkedDocs?.quotations || []).map((q: any) => (
                    <div key={q.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{q.quotation_number} · {q.status}</span>
                      <span>{formatZMW(q.total)}</span>
                    </div>
                  ))}
                  {(linkedDocs?.invoices || []).map((inv: any) => (
                    <div key={inv.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {inv.invoice_number}{inv.is_proforma ? " (PFI)" : ""} · {inv.status}
                      </span>
                      <span>{formatZMW(inv.total)}</span>
                    </div>
                  ))}
                </div>
              </form>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
}
