import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useBranches, useCompanySettings } from "@/hooks/useCompanySettings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Package,
  ShoppingCart,
  FileText,
  Landmark,
  Calculator,
  BookOpen,
  ShieldCheck,
  Truck,
  UserCog,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BrandLogo } from "@/components/BrandLogo";

type NavItemDef = { icon: typeof LayoutDashboard; label: string; path: string };

const dashboardItem: NavItemDef = { icon: LayoutDashboard, label: "Dashboard", path: "/" };

const navGroups: { id: string; label: string; items: NavItemDef[] }[] = [
  {
    id: "sales",
    label: "Sales",
    items: [
      { icon: Users, label: "CRM", path: "/crm" },
      { icon: FileText, label: "Invoicing", path: "/invoicing" },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { icon: FolderKanban, label: "Projects", path: "/projects" },
      { icon: Package, label: "Inventory", path: "/inventory" },
      { icon: ShoppingCart, label: "Procurement", path: "/procurement" },
      { icon: Truck, label: "Assets & Fleet", path: "/assets" },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    items: [
      { icon: BookOpen, label: "Bookkeeping", path: "/accounting" },
      { icon: Landmark, label: "Loans", path: "/loans" },
      { icon: Calculator, label: "Payroll", path: "/payroll" },
      { icon: BarChart3, label: "Reports", path: "/reports" },
    ],
  },
  {
    id: "people",
    label: "People & risk",
    items: [
      { icon: UserCog, label: "HR", path: "/hr" },
      { icon: ShieldCheck, label: "Compliance", path: "/compliance" },
    ],
  },
];

const bottomNavItems: NavItemDef[] = [
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, onCollapsedChange }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: branches } = useBranches();
  const { data: company } = useCompanySettings();
  const hq = branches?.[0];

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      navGroups.forEach((g) => {
        if (g.items.some((i) => location.pathname === i.path)) next[g.id] = true;
      });
      return next;
    });
  }, [location.pathname]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const getInitials = (name: string | null | undefined) => {
    if (!name) return user?.email?.slice(0, 2).toUpperCase() || "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const NavItem = ({ item }: { item: NavItemDef }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    const linkContent = (
      <NavLink
        to={item.path}
        className={cn("sidebar-item group relative", isActive && "sidebar-item-active")}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-r-full" />
        )}
        <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-sidebar-primary")} />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-[60] h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex items-center h-16 px-3 border-b border-sidebar-border",
          collapsed ? "justify-center" : "gap-2.5",
        )}
      >
        <BrandLogo className="h-10 w-10 shrink-0" />
        {!collapsed && (
          <div className="min-w-0">
            <span className="text-sm font-bold text-sidebar-foreground tracking-tight block leading-tight">
              SafeQuest
            </span>
            <span className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">ERP</span>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="px-3 py-3">
          <div className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent/50">
            <Building2 className="h-4 w-4 text-sidebar-foreground/60 shrink-0" />
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {hq?.name || company?.company_name || "SafeQuest"}
              </p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{hq?.city || "Head office"}</p>
            </div>
          </div>
        </div>
      )}

      <Separator className="bg-sidebar-border" />

      <ScrollArea className="flex-1 px-2 py-3">
        <nav className="space-y-1">
          <NavItem item={dashboardItem} />

          {collapsed
            ? navGroups.flatMap((g) => g.items).map((item) => <NavItem key={item.path} item={item} />)
            : navGroups.map((group) => {
                const isOpen = openGroups[group.id] ?? group.items.some((i) => location.pathname === i.path);
                const groupActive = group.items.some((i) => location.pathname === i.path);
                return (
                  <Collapsible
                    key={group.id}
                    open={isOpen}
                    onOpenChange={(open) => setOpenGroups((s) => ({ ...s, [group.id]: open }))}
                  >
                    <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/45 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent/40">
                      <span>{group.label}</span>
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180", groupActive && "text-sidebar-primary")} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-0.5 pb-1">
                      {group.items.map((item) => (
                        <NavItem key={item.path} item={item} />
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
        </nav>
      </ScrollArea>

      <Separator className="bg-sidebar-border" />

      <div className="px-2 py-3 space-y-1">
        {bottomNavItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}

        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2 mt-2 rounded-lg bg-sidebar-accent/30 cursor-pointer hover:bg-sidebar-accent/50 transition-colors",
            collapsed && "justify-center",
          )}
          onClick={() => navigate("/settings")}
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-sm font-semibold">
              {getInitials(profile?.full_name)}
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSignOut();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sign out</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="absolute -right-3 top-20">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-full bg-card border-border shadow-md"
          onClick={() => onCollapsedChange(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </div>
    </aside>
  );
}
