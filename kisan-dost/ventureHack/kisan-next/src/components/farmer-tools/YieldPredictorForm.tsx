"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Leaf,
  Droplets,
  CloudRain,
  CloudLightning,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ArrowLeft,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useWeather } from "@/context/WeatherContext";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

// Crop-specific base yield data (tons per acre)
export const CROP_BASE_YIELDS: Record<string, number> = {
  rice: 2.10,
  wheat: 1.85,
  corn: 2.35,
  cotton: 0.95,
  soybean: 1.15,
  sugarcane: 34.0,
};

const CROPS = [
  { id: "wheat", name: "Wheat" },
  { id: "rice", name: "Rice" },
  { id: "corn", name: "Corn" },
  { id: "cotton", name: "Cotton" },
  { id: "soybean", name: "Soybean" },
  { id: "sugarcane", name: "Sugarcane" },
];

interface YieldPredictorFormProps {
  onPredict: (data: {
    predicted_yield: number;
    yield_per_acre: number;
    average_regional_yield: number;
    crop: string;
    area_acres: number;
  }) => void;
}

interface PredictionResult {
  predicted_yield: number;
  yield_per_acre: number;
  average_regional_yield: number;
  insights: string;
}

// FIXED: Export separate panel components for 3-column layout
export function YieldPredictorForm({ onPredict }: YieldPredictorFormProps) {
  const t = useTranslations("YieldPredictor");
  const { weatherData, lastUpdated } = useWeather();
  const [loading, setLoading] = useState(false);
  const [syncedWeather, setSyncedWeather] = useState(false);
  const [showResults, setShowResults] = useState(false);
  // FIXED: Add showErrors state - only show validation errors after submit or field blur
  const [showErrors, setShowErrors] = useState(false);

  // Form State - Left Panel (Environmental)
  const [formData, setFormData] = useState({
    ndvi: 0.65,
    soil_moisture: 30,
    rainfall: 150,
  });

  // Form State - Right Panel (Farm-specific)
  const [cropType, setCropType] = useState<string>("");
  const [areaValue, setAreaValue] = useState<string>("");
  const [areaUnit, setAreaUnit] = useState<"acres" | "hectares">("acres");
  
  // Result State
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);

  // Validation
  const areaInAcres = !areaValue
    ? 0
    : areaUnit === "acres"
    ? parseFloat(areaValue)
    : parseFloat(areaValue) * 2.471; // 1 hectare = 2.471 acres

  const isFormValid = cropType && areaInAcres > 0;

  // FIXED: Build errors array - only display if showErrors is true
  const errors: string[] = [];
  if (!cropType) errors.push(t("cropTypeRequired") || "फसल का प्रकार आवश्यक है");
  if (!areaValue || parseFloat(areaValue) <= 0)
    errors.push(t("areaRequired") || "मान्य भूमि क्षेत्र आवश्यक है");

  // Auto-fill from weather data
  useEffect(() => {
    if (weatherData && lastUpdated) {
      const humidity = weatherData.current.humidity;
      const moistureJitter = Math.floor(Math.random() * 7) - 3;
      const mappedMoisture = Math.max(
        5,
        Math.min(60, Math.round(humidity * 0.6) + moistureJitter)
      );

      const currentRain = weatherData.current.precip_mm || 0;
      const rainJitter = Math.floor(Math.random() * 31) - 15;
      const baseRain =
        currentRain > 0 ? currentRain * 50 + 50 : 40 + humidity * 0.5;
      const mappedRainfall = Math.max(
        0,
        Math.min(500, Math.round(baseRain + rainJitter))
      );

      let simulatedNdvi = 0.4;
      if (mappedMoisture > 30 || mappedRainfall > 100) {
        simulatedNdvi = 0.65 + Math.random() * 0.25;
      } else if (mappedMoisture > 15) {
        simulatedNdvi = 0.45 + Math.random() * 0.2;
      } else {
        simulatedNdvi = 0.2 + Math.random() * 0.2;
      }
      simulatedNdvi = Math.round(simulatedNdvi * 100) / 100;

      setFormData((prev) => ({
        ...prev,
        ndvi: simulatedNdvi,
        soil_moisture: mappedMoisture,
        rainfall: mappedRainfall,
      }));
      setSyncedWeather(true);
      toast.info(
        `Auto-filled satellite & weather data for ${weatherData.location.name}`
      );
    }
  }, [lastUpdated]);

  // FIXED: Clear prediction results when ANY form input changes
  // This ensures the user sees fresh prediction when they modify form inputs
  // Includes crop type, area, AND environmental factors (NDVI, soil moisture, rainfall)
  useEffect(() => {
    if (predictionResult) {
      setPredictionResult(null);
      setShowResults(false);
    }
  }, [cropType, areaValue, areaUnit, formData.ndvi, formData.soil_moisture, formData.rainfall]);

  // Calculate prediction factors
  const ndvi_factor = (formData.ndvi - 0.2) / (0.9 - 0.2); // Normalize 0.2-0.9 to 0-1
  const moisture_factor = formData.soil_moisture / 60; // Normalize to 0-1
  const rainfall_factor = Math.min(formData.rainfall / 300, 1.2); // Cap at 1.2x bonus

  const handlePredict = async () => {
    // FIXED: Show errors only on submit attempt (not on mount)
    if (!isFormValid) {
      setShowErrors(true);
      toast.error(errors[0] || (t("validationError") || "कृपया सभी आवश्यक फ़ील्ड भरें"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/yield-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop_type: cropType,
          area_acres: areaInAcres,
          ndvi: formData.ndvi,
          soil_moisture: formData.soil_moisture,
          rainfall: formData.rainfall,
        }),
      });

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || t("predictionError"));
        }
        setPredictionResult(data);
        setShowResults(true);
        onPredict({
          predicted_yield: data.predicted_yield,
          yield_per_acre: data.yield_per_acre,
          average_regional_yield: data.average_regional_yield,
          crop: cropType,
          area_acres: areaInAcres,
        });
        toast.success(t("predictionSuccess"));
      } else {
        throw new Error("Server returned non-JSON response");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : t("predictionError");
      toast.error(message);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className={`transition-all duration-300 ${showResults ? "blur-sm pointer-events-none" : ""}`}>
        {/* Main Grid: Left Panel (Environmental) + Right Panel (Farm Inputs) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT PANEL: Environmental Inputs */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-2 border-emerald-500/10 h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-green-600/20 rounded-xl">
                    <Leaf className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-2xl">{t("title")}</CardTitle>
                      {syncedWeather && (
                        <Badge
                          variant="secondary"
                          className="bg-sky-100 text-sky-700 hover:bg-sky-200 border-sky-200 shadow-sm ml-2"
                        >
                          <CloudLightning className="w-3 h-3 mr-1" />
                          Live Weather
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      Environmental & soil conditions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* NDVI Slider */}
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-emerald-600" />
                        <Label className="text-sm font-semibold">
                          {t("ndvi")} (Vegetation Health)
                        </Label>
                      </div>
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 rounded-full">
                        {formData.ndvi.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.95"
                      step="0.01"
                      value={formData.ndvi}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ndvi: Number(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                      <span>0.1 ({t("ndviLow")})</span>
                      <span>0.95 ({t("ndviHigh")})</span>
                    </div>
                  </div>
                </div>

                {/* Soil Moisture */}
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-600" />
                        <Label className="text-sm font-semibold">
                          {t("soilMoisture")}
                        </Label>
                      </div>
                      <span className="text-sm font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full">
                        {formData.soil_moisture}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="1"
                      value={formData.soil_moisture}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          soil_moisture: Number(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                      <span>5% ({t("dry")})</span>
                      <span>60% ({t("wet")})</span>
                    </div>
                  </div>
                </div>

                {/* Rainfall */}
                <div className="space-y-3">
                  <div className="p-4 bg-sky-50/50 dark:bg-sky-950/20 rounded-xl border border-sky-200/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CloudRain className="w-4 h-4 text-sky-600" />
                        <Label className="text-sm font-semibold">
                          {t("rainfall")}
                        </Label>
                      </div>
                      <span className="text-sm font-bold text-sky-600 bg-sky-100 dark:bg-sky-900/30 px-2.5 py-0.5 rounded-full">
                        {formData.rainfall} mm
                      </span>
                    </div>
                    <Input
                      id="rainfall"
                      type="number"
                      min="0"
                      max="500"
                      value={formData.rainfall}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rainfall: Number(e.target.value),
                        })
                      }
                      className="text-center text-lg font-semibold"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT PANEL: Farm-specific Inputs Form */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-2 border-amber-500/10 h-full sticky top-4">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{t("predictYield") || "उपज भविष्यवाणी"}</CardTitle>
                    <CardDescription className="text-xs">
                      {t("farmInputs") || "खेत-विशिष्ट इनपुट"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Crop Selection */}
                <div className="space-y-2">
                  <Label
                    htmlFor="crop"
                    className="text-sm font-semibold flex items-center gap-2"
                  >
                    {t("cropType") || "फसल का प्रकार"} {!cropType && showErrors && <span className="text-red-500">*</span>}
                  </Label>
                  <select
                    id="crop"
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    onBlur={() => setShowErrors(true)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  >
                    <option value="" disabled>
                      Select a crop...
                    </option>
                    {CROPS.map((crop) => (
                      <option key={crop.id} value={crop.id}>
                        {crop.name}
                      </option>
                    ))}
                  </select>
                  {cropType && (
                    <p className="text-xs text-muted-foreground">
                      Base yield: {CROP_BASE_YIELDS[cropType]}/acre
                    </p>
                  )}
                </div>

                {/* Land Area */}
                <div className="space-y-2">
                  <Label
                    htmlFor="area"
                    className="text-sm font-semibold flex items-center gap-2"
                  >
                    {t("landArea") || "भूमि क्षेत्र"} {!areaValue && showErrors && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="area"
                      type="number"
                      placeholder={t("enterArea") || "क्षेत्र दर्ज करें"}
                      min="0"
                      step="0.1"
                      value={areaValue}
                      onChange={(e) => setAreaValue(e.target.value)}
                      onBlur={() => setShowErrors(true)}
                      className="flex-1 text-center font-medium"
                    />
                    <select
                      value={areaUnit}
                      onChange={(e) =>
                        setAreaUnit(e.target.value as "acres" | "hectares")
                      }
                      className="px-2 border border-input rounded-lg bg-background text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    >
                      <option value="acres">Acres</option>
                      <option value="hectares">Hectares</option>
                    </select>
                  </div>
                  {areaInAcres > 0 && (
                    <p className="text-xs text-muted-foreground">
                      = {areaInAcres.toFixed(2)} acres
                    </p>
                  )}
                </div>

                {/* Validation Errors */}
                {/* FIXED: Only show errors if showErrors is true (not on mount) */}
                {showErrors && errors.length > 0 && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800/50">
                    {errors.map((err, i) => (
                      <p key={i} className="text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {err}
                      </p>
                    ))}
                  </div>
                )}

                {/* Predict Button */}
                <Button
                  onClick={handlePredict}
                  className="w-full h-11 text-base font-bold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  disabled={!isFormValid || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("predicting") || "भविष्यवाणी जारी..."}
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      {t("predictYield") || "उपज भविष्यवाणी करें"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* RESULTS MODAL POPUP */}
      {showResults && predictionResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          {/* Modal Container */}
          <Card className="w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto border-2 border-green-500/20">
            <CardHeader className="sticky top-0 bg-white dark:bg-slate-950 z-10 flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Yield Prediction Results</CardTitle>
                  <CardDescription>Analysis & recommendations</CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowResults(false);
                  setPredictionResult(null);
                }}
                className="h-8 w-8 p-0 hover:bg-red-50"
              >
                <X className="w-5 h-5 text-red-500" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Key Metrics */}
              <div className="space-y-4">
                {/* Main Yield Display */}
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border-2 border-green-200 dark:border-green-800/50">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-widest">
                    Total Predicted Yield
                  </p>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">
                    {predictionResult.predicted_yield.toFixed(2)}{" "}
                    <span className="text-xl">tons</span>
                  </p>
                </div>

                {/* Secondary Metrics Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                    <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 uppercase">Per Acre</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {predictionResult.yield_per_acre.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70 mt-0.5">tons/acre</p>
                  </div>
                  <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800/30">
                    <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 uppercase">Region Avg</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                      {predictionResult.average_regional_yield.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-purple-600/70 dark:text-purple-400/70 mt-0.5">tons/acre</p>
                  </div>
                  <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800/30">
                    <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase">Difference</p>
                    <p className={`text-2xl font-bold mt-1 ${predictionResult.yield_per_acre > predictionResult.average_regional_yield ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}`}>
                      {(predictionResult.yield_per_acre - predictionResult.average_regional_yield).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70 mt-0.5">tons/acre</p>
                  </div>
                </div>

                {/* Farm Details */}
                <div className="p-3 bg-slate-50/50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-800/30">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Farm Information</p>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Crop Type</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100 capitalize">{cropType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Land Area</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{areaInAcres.toFixed(2)} acres</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Yield Comparison Chart */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-800/30">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Yield Comparison Chart
                </p>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={[
                      {
                        name: "Your Farm",
                        yield: parseFloat(
                          predictionResult.yield_per_acre.toFixed(2)
                        ),
                      },
                      {
                        name: "Region Avg",
                        yield: predictionResult.average_regional_yield,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        border: "1px solid rgba(100, 116, 139, 0.3)",
                        borderRadius: "8px",
                        color: "white",
                      }}
                    />
                    <Bar
                      dataKey="yield"
                      fill="#10b981"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Impact Factors Chart */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-800/30">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Factor Impact on Yield Calculation
                </p>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={[
                      {
                        name: "NDVI Health",
                        value: Math.min(
                          ((formData.ndvi - 0.2) / (0.9 - 0.2)) * 100,
                          100
                        ),
                      },
                      {
                        name: "Soil Moisture",
                        value: Math.min(
                          (formData.soil_moisture / 60) * 100,
                          100
                        ),
                      },
                      {
                        name: "Rainfall",
                        value: Math.min(
                          (Math.min(formData.rainfall / 300, 1.2) /
                            1.2) *
                            100,
                          100
                        ),
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        border: "1px solid rgba(100, 116, 139, 0.3)",
                        borderRadius: "8px",
                        color: "white",
                      }}
                      formatter={(value) => `${(value as number).toFixed(0)}%`}
                    />
                    <Bar
                      dataKey="value"
                      fill="#6366f1"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Insights */}
              {predictionResult.insights && (
                <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-800/50">
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <Leaf className="w-4 h-4" />
                    Insights & Recommendations
                  </p>
                  <p className="text-base text-blue-900 dark:text-blue-100 mt-2 leading-relaxed">
                    {predictionResult.insights}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    setShowResults(false);
                    setPredictionResult(null);
                  }}
                  className="flex-1 h-10 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-lg shadow-emerald-500/20"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  New Prediction
                </Button>
                <Button
                  onClick={() => {
                    setShowResults(false);
                    setPredictionResult(null);
                  }}
                  variant="outline"
                  className="flex-1 h-10"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// FIXED: Export EnvironmentalPanel subcomponent for 3-column layout (left panel)
export interface EnvironmentalData {
  ndvi: number;
  soil_moisture: number;
  rainfall: number;
}

export interface EnvironmentalPanelProps {
  onPredict?: (data: any) => void;
  envData?: EnvironmentalData;
  onEnvChange?: (data: EnvironmentalData) => void;
}

export function EnvironmentalPanel({ onPredict, envData, onEnvChange }: EnvironmentalPanelProps) {
  const t = useTranslations("YieldPredictor");
  const { weatherData, lastUpdated } = useWeather();
  const [syncedWeather, setSyncedWeather] = useState(false);

  const [localFormData, setLocalFormData] = useState<EnvironmentalData>({
    ndvi: 0.65,
    soil_moisture: 30,
    rainfall: 150,
  });

  const formData = envData || localFormData;
  const updateFormData = (newData: EnvironmentalData) => {
    if (onEnvChange) {
      onEnvChange(newData);
    } else {
      setLocalFormData(newData);
    }
  };

  // Auto-fill from weather data
  useEffect(() => {
    if (weatherData && lastUpdated) {
      const humidity = weatherData.current.humidity;
      const moistureJitter = Math.floor(Math.random() * 7) - 3;
      const mappedMoisture = Math.max(5, Math.min(60, Math.round(humidity * 0.6) + moistureJitter));
      const currentRain = weatherData.current.precip_mm || 0;
      const rainJitter = Math.floor(Math.random() * 31) - 15;
      const baseRain = currentRain > 0 ? currentRain * 50 + 50 : 40 + humidity * 0.5;
      const mappedRainfall = Math.max(0, Math.min(500, Math.round(baseRain + rainJitter)));
      
      let simulatedNdvi = 0.4;
      if (mappedMoisture > 30 || mappedRainfall > 100) {
        simulatedNdvi = 0.65 + Math.random() * 0.25;
      } else if (mappedMoisture > 15) {
        simulatedNdvi = 0.45 + Math.random() * 0.2;
      } else {
        simulatedNdvi = 0.2 + Math.random() * 0.2;
      }
      simulatedNdvi = Math.round(simulatedNdvi * 100) / 100;

      updateFormData({
        ndvi: simulatedNdvi,
        soil_moisture: mappedMoisture,
        rainfall: mappedRainfall,
      });
      setSyncedWeather(true);
      toast.info(`Auto-filled satellite & weather data for ${weatherData.location.name}`);
    }
  }, [lastUpdated]);

  return (
    <Card className="shadow-lg border-2 border-emerald-500/10 h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-green-600/20 rounded-xl">
            <Leaf className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl">{t("environmental") || "पर्यावरणीय डेटा"}</CardTitle>
              {syncedWeather && (
                <Badge variant="secondary" className="bg-sky-100 text-sky-700 hover:bg-sky-200 border-sky-200 shadow-sm ml-2">
                  <CloudLightning className="w-3 h-3 mr-1" />
                  Live Weather
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs">{t("satelliteData") || "उपग्रह & मौसम डेटा"}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* NDVI Slider */}
        <div className="space-y-3">
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-600" />
                <Label className="text-sm font-semibold">{t("ndvi")} (Vegetation Health)</Label>
              </div>
              <span className="text-sm font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 rounded-full">
                {formData.ndvi.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.95"
              step="0.01"
              value={formData.ndvi}
              onChange={(e) => updateFormData({ ...formData, ndvi: Number(e.target.value) })}
              className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
              <span>0.1 ({t("ndviLow")})</span>
              <span>0.95 ({t("ndviHigh")})</span>
            </div>
          </div>
        </div>

        {/* Soil Moisture */}
        <div className="space-y-3">
          <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-600" />
                <Label className="text-sm font-semibold">{t("soilMoisture")}</Label>
              </div>
              <span className="text-sm font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full">
                {formData.soil_moisture}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="1"
              value={formData.soil_moisture}
              onChange={(e) => updateFormData({ ...formData, soil_moisture: Number(e.target.value) })}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
              <span>5% ({t("dry")})</span>
              <span>60% ({t("wet")})</span>
            </div>
          </div>
        </div>

        {/* Rainfall */}
        <div className="space-y-3">
          <div className="p-4 bg-sky-50/50 dark:bg-sky-950/20 rounded-xl border border-sky-200/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-sky-600" />
                <Label className="text-sm font-semibold">{t("rainfall")}</Label>
              </div>
              <span className="text-sm font-bold text-sky-600 bg-sky-100 dark:bg-sky-900/30 px-2.5 py-0.5 rounded-full">
                {formData.rainfall} mm
              </span>
            </div>
            <Input
              type="number"
              min="0"
              max="500"
              value={formData.rainfall}
              onChange={(e) => updateFormData({ ...formData, rainfall: Number(e.target.value) })}
              className="text-center text-lg font-semibold"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// FIXED: Export FormPanel subcomponent for 3-column layout (middle panel)
export interface FormPanelProps {
  onPredict: (data: any) => void;
  envData?: EnvironmentalData;
}

export function FormPanel({ onPredict, envData }: FormPanelProps) {
  const t = useTranslations("YieldPredictor");
  const [loading, setLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const [cropType, setCropType] = useState<string>("");
  const [areaValue, setAreaValue] = useState<string>("");
  const [areaUnit, setAreaUnit] = useState<"acres" | "hectares">("acres");

  const areaInAcres = !areaValue ? 0 : areaUnit === "acres" ? parseFloat(areaValue) : parseFloat(areaValue) * 2.471;
  const isFormValid = cropType && areaInAcres > 0;

  const errors: string[] = [];
  if (!cropType) errors.push(t("cropTypeRequired") || "फसल का प्रकार आवश्यक है");
  if (!areaValue || parseFloat(areaValue) <= 0) errors.push(t("areaRequired") || "मान्य भूमि क्षेत्र आवश्यक है");

  const handlePredict = async () => {
    if (!isFormValid) {
      setShowErrors(true);
      toast.error(errors[0] || (t("validationError") || "कृपया सभी आवश्यक फ़ील्ड भरें"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/yield-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop_type: cropType,
          area_acres: areaInAcres,
          area_unit: areaUnit,
          ndvi: envData?.ndvi ?? 0.65,
          soil_moisture: envData?.soil_moisture ?? 30,
          rainfall: envData?.rainfall ?? 150,
        }),
      });

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || t("predictionError"));
        
        onPredict({
          predicted_yield: data.predicted_yield,
          yield_per_acre: data.yield_per_acre,
          total_yield: data.total_yield,
          average_regional_yield: data.average_regional_yield,
          average_regional_per_acre: data.average_regional_per_acre,
          percent_difference: data.percent_difference,
          is_above_average: data.is_above_average,
          insights: data.insights,
          crop: cropType,
          area_acres: areaInAcres,
          area_unit: areaUnit,
        });
        toast.success(t("predictionSuccess"));
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t("predictionError");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-2 border-amber-500/10 h-full sticky top-4">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-lg">{t("predictYield") || "उपज भविष्यवाणी"}</CardTitle>
            <CardDescription className="text-xs">{t("farmInputs") || "खेत-विशिष्ट इनपुट"}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Crop Selection */}
        <div className="space-y-2">
          <Label htmlFor="crop" className="text-sm font-semibold flex items-center gap-2">
            {t("cropType") || "फसल का प्रकार"} {!cropType && showErrors && <span className="text-red-500">*</span>}
          </Label>
          <select
            id="crop"
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
            onBlur={() => setShowErrors(true)}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <option value="" disabled>{t("selectCrop") || "फसल चुनें..."}</option>
            {CROPS.map((crop) => (
              <option key={crop.id} value={crop.id}>{crop.name}</option>
            ))}
          </select>
          {cropType && (
            <p className="text-xs text-muted-foreground">
              {t("baseYield") || "आधार उपज"}: {CROP_BASE_YIELDS[cropType]}/acre
            </p>
          )}
        </div>

        {/* Land Area */}
        <div className="space-y-2">
          <Label htmlFor="area" className="text-sm font-semibold flex items-center gap-2">
            {t("landArea") || "भूमि क्षेत्र"} {!areaValue && showErrors && <span className="text-red-500">*</span>}
          </Label>
          <div className="flex gap-2">
            <Input
              id="area"
              type="number"
              placeholder={t("enterArea") || "क्षेत्र दर्ज करें"}
              min="0"
              step="0.1"
              value={areaValue}
              onChange={(e) => setAreaValue(e.target.value)}
              onBlur={() => setShowErrors(true)}
              className="flex-1 text-center font-medium"
            />
            <select
              value={areaUnit}
              onChange={(e) => setAreaUnit(e.target.value as "acres" | "hectares")}
              className="px-2 border border-input rounded-lg bg-background text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            >
              <option value="acres">Acres</option>
              <option value="hectares">Hectares</option>
            </select>
          </div>
          {areaInAcres > 0 && (
            <p className="text-xs text-muted-foreground">= {areaInAcres.toFixed(2)} acres</p>
          )}
        </div>

        {/* Validation Errors */}
        {showErrors && errors.length > 0 && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800/50">
            {errors.map((err, i) => (
              <p key={i} className="text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5" />
                {err}
              </p>
            ))}
          </div>
        )}

        {/* Predict Button */}
        <Button
          onClick={handlePredict}
          className="w-full h-11 text-base font-bold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          disabled={!isFormValid || loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("predicting") || "भविष्यवाणी जारी..."}
            </>
          ) : (
            <>
              <TrendingUp className="mr-2 h-4 w-4" />
              {t("predictYield") || "उपज भविष्यवाणी करें"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
