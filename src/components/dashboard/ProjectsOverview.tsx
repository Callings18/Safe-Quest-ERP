import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Users } from "lucide-react";

const projects = [
  {
    id: 1,
    name: "Kafue Solar Farm - Phase 2",
    client: "Zambia Energy Corp",
    location: "Kafue",
    progress: 75,
    status: "on-track",
    team: 8,
    budget: "K2.4M",
  },
  {
    id: 2,
    name: "Lusaka Office Complex",
    client: "Premier Properties",
    location: "Lusaka CBD",
    progress: 45,
    status: "at-risk",
    team: 12,
    budget: "K5.8M",
  },
  {
    id: 3,
    name: "Residential Solar Installation",
    client: "Multiple Clients",
    location: "Kabulonga",
    progress: 90,
    status: "on-track",
    team: 4,
    budget: "K850K",
  },
];

const statusColors = {
  "on-track": "bg-success/10 text-success border-success/20",
  "at-risk": "bg-warning/10 text-warning border-warning/20",
  "delayed": "bg-destructive/10 text-destructive border-destructive/20",
};

export function ProjectsOverview() {
  return (
    <Card className="col-span-2 animate-slide-up" style={{ animationDelay: "500ms" }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Active Projects</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 gap-1">
            View all projects
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all hover:border-primary/20 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-1">
                  <h4 className="font-semibold group-hover:text-primary transition-colors">
                    {project.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">{project.client}</p>
                </div>
                <Badge
                  variant="outline"
                  className={statusColors[project.status as keyof typeof statusColors]}
                >
                  {project.status.replace("-", " ")}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{project.team} members</span>
                    </div>
                  </div>
                  <span className="font-semibold text-primary">{project.budget}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
