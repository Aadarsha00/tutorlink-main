import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChartLineData01Icon } from "@hugeicons/core-free-icons";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CHART_COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  pink: "#ec4899",
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const asPieData = (
  data: unknown,
  nameKey = "name",
  valueKey = "value"
) => {
  if (Array.isArray(data)) {
    return data.map((item: any) => ({
      name: item[nameKey] ?? item.subject ?? item.grade ?? "Unknown",
      value: Number(item[valueKey] ?? item.amount ?? item.count ?? 0),
    }));
  }

  return Object.entries((data as Record<string, unknown>) || {}).map(
    ([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Number(value || 0),
    })
  );
};

interface ParentChartsProps {
  chartType: "spending" | "gigs" | "applications";
  onChartTypeChange: (type: "spending" | "gigs" | "applications") => void;
  loading: boolean;
  charts: any;
  distributions: any;
}

export function ParentCharts({
  chartType,
  onChartTypeChange,
  loading,
  charts,
  distributions,
}: ParentChartsProps) {
  const gigTrendData = charts?.gig_trends || charts?.gig_creation || [];
  const applicationTrendData = charts?.application_trends || [];
  const gigsByStatus = asPieData(distributions?.gigs_by_status);
  const spendingBySubject = asPieData(
    distributions?.spending_by_subject || distributions?.gigs_by_subject,
    "subject",
    "amount"
  );

  return (
    <>
      {/* Main Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={ChartLineData01Icon} size={20} />
            {chartType === "spending" && "Spending Overview"}
            {chartType === "gigs" && "Gig Analytics"}
            {chartType === "applications" && "Application Trends"}
            <Badge variant="outline" className="ml-2">
              {(chartType === "spending"
                ? charts?.spending_trends
                : chartType === "gigs"
                ? gigTrendData
                : applicationTrendData
              )?.length || 0}{" "}
              data points
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-87.5 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin text-4xl mb-2">⏳</div>
                <p className="text-sm text-muted-foreground">
                  Updating chart...
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex gap-1 bg-muted rounded-lg p-1 w-fit">
                {["spending", "gigs", "applications"].map((type) => (
                  <Button
                    key={type}
                    variant={chartType === type ? "default" : "ghost"}
                    size="sm"
                    onClick={() =>
                      onChartTypeChange(type as "spending" | "gigs" | "applications")
                    }
                    className="h-8 text-xs"
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={350}>
                {chartType === "spending" && (
                  <AreaChart data={charts?.spending_trends}>
                    <defs>
                      <linearGradient
                        id="spendingGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={CHART_COLORS.primary}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={CHART_COLORS.primary}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke={CHART_COLORS.primary}
                      fillOpacity={1}
                      fill="url(#spendingGradient)"
                      name="Total Spent"
                    />
                  </AreaChart>
                )}

                {chartType === "gigs" && (
                  <BarChart data={gigTrendData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill={CHART_COLORS.success}
                      name="Gigs Posted"
                    />
                  </BarChart>
                )}

                {chartType === "applications" && (
                  <LineChart data={applicationTrendData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="received"
                      stroke={CHART_COLORS.primary}
                      strokeWidth={2}
                      name="Applications Received"
                    />
                    <Line
                      type="monotone"
                      dataKey="hired"
                      stroke={CHART_COLORS.success}
                      strokeWidth={2}
                      name="Hired"
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </>
          )}
        </CardContent>
      </Card>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Gigs by Status</CardTitle>
            <CardDescription>Overview of your gig statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gigsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {gigsByStatus.map(
                    (_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    )
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending by Subject</CardTitle>
            <CardDescription>Budget allocation by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={spendingBySubject}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {spendingBySubject.map(
                    (_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    )
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
