import { Alert, AlertDescription } from "@/components/ui/alert";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";

interface DashboardErrorStateProps {
  error: string;
}

export function DashboardErrorState({ error }: DashboardErrorStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Alert variant="destructive" className="max-w-md">
        <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </div>
  );
}
