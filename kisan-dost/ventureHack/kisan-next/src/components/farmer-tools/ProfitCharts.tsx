"use client";

import { useTranslations } from "next-intl";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfitChartsProps {
  data: {
    predictedProfit: number;
    expectedRevenue: number;
    totalCost: number;
    fertilizerCost: number;
    pesticideCost: number;
    irrigationCost: number;
  };
}

export function ProfitCharts({ data }: ProfitChartsProps) {
  const t = useTranslations("ProfitPredictor");

  const costBreakdownData = [
    { name: t("fertilizerCost"), value: data.fertilizerCost, color: "#3b82f6" },
    { name: "Pesticide", value: data.pesticideCost, color: "#f43f5e" },
    { name: "Irrigation", value: data.irrigationCost, color: "#f59e0b" },
  ];

  const barData = [
    { name: "Total Cost", amount: data.totalCost },
    { name: "Net Profit", amount: data.predictedProfit },
  ];

  const profitvsRevenueData = [
    { name: "Revenue", value: data.expectedRevenue },
    { name: "Profit", value: data.predictedProfit },
  ];

  return (
    <div className="space-y-6 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Input Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {costBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString()}`} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Profit vs Cost Analysis</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(val: number) => `₹${val / 1000}k`} />
                <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString()}`} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#f43f5e" : "#10b981"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Economic Efficiency (ROI Estimates)</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                  data={[
                    { name: "Profit", value: data.predictedProfit, color: "#10b981" },
                    { name: "Costs", value: data.totalCost, color: "#f43f5e" }
                  ]}
                  cx="50%"
                  cy="50%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f43f5e" />
                </Pie>
                <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString()}`} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
