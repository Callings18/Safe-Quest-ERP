import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const pages = [
  { label: "Dashboard", path: "/", group: "Overview" },
  { label: "CRM", path: "/crm", group: "Sales" },
  { label: "Invoicing", path: "/invoicing", group: "Sales" },
  { label: "Projects", path: "/projects", group: "Operations" },
  { label: "Inventory", path: "/inventory", group: "Operations" },
  { label: "Procurement", path: "/procurement", group: "Operations" },
  { label: "Assets", path: "/assets", group: "Operations" },
  { label: "Accounting", path: "/accounting", group: "Finance" },
  { label: "Loans", path: "/loans", group: "Finance" },
  { label: "Payroll", path: "/payroll", group: "Finance" },
  { label: "Reports", path: "/reports", group: "Finance" },
  { label: "HR", path: "/hr", group: "People & risk" },
  { label: "Compliance", path: "/compliance", group: "People & risk" },
  { label: "Notifications", path: "/notifications", group: "Workspace" },
  { label: "Settings", path: "/settings", group: "Workspace" },
  { label: "Customize documents", path: "/settings?tab=documents", group: "Workspace" },
];

const creates = [
  { label: "New customer", path: "/crm" },
  { label: "New lead", path: "/crm" },
  { label: "New project", path: "/projects" },
  { label: "New invoice", path: "/invoicing" },
  { label: "New purchase order", path: "/procurement" },
  { label: "New contract", path: "/compliance" },
];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const go = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages and actions…" />
      <CommandList>
        <CommandEmpty>No match.</CommandEmpty>
        {["Overview", "Sales", "Operations", "Finance", "People & risk", "Workspace"].map((group) => (
          <CommandGroup key={group} heading={group}>
            {pages
              .filter((p) => p.group === group)
              .map((p) => (
                <CommandItem key={p.path} onSelect={() => go(p.path)}>
                  {p.label}
                </CommandItem>
              ))}
          </CommandGroup>
        ))}
        <CommandGroup heading="Create">
          {creates.map((p) => (
            <CommandItem key={p.label} onSelect={() => go(p.path)}>
              {p.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
}
