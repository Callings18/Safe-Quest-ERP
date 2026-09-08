import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Info, Landmark, ShieldCheck, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

const iconMap: Record<string, typeof FileText> = {
  invoice: FileText,
  loan: Landmark,
  compliance: ShieldCheck,
  asset: Truck,
};

export function RecentActivity() {
  const { data: activities } = useQuery({
    queryKey: ["dashboard_activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data;
    },
  });

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
            {!activities?.length ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No activity yet. Create a lead, invoice, or loan to start the feed.</p>
            ) : (
              activities.map((activity) => {
                const Icon = iconMap[activity.entity_type || ""] || Info;
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg bg-primary/10 text-primary")}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.action}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.description || activity.entity_type}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </span>
                  </div>
                );
              })
            )}
            <Link to="/notifications" className="block text-sm text-primary text-center pt-2">View all</Link>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
