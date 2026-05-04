import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChartLineData01Icon } from "@hugeicons/core-free-icons";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
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

interface TeacherChartsProps {
  chartType: "applications" | "earnings" | "success";
  onChartTypeChange: (type: "applications" | "earnings" | "success") => void;
  loading: boolean;
  charts: any;
  distributions: any;
}

export function TeacherCharts({
  chartType,
  onChartTypeChange,
  loading,
  charts,
  distributions,
}: TeacherChartsProps) {
  return (
    <>
      {/* Main Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={ChartLineData01Icon} size={20} />
            {chartType === "applications" && "Application Trends"}
            {chartType === "earnings" && "Earnings Overview"}
            {chartType === "success" && "Success Rate Over Time"}
            <Badge variant="outline" className="ml-2">
              {(chartType === "applications"
                ? charts?.application_trends
                : chartType === "earnings"
                ? charts?.earnings_trends
                : charts?.success_rate
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
                {["applications", "earnings", "success"].map((type) => (
                  <Button
                    key={type}
                    variant={chartType === type ? "default" : "ghost"}
                    size="sm"
                    onClick={() =>
                      onChartTypeChange(type as "applications" | "earnings" | "success")
                    }
                    className="h-8 text-xs"
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={350}>
                {chartType === "applications" && (
                  <BarChart data={charts?.application_trends}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill={CHART_COLORS.primary}
                      name="Applications"
                    />
                  </BarChart>
                )}

                {chartType === "earnings" && (
                  <AreaChart data={charts?.earnings_trends}>
                    <defs>
                      <linearGradient
                        id="earningsGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={CHART_COLORS.success}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={CHART_COLORS.success}
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
                      dataKey="net_earnings"
                      stroke={CHART_COLORS.success}
                      fillOpacity={1}
                      fill="url(#earningsGradient)"
                      name="Net Earnings"
                    />
                    <Area
                      type="monotone"
                      dataKey="gross_earnings"
                      stroke={CHART_COLORS.primary}
                      fillOpacity={0.3}
                      fill={CHART_COLORS.primary}
                      name="Gross Earnings"
                    />
                  </AreaChart>
                )}

                {chartType === "success" && (
                  <LineChart data={charts?.success_rate}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="success_rate"
                      stroke={CHART_COLORS.success}
                      strokeWidth={3}
                      dot={{ r: 5 }}
                      name="Success Rate (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="total_applications"
                      stroke={CHART_COLORS.primary}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Total Applications"
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
            <CardTitle>Applications by Status</CardTitle>
            <CardDescription>
              Overview of your application statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(
                    distributions?.applications_by_status || {}
                  ).map(([name, value]) => ({
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    value,
                  }))}
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
                  {Object.keys(
                    distributions?.applications_by_status || {}
                  ).map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Earnings by Subject</CardTitle>
            <CardDescription>Top earning subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(
                    distributions?.earnings_by_subject || {}
                  ).map(([name, value]) => ({
                    name,
                    value,
                  }))}
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
                  {Object.keys(
                    distributions?.earnings_by_subject || {}
                  ).map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
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
