import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Bell, AlertTriangle, CheckCircle2, Info, FileText, Landmark, ShieldCheck, Truck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useComplianceStats } from "@/hooks/useCompliance";
import { useInvoiceStats } from "@/hooks/useInvoices";

const iconMap: Record<string, any> = {
  invoice: FileText, loan: Landmark, compliance: ShieldCheck, project: Info, asset: Truck,
};

export default function Notifications() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["activity_log"],
    queryFn: async () => {
      const { data, error } = await supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: complianceStats } = useComplianceStats();
  const { data: invoiceStats } = useInvoiceStats();

  const alerts = [];
  if (complianceStats?.expiringSoon && complianceStats.expiringSoon > 0) {
    alerts.push({ type: "warning", message: `${complianceStats.expiringSoon} compliance document(s) expiring soon`, icon: ShieldCheck });
  }
  if (invoiceStats?.overdue && invoiceStats.overdue > 0) {
    alerts.push({ type: "destructive", message: `${invoiceStats.overdue} invoice(s) overdue`, icon: AlertTriangle });
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">System alerts, reminders, and activity feed</p>
        </div>

        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((a, i) => (
              <Card key={i} className={a.type === "destructive" ? "border-destructive/50 bg-destructive/5" : "border-warning/50 bg-warning/5"}>
                <CardContent className="p-4 flex items-center gap-3">
                  <a.icon className={`h-5 w-5 ${a.type === "destructive" ? "text-destructive" : "text-warning"}`} />
                  <span className="text-sm font-medium">{a.message}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Activity Feed</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {activities?.map(a => {
                    const Icon = iconMap[a.entity_type || ""] || Info;
                    return (
                      <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{a.action}</p>
                          {a.description && <p className="text-xs text-muted-foreground">{a.description}</p>}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    );
                  })}
                  {(!activities || activities.length === 0) && (
                    <p className="text-center py-8 text-muted-foreground">No activity yet. Actions across the system will appear here.</p>
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
