import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsData } from "@/lib/types";
import { useState } from "react";

interface DeviceStatsProps {
  data: AnalyticsData;
}

export function DeviceStats({ data }: DeviceStatsProps) {
  const [view, setView] = useState<"devices" | "browsers">("devices");

  // Process data for the charts
  const deviceData = [
    { name: "Mobile", value: data.devices.mobile },
    { name: "Desktop", value: data.devices.desktop },
    { name: "Tablet", value: data.devices.tablet },
  ];

  const browserData = [
    { name: "Chrome", value: data.browsers.chrome },
    { name: "Safari", value: data.browsers.safari },
    { name: "Firefox", value: data.browsers.firefox },
    { name: "Edge", value: data.browsers.edge },
    { name: "Autres", value: data.browsers.other },
  ];

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Répartition des Appareils</CardTitle>
        <Tabs
          defaultValue="devices"
          className="w-[200px]"
          onValueChange={(value) => setView(value as "devices" | "browsers")}
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="devices">Appareils</TabsTrigger>
            <TabsTrigger value="browsers">Navigateurs</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={view === "devices" ? deviceData : browserData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                // Using direct props instead of defaultProps
                animationBegin={0}
                animationDuration={400}
                animationEasing="ease"
                blendStroke={true}
                isAnimationActive={true}
                legendType="rect"
                minAngle={0}
                paddingAngle={0}
              >
                {(view === "devices" ? deviceData : browserData).map(
                  (entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  )
                )}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "0.5rem",
                  color: "hsl(var(--card-foreground))",
                }}
                formatter={(value: number) => [
                  `${value.toLocaleString()} visiteurs`,
                  null,
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
