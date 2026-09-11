"use client";

import { useState, useEffect } from "react";
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from "@/i18n/routing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CloudRain, ScanEye, TrendingUp, Sprout, Bot, Loader2, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function ToolsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [diseaseQuery, setDiseaseQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [weather, setWeather] = useState<{
    location: string;
    temp: number;
    condition: string;
    humidity: number;
    wind: number;
    isDay: boolean;
    icon: string;
  } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    fetch("/api/weather?q=Ahmedabad,India")
      .then((r) => r.json())
      .then((data) => {
        if (data.location && data.current) {
          setWeather({
            location: `${data.location.name}${data.location.region ? ", " + data.location.region : ""}`,
            temp: Math.round(data.current.temp_c),
            condition: data.current.condition?.text || "—",
            humidity: data.current.humidity,
            wind: data.current.wind_kph,
            isDay: data.current.is_day === 1,
            icon: data.current.condition?.icon || "",
          });
        }
      })
      .catch(() => setWeather(null))
      .finally(() => setWeatherLoading(false));
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/auth");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleAiScan = () => {
    if (!diseaseQuery) return;
    setIsScanning(true);
    // Mock AI delay
    setTimeout(() => {
      setAiResponse(`Based on your description "${diseaseQuery}", it appears to be a mild case of Powdery Mildew or early Aphid infestation. \n\nRecommendation: Spray 5% Neem Seed Kernel Extract (NSKE) or a mild sulfur-based fungicide. Ensure proper sunlight and airflow.`);
      setIsScanning(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Farmer Tools</h1>
        <p className="text-muted-foreground mt-1">Smart utilities to help your daily farming.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Weather Widget — day/night aware, matches /weather style */}
        <Card className="overflow-hidden border-0 shadow-lg">
          {weatherLoading ? (
            <div className="flex items-center gap-3 p-6 bg-muted/50 rounded-xl">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading weather…</span>
            </div>
          ) : weather ? (
            <div
              className={`relative overflow-hidden rounded-xl border border-white/10 ${
                weather.isDay
                  ? "bg-gradient-to-b from-amber-100 via-sky-100 to-sky-200 text-slate-800"
                  : "bg-gradient-to-b from-slate-800 via-slate-900 to-indigo-950 text-white"
              }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium opacity-80">{weather.location}</p>
                    <p className="text-3xl font-light tabular-nums mt-0.5">{weather.temp}°C</p>
                    <p className="text-sm capitalize opacity-90 mt-0.5">{weather.condition}</p>
                  </div>
                  {weather.icon && (
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <img src={`https:${weather.icon}`} alt="" className="w-9 h-9 object-contain" />
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-4 text-xs opacity-90">
                  <span>Humidity {weather.humidity}%</span>
                  <span>·</span>
                  <span>Wind {weather.wind} km/h</span>
                </div>
                <Link
                  href="/weather"
                  className="inline-flex items-center gap-1 mt-3 text-xs font-medium opacity-90 hover:underline"
                >
                  Search any location <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-dashed bg-muted/30 text-center">
              <p className="text-sm text-muted-foreground">Weather unavailable.</p>
              <Link href="/weather" className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-2 hover:underline">
                Open Weather <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </Card>

        {/* AI Disease Identifier */}
        <Card className="border-border shadow-sm flex flex-col">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-xl flex items-center gap-2 text-primary">
              <ScanEye className="w-6 h-6 text-primary" /> AI Disease Identifier
            </CardTitle>
            <CardDescription>Describe your plant&apos;s symptoms or upload a picture (mock)</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex-1 flex flex-col gap-4">
             {!aiResponse ? (
               <div className="space-y-3">
                 <Textarea 
                   placeholder="E.g., My cotton leaves have white powdery spots on the back..." 
                   className="resize-none h-24 bg-muted/50 rounded-xl border-primary/20"
                   value={diseaseQuery}
                   onChange={(e: any) => setDiseaseQuery(e.target.value)}
                 />
                 <Button onClick={handleAiScan} className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white" disabled={isScanning}>
                   {isScanning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ScanEye className="w-4 h-4 mr-2" />}
                   {isScanning ? "Scanning..." : "Identify Disease"}
                 </Button>
               </div>
             ) : (
               <div className="space-y-4 animate-in slide-in-from-bottom-2">
                 <div className="p-4 bg-muted/50 border border-primary/20 rounded-xl relative">
                   <div className="absolute -top-3 -left-3 bg-primary text-white p-1.5 rounded-full shadow-sm">
                     <Bot className="w-4 h-4" />
                   </div>
                   <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{aiResponse}</p>
                 </div>
                 <Button variant="outline" onClick={() => {setAiResponse(null); setDiseaseQuery("")}} className="w-full text-xs">
                   Ask Another Question
                 </Button>
               </div>
             )}
          </CardContent>
        </Card>

        {/* Soil Health Tips */}
        <Card className="border-border shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Sprout className="w-6 h-6 text-[#8D6E63]" /> Soil Health Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <p className="text-sm text-muted-foreground"><span className="font-bold text-foreground">Crop Rotation:</span> Rotate legumes like chickpea with cereals to naturally restore soil nitrogen.</p>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <p className="text-sm text-muted-foreground"><span className="font-bold text-foreground">Organic Matter:</span> Add Farm Yard Manure (FYM) before monsoon to improve water retention in sandy soils.</p>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <p className="text-sm text-muted-foreground"><span className="font-bold text-foreground">Avoid Over-Tilling:</span> Deep ploughing every year breaks soil structure. Practice minimum tillage.</p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
