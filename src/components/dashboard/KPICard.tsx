import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  iconBgClass?: string;
  delay?: number;
}

export function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconBgClass = "bg-primary/10 text-primary",
  delay = 0,
}: KPICardProps) {
  const TrendIcon = change === undefined ? null : change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  const trendColor = change === undefined ? "" : change > 0 ? "text-success" : change < 0 ? "text-destructive" : "text-muted-foreground";

  return (
    <div
      className="kpi-card animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {change !== undefined && (
            <div className={cn("flex items-center gap-1 text-sm", trendColor)}>
              {TrendIcon && <TrendIcon className="h-4 w-4" />}
              <span className="font-medium">{change > 0 ? "+" : ""}{change}%</span>
              {changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", iconBgClass)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
