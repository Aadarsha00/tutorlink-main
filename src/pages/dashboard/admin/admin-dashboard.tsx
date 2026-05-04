import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { RefreshIcon } from "@hugeicons/core-free-icons";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import {
  DashboardLoadingState,
  DashboardErrorState,
  DashboardFilters,
} from "@/components/dashboard/shared";
import { AdminStats, AdminCharts } from "@/components/dashboard/admin";

export default function AdminDashboard() {
  const {
    stats,
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
  } = useAdminDashboard();

  if (loading) {
    return <DashboardLoadingState />;
  }

  if (error) {
    return <DashboardErrorState error={error} />;
  }

  if (!stats) {
    return <DashboardErrorState error="Failed to load dashboard data" />;
  }

  const { summary, charts, distributions } = stats;

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 via-white to-neutral-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent mb-2">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Platform analytics and insights
              </p>
            </div>
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

        <AdminStats summary={summary} />

        <AdminCharts
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
