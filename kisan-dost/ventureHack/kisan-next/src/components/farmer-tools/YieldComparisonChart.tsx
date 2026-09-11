"use client";

import { useTranslations } from "next-intl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface YieldComparisonChartProps {
  predictedYield: number;
  averageRegionalYield: number;
}

export function YieldComparisonChart({
  predictedYield,
  averageRegionalYield,
}: YieldComparisonChartProps) {
  const t = useTranslations("YieldPredictor");

  const data = [
    {
      name: t("predictedYield"),
      yield: predictedYield,
      fill: "#10b981",
    },
    {
      name: t("averageRegional"),
      yield: averageRegionalYield,
      fill: "#6366f1",
    },
  ];

  return (
    <Card className="shadow-lg border-emerald-500/10">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          📊 {t("comparisonChart")}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fontWeight: 600 }}
            />
            <YAxis
              tickFormatter={(val: number) => `${val} t`}
              tick={{ fontSize: 12 }}
              domain={[0, "auto"]}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) =>
                `${Number(value).toFixed(2)} ${t("tonsPerHectare")}`
              }
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
            />
            <ReferenceLine
              y={averageRegionalYield}
              stroke="#6366f1"
              strokeDasharray="5 5"
              strokeWidth={1.5}
            />
            <Bar dataKey="yield" radius={[8, 8, 0, 0]} barSize={60}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
