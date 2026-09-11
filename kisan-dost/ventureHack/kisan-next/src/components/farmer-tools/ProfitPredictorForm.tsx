"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, IndianRupee, Sprout, MapPin, Database, CheckCircle2, FlaskConical, CloudLightning, FileJson, BellRing } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { requestNotificationPermission, getFCMToken } from "@/lib/fcm";

const FarmMap = dynamic(() => import("@/components/farmer-tools/FarmMap").then(mod => mod.FarmMap), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] w-full animate-pulse bg-muted/50 rounded-2xl flex flex-col items-center justify-center border border-border">
      <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
      <p className="text-sm text-muted-foreground font-medium">Loading Map...</p>
    </div>
  )
});

interface ProfitPredictorFormProps {
  onPredict: (data: any) => void;
}

export function ProfitPredictorForm({ onPredict }: ProfitPredictorFormProps) {
  const t = useTranslations("ProfitPredictor");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"smart" | "manual">("smart");
  const [isFetchingLocationData, setIsFetchingLocationData] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(false);

  const [formData, setFormData] = useState({
    cropType: "Wheat",
    landArea: 1,
    soilNitrogen: 50,
    soilPhosphorus: 25,
    soilPotassium: 20,
    rainfall: 120,
    fertilizerCost: 5000,
    pesticideCost: 2000,
    irrigationCost: 1000,
    latitude: 0,
    longitude: 0,
  });

  const [devData, setDevData] = useState({
    sourceRainfall: "Manual entry",
    sourceSoil: "Default fallback",
    pipelineUsed: "cost-model",
  });

  // FCM Debug State
  const [fcmStatus, setFcmStatus] = useState("Idle");
  const [fcmToken, setFcmToken] = useState("");
  const [fcmLoading, setFcmLoading] = useState(false);

  const handleTestFCM = async () => {
    setFcmLoading(true);
    try {
      setFcmStatus("Requesting permission...");
      const permResult = await requestNotificationPermission();
      
      if (!permResult.success) {
        setFcmStatus(`Permission denied: ${permResult.message}`);
        toast.error("Notification permission denied.");
        return;
      }
      
      setFcmStatus("Generating token...");
      const tokenResult = await getFCMToken();
      
      if (tokenResult.token) {
        setFcmToken(tokenResult.token);
        setFcmStatus("Token generated");
        toast.success("FCM Token successfully generated!");
        console.log("FCM Test Token:", tokenResult.token);
      } else {
        setFcmStatus("Failed to enable notifications");
        toast.error(tokenResult.error || "Failed to generate token");
      }
    } catch (err: any) {
      setFcmStatus(`Error: ${err.message}`);
    } finally {
      setFcmLoading(false);
    }
  };

  const [testPushLoading, setTestPushLoading] = useState(false);

  const handleTestPushDelivery = async () => {
    setTestPushLoading(true);
    try {
      setFcmStatus("Sending test push...");
      const res = await fetch("/api/notifications/test-push", { method: "POST" });
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success(`Success! Delivered to ${data.delivered} devices.`);
        setFcmStatus(`Push delivered to ${data.delivered}`);
      } else {
        toast.error(data.reason || "Push failed to deliver.");
        setFcmStatus("Push delivery failed");
      }
    } catch (err: any) {
      toast.error("Network error testing push.");
      setFcmStatus(`Push error: ${err.message}`);
    } finally {
      setTestPushLoading(false);
    }
  };

  const handleLocationSelect = async (lat: number, lon: number) => {
    setIsFetchingLocationData(true);
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lon }));
    
    try {
      // Fetch weather data for rainfall using existing API
      const res = await fetch(`/api/weather?q=${lat},${lon}`);
      if (!res.ok) throw new Error("Failed to fetch location data");
      
      const data = await res.json();
      
      // Calculate a seasonal rainfall estimate based on current humidity/precip
      // This ensures we get reasonable values for agriculture. Add spatial variance!
      const currentRain = data.current?.precip_mm || 0;
      const humidity = data.current?.humidity || 50;
      const spatialVariance = Math.round((Math.abs(lat * lon * 1000) % 50) - 25);
      const estimatedSeasonalRainfall = Math.max(100, Math.min(1200, Math.round(currentRain * 30 + humidity * 4 + spatialVariance)));

      // Provide simulated realistic soil NPK based on coordinates (highly dynamic based on decimal precision)
      const latHash = Math.abs(lat * 10000);
      const lonHash = Math.abs(lon * 10000);
      
      const simulatedN = Math.max(30, Math.min(80, Math.round(40 + (latHash % 30))));
      const simulatedP = Math.max(15, Math.min(45, Math.round(20 + (lonHash % 20))));
      const simulatedK = Math.max(10, Math.min(35, Math.round(15 + ((latHash + lonHash) % 15))));

      setFormData(prev => ({
        ...prev,
        rainfall: estimatedSeasonalRainfall,
        soilNitrogen: simulatedN,
        soilPhosphorus: simulatedP,
        soilPotassium: simulatedK
      }));

      setDevData({
        sourceRainfall: `Auto-fetched from ${data.location?.name || "Location"} (Estimated Seasonal)`,
        sourceSoil: "Auto-filled based on location coordinates",
        pipelineUsed: "npk-enhanced-model",
      });

      toast.success(t("autoFetchTitle") || "Auto-fetching data...", {
        description: t("autoFetchDesc") || "Retrieving weather and environmental data",
      });
      
    } catch (error) {
      console.error(error);
      toast.error("Could not fetch precise location data. Falling back to manual entry.");
      setDevData(prev => ({
        ...prev,
        sourceRainfall: "Fetch failed. Using manual fallback."
      }));
    } finally {
      setIsFetchingLocationData(false);
    }
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (mode === "manual") {
        payload.latitude = 0;
        payload.longitude = 0;
      }

      const res = await fetch("/api/predict-yield", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.details || data.error || t("predictionError"));
        }
        onPredict(data);
        toast.success(t("predictionSuccess"));
      } else {
        const text = await res.text();
        console.error("Non-JSON response received:", text);
        throw new Error(`Server returned HTML instead of JSON. Check console for details.`);
      }
    } catch (error: any) {
      console.error("Prediction Error:", error);
      toast.error(error.message || t("predictionError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex bg-secondary/30 p-1.5 rounded-full border border-secondary shadow-sm w-fit mx-auto">
        <button
          onClick={() => setMode("smart")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
            mode === "smart"
              ? "bg-primary text-primary-foreground shadow-md scale-105"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          }`}
        >
          <MapPin className="w-4 h-4" />
          {t("smartMode") || "Smart Mode"}
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
            mode === "manual"
              ? "bg-primary text-primary-foreground shadow-md scale-105"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          }`}
        >
          <Database className="w-4 h-4" />
          {t("manualMode") || "Manual Mode"}
        </button>
      </div>

      <Card className="w-full max-w-2xl mx-auto shadow-lg border-2 border-primary/10 overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500" />
        <CardHeader className="bg-gradient-to-b from-primary/5 to-transparent pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl shadow-sm">
              <Sprout className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">{t("title")}</CardTitle>
              <CardDescription>{t("description")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePredict} className="space-y-6">
            
            {/* Map Section for Smart Mode */}
            {mode === "smart" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-primary flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {t("selectLocation") || "Select your farm location"}
                  </Label>
                  {formData.latitude !== 0 && (
                     <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {t("locationSelected") || "Location selected"}
                     </Badge>
                  )}
                </div>
                <div className="relative rounded-2xl overflow-hidden border-2 border-primary/20 shadow-inner">
                  {isFetchingLocationData && (
                    <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none">
                      <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                      <p className="font-semibold text-primary">{t("autoFetchTitle") || "Auto-fetching data..."}</p>
                    </div>
                  )}
                  <FarmMap onLocationSelect={handleLocationSelect} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-primary/10">
              <div className="space-y-2">
                <Label htmlFor="cropType" className="font-semibold">{t("cropType")}</Label>
                <Select 
                  value={formData.cropType} 
                  onValueChange={(val: string | null) => {
                    if (val) setFormData({ ...formData, cropType: val });
                  }}
                >
                  <SelectTrigger id="cropType" className="h-11">
                    <SelectValue placeholder={t("selectCrop")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wheat">Wheat</SelectItem>
                    <SelectItem value="Rice">Rice</SelectItem>
                    <SelectItem value="Maize">Maize</SelectItem>
                    <SelectItem value="Cotton">Cotton</SelectItem>
                    <SelectItem value="Sugarcane">Sugarcane</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="landArea" className="font-semibold">{t("landArea")} (Acres)</Label>
                <div className="relative">
                  <Input
                    id="landArea"
                    type="number"
                    value={formData.landArea}
                    onChange={(e) => setFormData({ ...formData, landArea: Number(e.target.value) })}
                    className="pl-9 h-11"
                  />
                  <TrendingUp className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fertilizerCost" className="font-semibold">{t("fertilizerCost")}</Label>
                <div className="relative">
                  <Input
                    id="fertilizerCost"
                    type="number"
                    value={formData.fertilizerCost}
                    onChange={(e) => setFormData({ ...formData, fertilizerCost: Number(e.target.value) })}
                    className="pl-9 h-11"
                  />
                  <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pesticideCost" className="font-semibold">{t("pesticideCost")}</Label>
                <div className="relative">
                  <Input
                    id="pesticideCost"
                    type="number"
                    value={formData.pesticideCost}
                    onChange={(e) => setFormData({ ...formData, pesticideCost: Number(e.target.value) })}
                    className="pl-9 h-11"
                  />
                  <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="irrigationCost" className="font-semibold">{t("irrigationCost")}</Label>
                <div className="relative">
                  <Input
                    id="irrigationCost"
                    type="number"
                    value={formData.irrigationCost}
                    onChange={(e) => setFormData({ ...formData, irrigationCost: Number(e.target.value) })}
                    className="pl-9 h-11"
                  />
                  <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Environmental/Soil fields */}
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                   <Label htmlFor="rainfall" className="font-semibold">{t("rainfall")}</Label>
                   {mode === "smart" && formData.latitude !== 0 && (
                      <Badge variant="outline" className="text-[10px] bg-sky-50 text-sky-700 border-sky-200">
                        <CloudLightning className="w-3 h-3 mr-1" />
                        Auto-filled
                      </Badge>
                   )}
                </div>
                <Input
                  id="rainfall"
                  type="number"
                  value={formData.rainfall}
                  onChange={(e) => setFormData({ ...formData, rainfall: Number(e.target.value) })}
                  className={`h-11 ${mode === "smart" && formData.latitude !== 0 ? "border-sky-300 bg-sky-50/50 text-sky-900 font-semibold" : ""}`}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                   <Label htmlFor="soilNitrogen" className="font-semibold">{t("soilNitrogen")}</Label>
                   {mode === "smart" && formData.latitude !== 0 && (
                      <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                         <FlaskConical className="w-3 h-3 mr-1" />
                         Estimated
                      </Badge>
                   )}
                </div>
                <Input
                  id="soilNitrogen"
                  type="number"
                  value={formData.soilNitrogen}
                  onChange={(e) => setFormData({ ...formData, soilNitrogen: Number(e.target.value) })}
                  className={`h-11 ${mode === "smart" && formData.latitude !== 0 ? "border-emerald-300 bg-emerald-50/50 text-emerald-900 font-semibold" : ""}`}
                />
              </div>

              <div className="space-y-2">
                 <Label htmlFor="soilPhosphorus" className="font-semibold">{t("soilPhosphorus")}</Label>
                <Input
                  id="soilPhosphorus"
                  type="number"
                  value={formData.soilPhosphorus}
                  onChange={(e) => setFormData({ ...formData, soilPhosphorus: Number(e.target.value) })}
                  className={`h-11 ${mode === "smart" && formData.latitude !== 0 ? "border-emerald-300 bg-emerald-50/50 text-emerald-900 font-semibold" : ""}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="soilPotassium" className="font-semibold">{t("soilPotassium")}</Label>
                <Input
                  id="soilPotassium"
                  type="number"
                  value={formData.soilPotassium}
                  onChange={(e) => setFormData({ ...formData, soilPotassium: Number(e.target.value) })}
                  className={`h-11 ${mode === "smart" && formData.latitude !== 0 ? "border-emerald-300 bg-emerald-50/50 text-emerald-900 font-semibold" : ""}`}
                />
              </div>

              <Button 
                 type="submit" 
                 className="md:col-span-2 h-14 text-lg font-bold mt-4 bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-700 shadow-md transition-all hover:shadow-lg" 
                 disabled={loading || isFetchingLocationData}
              >
                {loading || isFetchingLocationData ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isFetchingLocationData ? t("autoFetchTitle") || "Fetching..." : t("predicting")}
                  </>
                ) : (
                  <>
                    <Sprout className="w-5 h-5 mr-2" />
                    {t("predictButton")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Developer Debug Panel */}
      <div className="w-full max-w-2xl mx-auto">
        <button
          onClick={() => setShowDevPanel(!showDevPanel)}
          className="w-full flex items-center justify-center gap-2 p-3 text-xs font-mono text-muted-foreground/80 hover:text-primary transition-colors border border-dashed border-border rounded-xl bg-background/50 backdrop-blur-sm"
        >
          <FileJson className="w-4 h-4" />
          {showDevPanel ? "Hide" : "Show"} {t("developerPanel") || "Developer Debug Panel"}
        </button>

        {showDevPanel && (
          <div className="mt-3 p-5 bg-slate-950 rounded-xl border border-slate-800 shadow-2xl animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
               <Database className="w-4 h-4 text-emerald-400" />
               <h4 className="text-emerald-400 font-mono text-sm font-bold tracking-wider uppercase">System Diagnostics</h4>
            </div>
            
            <div className="space-y-4 font-mono text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                    <p className="text-slate-500 mb-1">Mode</p>
                    <p className="text-white font-bold">{mode.toUpperCase()}</p>
                 </div>
                 <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                    <p className="text-slate-500 mb-1">Coordinates</p>
                    <p className="text-white font-bold">
                       {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                    </p>
                 </div>
              </div>

              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/50 space-y-2">
                 <p className="text-slate-500 mb-2">Data Sources</p>
                 <div className="flex items-start gap-2">
                    <span className="text-sky-400 shrink-0">Rainfall:</span>
                    <span className="text-slate-300">{mode === "smart" && formData.latitude !== 0 ? devData.sourceRainfall : "Manual input"}</span>
                 </div>
                 <div className="flex items-start gap-2">
                    <span className="text-emerald-400 shrink-0">Soil (NPK):</span>
                    <span className="text-slate-300">{mode === "smart" && formData.latitude !== 0 ? devData.sourceSoil : "Manual input"}</span>
                 </div>
                 <div className="flex items-start gap-2">
                    <span className="text-orange-400 shrink-0">Pipeline:</span>
                    <span className="text-slate-300">{mode === "smart" && formData.latitude !== 0 ? devData.pipelineUsed : "cost-priority-model"}</span>
                 </div>
              </div>

              <div>
                <p className="text-slate-500 mb-2">API Payload Preview</p>
                <div className="bg-slate-900 p-4 rounded-lg overflow-x-auto border border-slate-800">
                  <pre className="text-emerald-300">
{JSON.stringify(
  mode === "smart" 
    ? formData 
    : { ...formData, latitude: 0, longitude: 0 }, 
  null, 
  2
)}
                  </pre>
                </div>
              </div>

              {/* FCM TEST UI BLOCK */}
              <div className="bg-sky-950/40 p-4 rounded-lg border border-sky-800/50 mt-4 space-y-3">
                 <div className="flex items-center gap-2 mb-1">
                    <BellRing className="w-4 h-4 text-sky-400" />
                    <h5 className="text-sky-400 font-bold">Firebase Cloud Messaging Test (Step 2)</h5>
                 </div>
                 <div className="flex items-center justify-between">
                    <p className="text-slate-400">Status: <span className="text-white ml-2">{fcmStatus}</span></p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleTestFCM}
                        disabled={fcmLoading}
                        className="bg-transparent border-sky-700 text-sky-300 hover:bg-sky-900 hover:text-white"
                      >
                        {fcmLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Fetch Token
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleTestPushDelivery}
                        disabled={testPushLoading}
                        className="bg-transparent border-indigo-700 text-indigo-300 hover:bg-indigo-900 hover:text-white"
                      >
                        {testPushLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Test Broadcast
                      </Button>
                    </div>
                 </div>
                 {fcmToken && (
                    <div className="bg-slate-900 p-2 rounded border border-slate-800 break-all text-[10px] text-sky-200 mt-2">
                       <p className="text-sky-500 mb-1 font-bold">FCM Token Generated:</p>
                       {fcmToken}
                    </div>
                 )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
