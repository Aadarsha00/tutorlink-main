import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowRight01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { useProfileCheck } from "@/hooks/useProfileCheck";
import { useAuth } from "@/hooks/useAuth";

const formatMissingItem = (value: string) => {
  const labels: Record<string, string> = {
    citizenship_front: "Citizenship front",
    citizenship_back: "Citizenship back",
    academic: "Academic certificate",
    experience: "Experience letter",
    id_card: "ID card",
    supporting_document: "Supporting document",
    full_name: "Full name",
    phone: "Phone number",
    experience_years: "Experience",
    hourly_rate_min: "Minimum rate",
    hourly_rate_max: "Maximum rate",
  };

  return (
    labels[value] ||
    value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
};

export function ProfileCompletionBanner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isComplete, completionData, loading } = useProfileCheck();
  const [dismissed, setDismissed] = React.useState(false);

  if (loading || isComplete || dismissed || !user || user.role === "admin") {
    return null;
  }

  const setupLink =
    user.role === "teacher"
      ? "/profile/teacher/setup"
      : "/profile/parent/setup";

  const completionPercentage = Math.max(
    0,
    Math.min(100, completionData?.completion_percentage ?? 0)
  );
  const missingItems = [
    ...(completionData?.missing_fields ?? []),
    ...(completionData?.missing_documents ?? []),
  ];
  const visibleMissingItems = missingItems.slice(0, 4);
  const hiddenMissingCount = Math.max(0, missingItems.length - 4);
  const hasProfile = completionData?.profile_exists ?? false;

  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-1 gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <HugeiconsIcon icon={Alert02Icon} size={22} />
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2">
                <h3 className="font-semibold text-amber-950">
                  Your profile is {completionPercentage}% complete
                </h3>
                <p className="text-sm text-amber-800">
                  {hasProfile
                    ? "Finish setup to unlock the full dashboard experience."
                    : "Create your profile to start using your dashboard."}
                </p>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-amber-100">
                <div
                  className="h-full rounded-full bg-amber-600 transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>

              {visibleMissingItems.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {visibleMissingItems.map((item) => (
                    <span
                      key={item}
                      className="rounded-md border border-amber-200 bg-white px-2 py-1 text-xs font-medium text-amber-900"
                    >
                      {formatMissingItem(item)}
                    </span>
                  ))}
                  {hiddenMissingCount > 0 && (
                    <span className="rounded-md border border-amber-200 bg-white px-2 py-1 text-xs font-medium text-amber-900">
                      +{hiddenMissingCount} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 md:self-start">
            <Button
              onClick={() => navigate(setupLink)}
              size="sm"
              className="bg-amber-700 text-white hover:bg-amber-800"
            >
              {hasProfile ? "Complete profile" : "Create profile"}
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={2}
                data-icon="inline-end"
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDismissed(true)}
              className="text-amber-800 hover:bg-amber-100 hover:text-amber-950"
              aria-label="Dismiss profile completion alert"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
