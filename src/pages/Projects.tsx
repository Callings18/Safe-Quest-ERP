import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const projects = [
  {
    id: 1,
    name: "Kafue Solar Farm - Phase 2",
    client: "Zambia Energy Corporation",
    location: "Kafue District",
    startDate: "2024-08-15",
    endDate: "2025-03-30",
    progress: 75,
    status: "on-track",
    budget: "K2,400,000",
    spent: "K1,680,000",
    team: ["JM", "SP", "TM", "AK"],
    type: "Solar",
    milestones: { completed: 6, total: 8 },
  },
  {
    id: 2,
    name: "Lusaka Office Complex",
    client: "Premier Properties Ltd",
    location: "Lusaka CBD",
    startDate: "2024-06-01",
    endDate: "2025-06-30",
    progress: 45,
    status: "at-risk",
    budget: "K5,800,000",
    spent: "K3,100,000",
    team: ["KB", "MN", "CP", "DL", "RB"],
    type: "Construction",
    milestones: { completed: 3, total: 10 },
  },
  {
    id: 3,
    name: "Residential Solar Installation",
    client: "Multiple Clients",
    location: "Kabulonga, Lusaka",
    startDate: "2024-10-01",
    endDate: "2024-12-15",
    progress: 90,
    status: "on-track",
    budget: "K850,000",
    spent: "K720,000",
    team: ["TM", "AK"],
    type: "Solar",
    milestones: { completed: 8, total: 9 },
  },
  {
    id: 4,
    name: "Ndola Warehouse Expansion",
    client: "Logistics Plus Zambia",
    location: "Ndola Industrial",
    startDate: "2024-09-15",
    endDate: "2025-02-28",
    progress: 30,
    status: "delayed",
    budget: "K1,200,000",
    spent: "K480,000",
    team: ["JM", "KB", "MN"],
    type: "Construction",
    milestones: { completed: 2, total: 7 },
  },
];

const statusConfig = {
  "on-track": { color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  "at-risk": { color: "bg-warning/10 text-warning border-warning/20", icon: AlertCircle },
  "delayed": { color: "bg-destructive/10 text-destructive border-destructive/20", icon: Clock },
};

export default function Projects() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projects & Sites</h1>
            <p className="text-muted-foreground">
              Manage construction and solar installation projects
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="animate-slide-up">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "50ms" }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-2xl font-bold">K10.2M</p>
                </div>
                <div className="p-3 rounded-xl bg-success/10">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">At Risk</p>
                  <p className="text-2xl font-bold text-warning">2</p>
                </div>
                <div className="p-3 rounded-xl bg-warning/10">
                  <AlertCircle className="h-5 w-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "150ms" }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Team Members</p>
                  <p className="text-2xl font-bold">34</p>
                </div>
                <div className="p-3 rounded-xl bg-info/10">
                  <Users className="h-5 w-5 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Cards */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="construction">Construction</TabsTrigger>
            <TabsTrigger value="solar">Solar</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project, index) => {
                const StatusIcon = statusConfig[project.status as keyof typeof statusConfig].icon;
                return (
                  <Card
                    key={project.id}
                    className="group hover:border-primary/30 transition-all cursor-pointer animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {project.type}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={statusConfig[project.status as keyof typeof statusConfig].color}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {project.status.replace("-", " ")}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {project.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">{project.client}</p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{project.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Due {new Date(project.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>

                      {/* Budget */}
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="text-xs text-muted-foreground">Budget</p>
                          <p className="font-semibold">{project.budget}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Spent</p>
                          <p className="font-semibold text-primary">{project.spent}</p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1">
                          <div className="flex -space-x-2">
                            {project.team.slice(0, 3).map((member, i) => (
                              <Avatar key={i} className="h-7 w-7 border-2 border-background">
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                  {member}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          {project.team.length > 3 && (
                            <span className="text-xs text-muted-foreground ml-1">
                              +{project.team.length - 3}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{project.milestones.completed}</span>
                          /{project.milestones.total} milestones
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="construction">
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Construction projects filtered view...
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="solar">
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Solar installation projects filtered view...
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
