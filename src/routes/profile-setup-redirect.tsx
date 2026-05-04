// components/ProfileSetupRedirect.tsx
import { useAuth } from "@/hooks/useAuth";
import { useProfileCheck } from "@/hooks/useProfileCheck";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProfileSetupRedirectProps {
  children: ReactNode;
}

export function ProfileSetupRedirect({ children }: ProfileSetupRedirectProps) {
  const { user, loading: authLoading } = useAuth();
  const { isComplete, loading: profileLoading } = useProfileCheck();
  const location = useLocation();

  // Wait for checks to complete
  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user profile is complete, redirect to dashboard
  if (isComplete) {
    const from = location.state?.from?.pathname;
    if (from && from !== location.pathname) {
      return <Navigate to={from} replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, allow access to setup page
  return <>{children}</>;
}
