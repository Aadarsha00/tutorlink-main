import { Card, CardContent } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Briefcase01Icon,
  DollarCircleIcon,
  TrendingUp,
  Clock02Icon,
} from "@hugeicons/core-free-icons";

interface ParentStatsProps {
  summary: any;
}

const formatNumber = (value: number | undefined | null) =>
  typeof value === "number" ? value.toLocaleString() : "0";

const formatCurrency = (value: number | undefined | null) =>
  `Rs. ${formatNumber(value)}`;

export function ParentStats({ summary }: ParentStatsProps) {
  const stats = [
    {
      label: "Active Gigs",
      value: formatNumber(summary?.active_gigs),
      subValue: `${formatNumber(summary?.completed_gigs)} completed`,
      icon: Briefcase01Icon,
      color: "blue",
    },
    {
      label: "Total Spent",
      value: formatCurrency(summary?.total_spent),
      subValue: `${formatCurrency(summary?.pending_payments)} pending`,
      icon: DollarCircleIcon,
      color: "green",
    },
    {
      label: "Success Rate",
      value: `${formatNumber(summary?.success_rate)}%`,
      subValue: `${summary?.total_sessions || 0} sessions`,
      icon: TrendingUp,
      color: "emerald",
    },
    {
      label: "Avg Response",
      value: `${summary?.avg_response_time || 0}h`,
      subValue: "response time",
      icon: Clock02Icon,
      color: "purple",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, idx) => (
        <Card
          key={idx}
          className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="h-12 w-12 rounded-xl bg-neutral-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <HugeiconsIcon
                  icon={stat.icon}
                  className="text-neutral-600"
                  size={24}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium mb-1">
              {stat.label}
            </p>
            <p className="text-2xl font-bold tracking-tight mb-1">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground">{stat.subValue}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
