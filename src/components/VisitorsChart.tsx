import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsData } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface VisitorsChartProps {
  data: AnalyticsData;
}

export function VisitorsChart({ data }: VisitorsChartProps) {
  const [timeRange, setTimeRange] = useState("7d");

  const chartData = data.dailyVisits.map((day) => ({
    date: formatDate(day.date),
    visitors: day.visitors,
    pageviews: day.pageviews,
  }));

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Visiteurs et Pages Vues</CardTitle>
        <Tabs
          defaultValue="7d"
          className="w-[200px]"
          onValueChange={setTimeRange}
        >
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="7d">7j</TabsTrigger>
            <TabsTrigger value="30d">30j</TabsTrigger>
            <TabsTrigger value="90d">90j</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs text-muted-foreground"
                tickMargin={10}
                height={60}
                tick={{ fill: "currentColor" }}
                tickLine={{ stroke: "currentColor" }}
                axisLine={{ stroke: "currentColor" }}
                padding={{ left: 0, right: 0 }}
                minTickGap={5}
                interval="preserveStartEnd"
                allowDataOverflow={false}
                scale="point"
                type="category"
              />
              <YAxis
                className="text-xs text-muted-foreground"
                width={50}
                tick={{ fill: "currentColor" }}
                tickLine={{ stroke: "currentColor" }}
                axisLine={{ stroke: "currentColor" }}
                padding={{ top: 20, bottom: 20 }}
                minTickGap={5}
                allowDataOverflow={false}
                scale="linear"
                type="number"
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "0.5rem",
                  color: "hsl(var(--card-foreground))",
                }}
                cursor={{ fill: "hsl(var(--muted))" }}
                formatter={(value: number) => [
                  value.toLocaleString(),
                  undefined,
                ]}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                formatter={(value) => value}
              />
              <Area
                type="monotone"
                dataKey="visitors"
                name="Visiteurs"
                stroke="hsl(var(--chart-1))"
                fill="url(#colorVisitors)"
                fillOpacity={1}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 1 }}
                isAnimationActive={true}
                animationDuration={300}
                animationEasing="ease-in-out"
              />
              <Area
                type="monotone"
                dataKey="pageviews"
                name="Pages Vues"
                stroke="hsl(var(--chart-2))"
                fill="url(#colorPageviews)"
                fillOpacity={1}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 1 }}
                isAnimationActive={true}
                animationDuration={300}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
