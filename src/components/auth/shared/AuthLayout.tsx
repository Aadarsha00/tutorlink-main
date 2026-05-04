// Auth Layout wrapper
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-neutral-50 to-neutral-100 p-4">
      {children}
    </div>
  );
}
