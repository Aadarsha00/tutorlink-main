import { Card, CardContent } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Briefcase01Icon,
  FileCheck,
  DollarCircleIcon,
  TrendingUp,
} from "@hugeicons/core-free-icons";

interface TeacherStatsProps {
  summary: any;
}

const formatNumber = (value: number | undefined | null) =>
  typeof value === "number" ? value.toLocaleString() : "0";

const formatCurrency = (value: number | undefined | null) =>
  `Rs. ${formatNumber(value)}`;

export function TeacherStats({ summary }: TeacherStatsProps) {
  const stats = [
    {
      label: "Total Applications",
      value: formatNumber(summary?.total_applications),
      subValue: `${formatNumber(summary?.recent_applications)} recent`,
      icon: Briefcase01Icon,
      color: "blue",
    },
    {
      label: "Active Gigs",
      value: formatNumber(summary?.active_gigs),
      subValue: `${formatNumber(summary?.completed_gigs)} completed`,
      icon: FileCheck,
      color: "green",
    },
    {
      label: "Total Earnings",
      value: formatCurrency(summary?.total_earned),
      subValue: `${formatCurrency(summary?.recent_earnings)} recent`,
      icon: DollarCircleIcon,
      color: "emerald",
    },
    {
      label: "Success Rate",
      value: `${formatNumber(summary?.acceptance_rate)}%`,
      subValue: `${summary?.average_rating?.toFixed(1) || 0} ⭐ rating`,
      icon: TrendingUp,
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
