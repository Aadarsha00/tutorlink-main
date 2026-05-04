// components/ProfileRequiredRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfileCheck } from "@/hooks/useProfileCheck";

interface ProfileRequiredRouteProps {
  children: ReactNode;
}

export function ProfileRequiredRoute({ children }: ProfileRequiredRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasProfile, isComplete, loading: profileLoading } = useProfileCheck();
  const location = useLocation();

  // Wait for auth and profile checks to complete
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

  // Redirect to profile setup if profile doesn't exist OR is incomplete
  if (
    (!hasProfile || !isComplete) &&
    (user.role === "teacher" || user.role === "parent")
  ) {
    const profilePath =
      user.role === "teacher"
        ? "/profile/teacher/setup"
        : "/profile/parent/setup";
    return <Navigate to={profilePath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
