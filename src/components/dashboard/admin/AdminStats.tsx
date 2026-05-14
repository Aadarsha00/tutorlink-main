import { Card, CardContent } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserMultiple02Icon,
  Briefcase01Icon,
  DollarCircleIcon,
  TrendingUp,
} from "@hugeicons/core-free-icons";

interface AdminStatsProps {
  summary: any;
}

const formatNumber = (value: number | undefined | null) =>
  typeof value === "number" ? value.toLocaleString() : "0";

const formatCurrency = (value: number | undefined | null) =>
  `Rs. ${formatNumber(value)}`;

export function AdminStats({ summary }: AdminStatsProps) {
  const stats = [
    {
      label: "Total Users",
      value: formatNumber(summary?.total_users),
      subValue: `${formatNumber(summary?.active_premium_users)} premium`,
      icon: UserMultiple02Icon,
      color: "blue",
    },
    {
      label: "Active Gigs",
      value: formatNumber(summary?.active_gigs),
      subValue: `${formatNumber(summary?.total_gigs)} total`,
      icon: Briefcase01Icon,
      color: "green",
    },
    {
      label: "Platform Revenue",
      value: formatCurrency(summary?.platform_earnings),
      subValue: `${formatCurrency(summary?.gig_earnings)} gig fees`,
      icon: DollarCircleIcon,
      color: "emerald",
    },
    {
      label: "Payment Success",
      value: `${formatNumber(summary?.payment_success_rate)}%`,
      subValue: `${formatCurrency(summary?.avg_payment_amount)} avg fee`,
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
