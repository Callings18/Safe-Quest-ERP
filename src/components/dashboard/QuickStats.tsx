import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const stats = [
  { label: "Active Projects", current: 12, total: 15, color: "bg-primary" },
  { label: "Loan Portfolio", current: 85, total: 100, color: "bg-success" },
  { label: "Inventory Health", current: 72, total: 100, color: "bg-info" },
  { label: "Staff Attendance", current: 94, total: 100, color: "bg-warning" },
];

export function QuickStats() {
  return (
    <Card className="animate-slide-up" style={{ animationDelay: "300ms" }}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {stats.map((stat) => {
          const percentage = Math.round((stat.current / stat.total) * 100);
          return (
            <div key={stat.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{stat.label}</span>
                <span className="font-medium">{percentage}%</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
