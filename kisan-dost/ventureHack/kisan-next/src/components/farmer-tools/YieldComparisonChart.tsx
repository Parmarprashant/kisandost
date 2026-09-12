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
import { BarChart3 } from "lucide-react";

interface YieldComparisonChartProps {
  predictedYield: number;
  averageRegionalYield: number;
  unitLabel?: string;
}

export function YieldComparisonChart({
  predictedYield,
  averageRegionalYield,
  unitLabel = "tons / acre",
}: YieldComparisonChartProps) {
  const t = useTranslations("YieldPredictor");

  const data = [
    {
      name: t("predictedYield") || "Predicted Yield",
      yield: Number(predictedYield.toFixed(2)),
      fill: "#10b981",
    },
    {
      name: t('averageRegional') || "Regional Baseline",
      yield: Number(averageRegionalYield.toFixed(2)),
      fill: "#6366f1",
    },
  ];

  return (
    <Card className="shadow-lg border-emerald-500/10">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          {t("comparisonChart") || "Yeeld Comparison"} <span className="text-xs font-normal text-muted-foreground">({unitLabel})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={true} opacity={0.3} />
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
                `${Number(value).toFixed(2)} ${unitLabel}`
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
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

