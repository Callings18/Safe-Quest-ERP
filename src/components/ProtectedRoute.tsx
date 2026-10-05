import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Loader2 } from "lucide-react";
import type { AppModule } from "@/lib/permissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  module?: AppModule;
}

export function ProtectedRoute({ children, module }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { can, loading: rolesLoading, homePath } = usePermissions();
  const location = useLocation();

  if (loading || (user && rolesLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (module && !can(module)) {
    return <Navigate to={homePath || "/"} replace state={{ from: location.pathname, denied: true }} />;
  }

  return <>{children}</>;
}
