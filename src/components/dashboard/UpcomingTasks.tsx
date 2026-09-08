import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";
import { Link } from "react-router-dom";

type Task = {
  id: string;
  title: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  category: string;
  href: string;
};

const priorityColors = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-muted text-muted-foreground border-border",
};

export function UpcomingTasks() {
  const { data: tasks } = useQuery({
    queryKey: ["dashboard_tasks"],
    queryFn: async () => {
      const today = new Date();
      const [{ data: invoices }, { data: loans }, { data: docs }, { data: pos }, { data: leave }] = await Promise.all([
        supabase.from("invoices").select("id, invoice_number, status, due_date").neq("status", "paid").neq("status", "cancelled").neq("status", "draft"),
        supabase.from("loans").select("id, loan_number, status, borrower_name").eq("status", "pending"),
        supabase.from("compliance_documents").select("id, name, expiry_date"),
        supabase.from("purchase_orders").select("id, order_number, status").in("status", ["draft", "approved"]),
        supabase.from("leave_requests").select("id, leave_type, start_date, status").eq("status", "pending"),
      ]);

      const list: Task[] = [];

      invoices?.forEach((inv) => {
        const overdue = inv.status === "overdue" || (inv.due_date && differenceInDays(new Date(inv.due_date), today) < 0);
        list.push({
          id: `inv-${inv.id}`,
          title: `${overdue ? "Collect overdue" : "Follow up"} ${inv.invoice_number}`,
          dueDate: inv.due_date || "Open",
          priority: overdue ? "high" : "medium",
          category: "Invoicing",
          href: "/invoicing",
        });
      });

      loans?.forEach((loan) => {
        list.push({
          id: `loan-${loan.id}`,
          title: `Review loan ${loan.loan_number} (${loan.borrower_name})`,
          dueDate: "Pending",
          priority: "high",
          category: "Loans",
          href: "/loans",
        });
      });

      docs?.forEach((doc) => {
        if (!doc.expiry_date) return;
        const days = differenceInDays(new Date(doc.expiry_date), today);
        if (days > 30) return;
        list.push({
          id: `doc-${doc.id}`,
          title: `${days < 0 ? "Expired" : "Renew"} ${doc.name}`,
          dueDate: doc.expiry_date,
          priority: days < 0 ? "high" : "medium",
          category: "Compliance",
          href: "/compliance",
        });
      });

      pos?.forEach((po) => {
        list.push({
          id: `po-${po.id}`,
          title: `Complete purchase order ${po.order_number}`,
          dueDate: po.status,
          priority: "low",
          category: "Procurement",
          href: "/procurement",
        });
      });

      leave?.forEach((req) => {
        list.push({
          id: `leave-${req.id}`,
          title: `Approve ${req.leave_type} leave`,
          dueDate: req.start_date,
          priority: "medium",
          category: "HR",
          href: "/hr",
        });
      });

      const rank = { high: 0, medium: 1, low: 2 };
      return list.sort((a, b) => rank[a.priority] - rank[b.priority]).slice(0, 8);
    },
  });

  return (
    <Card className="animate-slide-up" style={{ animationDelay: "400ms" }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Upcoming Tasks</CardTitle>
          <Link to="/notifications">
            <span className="text-sm text-primary hover:text-primary/80 inline-flex items-center gap-1">
              View all
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!tasks?.length ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Nothing waiting. Overdue invoices, pending loans, and expiring licences will appear here.</p>
        ) : (
          tasks.map((task) => (
            <Link
              key={task.id}
              to={task.href}
              className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors group"
            >
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
              <Badge variant="outline" className={priorityColors[task.priority]}>
                {task.priority}
              </Badge>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
