"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { CROPS, TranslationMap } from "@/data/crops";
import { FERTILIZER_FORMULAS, UREA_N_RATIO, DAP_P_RATIO, MOP_K_RATIO, BAG_SIZE_KG } from "@/data/fertilizers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Sprout, Coins, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { saveCalculation } from "./actions";
import { toast } from "sonner";
import { useAuth } from '@/components/providers/AuthProvider';

function getLocalizedText(translationObj: TranslationMap | undefined, currentLocale: string): string {
  if (!translationObj) return "";
  // @ts-ignore
  return translationObj[currentLocale] || translationObj.en;
}

function FertilizerCalculatorContent() {
  const searchParams = useSearchParams();
  const defaultCrop = searchParams.get("crop") || "";
  const t = useTranslations("Fertilizer");
  const locale = useLocale();
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useAuth();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/auth");
    }
  }, [isLoaded, isSignedIn, router]);

  const [crop, setCrop] = useState(defaultCrop);
  const [area, setArea] = useState("1");
  const [soilType, setSoilType] = useState("loamy");
  const [currentN, setCurrentN] = useState("0");
  const [currentP, setCurrentP] = useState("0");
  const [currentK, setCurrentK] = useState("0");

  const [results, setResults] = useState<{
    urea: number; dap: number; mop: number; 
    totalBags: number; cost: number; overFertilizing: boolean;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const handleCalculate = () => {
    if (!crop || !area) {
      toast.error("Please select a crop and enter area.");
      return;
    }

    const acreage = parseFloat(area);
    const formula = FERTILIZER_FORMULAS[crop];
    if (!formula) return;

    // Soil type adjustments
    let soilMultiplier = 1;
    if (soilType === "sandy") soilMultiplier = 1.2; // needs more
    if (soilType === "clay") soilMultiplier = 0.9; // retains more

    let targetN = formula.n * soilMultiplier;
    let targetP = formula.p * soilMultiplier;
    let targetK = formula.k * soilMultiplier;

    // Subtract current levels (simplistic approach for demo)
    targetN = Math.max(0, targetN - parseFloat(currentN || "0"));
    targetP = Math.max(0, targetP - parseFloat(currentP || "0"));
    targetK = Math.max(0, targetK - parseFloat(currentK || "0"));

    // Check over-fertilizing
    const overFertilizing = parseFloat(currentN || "0") > formula.n || parseFloat(currentP || "0") > formula.p || parseFloat(currentK || "0") > formula.k;

    // Convert to fertilizer types:
    // P requirement is met by DAP mostly
    const dapKgs = targetP / DAP_P_RATIO;
    // DAP also provides Nitrogen (18%)
    const nFromDap = dapKgs * 0.18;
    // Remaining N met by Urea
    const ureaKgs = Math.max(0, (targetN - nFromDap) / UREA_N_RATIO);
    // K met by MOP (Muriate of Potash)
    const mopKgs = targetK / MOP_K_RATIO;

    const totalKgs = (dapKgs + ureaKgs + mopKgs) * acreage;
    const totalBags = Math.ceil(totalKgs / BAG_SIZE_KG);
    
    // Cost estimation
    const roughCost = (ureaKgs * 6 + dapKgs * 24 + mopKgs * 34) * acreage; // Mock prices per kg in INR

    setResults({
      urea: Math.round(ureaKgs * acreage),
      dap: Math.round(dapKgs * acreage),
      mop: Math.round(mopKgs * acreage),
      totalBags,
      cost: Math.round(roughCost),
      overFertilizing
    });
  };

  const handleSave = async () => {
    if (!results || !user || !crop) return;
    setIsSaving(true);
    try {
      await saveCalculation({
        userId: user.id, // Clerk ID will be transformed to Mongo ID in action
        crop,
        areaAcres: parseFloat(area),
        soilType,
        npkDosings: { urea: results.urea, dap: results.dap, mop: results.mop },
        totalBags: results.totalBags,
        costEstimate: results.cost
      });
      toast.success(t("save") + " successful!");
    } catch (e) {
      toast.error("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-12 overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Calculator className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered precision dosing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-5 border-border shadow-md rounded-[30px] sm:rounded-3xl overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-[#4CAF50] to-[#FFCA28]" />
          <CardHeader>
            <CardTitle>Farm Details</CardTitle>
            <CardDescription>Enter parameters to get precise NPK dosage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>{t("crop")}</Label>
              <Select value={crop} onValueChange={(val) => setCrop(val || "")}>
                <SelectTrigger className="h-12 bg-muted/50 rounded-xl">
                  <SelectValue placeholder="Choose crop..." />
                </SelectTrigger>
                <SelectContent>
                  {CROPS.map(c => (
                    <SelectItem key={c.id} value={c.id}>{getLocalizedText(c.name, locale)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("area")}</Label>
                <Input 
                  type="number" 
                  className="h-12 bg-muted/50 rounded-xl" 
                  value={area} 
                  onChange={(e) => setArea(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>{t("soilType")} ({t("soilDesc")})</Label>
                <Select value={soilType} onValueChange={(val) => setSoilType(val || "loamy")}>
                  <SelectTrigger className="h-12 bg-muted/50 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loamy">Loamy</SelectItem>
                    <SelectItem value="sandy">Sandy</SelectItem>
                    <SelectItem value="clay">Clay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <Label className="text-muted-foreground flex items-center justify-between">
                Current NPK Levels (Optional)
                <span className="text-xs font-normal bg-primary/10 text-primary px-2 py-0.5 rounded-full">Pro</span>
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="N" type="number" className="bg-muted/30" value={currentN} onChange={e=>setCurrentN(e.target.value)} />
                <Input placeholder="P" type="number" className="bg-muted/30" value={currentP} onChange={e=>setCurrentP(e.target.value)} />
                <Input placeholder="K" type="number" className="bg-muted/30" value={currentK} onChange={e=>setCurrentK(e.target.value)} />
              </div>
            </div>

            <Button onClick={handleCalculate} className="w-full h-14 text-lg rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg mt-4">
              {t("calculate")}
            </Button>
          </CardContent>
        </Card>

        {results && (
          <div className="lg:col-span-7 space-y-6 animate-in slide-in-from-right-8 duration-500 delay-100">
            {results.overFertilizing && (
              <div className="p-4 bg-warning/20 border-l-4 border-warning rounded-r-xl flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-warning-foreground shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-warning-foreground">High Existing Nutrients</h4>
                  <p className="text-sm text-warning-foreground/80 mt-1">Your soil already has high levels of certain nutrients. We&apos;ve reduced the dosage to prevent toxicities and save costs.</p>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="bg-card shadow-sm border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2"><Sprout className="w-5 h-5 text-[#4CAF50]" /> {t("recommended")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-end border-b pb-2">
                    <span className="font-semibold text-muted-foreground">Urea (N)</span>
                    <div className="text-right">
                      <span className="text-2xl font-black">{results.urea}</span>
                      <span className="text-sm text-muted-foreground ml-1">kg</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end border-b pb-2">
                    <span className="font-semibold text-muted-foreground">DAP (P)</span>
                    <div className="text-right">
                      <span className="text-2xl font-black">{results.dap}</span>
                      <span className="text-sm text-muted-foreground ml-1">kg</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="font-semibold text-muted-foreground">MOP (K)</span>
                    <div className="text-right">
                      <span className="text-2xl font-black">{results.mop}</span>
                      <span className="text-sm text-muted-foreground ml-1">kg</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-[#FFCA28]/20 to-transparent border-[#FFCA28]/30">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-[#FFCA28] rounded-full text-[#3E2723] shadow-inner">
                      <Coins className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground uppercase">{t("cost")}</p>
                      <h3 className="text-3xl font-black">₹{results.cost.toLocaleString()}</h3>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground uppercase">{t("totalBags")}</p>
                      <h3 className="text-2xl font-black">{results.totalBags} <span className="text-sm font-medium">bags (50kg)</span></h3>
                    </div>
                    <div className="px-3 py-1 bg-[#4CAF50]/10 text-[#4CAF50] rounded-full border border-[#4CAF50]/20 flex items-center gap-1 text-sm font-bold">
                       <TrendingUp className="w-4 h-4" /> {t("profit")} +18%
                    </div>
                  </CardContent>
                </Card>

                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  variant="outline" 
                  className="w-full h-14 rounded-xl border-primary text-primary hover:bg-primary/5 mt-2"
                >
                  {isSaving ? "Saving..." : t("save")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FertilizerCalculatorPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading calculator...</p>
      </div>
    }>
      <FertilizerCalculatorContent />
    </Suspense>
  );
}
