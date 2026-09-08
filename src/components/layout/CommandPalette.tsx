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
  { label: "Dashboard", path: "/" },
  { label: "CRM & Sales", path: "/crm" },
  { label: "Projects", path: "/projects" },
  { label: "Inventory", path: "/inventory" },
  { label: "Procurement", path: "/procurement" },
  { label: "Invoicing", path: "/invoicing" },
  { label: "Loans", path: "/loans" },
  { label: "Payroll", path: "/payroll" },
  { label: "Accounting", path: "/accounting" },
  { label: "Compliance", path: "/compliance" },
  { label: "Assets", path: "/assets" },
  { label: "HR", path: "/hr" },
  { label: "Reports", path: "/reports" },
  { label: "Notifications", path: "/notifications" },
  { label: "Settings", path: "/settings" },
];

const creates = [
  { label: "New lead", path: "/crm" },
  { label: "New project", path: "/projects" },
  { label: "New invoice", path: "/invoicing" },
  { label: "New purchase order", path: "/procurement" },
  { label: "New loan", path: "/loans" },
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
        <CommandGroup heading="Go to">
          {pages.map((p) => (
            <CommandItem key={p.path} onSelect={() => go(p.path)}>
              {p.label}
            </CommandItem>
          ))}
        </CommandGroup>
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
