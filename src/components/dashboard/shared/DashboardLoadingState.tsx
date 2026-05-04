export function DashboardLoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-neutral-50 to-neutral-100">
      <div className="text-center">
        <div className="animate-spin text-6xl mb-4">⏳</div>
        <p className="text-lg text-muted-foreground animate-pulse">
          Loading dashboard...
        </p>
      </div>
    </div>
  );
}
