import { Bell, Search, Plus, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CommandPalette, useCommandPalette } from "./CommandPalette";
import { formatDistanceToNow } from "date-fns";

export function TopBar() {
  const navigate = useNavigate();
  const { open, setOpen } = useCommandPalette();
  const { data: activities } = useQuery({
    queryKey: ["topbar_activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <CommandPalette open={open} onOpenChange={setOpen} />
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          readOnly
          onClick={() => setOpen(true)}
          placeholder="Search anything... (Ctrl+K)"
          className="pl-10 bg-secondary/50 border-transparent focus:border-primary/30 focus:bg-background cursor-pointer"
        />
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-md">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Create</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Create New</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/crm")}>New Lead</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/projects")}>New Project</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/invoicing")}>New Invoice</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/procurement")}>New Purchase Order</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/loans")}>New Loan Application</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/settings")}>
          <HelpCircle className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              {!!activities?.length && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-destructive border-2 border-background">
                  {Math.min(activities.length, 9)}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {!activities?.length ? (
                <p className="p-4 text-sm text-muted-foreground">No activity yet.</p>
              ) : (
                activities.map((a) => (
                  <DropdownMenuItem key={a.id} className="flex flex-col items-start gap-1 py-3">
                    <span className="font-medium text-sm">{a.action}</span>
                    <span className="text-xs text-muted-foreground">{a.description}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                    </span>
                  </DropdownMenuItem>
                ))
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-primary justify-center" onClick={() => navigate("/notifications")}>
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
