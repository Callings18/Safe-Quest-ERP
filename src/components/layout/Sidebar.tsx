import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Package,
  ShoppingCart,
  FileText,
  Landmark,
  Calculator,
  ShieldCheck,
  Truck,
  UserCog,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Zap,
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

const mainNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "CRM & Sales", path: "/crm" },
  { icon: FolderKanban, label: "Projects & Sites", path: "/projects" },
  { icon: Package, label: "Inventory", path: "/inventory" },
  { icon: ShoppingCart, label: "Procurement", path: "/procurement" },
  { icon: FileText, label: "Invoicing", path: "/invoicing" },
  { icon: Landmark, label: "Loans", path: "/loans" },
  { icon: Calculator, label: "Payroll", path: "/payroll" },
  { icon: ShieldCheck, label: "Compliance", path: "/compliance" },
  { icon: Truck, label: "Assets & Fleet", path: "/assets" },
  { icon: UserCog, label: "HR & Employees", path: "/hr" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
];

const bottomNavItems = [
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const NavItem = ({ item }: { item: typeof mainNavItems[0] }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    const linkContent = (
      <NavLink
        to={item.path}
        className={cn(
          "sidebar-item group relative",
          isActive && "sidebar-item-active"
        )}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-r-full" />
        )}
        <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-sidebar-primary")} />
        {!collapsed && (
          <span className="truncate">{item.label}</span>
        )}
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
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-sidebar-border",
        collapsed ? "justify-center" : "gap-3"
      )}>
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-glow">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-lg font-bold text-sidebar-foreground tracking-tight">
              SAFEQUEST
            </span>
            <span className="text-[10px] text-sidebar-foreground/50 uppercase tracking-widest">
              Enterprise
            </span>
          </div>
        )}
      </div>

      {/* Branch Selector */}
      {!collapsed && (
        <div className="px-3 py-3">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors">
            <Building2 className="h-4 w-4 text-sidebar-foreground/60" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-sidebar-foreground">Lusaka HQ</p>
              <p className="text-xs text-sidebar-foreground/50">Main Branch</p>
            </div>
          </button>
        </div>
      )}

      <Separator className="bg-sidebar-border" />

      {/* Main Navigation */}
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="space-y-1">
          {mainNavItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>
      </ScrollArea>

      <Separator className="bg-sidebar-border" />

      {/* Bottom Navigation */}
      <div className="px-3 py-3 space-y-1">
        {bottomNavItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}

        {/* User Profile */}
        <div className={cn(
          "flex items-center gap-3 px-3 py-2 mt-2 rounded-lg bg-sidebar-accent/30",
          collapsed && "justify-center"
        )}>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
            JM
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">John Mwamba</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">Administrator</p>
            </div>
          )}
          {!collapsed && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Collapse Button */}
      <div className="absolute -right-3 top-20">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-full bg-card border-border shadow-md"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </div>
    </aside>
  );
}
