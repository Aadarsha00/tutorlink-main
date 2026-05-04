import * as React from "react";
import api from "@/services/api";

export const TIME_PRESETS = [
  { label: "Last 7 Days", value: "7d", days: 7 },
  { label: "Last 30 Days", value: "30d", days: 30 },
  { label: "Last 3 Months", value: "3m", months: 3 },
  { label: "Last 6 Months", value: "6m", months: 6 },
  { label: "Last Year", value: "1y", months: 12 },
  { label: "All Time", value: "all", days: 9999 },
];

export function useAdminDashboard() {
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [filterLoading, setFilterLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Filter state
  const [timeRange, setTimeRange] = React.useState("1y");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [showCustomDate, setShowCustomDate] = React.useState(false);
  const [chartType, setChartType] = React.useState<"revenue" | "users" | "gigs">(
    "revenue"
  );

  React.useEffect(() => {
    loadDashboardData();
  }, []);

  const calculateDateRange = (range: string) => {
    const now = new Date();
    const preset = TIME_PRESETS.find((p) => p.value === range);

    if (!preset || range === "all") {
      return { date_from: undefined, date_to: undefined };
    }

    let startDate: Date;
    if (preset.days) {
      startDate = new Date(now.getTime() - preset.days * 24 * 60 * 60 * 1000);
    } else if (preset.months) {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - preset.months);
    } else {
      return { date_from: undefined, date_to: undefined };
    }

    return {
      date_from: startDate.toISOString().split("T")[0],
      date_to: now.toISOString().split("T")[0],
    };
  };

  const loadDashboardData = async (customFilters?: {
    date_from?: string;
    date_to?: string;
  }) => {
    try {
      setFilterLoading(true);
      setError(null);

      let filters;
      if (customFilters) {
        filters = customFilters;
      } else if (timeRange !== "all") {
        filters = calculateDateRange(timeRange);
      }

      const data = await api.stats.admin(filters);
      setStats(data);
    } catch (err: any) {
      console.error("Failed to load admin dashboard", err);
      setError(err.response?.data?.detail || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    if (value === "custom") {
      setShowCustomDate(true);
    } else {
      setShowCustomDate(false);
      setDateFrom("");
      setDateTo("");
      loadDashboardData();
    }
  };

  const handleCustomDateApply = () => {
    if (dateFrom && dateTo) {
      loadDashboardData({
        date_from: dateFrom,
        date_to: dateTo,
      });
    }
  };

  const handleRefresh = () => {
    if (showCustomDate && dateFrom && dateTo) {
      loadDashboardData({ date_from: dateFrom, date_to: dateTo });
    } else {
      loadDashboardData();
    }
  };

  return {
    // State
    stats,
    loading,
    filterLoading,
    error,
    timeRange,
    dateFrom,
    dateTo,
    showCustomDate,
    chartType,

    // Setters
    setDateFrom,
    setDateTo,
    setChartType,

    // Handlers
    handleTimeRangeChange,
    handleCustomDateApply,
    handleRefresh,
    loadDashboardData,
  };
}
