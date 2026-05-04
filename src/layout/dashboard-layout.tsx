import * as React from "react";
import Sidebar from "@/components/layout/sidebar";
import { NotificationDropdown } from "@/components/notifications/notification-component";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ProfileCompletionBanner } from "@/components/profile/profile-completion-banner";
import { DocumentVerificationBanner } from "@/components/profile/document-verification-banner";
import { useAuth } from "@/hooks/useAuth";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, refreshUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;

    const refreshOnFocus = () => {
      if (document.visibilityState === "visible") {
        refreshUser();
      }
    };
    const refreshInterval = window.setInterval(refreshUser, 30000);

    window.addEventListener("focus", refreshUser);
    document.addEventListener("visibilitychange", refreshOnFocus);

    return () => {
      window.clearInterval(refreshInterval);
      window.removeEventListener("focus", refreshUser);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [refreshUser, user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <Sidebar
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={logout}
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Top Bar */}
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage
                  src={user.profile_picture}
                  alt={`${user.first_name}'s profile picture`}
                />
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">
                  Welcome back,{" "}
                  <span className="text-emerald-500">{user.first_name}!👋</span>
                </h2>
                <p className="text-sm text-neutral-500">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <NotificationDropdown />
            </div>
          </div>
        </header>

        <ProfileCompletionBanner />
        <DocumentVerificationBanner />

        {/* Page Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
