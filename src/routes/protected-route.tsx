import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loader } from "@hugeicons/core-free-icons";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-neutral-50 to-neutral-100">
        <div className="text-center">
          <HugeiconsIcon
            icon={Loader}
            strokeWidth={2}
            className="mx-auto mb-4 animate-spin text-neutral-600"
            size={48}
          />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}

// Optional: Role-based protection
interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function RoleProtectedRoute({
  children,
  allowedRoles,
}: RoleProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <HugeiconsIcon
          icon={Loader}
          strokeWidth={2}
          className="animate-spin"
          size={48}
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user's role is allowed
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this page.
          </p>
          <a href="/dashboard" className="text-primary hover:underline">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
