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

interface AdminChartsProps {
  chartType: "revenue" | "users" | "gigs";
  onChartTypeChange: (type: "revenue" | "users" | "gigs") => void;
  loading: boolean;
  charts: any;
  distributions: any;
}

export function AdminCharts({
  chartType,
  onChartTypeChange,
  loading,
  charts,
  distributions,
}: AdminChartsProps) {
  return (
    <>
      {/* Main Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={ChartLineData01Icon} size={20} />
            {chartType === "revenue" && "Revenue Analytics"}
            {chartType === "users" && "User Growth"}
            {chartType === "gigs" && "Gig Analytics"}
            <Badge variant="outline" className="ml-2">
              {(chartType === "revenue"
                ? charts?.revenue_trends
                : chartType === "users"
                ? charts?.user_trends
                : charts?.gig_trends
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
                {["revenue", "users", "gigs"].map((type) => (
                  <Button
                    key={type}
                    variant={chartType === type ? "default" : "ghost"}
                    size="sm"
                    onClick={() =>
                      onChartTypeChange(type as "revenue" | "users" | "gigs")
                    }
                    className="h-8 text-xs"
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={350}>
                {chartType === "revenue" && (
                  <LineChart data={charts?.revenue_trends}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke={CHART_COLORS.success}
                      strokeWidth={2}
                      name="Total Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="commission"
                      stroke={CHART_COLORS.primary}
                      strokeWidth={2}
                      name="Commission"
                    />
                  </LineChart>
                )}

                {chartType === "users" && (
                  <BarChart data={charts?.user_trends}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="teachers"
                      fill={CHART_COLORS.primary}
                      name="Teachers"
                    />
                    <Bar
                      dataKey="parents"
                      fill={CHART_COLORS.success}
                      name="Parents"
                    />
                  </BarChart>
                )}

                {chartType === "gigs" && (
                  <LineChart data={charts?.gig_trends}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="posted"
                      stroke={CHART_COLORS.primary}
                      strokeWidth={2}
                      name="Posted"
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke={CHART_COLORS.success}
                      strokeWidth={2}
                      name="Completed"
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
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Platform users by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(
                    distributions?.users_by_type || {}
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
                  {Object.keys(distributions?.users_by_type || {}).map(
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
            <CardTitle>Revenue by Source</CardTitle>
            <CardDescription>Revenue distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(
                    distributions?.revenue_by_source || {}
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
                  {Object.keys(distributions?.revenue_by_source || {}).map(
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
