import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays, Clock, ArrowRight } from "lucide-react";

const tasks = [
  {
    id: 1,
    title: "Process monthly payroll",
    dueDate: "Today",
    priority: "high",
    category: "Payroll",
  },
  {
    id: 2,
    title: "Review loan applications (3)",
    dueDate: "Today",
    priority: "high",
    category: "Loans",
  },
  {
    id: 3,
    title: "Site inspection - Kafue Solar",
    dueDate: "Tomorrow",
    priority: "medium",
    category: "Projects",
  },
  {
    id: 4,
    title: "Submit NAPSA returns",
    dueDate: "Dec 10",
    priority: "medium",
    category: "Compliance",
  },
  {
    id: 5,
    title: "Approve purchase orders (5)",
    dueDate: "Dec 5",
    priority: "low",
    category: "Procurement",
  },
];

const priorityColors = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-muted text-muted-foreground border-border",
};

export function UpcomingTasks() {
  return (
    <Card className="animate-slide-up" style={{ animationDelay: "400ms" }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Upcoming Tasks</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 gap-1">
            View all
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors group"
          >
            <Checkbox className="mt-0.5" />
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                {task.title}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{task.dueDate}</span>
                <span>•</span>
                <span>{task.category}</span>
              </div>
            </div>
            <Badge
              variant="outline"
              className={priorityColors[task.priority as keyof typeof priorityColors]}
            >
              {task.priority}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
