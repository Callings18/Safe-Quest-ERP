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
import { Loader2, Plus, MapPin, Calendar, Users, DollarSign, MoreHorizontal, Clock, CheckCircle2, AlertCircle } from "lucide-react";

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

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", project_type: "construction" as const, site_address: "", city: "", budget: "", start_date: "", end_date: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProject.mutateAsync({ ...form, budget: Number(form.budget) || undefined });
    setDialogOpen(false);
    setForm({ name: "", description: "", project_type: "construction", site_address: "", city: "", budget: "", start_date: "", end_date: "" });
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
                    <Select value={form.project_type} onValueChange={(v: any) => setForm({ ...form, project_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="construction">Construction</SelectItem>
                        <SelectItem value="solar">Solar</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Budget (K)</Label>
                    <Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
                  </div>
                </div>
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
          <Card className="animate-slide-up">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Active Projects</p><p className="text-2xl font-bold">{stats?.active || 0}</p></div>
                <div className="p-3 rounded-xl bg-primary/10"><CheckCircle2 className="h-5 w-5 text-primary" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "50ms" }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Total Budget</p><p className="text-2xl font-bold">K{((stats?.totalBudget || 0) / 1000000).toFixed(2)}M</p></div>
                <div className="p-3 rounded-xl bg-success/10"><DollarSign className="h-5 w-5 text-success" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Construction</p><p className="text-2xl font-bold">{stats?.construction || 0}</p></div>
                <div className="p-3 rounded-xl bg-warning/10"><AlertCircle className="h-5 w-5 text-warning" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "150ms" }}>
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
                    <Card key={project.id} className="group hover:border-primary/30 transition-all cursor-pointer animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
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
                            <div><p className="text-xs text-muted-foreground">Budget</p><p className="font-semibold">K{Number(project.budget).toLocaleString()}</p></div>
                            <div className="text-right"><p className="text-xs text-muted-foreground">Spent</p><p className="font-semibold text-primary">K{Number(project.actual_cost || 0).toLocaleString()}</p></div>
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
        </Tabs>
      </div>
    </AppLayout>
  );
}
