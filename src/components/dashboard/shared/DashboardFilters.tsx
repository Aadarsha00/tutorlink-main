import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { FilterIcon, Calendar03Icon, RefreshIcon } from "@hugeicons/core-free-icons";

const TIME_PRESETS = [
  { label: "Last 7 Days", value: "7d", days: 7 },
  { label: "Last 30 Days", value: "30d", days: 30 },
  { label: "Last 3 Months", value: "3m", months: 3 },
  { label: "Last 6 Months", value: "6m", months: 6 },
  { label: "Last Year", value: "1y", months: 12 },
  { label: "All Time", value: "all", days: 9999 },
];

interface DashboardFiltersProps {
  timeRange: string;
  dateFrom: string;
  dateTo: string;
  showCustomDate: boolean;
  loading: boolean;
  onTimeRangeChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onApplyCustomDate: () => void;
  onRefresh: () => void;
}

export function DashboardFilters({
  timeRange,
  dateFrom,
  dateTo,
  showCustomDate,
  loading,
  onTimeRangeChange,
  onDateFromChange,
  onDateToChange,
  onApplyCustomDate,
  onRefresh,
}: DashboardFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={FilterIcon}
              size={18}
              className="text-muted-foreground"
            />
            <Label className="text-sm font-medium">Filters:</Label>
          </div>

          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Calendar03Icon}
              size={16}
              className="text-muted-foreground"
            />
            <Select value={timeRange} onValueChange={onTimeRangeChange} disabled={loading}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {TIME_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showCustomDate && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                className="w-37.5"
                disabled={loading}
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                className="w-37.5"
                min={dateFrom}
                disabled={loading}
              />
              <Button
                size="sm"
                onClick={onApplyCustomDate}
                disabled={!dateFrom || !dateTo || loading}
              >
                Apply
              </Button>
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <HugeiconsIcon
                icon={RefreshIcon}
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
