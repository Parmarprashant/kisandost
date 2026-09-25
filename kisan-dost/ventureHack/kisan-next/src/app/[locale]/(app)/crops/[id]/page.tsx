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
      console.error(err);
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
      console.error("Failed to load scans:", err);
    } finally {
      setLoadingScans(false);
    }
  }

  // Evaluate AgriShield Risk
  async function handleEvaluateRisk() {
    if (!cropId) return;
    setEvaluatingRisk(true);
    try {
      const res = await fetch(`/api/crops/${cropId}/risk`);
      if (res.ok) {
        const data = await res.json();
        setRiskData(data);
        toast.success("AgriShield 360° risk evaluation complete.");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to evaluate risk");
      }
    } catch (err) {
      toast.error("Network error evaluating crop risk");
    } finally {
      setEvaluatingRisk(false);
    }
  }

  useEffect(() => {
    loadCropDetails();
    loadCropScans();
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

  // Location string construction
  const locParts = [
    field?.location?.village,
    field?.location?.district,
    field?.location?.state,
  ].filter(Boolean);
  const locationSummary = locParts.length > 0 ? locParts.join(", ") : "Location unavailable";

  const calculatedDas =
    crop.currentDas ??
    Math.max(
      0,
      Math.floor(
        (Date.now() - new Date(crop.sowingDate).getTime()) / (1000 * 60 * 60 * 24)
      )
    );

  const hasBoundary = Boolean(field?.boundary?.coordinates?.length);

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

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-amber-300 text-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              disabled={evaluatingRisk}
              onClick={handleEvaluateRisk}
            >
              {evaluatingRisk ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
              )}
              {evaluatingRisk ? "Evaluating Risk..." : "AgriShield Risk"}
            </Button>
          </div>
        </div>
      </div>

      {/* Spatial Hierarchy & Location Context */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spatial Lineage Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              Spatial &amp; Location Hierarchy
            </CardTitle>
            <CardDescription className="text-xs">
              Explicit relationship: Farmer → Field → Location → Boundary → Monitoring Zone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            {/* Field */}
            <div className="flex items-start justify-between border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Tractor className="w-3.5 h-3.5" /> Field Name:
              </span>
              <span className="font-semibold text-foreground">
                {field?.name || "Unknown Field"}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-start justify-between border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Field Location:
              </span>
              <span className="font-medium text-foreground text-right max-w-[240px]">
                {locationSummary}
              </span>
            </div>

            {/* GPS Coordinates (if stored) */}
            <div className="flex items-start justify-between border-b pb-2">
              <span className="text-muted-foreground">Field Coordinates:</span>
              <span className="font-mono text-muted-foreground">
                {field?.location?.latitude && field?.location?.longitude
                  ? `${field.location.latitude.toFixed(4)}°N, ${field.location.longitude.toFixed(4)}°E`
                  : "Coordinates unavailable"}
              </span>
            </div>

            {/* Boundary */}
            <div className="flex items-start justify-between border-b pb-2">
              <span className="text-muted-foreground">Field Boundary:</span>
              <span>
                {hasBoundary ? (
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300">
                    <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> Boundary Defined
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px]">
                    No boundary defined
                  </Badge>
                )}
              </span>
            </div>

            {/* Monitoring Zone */}
            <div className="flex items-start justify-between pt-0.5">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> Monitoring Zone:
              </span>
              <span>
                {zone ? (
                  <Badge variant="outline" className="border-emerald-400 text-emerald-800 bg-emerald-50 font-semibold">
                    {zone.zoneCode} — {zone.zoneName}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-muted-foreground">
                    Zone not assigned
                  </Badge>
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Growth & Lifecycle Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Crop Lifecycle &amp; Thermal Progress
            </CardTitle>
            <CardDescription className="text-xs">
              Phase 3C Crop Cycle Engine progression metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            <div className="flex items-start justify-between border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Sowing Date:
              </span>
              <span className="font-semibold text-foreground">
                {new Date(crop.sowingDate).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-start justify-between border-b pb-2">
              <span className="text-muted-foreground">Elapsed DAS:</span>
              <span className="font-bold text-foreground">
                {calculatedDas} Days
              </span>
            </div>

            <div className="flex items-start justify-between border-b pb-2">
              <span className="text-muted-foreground">Current Growth Stage:</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {crop.currentStageId || "Initial Growth"}
              </span>
            </div>

            <div className="flex items-start justify-between border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5" /> Accumulated GDD:
              </span>
              <span className="font-medium text-foreground">
                {crop.cumulativeGdd !== undefined && crop.cumulativeGdd !== null
                  ? `${crop.cumulativeGdd} °C day`
                  : "— (Awaiting observations)"}
              </span>
            </div>

            <div className="flex items-start justify-between pt-0.5">
              <span className="text-muted-foreground">Progression Mode:</span>
              <Badge variant="outline" className="text-[11px]">
                {crop.progressionMode || "DAS_ONLY"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AgriShield 360° Risk Assessment Panel (If evaluated) */}
      {riskData && (
        <Card className="border-amber-200 bg-amber-50/20 dark:bg-amber-950/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                AgriShield 360° Risk Evaluation Result
              </CardTitle>
              <Badge
                variant="outline"
                className={`text-xs font-bold ${
                  riskData.overallStatus === "POTENTIAL_CONCERN"
                    ? "border-amber-400 bg-amber-50 text-amber-800"
                    : riskData.overallStatus === "NO_CONCERN"
                    ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                    : riskData.overallStatus === "INCONCLUSIVE"
                    ? "border-purple-400 bg-purple-50 text-purple-800"
                    : "border-slate-300 bg-slate-50 text-slate-700"
                }`}
              >
                {riskData.overallStatus.replace("_", " ")}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Multi-source evidence evaluation under Zero Hallucination policy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {/* Evidence Completeness Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-background p-3 rounded-lg border text-[11px]">
              <div>
                <span className="text-muted-foreground block">Phenology Stage:</span>
                <span className="font-semibold">
                  {riskData.evidenceCompleteness?.cropStageAvailable ? "✓ Grounded" : "✗ Missing"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Historical Weather:</span>
                <span className="font-semibold">
                  {riskData.evidenceCompleteness?.weatherAvailable
                    ? `✓ Available (${riskData.evidenceCompleteness.weatherCoveragePercent}%)`
                    : "✗ Missing"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Zone Image Scans:</span>
                <span className="font-semibold">
                  {riskData.evidenceCompleteness?.imageScanAvailable ? "✓ Recorded" : "— None in window"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Cultivar Genetics:</span>
                <span className="font-semibold">
                  {riskData.evidenceCompleteness?.varietyDataAvailable ? "✓ ICAR Verified" : "— Standard"}
                </span>
              </div>
            </div>

            {/* Evaluated Threats */}
            {riskData.evaluatedThreats && riskData.evaluatedThreats.length > 0 && (
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Evaluated Threat Rules:</p>
                <div className="divide-y rounded-md border bg-background">
                  {riskData.evaluatedThreats.map((t: any) => (
                    <div key={t.ruleId} className="p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{t.threatName}</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            t.status === "POTENTIAL_CONCERN"
                              ? "border-amber-400 text-amber-800 bg-amber-50"
                              : t.status === "NO_CONCERN"
                              ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                              : "text-muted-foreground"
                          }`}
                        >
                          {t.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px]">{t.explanation}</p>
                      {t.sourceReference && (
                        <p className="text-[10px] text-muted-foreground/80 italic">
                          Source: {t.sourceReference}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
