import { useMemo } from "react";
import { useMyRoles } from "@/hooks/useCompanySettings";
import {
  canAccessModule,
  canAccessPath,
  collectModules,
  defaultHomePath,
  type AppModule,
} from "@/lib/permissions";

export function usePermissions() {
  const { data: roles = [], isLoading } = useMyRoles();
  const modules = useMemo(() => collectModules(roles), [roles]);

  return {
    roles,
    modules,
    loading: isLoading,
    isAdmin: roles.includes("admin"),
    isManager: roles.includes("manager") || roles.includes("admin"),
    can: (module: AppModule) => canAccessModule(roles, module),
    canPath: (path: string) => canAccessPath(roles, path),
    homePath: defaultHomePath(roles),
  };
}
