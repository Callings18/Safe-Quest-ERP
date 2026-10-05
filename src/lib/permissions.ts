/**
 * Role → module permissions for SafeQuest ERP.
 * CEO (admin) is super-admin. Manager runs the business. Other roles are department-scoped.
 */

export type AppRole =
  | "admin"
  | "manager"
  | "accountant"
  | "receptionist"
  | "sales"
  | "technician"
  | "loan_officer"
  | "hr";

export type AppModule =
  | "dashboard"
  | "crm"
  | "invoicing"
  | "projects"
  | "inventory"
  | "procurement"
  | "assets"
  | "accounting"
  | "loans"
  | "payroll"
  | "reports"
  | "hr"
  | "compliance"
  | "notifications"
  | "settings"
  | "settings.roles"
  | "settings.tax";

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "CEO / Super Admin",
  manager: "Manager",
  accountant: "Accountant",
  receptionist: "Receptionist",
  sales: "Sales",
  technician: "Field Technician",
  loan_officer: "Loan Officer",
  hr: "HR",
};

export const DEPARTMENT_BY_ROLE: Record<AppRole, string> = {
  admin: "Executive",
  manager: "Management",
  accountant: "Finance & Accounting",
  receptionist: "Reception",
  sales: "Reception",
  technician: "Field Operations",
  loan_officer: "Loans",
  hr: "Human Resources",
};

/** Modules each role may open in the UI. */
const ROLE_MODULES: Record<AppRole, AppModule[]> = {
  admin: [
    "dashboard", "crm", "invoicing", "projects", "inventory", "procurement", "assets",
    "accounting", "loans", "payroll", "reports", "hr", "compliance", "notifications",
    "settings", "settings.roles", "settings.tax",
  ],
  manager: [
    "dashboard", "crm", "invoicing", "projects", "inventory", "procurement", "assets",
    "accounting", "loans", "payroll", "reports", "hr", "compliance", "notifications",
    "settings",
  ],
  accountant: [
    "dashboard", "accounting", "payroll", "reports", "invoicing", "notifications", "settings",
  ],
  receptionist: [
    "dashboard", "crm", "invoicing", "notifications", "settings",
  ],
  sales: [
    "dashboard", "crm", "invoicing", "notifications", "settings",
  ],
  technician: [
    "dashboard", "projects", "inventory", "assets", "notifications", "settings",
  ],
  loan_officer: [
    "dashboard", "loans", "crm", "reports", "notifications", "settings",
  ],
  hr: [
    "dashboard", "hr", "payroll", "notifications", "settings",
  ],
};

export const MODULE_PATHS: Record<Exclude<AppModule, "settings.roles" | "settings.tax">, string> = {
  dashboard: "/",
  crm: "/crm",
  invoicing: "/invoicing",
  projects: "/projects",
  inventory: "/inventory",
  procurement: "/procurement",
  assets: "/assets",
  accounting: "/accounting",
  loans: "/loans",
  payroll: "/payroll",
  reports: "/reports",
  hr: "/hr",
  compliance: "/compliance",
  notifications: "/notifications",
  settings: "/settings",
};

export const PATH_MODULE: Record<string, AppModule> = Object.fromEntries(
  Object.entries(MODULE_PATHS).map(([mod, path]) => [path, mod as AppModule]),
);

export const STAFF_ROLES: AppRole[] = [
  "admin",
  "manager",
  "accountant",
  "receptionist",
  "technician",
  "loan_officer",
  "hr",
  "sales",
];

export function collectModules(roles: string[]): Set<AppModule> {
  const set = new Set<AppModule>();
  if (!roles.length) {
    // No role yet: minimal access so new users are not locked out of settings profile only
    set.add("dashboard");
    set.add("notifications");
    set.add("settings");
    return set;
  }
  for (const r of roles) {
    const mods = ROLE_MODULES[r as AppRole];
    if (mods) mods.forEach((m) => set.add(m));
  }
  return set;
}

export function canAccessModule(roles: string[], module: AppModule): boolean {
  return collectModules(roles).has(module);
}

export function canAccessPath(roles: string[], path: string): boolean {
  const mod = PATH_MODULE[path];
  if (!mod) return true;
  return canAccessModule(roles, mod);
}

export function defaultHomePath(roles: string[]): string {
  if (roles.includes("admin") || roles.includes("manager")) return "/";
  if (roles.includes("accountant")) return "/accounting";
  if (roles.includes("loan_officer")) return "/loans";
  if (roles.includes("technician")) return "/projects";
  if (roles.includes("receptionist") || roles.includes("sales")) return "/crm";
  if (roles.includes("hr")) return "/hr";
  return "/";
}

export function roleSummary(role: AppRole): { can: string[]; cannot: string[] } {
  const summaries: Record<AppRole, { can: string[]; cannot: string[] }> = {
    admin: {
      can: ["Full ERP access", "Assign staff roles", "Tax & company settings", "All departments"],
      cannot: ["Nothing — super admin / owner"],
    },
    manager: {
      can: ["Run all business modules", "Approve work across departments", "View reports"],
      cannot: ["Assign CEO/admin roles", "Change tax banks / PAYE config"],
    },
    accountant: {
      can: ["Bookkeeping & journals", "VAT / AR reports", "Payroll view & posting support", "Invoice payments view"],
      cannot: ["Manage loans book", "Edit projects / field work", "Assign roles", "HR hiring"],
    },
    receptionist: {
      can: ["CRM customers & leads", "Quotations / invoices front desk", "Receive walk-in enquiries"],
      cannot: ["Accounting ledger", "Payroll", "Loans portfolio", "System settings admin"],
    },
    sales: {
      can: ["CRM & invoicing (legacy sales access)"],
      cannot: ["Finance backend", "Loans", "HR"],
    },
    technician: {
      can: ["Projects & sites", "Inventory movements", "Assets & fleet"],
      cannot: ["Bookkeeping", "Payroll", "Loan disbursements", "Staff roles"],
    },
    loan_officer: {
      can: ["Loan products & applications", "Schedules & collections", "Customer lookup for borrowers"],
      cannot: ["Company payroll", "Full accounting", "Procurement"],
    },
    hr: {
      can: ["Employee records", "Payroll runs", "Attendance"],
      cannot: ["Loan book", "Project BOQs", "Tax remittance banks"],
    },
  };
  return summaries[role];
}
