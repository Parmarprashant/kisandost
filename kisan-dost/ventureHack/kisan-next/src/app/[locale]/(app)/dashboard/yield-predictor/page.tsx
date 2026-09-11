"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { YieldPredictorForm, EnvironmentalPanel, FormPanel } from "@/components/farmer-tools/YieldPredictorForm";
import { YieldComparisonChart } from "@/components/farmer-tools/YieldComparisonChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sprout, TrendingUp, BarChart3, Loader2, Maximize2, X } from "lucide-react";
import { useWeather } from "@/context/WeatherContext";
import { toast } from "sonner";

// FIXED: Reduce FarmMap height from 350px to 150px for compact layout
// Leaflet requires window, so we must dynamically import without SSR
const FarmMap = dynamic(
  () => import("@/components/farmer-tools/FarmMap").then((mod) => mod.FarmMap),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[150px] flex items-center justify-center bg-muted/20 border rounded-xl animate-pulse">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }
);

interface PredictionResult {
  predicted_yield: number;
  average_regional_yield: number;
}

export default function YieldPredictorPage() {
  const t = useTranslations("YieldPredictor");
  const { fetchByQuery } = useWeather();
  const [result, setResult] = useState<PredictionResult | null>(null);
  // FIXED: Add modal state for expanded map view
  const [expandedMapOpen, setExpandedMapOpen] = useState(false);

  const yieldDiff = result
    ? (
        ((result.predicted_yield - result.average_regional_yield) /
          result.average_regional_yield) *
        100
      ).toFixed(1)
    : null;

  const isAboveAverage = result
    ? result.predicted_yield >= result.average_regional_yield
    : false;

  const handleLocationSelect = async (lat: number, lon: number) => {
    try {
      toast.loading("Fetching weather for selected location...", { id: "weather-fetch" });
      await fetchByQuery(`${lat},${lon}`);
      toast.success("Weather & location data synced successfully!", { id: "weather-fetch" });
    } catch (error) {
       toast.error("Failed to fetch location weather", { id: "weather-fetch" });
    }
  };

  return (
    <div className="container mx-auto pt-28 pb-8 px-4 space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#2e6b3b]">
          {t("pageTitle")}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {t("pageDescription")}
        </p>
      </div>

      {/* FIXED: Compact map section with expand button (max height 150px) */}
      <div className="relative rounded-xl overflow-hidden">
        <FarmMap onLocationSelect={handleLocationSelect} />
        <Button
          onClick={() => setExpandedMapOpen(true)}
          variant="outline"
          size="sm"
          className="absolute top-3 right-3 gap-2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white"
        >
          <Maximize2 className="w-4 h-4" />
          {t("expandMap") || "Expand"}
        </Button>
      </div>

      {/* FIXED: Step progress indicator above 3-column layout */}
      <div className="flex justify-center gap-8 py-6 px-4">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">1</div>
          <span className="text-xs font-medium text-muted-foreground text-center">{t("stepMap") || "Location"}</span>
        </div>
        <div className="flex-1 flex items-center">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-600 to-emerald-300"></div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">2</div>
          <span className="text-xs font-medium text-muted-foreground text-center">{t("stepEnvironment") || "Environment"}</span>
        </div>
        <div className="flex-1 flex items-center">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-600 to-emerald-300"></div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">3</div>
          <span className="text-xs font-medium text-muted-foreground text-center">{t("stepResults") || "Results"}</span>
        </div>
      </div>

      {/* FIXED: 3-column equal layout (environmental | form | results) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: Environmental Inputs (from YieldPredictorForm left panel) */}
        <EnvironmentalPanel onPredict={setResult} />

        {/* Column 2: Prediction Form (from YieldPredictorForm right panel) */}
        <FormPanel onPredict={setResult} />

        {/* Column 3: Results Panel */}
        <div>
          {result ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
              {/* Result Cards */}
              <div className="space-y-3">
                {/* Predicted Yield */}
                <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-200 dark:border-emerald-800 shadow-lg rounded-lg">
                  <CardHeader className="pb-3 pt-4 px-5">
                    <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                      <Sprout className="w-4 h-4" />
                      {t("predictedYield")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-4">
                    <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
                      {result.predicted_yield.toFixed(2)}
                    </div>
                    <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-medium mt-1">
                      {t("tonsPerHectare")}
                    </p>
                    <Badge
                      variant="secondary"
                      className={`mt-2 text-xs ${
                        isAboveAverage
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                      }`}
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {isAboveAverage ? "+" : ""}
                      {yieldDiff}% {t("vsAverage")}
                    </Badge>
                  </CardContent>
                </Card>

                {/* Regional Average */}
                <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border-indigo-200 dark:border-indigo-800 shadow-lg rounded-lg">
                  <CardHeader className="pb-3 pt-4 px-5">
                    <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      {t("averageRegional")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-4">
                    <div className="text-3xl font-black text-indigo-700 dark:text-indigo-300">
                      {result.average_regional_yield.toFixed(2)}
                    </div>
                    <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 font-medium mt-1">
                      {t("tonsPerHectare")}
                    </p>
                    <Badge
                      variant="secondary"
                      className="mt-2 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                    >
                      {t("regionBaseline")}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Comparison Chart */}
              <YieldComparisonChart
                predictedYield={result.predicted_yield}
                averageRegionalYield={result.average_regional_yield}
              />
            </div>
          ) : (
            // FIXED: Show placeholder with 3-step guide instead of completely empty
            <Card className="border-2 border-dashed bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-slate-900/30 dark:to-slate-800/30 rounded-lg h-full flex flex-col items-center justify-center p-6 text-center min-h-[400px]">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full shadow-sm mb-4">
                <Sprout className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                {t("readyTitle") || "Ready to predict?"}
              </h3>
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <p>✓ {t("stepGuide1") || "Step 1: Set location on map"}</p>
                <p>✓ {t("stepGuide2") || "Step 2: Adjust environmental data"}</p>
                <p>✓ {t("stepGuide3") || "Step 3: Select crop & click Predict"}</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* FIXED: Expanded Map Modal */}
      {expandedMapOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl h-[80vh] overflow-hidden rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
              <CardTitle>{t("mapTitle") || "Farm Location Map"}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedMapOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-60px)]">
              <FarmMap onLocationSelect={(lat, lon) => {
                handleLocationSelect(lat, lon);
                setExpandedMapOpen(false);
              }} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
