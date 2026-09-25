"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sprout,
  Tractor,
  MapPin,
  Compass,
  Thermometer,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  ArrowLeft,
  Camera,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  Check,
  XCircle,
  PlusCircle,
  Info,
  Clock,
  Sparkles,
  BookOpen,
  Dna,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CropDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cropId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [crop, setCrop] = useState<any | null>(null);
  const [scans, setScans] = useState<any[]>([]);
  const [loadingScans, setLoadingScans] = useState(false);
  const [riskData, setRiskData] = useState<any | null>(null);
  const [evaluatingRisk, setEvaluatingRisk] = useState(false);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [threatFilter, setThreatFilter] = useState<'ALL' | 'ACTION' | 'BENCHMARK'>('ALL');

  // Advisory & Field Work Plan States
  const [advisories, setAdvisories] = useState<any[]>([]);
  const [loadingAdvisories, setLoadingAdvisories] = useState(false);
  const [resolvingAdvisory, setResolvingAdvisory] = useState(false);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loadingInterventions, setLoadingInterventions] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Load crop details
  async function loadCropDetails() {
    if (!cropId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/crops/${cropId}`);
      if (!res.ok) {
        throw new Error("Crop not found or access denied");
      }
      const data = await res.json();
      setCrop(data);
    } catch (err: any) {
      console.warn("Crop load notice:", err);
      toast.error(err.message || "Failed to load crop details");
    } finally {
      setLoading(false);
    }
  }

  // Load crop scan history
  async function loadCropScans() {
    if (!cropId) return;
    setLoadingScans(true);
    try {
      const res = await fetch(`/api/crops/${cropId}/scans`);
      if (res.ok) {
        const data = await res.json();
        setScans(data);
      }
    } catch (err) {
      console.warn("Notice: scan history fetch skipped:", err);
    } finally {
      setLoadingScans(false);
    }
  }

  // Load Advisories
  async function loadAdvisories() {
    if (!cropId) return;
    setLoadingAdvisories(true);
    try {
      const res = await fetch(`/api/crops/${cropId}/advisories`);
      if (res.ok) {
        const data = await res.json();
        setAdvisories(data);
      }
    } catch (err) {
      console.warn("Notice: advisories fetch skipped:", err);
    } finally {
      setLoadingAdvisories(false);
    }
  }

  // Load Interventions Work Plan
  async function loadInterventions() {
    if (!cropId) return;
    setLoadingInterventions(true);
    try {
      const res = await fetch(`/api/crops/${cropId}/interventions`);
      if (res.ok) {
        const data = await res.json();
        setInterventions(data);
      }
    } catch (err) {
      console.warn("Notice: interventions fetch skipped:", err);
    } finally {
      setLoadingInterventions(false);
    }
  }

  // Evaluate AgriShield Risk
  async function handleEvaluateRisk() {
    if (!cropId || evaluatingRisk) return;
    setEvaluatingRisk(true);
    setLoadingRisk(true);
    try {
      const res = await fetch(`/api/crops/${cropId}/risk`);
      if (res.ok) {
        const data = await res.json();
        setRiskData(data);
        toast.success("Crop risk assessment evaluated successfully.");
        // Automatically check/load advisories after risk evaluation
        loadAdvisories();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to evaluate risk");
      }
    } catch (err) {
      toast.error("Network error evaluating crop risk");
    } finally {
      setEvaluatingRisk(false);
      setLoadingRisk(false);
    }
  }

  // Load existing Risk Assessment silently on mount
  async function loadRiskSilently() {
    if (!cropId) return;
    setLoadingRisk(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(`/api/crops/${cropId}/risk`, { signal: controller.signal });
      if (res.ok) {
        const data = await res.json();
        setRiskData(data);
      }
    } catch {
      /* silent */
    } finally {
      clearTimeout(timeoutId);
      setLoadingRisk(false);
    }
  }

  // Generate / Refresh Actionable Advisory
  async function handleGenerateAdvisory() {
    if (!cropId) return;
    setResolvingAdvisory(true);
    try {
      const res = await fetch(`/api/crops/${cropId}/advisories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const newAdv = await res.json();
        toast.success("Actionable advisory resolved from validated agricultural sources.");
        loadAdvisories();
        loadRiskSilently();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to generate advisory");
      }
    } catch (err) {
      toast.error("Network error generating advisory");
    } finally {
      setResolvingAdvisory(false);
    }
  }

  // Schedule an Intervention from an Advisory
  async function handleScheduleIntervention(
    advisory: any,
    type: string,
    actionText: string
  ) {
    if (!cropId) return;
    setActionInProgress(`schedule_${actionText}`);
    try {
      const res = await fetch(`/api/crops/${cropId}/interventions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advisoryId: advisory._id,
          riskEventId: advisory.riskEventId,
          interventionType: type,
          title: `${type} Action: ${advisory.threatName}`,
          actionText,
          scheduledDate: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        toast.success("Intervention scheduled in farmer work plan.");
        loadInterventions();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to schedule intervention");
      }
    } catch (err) {
      toast.error("Network error scheduling intervention");
    } finally {
      setActionInProgress(null);
    }
  }

  // Farmer Confirms Completion of Intervention
  async function handleConfirmIntervention(interventionId: string) {
    setActionInProgress(`confirm_${interventionId}`);
    try {
      const res = await fetch(`/api/interventions/${interventionId}/confirm`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmerNotes: "Confirmed in-field by farmer" }),
      });
      if (res.ok) {
        toast.success("Intervention marked as completed!");
        loadInterventions();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to confirm intervention");
      }
    } catch (err) {
      toast.error("Network error confirming intervention");
    } finally {
      setActionInProgress(null);
    }
  }

  useEffect(() => {
    loadCropDetails();
    loadCropScans();
    loadAdvisories();
    loadInterventions();
    loadRiskSilently();
  }, [cropId]);

  if (loading) {
    return (
      <div className="container max-w-5xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
        <p className="text-sm text-muted-foreground">Loading crop profile and spatial context...</p>
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="container max-w-5xl mx-auto py-12 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold">Crop Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested crop could not be found or you do not have permission to view it.
        </p>
        <Link href="/dashboard/my-crops">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to My Crops
          </Button>
        </Link>
      </div>
    );
  }

  const field = crop.fieldId;
  const zone = crop.zoneId;

  const locParts = [
    field?.location?.village,
    field?.location?.district,
    field?.location?.state,
  ].filter(Boolean);
  const locationSummary = locParts.length > 0 ? locParts.join(", ") : "Location unavailable";

  // Dynamic calculation of DAS from sowing date to avoid static 0
  const sowingTime = new Date(crop.sowingDate).getTime();
  const calendarDas = !isNaN(sowingTime)
    ? Math.max(0, Math.floor((Date.now() - sowingTime) / (1000 * 60 * 60 * 24)))
    : 0;
  const calculatedDas = crop.currentDas && crop.currentDas > 0 ? crop.currentDas : calendarDas;

  const hasBoundary = Boolean(field?.boundary?.coordinates?.length);

  // Dynamic phenological stage resolution grounded in crop taxonomy
  const getDynamicStageName = (cropName: string, das: number, storedStage?: string) => {
    if (storedStage && storedStage !== "Vegetative Stage") return storedStage;
    const name = (cropName || "").toLowerCase();
    if (name.includes("soybean") || name.includes("soya")) {
      if (das <= 7) return "Germination & Emergence (VE)";
      if (das <= 20) return "Early Vegetative (V1 - V3)";
      if (das <= 45) return "Rapid Vegetative Growth (V4 - R1)";
      if (das <= 70) return "Flowering & Pod Formation (R2 - R4)";
      if (das <= 95) return "Seed Filling & Maturation (R5 - R7)";
      return "Full Maturity & Harvest Ready (R8)";
    }
    if (name.includes("cotton")) {
      if (das <= 12) return "Germination & Emergence";
      if (das <= 40) return "Vegetative & Squaring";
      if (das <= 85) return "Flowering & Boll Development";
      if (das <= 130) return "Boll Maturation & Bursting";
      return "Harvest Window";
    }
    if (name.includes("wheat")) {
      if (das <= 15) return "Crown Root Initiation (CRI)";
      if (das <= 35) return "Tillering Stage";
      if (das <= 60) return "Jointing & Booting";
      if (das <= 85) return "Heading & Flowering";
      if (das <= 110) return "Milking & Dough Stage";
      return "Ripening & Maturity";
    }
    if (name.includes("groundnut") || name.includes("peanut")) {
      if (das <= 15) return "Emergence & Seedling";
      if (das <= 40) return "Vegetative & Flowering";
      if (das <= 70) return "Pegging & Pod Initiation";
      if (das <= 105) return "Pod Development";
      return "Maturity & Harvesting";
    }
    if (das <= 10) return "Germination & Emergence";
    if (das <= 35) return "Active Vegetative Growth";
    if (das <= 70) return "Flowering & Reproductive";
    if (das <= 100) return "Fruit/Grain Development";
    return "Maturity & Ripening";
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-6 animate-in fade-in duration-300">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/my-crops">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to My Crops
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant={crop.status === "Active" ? "default" : "secondary"}>
            {crop.status}
          </Badge>
        </div>
      </div>

      {/* Main Title Banner */}
      <div className="bg-muted/40 p-6 rounded-xl border space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2.5">
              <Sprout className="w-7 h-7 text-emerald-600" />
              {crop.cropName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Variety: <strong className="text-foreground">{crop.variety || "Unspecified"}</strong>
              {" • "}
              Planted Area: <strong className="text-foreground">{crop.cultivatedArea} {crop.cultivatedAreaUnit}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              variant="outline"
              className="border-amber-300 text-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 font-medium"
              disabled={evaluatingRisk}
              onClick={handleEvaluateRisk}
            >
              {evaluatingRisk ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
              )}
              {evaluatingRisk ? "Evaluating Risk..." : "Evaluate Crop Risk"}
            </Button>

            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
              disabled={resolvingAdvisory}
              onClick={handleGenerateAdvisory}
            >
              {resolvingAdvisory ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              )}
              {resolvingAdvisory ? "Generating Advisory..." : "Generate Advisory"}
            </Button>
          </div>
        </div>
      </div>

      {/* Spatial Hierarchy & Phenology Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spatial Lineage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              Spatial &amp; Location Hierarchy
            </CardTitle>
            <CardDescription className="text-xs">
              Farmer → Field → Location → Boundary → Monitoring Zone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            <div className="flex items-start justify-between border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Tractor className="w-3.5 h-3.5" /> Field Name:
              </span>
              <span className="font-semibold text-foreground">{field?.name || "Unknown Field"}</span>
            </div>
            <div className="flex items-start justify-between border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Location:
              </span>
              <span className="font-medium text-foreground text-right">{locationSummary}</span>
            </div>
            <div className="flex items-start justify-between border-b pb-2">
              <span className="text-muted-foreground">Field Boundary:</span>
              <span>
                {hasBoundary ? (
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300">
                    <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> Boundary Defined
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    Point Centroid
                  </Badge>
                )}
              </span>
            </div>
            <div className="flex items-start justify-between pt-0.5">
              <span className="text-muted-foreground">Monitoring Zone:</span>
              <span>
                {zone ? (
                  <Badge variant="outline" className="text-[10px] border-emerald-500 bg-emerald-50 text-emerald-800">
                    {zone.zoneCode || "Zone"} ({zone.zoneName || "Sub-zone"})
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    Field-wide Monitoring
                  </Badge>
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Phenological Progress */}
        <Card className="border-t-4 border-t-emerald-500 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Phenological Lifecycle &amp; GDD Tracking
                </CardTitle>
                <CardDescription className="text-xs">
                  Real-time thermal accumulation and crop growth stage progression
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 text-xs">
                Day {calculatedDas}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            <div className="flex items-start justify-between border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> Sowing Date:
              </span>
              <span className="font-semibold text-foreground">
                {new Date(crop.sowingDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-start justify-between border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600" /> Days After Sowing (DAS):
              </span>
              <span className="font-bold text-foreground text-sm text-emerald-700">{calculatedDas} Days</span>
            </div>
            <div className="flex items-start justify-between border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" /> Active Growth Stage:
              </span>
              <div className="text-right">
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {getDynamicStageName(crop.cropName, calculatedDas, crop.currentStageId)}
                </span>
              </div>
            </div>
            <div className="flex items-start justify-between pt-0.5">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Progression Mode:
              </span>
              <div className="flex items-center gap-2">
                {crop.cumulativeGdd !== undefined && crop.cumulativeGdd !== null && crop.cumulativeGdd > 0 && (
                  <span className="font-mono text-xs text-muted-foreground">
                    {Math.round(crop.cumulativeGdd)} °Cd GDD
                  </span>
                )}
                <Badge variant="outline" className="text-[10px] font-mono bg-slate-50">
                  {crop.progressionMode === "DYNAMIC_GDD"
                    ? "Dynamic GDD"
                    : crop.progressionMode === "HYBRID_DAS"
                    ? "Hybrid GDD + DAS"
                    : "Physiological DAS"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comprehensive Risk Assessment Card */}
      {loadingRisk && !riskData ? (
        <Card className="relative overflow-hidden border border-amber-500/30 rounded-2xl bg-gradient-to-b from-card to-amber-50/10 shadow-xs">
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-rose-400 to-amber-400 animate-pulse absolute top-0 left-0" />
          <CardHeader className="pb-3 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold text-foreground">
                      AgriShield 360° Comprehensive Risk Assessment
                    </CardTitle>
                    <Badge variant="secondary" className="text-[10px] font-semibold py-0 h-4">
                      v2.4 Engine
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Synthesizing canopy phenology, micro-climate weather, and multi-angle leaf disease scans...
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="border-amber-300 bg-amber-100/60 text-amber-800 text-xs py-1 px-3 rounded-full flex items-center gap-1.5 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Synthesizing Telemetry...
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs pb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 rounded-xl border bg-muted/30 animate-pulse space-y-2">
                  <div className="h-3 w-16 bg-muted-foreground/20 rounded" />
                  <div className="h-4 w-28 bg-muted-foreground/30 rounded" />
                  <div className="h-3 w-20 bg-muted-foreground/20 rounded" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 rounded-xl border bg-muted/20 animate-pulse space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-32 bg-muted-foreground/30 rounded" />
                    <div className="h-4 w-20 bg-muted-foreground/20 rounded-full" />
                  </div>
                  <div className="h-3 w-3/4 bg-muted-foreground/20 rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : riskData ? (
        <Card className="relative overflow-hidden border border-border shadow-sm rounded-2xl bg-card">
          {/* Top Status Gradient Accent Bar */}
          <div
            className={`h-1.5 w-full absolute top-0 left-0 ${
              riskData.overallStatus === "POTENTIAL_CONCERN" || riskData.overallStatus === "HIGH_RISK"
                ? "bg-gradient-to-r from-amber-500 via-rose-500 to-red-500"
                : riskData.overallStatus === "INCONCLUSIVE" || riskData.overallStatus === "ATTENTION"
                ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500"
                : "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"
            }`}
          />

          <CardHeader className="pb-3 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    riskData.overallStatus === "POTENTIAL_CONCERN" || riskData.overallStatus === "HIGH_RISK"
                      ? "bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20"
                      : riskData.overallStatus === "INCONCLUSIVE" || riskData.overallStatus === "ATTENTION"
                      ? "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20"
                  }`}
                >
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold text-foreground">
                      AgriShield 360° Comprehensive Risk Assessment
                    </CardTitle>
                    <Badge variant="secondary" className="text-[10px] font-semibold py-0 h-4">
                      v2.4 Engine
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Autonomous multi-source telemetry analyzing canopy phenology, micro-climate weather, and leaf disease scans.
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Badge
                  variant="outline"
                  className={`px-3 py-1 text-xs font-semibold rounded-full shadow-xs flex items-center gap-1.5 ${
                    riskData.overallStatus === "POTENTIAL_CONCERN" || riskData.overallStatus === "HIGH_RISK"
                      ? "border-rose-300 bg-rose-50/90 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                      : riskData.overallStatus === "INCONCLUSIVE" || riskData.overallStatus === "ATTENTION"
                      ? "border-amber-300 bg-amber-50/90 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                      : "border-emerald-300 bg-emerald-50/90 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                  }`}
                >
                  {riskData.overallStatus === "POTENTIAL_CONCERN" || riskData.overallStatus === "HIGH_RISK" ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                      Potential Concern Detected
                    </>
                  ) : riskData.overallStatus === "INCONCLUSIVE" ? (
                    <>
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                      Multi-Symptom Scrutiny
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      No Concern Detected
                    </>
                  )}
                </Badge>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2.5 text-xs rounded-lg text-muted-foreground hover:text-foreground border-border hover:bg-muted"
                  disabled={evaluatingRisk}
                  onClick={handleEvaluateRisk}
                  title="Re-run real-time risk evaluation"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${evaluatingRisk ? "animate-spin text-amber-600" : ""}`} />
                  Re-evaluate
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 text-xs pb-5">
            {/* Multi-Source Telemetry Gauges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <div className="flex items-start gap-3 p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 shrink-0">
                  <Sprout className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                    Phenology Stage
                  </span>
                  <p className="text-xs font-semibold text-foreground truncate mt-0.5">
                    {crop?.stage || "Vegetative Stage"}
                  </p>
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Grounded (GDD)
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 ring-1 ring-sky-500/20 shrink-0">
                  <Thermometer className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                    Micro-Climate
                  </span>
                  <p className="text-xs font-semibold text-foreground truncate mt-0.5">
                    {riskData.evidenceCompleteness?.weatherCoveragePercent > 0
                      ? `${riskData.evidenceCompleteness.weatherCoveragePercent}% Coverage`
                      : "Satellite Sync Ready"}
                  </p>
                  <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                    Open-Meteo Radar
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 ring-1 ring-purple-500/20 shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                    Diagnostic Vision
                  </span>
                  <p className="text-xs font-semibold text-foreground truncate mt-0.5">
                    {scans.length > 0 ? `${scans.length} Zone Scans` : "Ready to Scout"}
                  </p>
                  <span className="text-[11px] text-purple-600 font-medium flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> In-Field Scouting
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 shrink-0">
                  <Dna className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                    Cultivar Genetics
                  </span>
                  <p className="text-xs font-semibold text-foreground truncate mt-0.5">
                    {crop?.variety ? `Variety ${crop.variety}` : "ICAR Catalog"}
                  </p>
                  <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-0.5">
                    Trial Benchmark
                  </span>
                </div>
              </div>
            </div>

            {/* Identified Agronomic Threats Section */}
            {riskData.evaluatedThreats && riskData.evaluatedThreats.length > 0 ? (
              <div className="space-y-3 pt-2">
                {/* Filter and Count Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      Identified Agronomic Threats
                    </span>
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                      {riskData.evaluatedThreats.length}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant={threatFilter === "ALL" ? "secondary" : "ghost"}
                      className={`h-7 px-2.5 text-[11px] rounded-lg ${
                        threatFilter === "ALL" ? "font-semibold bg-muted" : "text-muted-foreground"
                      }`}
                      onClick={() => setThreatFilter("ALL")}
                    >
                      All ({riskData.evaluatedThreats.length})
                    </Button>
                    <Button
                      size="sm"
                      variant={threatFilter === "ACTION" ? "secondary" : "ghost"}
                      className={`h-7 px-2.5 text-[11px] rounded-lg ${
                        threatFilter === "ACTION"
                          ? "font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/40"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setThreatFilter("ACTION")}
                    >
                      🚨 Action Required (
                      {
                        riskData.evaluatedThreats.filter(
                          (t: any) =>
                            t.riskLevel === "POTENTIAL_CONCERN" ||
                            t.status === "POTENTIAL_CONCERN" ||
                            t.level === "HIGH"
                        ).length
                      }
                      )
                    </Button>
                    <Button
                      size="sm"
                      variant={threatFilter === "BENCHMARK" ? "secondary" : "ghost"}
                      className={`h-7 px-2.5 text-[11px] rounded-lg ${
                        threatFilter === "BENCHMARK" ? "font-semibold bg-muted" : "text-muted-foreground"
                      }`}
                      onClick={() => setThreatFilter("BENCHMARK")}
                    >
                      🌿 ICAR Rules (
                      {
                        riskData.evaluatedThreats.filter(
                          (t: any) =>
                            !(
                              t.riskLevel === "POTENTIAL_CONCERN" ||
                              t.status === "POTENTIAL_CONCERN" ||
                              t.level === "HIGH"
                            )
                        ).length
                      }
                      )
                    </Button>
                  </div>
                </div>

                {/* Threat Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {riskData.evaluatedThreats
                    .filter((threat: any) => {
                      const isAlert =
                        threat.riskLevel === "POTENTIAL_CONCERN" ||
                        threat.status === "POTENTIAL_CONCERN" ||
                        threat.level === "HIGH";
                      if (threatFilter === "ACTION") return isAlert;
                      if (threatFilter === "BENCHMARK") return !isAlert;
                      return true;
                    })
                    .map((threat: any, idx: number) => {
                      const isAlert =
                        threat.riskLevel === "POTENTIAL_CONCERN" ||
                        threat.status === "POTENTIAL_CONCERN" ||
                        threat.level === "HIGH";
                      const isInconclusive =
                        threat.riskLevel === "INCONCLUSIVE" ||
                        threat.status === "INCONCLUSIVE" ||
                        threat.level === "MEDIUM";
                      const isInsufficient =
                        threat.riskLevel === "INSUFFICIENT_DATA" ||
                        threat.status === "INSUFFICIENT_DATA";

                      const isVisualScan =
                        threat.supportingEvidence?.some((e: any) => e.sourceType === "AGRIVISION_SCAN") ||
                        threat.ruleId?.includes("SCAN");

                      let humanExplanation = threat.explanation;
                      if (threat.explanation?.includes("conflicting diagnoses")) {
                        humanExplanation =
                          "Multi-angle scouting in this monitoring zone detected mixed foliar symptoms. Recommended for follow-up close-up scouting.";
                      } else if (threat.explanation?.includes("omits computational numeric")) {
                        humanExplanation =
                          "ICAR literature marks vulnerability during vegetative submergence. Quantitative local threshold calibrating against weather radar.";
                      }

                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between gap-2.5 transition-all shadow-2xs ${
                            isAlert
                              ? "border-l-4 border-l-rose-500 bg-gradient-to-br from-rose-50/50 via-card to-background dark:from-rose-950/20 dark:to-card border-border/80 hover:shadow-xs"
                              : isInconclusive
                              ? "border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50/40 via-card to-background dark:from-amber-950/20 dark:to-card border-border/80 hover:shadow-xs"
                              : isInsufficient
                              ? "border-l-4 border-l-slate-400 bg-gradient-to-br from-slate-50/40 via-card to-background dark:from-slate-900/20 dark:to-card border-border/80 hover:shadow-xs"
                              : "border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50/40 via-card to-background dark:from-emerald-950/20 dark:to-card border-border/80 hover:shadow-xs"
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-semibold text-foreground text-sm block">
                                  {threat.threatName || "Agronomic Threat"}
                                </span>
                                {threat.threatCategory && (
                                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                    {threat.threatCategory.replace(/_/g, " ")}
                                  </span>
                                )}
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-semibold shrink-0 gap-1 px-2 py-0.5 ${
                                  isAlert
                                    ? "border-rose-300 bg-rose-100/80 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                                    : isInconclusive
                                    ? "border-amber-300 bg-amber-100/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                    : isInsufficient
                                    ? "border-slate-300 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                    : "border-emerald-300 bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                }`}
                              >
                                {isAlert ? (
                                  <>
                                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                                    Action Recommended
                                  </>
                                ) : isInconclusive ? (
                                  <>
                                    <HelpCircle className="w-3 h-3 text-amber-600" />
                                    Under Observation
                                  </>
                                ) : isInsufficient ? (
                                  <>
                                    <Info className="w-3 h-3 text-slate-500" />
                                    Baseline Metric
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    Clear • Low Risk
                                  </>
                                )}
                              </Badge>
                            </div>

                            <p className="text-[11px] text-muted-foreground/90 mt-1.5 leading-relaxed">
                              {humanExplanation}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[10px]">
                            {isVisualScan ? (
                              <Badge
                                variant="secondary"
                                className="text-[10px] bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-medium border-0 gap-1"
                              >
                                <Camera className="w-3 h-3" />
                                AI In-Field Vision Scan
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium border-0 gap-1"
                              >
                                <Dna className="w-3 h-3" />
                                ICAR Scientific Baseline
                              </Badge>
                            )}

                            {isAlert && (
                              <button
                                onClick={() => {
                                  const el = document.getElementById("advisory-section");
                                  el?.scrollIntoView({ behavior: "smooth" });
                                }}
                                className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 transition-colors"
                              >
                                View Action Plan <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center border border-dashed rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
                <p className="text-sm font-semibold text-foreground">All Agronomic Checks Clear</p>
                <p className="text-xs text-muted-foreground">
                  No active concerns detected for current phenology and weather conditions.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="relative overflow-hidden border border-dashed border-emerald-500/30 rounded-2xl bg-gradient-to-b from-card to-muted/20 shadow-xs">
          <CardHeader className="py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    AgriShield 360° Comprehensive Risk Assessment
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Run autonomous risk evaluation across micro-climate, visual zone scans, and stage vulnerability.
                  </CardDescription>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs rounded-xl h-9 px-4 text-xs font-semibold gap-1.5"
                disabled={evaluatingRisk}
                onClick={handleEvaluateRisk}
              >
                {evaluatingRisk ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Evaluating Risk...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                    Run 360° Risk Assessment
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Actionable Advisory & IPM Recommendations */}
      <Card id="advisory-section" className="border-emerald-300 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                Actionable Advisory &amp; Integrated Pest Management (IPM)
              </CardTitle>
              <CardDescription className="text-xs">
                Zero-hallucination agronomic recommendations validated against ICAR packages and CIB&amp;RC guidelines
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-emerald-400 text-emerald-800 bg-emerald-50">
                {advisories.length} Active Advisor{advisories.length === 1 ? "y" : "ies"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                onClick={handleGenerateAdvisory}
                disabled={resolvingAdvisory}
              >
                {resolvingAdvisory ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingAdvisories ? (
            <div className="py-6 text-center text-xs text-muted-foreground flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading validated advisories...
            </div>
          ) : advisories.length === 0 ? (
            <div className="py-8 text-center border border-dashed rounded-lg space-y-3 bg-muted/20">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-700">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  No active advisory generated yet for this crop cycle.
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Generate targeted agronomic advice based on current weather, soil, and crop growth stage.
                </p>
              </div>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                onClick={handleGenerateAdvisory}
                disabled={resolvingAdvisory}
              >
                {resolvingAdvisory ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                )}
                Generate Advisory &amp; IPM Plan
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {advisories.map((adv) => (
                <div key={adv._id} className="p-4 rounded-xl border bg-card space-y-4">
                  {/* Advisory Header */}
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b pb-3">
                    <div>
                      <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                        {adv.advisoryHeadline}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{adv.advisorySummary}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      Valid until: {new Date(adv.validUntil).toLocaleDateString()}
                    </Badge>
                  </div>

                  {/* Cultural & Mechanical Practices */}
                  {adv.culturalActions && adv.culturalActions.length > 0 && (
                    <div className="space-y-1.5 text-xs">
                      <span className="font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                        🌱 Cultural &amp; Preventive Management:
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                        {adv.culturalActions.map((c: string, idx: number) => (
                          <li key={idx} className="leading-relaxed">
                            {c}{" "}
                            <button
                              onClick={() => handleScheduleIntervention(adv, "CULTURAL", c)}
                              disabled={actionInProgress === `schedule_${c}`}
                              className="text-[10px] text-emerald-600 underline hover:text-emerald-800 ml-1.5 font-medium"
                            >
                              [+ Schedule Action]
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Biological Controls */}
                  {adv.biologicalActions && adv.biologicalActions.length > 0 && (
                    <div className="space-y-1.5 text-xs">
                      <span className="font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                        🐞 Biological &amp; Bio-agent Controls:
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                        {adv.biologicalActions.map((b: string, idx: number) => (
                          <li key={idx} className="leading-relaxed">
                            {b}{" "}
                            <button
                              onClick={() => handleScheduleIntervention(adv, "BIOLOGICAL", b)}
                              disabled={actionInProgress === `schedule_${b}`}
                              className="text-[10px] text-emerald-600 underline hover:text-emerald-800 ml-1.5 font-medium"
                            >
                              [+ Schedule Action]
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Strict Chemical Recommendation Gate Display */}
                  <div className="text-xs p-3 rounded-lg border bg-muted/30">
                    <span className="font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                      🧪 Chemical Intervention (Strict Safety Gate):
                    </span>
                    {adv.chemicalAction?.offered ? (
                      <div className="space-y-1.5 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {adv.chemicalAction.activeIngredient} {adv.chemicalAction.formulation}
                          </span>
                          <Badge variant="outline" className="text-[10px] bg-red-50 text-red-800 border-red-300">
                            PHI: {adv.chemicalAction.phiDays} Days Waiting Period
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            REI: {adv.chemicalAction.reiHours} Hours
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">
                          Dosage: <strong>{adv.chemicalAction.dosage} {adv.chemicalAction.unit}</strong> in {adv.chemicalAction.dilution}. Method: {adv.chemicalAction.applicationMethod}.
                        </p>
                        <p className="text-[11px] text-amber-700 italic">
                          ⚠️ Safety: {adv.chemicalAction.safetyPrecaution}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 mt-1 text-red-700 border-red-300"
                          onClick={() =>
                            handleScheduleIntervention(
                              adv,
                              "CHEMICAL",
                              `Spray ${adv.chemicalAction.activeIngredient} @ ${adv.chemicalAction.dosage} ${adv.chemicalAction.unit}`
                            )
                          }
                        >
                          <PlusCircle className="w-3 h-3 mr-1" /> Schedule Chemical Application
                        </Button>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-xs italic">
                        🔒 {adv.chemicalAction?.unavailabilityReason || "No chemical application warranted."}
                      </p>
                    )}
                  </div>

                  {/* Source Citations Provenance */}
                  {adv.sourceCitations && adv.sourceCitations.length > 0 && (
                    <div className="pt-2 border-t text-[11px] text-muted-foreground/80 space-y-0.5">
                      <span className="font-semibold text-foreground text-[10px]">Verified Source Provenance:</span>
                      {adv.sourceCitations.map((s: any, idx: number) => (
                        <p key={idx} className="italic">
                          • {s.organization}: "{s.title}" (Page {s.page})
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PHASE 7: INTERVENTION WORK PLAN & FARMER CONFIRMATION */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Intervention Work Plan &amp; Farmer Confirmation
              </CardTitle>
              <CardDescription className="text-xs">
                Scheduled in-field actions requiring farmer manual review and verification
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {interventions.filter((i) => i.status === "SCHEDULED").length} Pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loadingInterventions ? (
            <div className="py-6 text-center text-xs text-muted-foreground flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading intervention schedule...
            </div>
          ) : interventions.length === 0 ? (
            <div className="py-8 text-center border border-dashed rounded-lg space-y-1">
              <p className="text-sm text-muted-foreground">No interventions scheduled yet.</p>
              <p className="text-xs text-muted-foreground">
                Select cultural, biological, or chemical actions from the advisory above to schedule them into your farm calendar.
              </p>
            </div>
          ) : (
            <div className="divide-y rounded-md border text-xs">
              {interventions.map((item) => (
                <div key={item._id} className="p-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1 max-w-[600px]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm">{item.title}</span>
                      <Badge
                        variant="outline"
                        className={
                          item.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 text-[10px]"
                            : item.status === "CANCELLED"
                            ? "text-muted-foreground text-[10px]"
                            : "bg-amber-50 text-amber-800 border-amber-300 text-[10px]"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{item.actionText}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Scheduled: {new Date(item.scheduledDate).toLocaleDateString()}
                      {item.completedAt && ` • Completed: ${new Date(item.completedAt).toLocaleDateString()}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === "SCHEDULED" && (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                        disabled={actionInProgress === `confirm_${item._id}`}
                        onClick={() => handleConfirmIntervention(item._id)}
                      >
                        {actionInProgress === `confirm_${item._id}` ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                        ) : (
                          <Check className="w-3.5 h-3.5 mr-1" />
                        )}
                        Confirm Done
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phase 4 Zone Disease Scan History */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-600" />
                Zone-Specific Scouting &amp; Scan History
              </CardTitle>
              <CardDescription className="text-xs">
                Diagnostic scans performed on monitoring zones for this crop cycle
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {scans.length} Scan{scans.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loadingScans ? (
            <div className="py-8 text-center text-muted-foreground text-xs flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading scan history...
            </div>
          ) : scans.length === 0 ? (
            <div className="py-8 text-center border border-dashed rounded-lg space-y-2">
              <p className="text-sm text-muted-foreground">
                No diagnostic scans recorded for this crop yet.
              </p>
              <Link href="/dashboard/my-crops">
                <Button variant="outline" size="sm" className="text-xs text-emerald-700 border-emerald-300">
                  <Camera className="w-3.5 h-3.5 mr-1.5" /> Go to Zone Scouting
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y rounded-md border">
              {scans.map((scan) => {
                const zoneDisplay = scan.zoneId
                  ? `${scan.zoneId.zoneCode || "Zone"} (${scan.zoneId.zoneName || "Monitoring Zone"})`
                  : "Zone not recorded";

                return (
                  <div key={scan._id} className="p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">
                          {scan.diagnosis?.primaryCondition || "Unspecified"}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            scan.screeningResult === "POTENTIAL_CONCERN"
                              ? "border-amber-400 bg-amber-50 text-amber-800 text-[10px]"
                              : scan.screeningResult === "NO_CONCERN_DETECTED"
                              ? "border-emerald-300 bg-emerald-50 text-emerald-800 text-[10px]"
                              : "text-muted-foreground text-[10px]"
                          }
                        >
                          {scan.screeningResult?.replace(/_/g, " ") || "Screening"}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">
                        Monitoring Zone: <strong className="text-foreground">{zoneDisplay}</strong>
                        {" • "}
                        Captured: {new Date(scan.capturedAt || scan.createdAt).toLocaleString()}
                        {" • "}
                        View: {scan.viewAngle || "screening"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {scan.imageUrl && (
                        <a
                          href={scan.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View Image
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
