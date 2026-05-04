import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Briefcase01Icon, RefreshIcon } from "@hugeicons/core-free-icons";
import { useTeacherDashboard } from "@/hooks/useTeacherDashboard";
import {
  DashboardLoadingState,
  DashboardErrorState,
  DashboardFilters,
  PremiumBanner,
} from "@/components/dashboard/shared";
import {
  TeacherStats,
  SelectedApplicationsList,
  TeacherCharts,
} from "@/components/dashboard/teacher";

export function TeacherDashboard() {
  const {
    stats,
    selectedApplications,
    loading,
    filterLoading,
    error,
    timeRange,
    dateFrom,
    dateTo,
    showCustomDate,
    chartType,
    setDateFrom,
    setDateTo,
    setChartType,
    handleTimeRangeChange,
    handleCustomDateApply,
    handleRefresh,
    handleAccept,
    handleReject,
  } = useTeacherDashboard();

  if (loading) {
    return <DashboardLoadingState />;
  }

  if (error) {
    return <DashboardErrorState error={error} />;
  }

  if (!stats) {
    return <DashboardErrorState error="Failed to load dashboard data" />;
  }

  const { summary, charts, distributions, premium } = stats;

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 via-white to-neutral-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent mb-2">
                Teacher Dashboard
              </h1>
              <p className="text-muted-foreground">
                Your applications and performance
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={filterLoading}
              >
                <HugeiconsIcon
                  icon={RefreshIcon}
                  size={16}
                  className={filterLoading ? "animate-spin" : ""}
                />
                Refresh
              </Button>
              <Button asChild>
                <Link to="/gigs">
                  <HugeiconsIcon
                    icon={Briefcase01Icon}
                    data-icon="inline-start"
                  />
                  Browse Gigs
                </Link>
              </Button>
            </div>
          </div>

          <DashboardFilters
            timeRange={timeRange}
            dateFrom={dateFrom}
            dateTo={dateTo}
            showCustomDate={showCustomDate}
            loading={filterLoading}
            onTimeRangeChange={handleTimeRangeChange}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onApplyCustomDate={handleCustomDateApply}
            onRefresh={handleRefresh}
          />
        </div>

        <PremiumBanner premium={premium} />
        <TeacherStats summary={summary} />

        <SelectedApplicationsList
          applications={selectedApplications}
          onAccept={handleAccept}
          onReject={handleReject}
        />

        <TeacherCharts
          chartType={chartType}
          onChartTypeChange={setChartType}
          loading={filterLoading}
          charts={charts}
          distributions={distributions}
        />
      </div>
    </div>
  );
}
