"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ProfitPredictorForm } from "@/components/farmer-tools/ProfitPredictorForm";
import { ProfitCharts } from "@/components/farmer-tools/ProfitCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, TrendingUp, Info } from "lucide-react";

export default function ProfitPredictorPage() {
  const t = useTranslations("ProfitPredictor");
  const [predictionData, setPredictionData] = useState<any>(null);

  return (
    <div className="container mx-auto pt-28 pb-8 px-4 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t("description")}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-5">
          <ProfitPredictorForm onPredict={setPredictionData} />
        </div>

        <div className="xl:col-span-7 space-y-6">
          {predictionData ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-emerald-700">
                      Predicted Profit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-emerald-700 flex items-center">
                      <IndianRupee className="w-5 h-5 mr-1" />
                      {predictionData.predictedProfit.toLocaleString()}
                    </div>
                    <Badge variant="secondary" className="mt-1">
                      {Math.round(predictionData.confidenceScore * 100)}% Confidence
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-700">
                      Expected Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-700 flex items-center">
                      <IndianRupee className="w-5 h-5 mr-1" />
                      {predictionData.expectedRevenue.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50 border-orange-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-orange-700">
                      Total Cost
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-700 flex items-center">
                      <IndianRupee className="w-5 h-5 mr-1" />
                      {predictionData.totalCost.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-secondary/20 rounded-2xl p-6 border-2 border-dashed border-secondary">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg">Recommendation</h3>
                </div>
                <div className="p-4 bg-background/50 rounded-xl border border-primary/10">
                   <p className="text-foreground font-medium leading-relaxed">
                     {predictionData.recommendation}
                   </p>
                </div>
              </div>

              <ProfitCharts data={predictionData} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-3xl bg-muted/30">
              <div className="p-4 bg-background rounded-full shadow-sm mb-4">
                <TrendingUp className="w-12 h-12 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                Ready to predict your profit?
              </h3>
              <p className="text-muted-foreground max-w-sm">
                Fill out the form on the left with your land area and input costs to get AI-powered profit insights.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
