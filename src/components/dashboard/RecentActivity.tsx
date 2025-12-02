import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Users, Truck, CreditCard, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    type: "invoice",
    icon: FileText,
    title: "Invoice #INV-2024-092 created",
    description: "K45,000 • Zambia Solar Ltd",
    time: "2 min ago",
    status: "info",
  },
  {
    id: 2,
    type: "payment",
    icon: CreditCard,
    title: "Payment received",
    description: "K12,500 via Airtel Money",
    time: "15 min ago",
    status: "success",
  },
  {
    id: 3,
    type: "lead",
    icon: Users,
    title: "New lead assigned",
    description: "Copper Mining Corp → James Phiri",
    time: "32 min ago",
    status: "info",
  },
  {
    id: 4,
    type: "fleet",
    icon: Truck,
    title: "Vehicle maintenance due",
    description: "Toyota Hilux (ABL 1234) - Oil change",
    time: "1 hour ago",
    status: "warning",
  },
  {
    id: 5,
    type: "compliance",
    icon: AlertTriangle,
    title: "License expiring soon",
    description: "PACRA Certificate - 7 days remaining",
    time: "2 hours ago",
    status: "warning",
  },
  {
    id: 6,
    type: "project",
    icon: CheckCircle2,
    title: "Project milestone completed",
    description: "Kafue Solar Farm - Phase 2",
    time: "3 hours ago",
    status: "success",
  },
];

const statusColors = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
  error: "bg-destructive/10 text-destructive",
};

export function RecentActivity() {
  return (
    <Card className="animate-slide-up" style={{ animationDelay: "200ms" }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          <Badge variant="secondary" className="font-normal">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[340px]">
          <div className="px-6 pb-6 space-y-4">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3 group">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    statusColors[activity.status as keyof typeof statusColors]
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors cursor-pointer">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
