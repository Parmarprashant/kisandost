"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sprout,
  Compass,
  MapPin,
  Plus,
  Loader2,
  Tractor,
  Layers,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  RefreshCw,
  Activity,
  Camera,
  AlertTriangle,
  UploadCloud,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { GeoPolygon } from "@/lib/geoUtils";

// Dynamically import FarmBoundaryEditor with SSR disabled for Leaflet
const FarmBoundaryEditor = dynamic(
  () =>
    import("@/components/farmer-tools/FarmBoundaryEditor").then(
      (mod) => mod.FarmBoundaryEditor
    ),
  {
    ssr: false,
    loading: () => (
      <Card className="p-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
        <p className="text-sm text-muted-foreground">Initializing AgriShield spatial map...</p>
      </Card>
    ),
  }
);

interface CropItem {
  _id: string;
  fieldId?: string;
  zoneId?: string | null;
  cropName: string;
  variety?: string;
  sowingDate: string;
  cultivatedArea: number;
  status: string;
  currentDas?: number;
  currentStageId?: string;
  progressionMode?: "DYNAMIC_GDD" | "HYBRID_DAS" | "DAS_ONLY";
  cumulativeGdd?: number;
  gddParameterSetId?: string;
  baseTemperature?: number | null;
  maturityGdd?: number | null;
  expectedHarvestDate?: string | null;
}

interface FieldItem {
  _id: string;
  name: string;
  area: number;
  areaUnit: "Acre" | "Hectare";
  location?: {
    village?: string;
    taluka?: string;
    district?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
  };
  boundary?: GeoPolygon;
  crops?: CropItem[];
  createdAt: string;
}

export default function MyCropsPage() {
  const t = useTranslations("Dashboard");

  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<FieldItem[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  // New field modal/form state
  const [showNewFieldForm, setShowNewFieldForm] = useState(false);
  const [creatingField, setCreatingField] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldArea, setNewFieldArea] = useState("");
  const [newFieldUnit, setNewFieldUnit] = useState<"Acre" | "Hectare">("Acre");
  const [newFieldVillage, setNewFieldVillage] = useState("");
  const [newFieldDistrict, setNewFieldDistrict] = useState("");

  // Active sub-tab: 'spatial' | 'crops' | 'scouting'
  const [activeTab, setActiveTab] = useState<"spatial" | "crops" | "scouting">("spatial");
  const [updatingCropId, setUpdatingCropId] = useState<string | null>(null);

  // Phase 4 Progressive Zone Scouting States
  const [fieldZones, setFieldZones] = useState<any[]>([]);
  const [activeZone, setActiveZone] = useState<any | null>(null);
  const [zoneScanSession, setZoneScanSession] = useState<any | null>(null);
  const [scanningZone, setScanningZone] = useState(false);
  const [uploadingSupplementary, setUploadingSupplementary] = useState(false);
  const [supplementaryAngle, setSupplementaryAngle] = useState<string>("close-up");
  const [completingSession, setCompletingSession] = useState(false);

  // Phase 6 AgriShield 360° Risk Evaluation States
  const [cropRisks, setCropRisks] = useState<Record<string, any>>({});
  const [evaluatingRiskCropId, setEvaluatingRiskCropId] = useState<string | null>(null);

  async function handleEvaluateCropRisk(cropId: string) {
    setEvaluatingRiskCropId(cropId);
    try {
      const res = await fetch(`/api/crops/${cropId}/risk`);
      if (res.ok) {
        const data = await res.json();
        setCropRisks((prev) => ({ ...prev, [cropId]: data }));
        toast.success("AgriShield 360° risk evaluation complete.");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to evaluate crop risk.");
      }
    } catch (e) {
      toast.error("Network error evaluating crop risk.");
    } finally {
      setEvaluatingRiskCropId(null);
    }
  }

  // Fetch farmer fields
  async function loadFields() {
    setLoading(true);
    try {
      const res = await fetch("/api/fields");
      if (res.ok) {
        const data = await res.json();
        setFields(data);
        if (data.length > 0 && !selectedFieldId) {
          setSelectedFieldId(data[0]._id);
        }
      }
    } catch (err) {
      console.error("Failed to load fields:", err);
      toast.error("Could not load your farm fields.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFields();
  }, []);

  // Handle Field Creation
  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim() || !newFieldArea) {
      toast.error("Please enter a field name and area.");
      return;
    }

    setCreatingField(true);
    try {
      const res = await fetch("/api/fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFieldName.trim(),
          area: Number(newFieldArea),
          areaUnit: newFieldUnit,
          location: {
            village: newFieldVillage.trim(),
            district: newFieldDistrict.trim(),
            latitude: 23.2156, // Default Gujarat agricultural reference
            longitude: 72.6369,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create field");
      }

      toast.success(`Field "${data.name}" created successfully!`);
      setShowNewFieldForm(false);
      setNewFieldName("");
      setNewFieldArea("");
      setNewFieldVillage("");
      setNewFieldDistrict("");

      await loadFields();
      setSelectedFieldId(data._id);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create field");
    } finally {
      setCreatingField(false);
    }
  };

  // Handle Crop Cycle Progression Refresh / Update
  const handleUpdateCropProgression = async (cropId: string) => {
    setUpdatingCropId(cropId);
    try {
      const res = await fetch(`/api/crops/${cropId}/cycle/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update crop cycle");
      }

      toast.success(
        `Progression updated: ${data.cycle?.currentStage?.stageName || "Active stage"} (DAS ${data.cycle?.currentDas || 0})`
      );

      // Refresh fields list to update crop view
      await loadFields();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update crop progression");
    } finally {
      setUpdatingCropId(null);
    }
  };

  // Fetch Zones for selected field
  useEffect(() => {
    if (selectedFieldId) {
      fetch(`/api/fields/${selectedFieldId}/zones`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.zones) {
            setFieldZones(data.zones);
            if (data.zones.length > 0) {
              setActiveZone(data.zones[0]);
            }
          }
        })
        .catch((e) => console.error("Error loading zones:", e));
    }
  }, [selectedFieldId]);

  // Initial Screening Scan
  const handleInitialZoneScan = async (file: File) => {
    const currentField = fields.find((f) => f._id === selectedFieldId);
    const activeCrop = currentField?.crops?.[0];
    if (!activeCrop) {
      toast.error("Please add a crop to this field before scouting zones.");
      return;
    }
    if (!activeZone) {
      toast.error("Please select a monitoring zone to scan.");
      return;
    }

    setScanningZone(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("viewAngle", "screening");

    try {
      const res = await fetch(`/api/crops/${activeCrop._id}/zones/${activeZone._id}/scan`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze zone image");
      }

      setZoneScanSession(data);
      toast.success(data.message);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to process screening image");
    } finally {
      setScanningZone(false);
    }
  };

  // Supplementary View Scan (Image 2..4)
  const handleSupplementaryScan = async (file: File) => {
    const currentField = fields.find((f) => f._id === selectedFieldId);
    const activeCrop = currentField?.crops?.[0];
    if (!activeCrop || !activeZone || !zoneScanSession?.sessionId) return;

    setUploadingSupplementary(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("viewAngle", supplementaryAngle);

    try {
      const res = await fetch(
        `/api/crops/${activeCrop._id}/zones/${activeZone._id}/scan/${zoneScanSession.sessionId}/images`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process supplementary image");
      }

      setZoneScanSession(data);
      toast.success(data.message);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload supplementary image");
    } finally {
      setUploadingSupplementary(false);
    }
  };

  // Complete Scan Session
  const handleCompleteSession = async () => {
    const currentField = fields.find((f) => f._id === selectedFieldId);
    const activeCrop = currentField?.crops?.[0];
    if (!activeCrop || !activeZone || !zoneScanSession?.sessionId) return;

    setCompletingSession(true);
    try {
      const res = await fetch(
        `/api/crops/${activeCrop._id}/zones/${activeZone._id}/scan/${zoneScanSession.sessionId}/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to complete zone scan");
      }

      setZoneScanSession((prev: any) => ({
        ...prev,
        status: data.summary.status,
        result: data.summary.result,
        completedAt: data.summary.completedAt,
        evidenceSummary: data.summary.evidenceSummary,
        scans: data.summary.scans,
      }));
      toast.success(data.message);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to complete zone session");
    } finally {
      setCompletingSession(false);
    }
  };

  // Navigate to Next Zone
  const handleContinueNextZone = () => {
    if (!fieldZones || fieldZones.length === 0 || !activeZone) return;
    const currentIndex = fieldZones.findIndex((z) => z._id === activeZone._id);
    const nextIndex = (currentIndex + 1) % fieldZones.length;
    const nextZone = fieldZones[nextIndex];
    setActiveZone(nextZone);
    setZoneScanSession(null);
    toast.info(`Moved to Zone ${nextZone.zoneCode}`);
  };

  const selectedField = fields.find((f) => f._id === selectedFieldId) || null;

  return (
    <div className="container mx-auto py-8 px-4 mt-16 max-w-7xl space-y-8 animate-in fade-in duration-500">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              AgriShield 360° Spatial Foundation
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            My Crop & Farm Monitoring
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your agricultural fields, define precision farm boundaries, and divide plots into spatial monitoring zones.
          </p>
        </div>

        <Button
          onClick={() => setShowNewFieldForm(!showNewFieldForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          {showNewFieldForm ? "Cancel" : "Add New Field"}
        </Button>
      </div>

      {/* New Field Form (Conditional) */}
      {showNewFieldForm && (
        <Card className="border-t-4 border-emerald-500 shadow-md animate-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Tractor className="w-5 h-5 text-emerald-600" />
              Register New Farm Field
            </CardTitle>
            <CardDescription>
              Create a farm plot record. You can subsequently draw its exact polygon boundary on the map.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateField} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fieldName">Field / Plot Name *</Label>
                  <Input
                    id="fieldName"
                    placeholder="e.g. North Acre / Home Farm"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fieldArea">Estimated Area *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="fieldArea"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="e.g. 5"
                      value={newFieldArea}
                      onChange={(e) => setNewFieldArea(e.target.value)}
                      required
                      className="w-2/3"
                    />
                    <select
                      value={newFieldUnit}
                      onChange={(e) => setNewFieldUnit(e.target.value as "Acre" | "Hectare")}
                      className="w-1/3 text-xs rounded-md border border-input bg-background px-2"
                    >
                      <option value="Acre">Acres</option>
                      <option value="Hectare">Hectares</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fieldVillage">Village / Taluka</Label>
                  <Input
                    id="fieldVillage"
                    placeholder="e.g. Gandhinagar"
                    value={newFieldVillage}
                    onChange={(e) => setNewFieldVillage(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowNewFieldForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creatingField}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {creatingField ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-1.5" />
                  )}
                  Save Field
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-3" />
          <p className="text-sm text-muted-foreground">Loading your farm fields and spatial boundaries...</p>
        </div>
      ) : fields.length === 0 ? (
        /* Empty State */
        <Card className="text-center p-12 border-dashed">
          <div className="p-4 rounded-full bg-emerald-50 text-emerald-600 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Tractor className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Farm Fields Registered Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            Register your first agricultural field to unlock GPS-accurate farm boundaries, monitoring zones, and crop disease mapping.
          </p>
          <Button
            onClick={() => setShowNewFieldForm(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Your First Field
          </Button>
        </Card>
      ) : (
        /* Field Selection & Spatial Dashboard */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Field Selection Sidebar */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your Registered Fields ({fields.length})
            </h3>
            <div className="space-y-2">
              {fields.map((f) => {
                const isSelected = f._id === selectedFieldId;
                const hasBoundary = Boolean(f.boundary?.coordinates?.length);

                return (
                  <button
                    key={f._id}
                    onClick={() => setSelectedFieldId(f._id)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-start justify-between ${
                      isSelected
                        ? "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-500 shadow-xs"
                        : "bg-card hover:bg-accent/40 border-border"
                    }`}
                  >
                    <div className="space-y-1">
                      <p className={`font-semibold text-sm ${isSelected ? "text-emerald-800 dark:text-emerald-300" : "text-foreground"}`}>
                        {f.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{f.area} {f.areaUnit}</span>
                        {f.location?.village && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[100px]">{f.location.village}</span>
                          </>
                        )}
                      </div>
                      <div className="pt-1 flex items-center gap-1.5">
                        {hasBoundary ? (
                          <Badge variant="outline" className="text-[10px] bg-emerald-100/50 text-emerald-700 border-emerald-300 py-0">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Boundary Ready
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 py-0">
                            <AlertCircle className="w-2.5 h-2.5 mr-0.5" /> No Boundary
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 mt-1 ${isSelected ? "text-emerald-600" : "text-muted-foreground"}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field Details & Spatial Map Display */}
          <div className="lg:col-span-3 space-y-6">
            {selectedField && (
              <>
                {/* Field Header Card */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/40 p-4 rounded-lg border">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Tractor className="w-5 h-5 text-emerald-600" />
                      {selectedField.name}
                    </h2>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {[selectedField.location?.village, selectedField.location?.district, selectedField.location?.state]
                        .filter(Boolean)
                        .join(", ") || "Location not specified"}
                      {" • "}
                      Registered Area: {selectedField.area} {selectedField.areaUnit}
                    </p>
                  </div>

                  {/* Navigation Sub-Tabs */}
                  <div className="flex items-center gap-1 bg-background p-1 rounded-md border text-xs">
                    <button
                      onClick={() => setActiveTab("spatial")}
                      className={`px-3 py-1.5 rounded-sm font-medium transition-colors flex items-center gap-1.5 ${
                        activeTab === "spatial"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Compass className="w-3.5 h-3.5" />
                      Boundary & Zones
                    </button>
                    <button
                      onClick={() => setActiveTab("crops")}
                      className={`px-3 py-1.5 rounded-sm font-medium transition-colors flex items-center gap-1.5 ${
                        activeTab === "crops"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Sprout className="w-3.5 h-3.5" />
                      Planted Crops ({selectedField.crops?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveTab("scouting")}
                      className={`px-3 py-1.5 rounded-sm font-medium transition-colors flex items-center gap-1.5 ${
                        activeTab === "scouting"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Zone Scouting
                    </button>
                  </div>
                </div>

                {/* Spatial Boundary & Zones View */}
                {activeTab === "spatial" && (
                  <FarmBoundaryEditor
                    key={selectedField._id}
                    fieldId={selectedField._id}
                    fieldName={selectedField.name}
                    initialCenter={[
                      selectedField.location?.latitude || 23.2156,
                      selectedField.location?.longitude || 72.6369,
                    ]}
                    initialArea={selectedField.area}
                    areaUnit={selectedField.areaUnit}
                    onBoundarySaved={(newBoundary, newArea) => {
                      setFields((prev) =>
                        prev.map((f) =>
                          f._id === selectedField._id
                            ? { ...f, boundary: newBoundary, area: newArea }
                            : f
                        )
                      );
                    }}
                  />
                )}

                {/* Planted Crops View */}
                {activeTab === "crops" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sprout className="w-5 h-5 text-emerald-600" />
                        Active Crops on {selectedField.name}
                      </CardTitle>
                      <CardDescription>
                        Crops planted on this field will link directly to spatial monitoring zones for localized health evaluation.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {(!selectedField.crops || selectedField.crops.length === 0) ? (
                        <div className="text-center py-8 space-y-3">
                          <p className="text-sm text-muted-foreground">
                            No active crops are registered on this field yet.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-emerald-700 border-emerald-300"
                            onClick={() => {
                              window.location.href = "/dashboard/add-crop";
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Crop to this Field
                          </Button>
                        </div>
                      ) : (
                        <div className="divide-y border rounded-md">
                          {selectedField.crops.map((c) => {
                            const calculatedDas =
                              c.currentDas ??
                              Math.max(
                                0,
                                Math.floor(
                                  (Date.now() - new Date(c.sowingDate).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )
                              );
                            const isUpdating = updatingCropId === c._id;
                            const mode = c.progressionMode || "DAS_ONLY";

                            const matchedZone = c.zoneId
                              ? fieldZones.find((z) => z._id === c.zoneId)
                              : null;
                            const assignedZoneText = matchedZone
                              ? `${matchedZone.zoneCode} (${matchedZone.zoneName})`
                              : "Zone not assigned";

                            const locParts = [
                              selectedField.location?.village,
                              selectedField.location?.district,
                              selectedField.location?.state,
                            ].filter(Boolean);
                            const locationSummary =
                              locParts.length > 0 ? locParts.join(", ") : "Location unavailable";

                            return (
                              <div
                                key={c._id}
                                className="p-4 space-y-3 hover:bg-muted/20 transition-colors"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <p className="font-semibold text-base text-foreground">
                                        {c.cropName}
                                      </p>
                                      {mode === "DYNAMIC_GDD" && (
                                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] flex items-center gap-1">
                                          <Thermometer className="w-3 h-3" />
                                          Thermal Time (GDD)
                                        </Badge>
                                      )}
                                      {mode === "HYBRID_DAS" && (
                                        <Badge
                                          variant="outline"
                                          className="text-amber-700 border-amber-400 bg-amber-50 text-[11px] flex items-center gap-1"
                                        >
                                          <Activity className="w-3 h-3" />
                                          Hybrid (DAS + Target GDD)
                                        </Badge>
                                      )}
                                      {mode === "DAS_ONLY" && (
                                        <Badge
                                          variant="secondary"
                                          className="text-muted-foreground text-[11px]"
                                        >
                                          DAS Tracking
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      Variety: <span className="font-medium text-foreground">{c.variety || "Unspecified"}</span>
                                    </p>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                                      <span>
                                        Field: <strong className="text-foreground">{selectedField.name}</strong>
                                      </span>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-muted-foreground" />
                                        Location: <span className="text-foreground">{locationSummary}</span>
                                      </span>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <Compass className="w-3 h-3 text-muted-foreground" />
                                        Monitoring Zone:{" "}
                                        <Badge
                                          variant={matchedZone ? "outline" : "secondary"}
                                          className={`text-[10px] py-0 px-1.5 ${
                                            matchedZone
                                              ? "border-emerald-400 text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300"
                                              : "text-muted-foreground"
                                          }`}
                                        >
                                          {assignedZoneText}
                                        </Badge>
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {c.cultivatedArea} {selectedField.areaUnit}
                                    </Badge>
                                    <Badge
                                      variant={
                                        c.status === "Active" ? "default" : "secondary"
                                      }
                                      className="text-xs"
                                    >
                                      {c.status}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Crop Cycle Progression Metrics Bar */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-muted/30 p-2.5 rounded-md border text-xs">
                                  <div>
                                    <span className="text-muted-foreground block text-[11px]">
                                      Elapsed DAS:
                                    </span>
                                    <span className="font-semibold text-foreground">
                                      {calculatedDas} Days
                                    </span>
                                  </div>

                                  <div>
                                    <span className="text-muted-foreground block text-[11px]">
                                      Growth Stage:
                                    </span>
                                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 truncate block">
                                      {c.currentStageId || "Initial Growth"}
                                    </span>
                                  </div>

                                  <div>
                                    <span className="text-muted-foreground block text-[11px]">
                                      Accumulated GDD:
                                    </span>
                                    <span className="font-medium text-foreground">
                                      {c.cumulativeGdd !== undefined && c.cumulativeGdd !== null
                                        ? `${c.cumulativeGdd} °C day`
                                        : "— (Awaiting Obs)"}
                                    </span>
                                  </div>

                                  <div>
                                    <span className="text-muted-foreground block text-[11px]">
                                      Est. Harvest:
                                    </span>
                                    <span className="font-medium text-foreground">
                                      {c.expectedHarvestDate
                                        ? new Date(c.expectedHarvestDate).toLocaleDateString()
                                        : "—"}
                                    </span>
                                  </div>
                                </div>

                                {/* Cycle Action Footer */}
                                <div className="flex items-center justify-between pt-1">
                                  <span className="text-[11px] text-muted-foreground">
                                    {c.gddParameterSetId ? (
                                      <span>Parameter Set: {c.gddParameterSetId}</span>
                                    ) : (
                                      <span>Physiological DAS baseline tracking</span>
                                    )}
                                  </span>

                                  <div className="flex items-center gap-2">
                                    <Link href={`/crops/${c._id}`}>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs border-blue-300 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                      >
                                        <Eye className="w-3 h-3 mr-1.5 text-blue-600" />
                                        View Crop
                                      </Button>
                                    </Link>

                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs border-amber-300 text-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                      disabled={evaluatingRiskCropId === c._id}
                                      onClick={() => handleEvaluateCropRisk(c._id)}
                                    >
                                      {evaluatingRiskCropId === c._id ? (
                                        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                                      ) : (
                                        <ShieldCheck className="w-3 h-3 mr-1.5 text-amber-600" />
                                      )}
                                      {evaluatingRiskCropId === c._id ? "Evaluating Risk..." : "AgriShield Risk"}
                                    </Button>

                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                      disabled={isUpdating}
                                      onClick={() => handleUpdateCropProgression(c._id)}
                                    >
                                      <RefreshCw
                                        className={`w-3 h-3 mr-1.5 ${
                                          isUpdating ? "animate-spin" : ""
                                        }`}
                                      />
                                      {isUpdating ? "Evaluating..." : "Update Progression"}
                                    </Button>
                                  </div>
                                </div>

                                {/* Phase 6 AgriShield Risk Result Display */}
                                {cropRisks[c._id] && (
                                  <div className="mt-2 p-3 bg-muted/40 rounded-md border text-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5 font-medium">
                                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                                        <span>AgriShield 360° Risk Assessment:</span>
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className={`text-[11px] font-semibold ${
                                          cropRisks[c._id].overallStatus === "POTENTIAL_CONCERN"
                                            ? "border-amber-400 bg-amber-50 text-amber-800"
                                            : cropRisks[c._id].overallStatus === "NO_CONCERN"
                                            ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                                            : cropRisks[c._id].overallStatus === "INCONCLUSIVE"
                                            ? "border-purple-400 bg-purple-50 text-purple-800"
                                            : "border-slate-300 bg-slate-50 text-slate-700"
                                        }`}
                                      >
                                        {cropRisks[c._id].overallStatus.replace("_", " ")}
                                      </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] text-muted-foreground border-t pt-1.5">
                                      <div>Stage: {cropRisks[c._id].evidenceCompleteness?.cropStageAvailable ? "✓ Grounded" : "✗ Missing"}</div>
                                      <div>Weather: {cropRisks[c._id].evidenceCompleteness?.weatherAvailable ? `✓ ${cropRisks[c._id].evidenceCompleteness.weatherCoveragePercent}%` : "✗ Missing"}</div>
                                      <div>Scout Scans: {cropRisks[c._id].evidenceCompleteness?.imageScanAvailable ? "✓ Recorded" : "— None Yet"}</div>
                                      <div>Cultivar: {cropRisks[c._id].evidenceCompleteness?.varietyDataAvailable ? "✓ ICAR Verified" : "— Standard"}</div>
                                    </div>

                                    {cropRisks[c._id].evaluatedThreats && cropRisks[c._id].evaluatedThreats.length > 0 && (
                                      <div className="space-y-1 pt-1">
                                        {cropRisks[c._id].evaluatedThreats.slice(0, 3).map((threat: any) => (
                                          <div key={threat.ruleId} className="flex items-start gap-1.5 text-[11px]">
                                            <span className="font-medium text-foreground shrink-0">{threat.threatName}:</span>
                                            <span className="text-muted-foreground">{threat.explanation}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Phase 4 Progressive Zone Scouting View */}
                {activeTab === "scouting" && (
                  <div className="space-y-6">
                    {/* Zone Selector Strip */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Camera className="w-5 h-5 text-emerald-600" />
                              Progressive Zone Scouting
                            </CardTitle>
                            <CardDescription>
                              Select a monitoring zone and upload screening views for AgriVision disease evaluation.
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {fieldZones.length} Monitoring Zone{fieldZones.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {fieldZones.length === 0 ? (
                          <div className="text-center py-6 border border-dashed rounded-lg">
                            <p className="text-sm text-muted-foreground mb-3">
                              No monitoring zones found for this field. Generate zones in the &quot;Boundary &amp; Zones&quot; tab first.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveTab("spatial")}
                              className="text-emerald-700 border-emerald-300"
                            >
                              <Compass className="w-4 h-4 mr-1.5" />
                              Go to Boundary &amp; Zones
                            </Button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {fieldZones.map((z) => {
                              const isSelected = activeZone?._id === z._id;
                              return (
                                <button
                                  key={z._id}
                                  type="button"
                                  onClick={() => {
                                    setActiveZone(z);
                                    setZoneScanSession(null);
                                  }}
                                  className={`p-3 rounded-lg border text-left transition-all ${
                                    isSelected
                                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-xs ring-1 ring-emerald-500"
                                      : "bg-card hover:bg-muted/50 border-border"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-sm text-foreground">
                                      {z.zoneCode}
                                    </span>
                                    <Badge
                                      variant={z.status === "ACTIVE" ? "outline" : "secondary"}
                                      className="text-[9px] py-0 px-1"
                                    >
                                      {z.status || "ACTIVE"}
                                    </Badge>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground truncate">
                                    {z.area ? `${z.area} ${selectedField.areaUnit}` : "Zone"}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Active Zone Inspection Panel */}
                    {activeZone && (
                      <Card className="border-t-4 border-t-emerald-600">
                        <CardHeader>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <CardTitle className="text-base flex items-center gap-2">
                                <Layers className="w-4 h-4 text-emerald-600" />
                                Inspecting Zone: <span className="text-emerald-700 dark:text-emerald-400">{activeZone.zoneCode}</span>
                              </CardTitle>
                              <CardDescription>
                                Targeted multi-angle visual scouting with AgriVision diagnostic integration.
                              </CardDescription>
                            </div>
                            {zoneScanSession && (
                              <Badge
                                className={
                                  zoneScanSession.result === "NO_CONCERN_DETECTED"
                                    ? "bg-emerald-600 text-white"
                                    : zoneScanSession.status === "ADDITIONAL_IMAGES_REQUIRED"
                                    ? "bg-amber-600 text-white"
                                    : "bg-slate-700 text-white"
                                }
                              >
                                {zoneScanSession.status}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Step 1: Initial Screening View Upload (If no active session) */}
                          {!zoneScanSession ? (
                            <div className="border border-dashed rounded-xl p-8 text-center bg-muted/10 space-y-4">
                              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
                                <Camera className="w-7 h-7" />
                              </div>
                              <div className="max-w-md mx-auto space-y-1">
                                <h4 className="font-semibold text-base text-foreground">
                                  Screening View (View 1 of 4)
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  Capture or upload an initial wide view of Zone {activeZone.zoneCode} to screen for potential concerns.
                                </p>
                              </div>

                              <div className="flex justify-center pt-2">
                                <label className="cursor-pointer">
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    disabled={scanningZone}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleInitialZoneScan(file);
                                    }}
                                  />
                                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-xs transition-colors">
                                    {scanningZone ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                        Analyzing with AgriVision...
                                      </>
                                    ) : (
                                      <>
                                        <UploadCloud className="w-4 h-4 mr-1" />
                                        Upload Screening Image
                                      </>
                                    )}
                                  </div>
                                </label>
                              </div>
                            </div>
                          ) : (
                            /* Active Session Interface */
                            <div className="space-y-5">
                              {/* NO CONCERN DETECTED Branch */}
                              {zoneScanSession.result === "NO_CONCERN_DETECTED" && (
                                <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/30 space-y-4">
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                                      <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                      <h4 className="font-bold text-base text-emerald-900 dark:text-emerald-200">
                                        No concerning signs detected in this scan.
                                      </h4>
                                      <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                        Continue to the next zone.
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-3 pt-2">
                                    <Button
                                      onClick={handleContinueNextZone}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                                    >
                                      Continue to Next Zone
                                      <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setZoneScanSession(null)}
                                      className="text-xs text-muted-foreground"
                                    >
                                      Start Fresh Scan on this Zone
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* POTENTIAL CONCERN / ADDITIONAL IMAGES REQUIRED Branch */}
                              {(zoneScanSession.result === "POTENTIAL_CONCERN" ||
                                zoneScanSession.status === "ADDITIONAL_IMAGES_REQUIRED") &&
                                zoneScanSession.status !== "COMPLETED" && (
                                  <div className="space-y-4">
                                    <div className="p-5 rounded-xl border border-amber-300 bg-amber-50/80 dark:bg-amber-950/30 space-y-3">
                                      <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                                          <AlertTriangle className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1">
                                          <h4 className="font-bold text-base text-amber-900 dark:text-amber-200">
                                            Potential issue detected. Please capture additional views from this zone.
                                          </h4>
                                          <p className="text-xs text-amber-800 dark:text-amber-300">
                                            Initial Finding:{" "}
                                            <span className="font-semibold underline">
                                              {zoneScanSession.latestDiagnosis?.name || "Suspicious anomaly"}
                                            </span>
                                          </p>
                                        </div>
                                      </div>

                                      {/* View Angle Recommendation Checklist */}
                                      <div className="bg-white/80 dark:bg-background/80 p-3 rounded-lg border border-amber-200 text-xs space-y-2">
                                        <p className="font-semibold text-foreground">
                                          Recommended supplementary views for Zone {activeZone.zoneCode}:
                                        </p>
                                        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-muted-foreground text-[11px]">
                                          <li className="flex items-center gap-1.5 p-2 rounded bg-muted/40">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            <strong>View 2:</strong> Close-up of leaf/lesion
                                          </li>
                                          <li className="flex items-center gap-1.5 p-2 rounded bg-muted/40">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            <strong>View 3:</strong> Wider canopy view
                                          </li>
                                          <li className="flex items-center gap-1.5 p-2 rounded bg-muted/40">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            <strong>View 4:</strong> Stem / adjacent plant
                                          </li>
                                        </ul>
                                      </div>

                                      {/* Supplementary Upload Form */}
                                      <div className="pt-2 flex flex-wrap items-center gap-3">
                                        <div className="flex items-center gap-2">
                                          <Label className="text-xs">Angle:</Label>
                                          <select
                                            value={supplementaryAngle}
                                            onChange={(e) => setSupplementaryAngle(e.target.value)}
                                            className="h-8 text-xs rounded border bg-background px-2"
                                          >
                                            <option value="close-up">Close-up of lesion</option>
                                            <option value="canopy">Canopy view</option>
                                            <option value="stem">Stem / Side</option>
                                            <option value="wide">Wide zone view</option>
                                          </select>
                                        </div>

                                        <label className="cursor-pointer">
                                          <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            disabled={uploadingSupplementary}
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) handleSupplementaryScan(file);
                                            }}
                                          />
                                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium shadow-xs">
                                            {uploadingSupplementary ? (
                                              <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                                Uploading View...
                                              </>
                                            ) : (
                                              <>
                                                <UploadCloud className="w-3.5 h-3.5 mr-1" />
                                                Upload View ({zoneScanSession.totalImages || 1}/4)
                                              </>
                                            )}
                                          </div>
                                        </label>

                                        <Button
                                          variant="outline"
                                          size="sm"
                                          disabled={completingSession}
                                          onClick={handleCompleteSession}
                                          className="text-xs border-amber-300 text-amber-800 hover:bg-amber-100"
                                        >
                                          {completingSession ? (
                                            <>
                                              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                              Finalizing...
                                            </>
                                          ) : (
                                            "Complete Zone Scan"
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}

                              {/* COMPLETED / INCONCLUSIVE Summary Branch */}
                              {(zoneScanSession.status === "COMPLETED" ||
                                zoneScanSession.status === "INCONCLUSIVE") && (
                                <div className="p-5 rounded-xl border bg-muted/20 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                      <h4 className="font-bold text-sm text-foreground">
                                        Zone Scouting Summary: {activeZone.zoneCode}
                                      </h4>
                                    </div>
                                    <Badge
                                      variant={
                                        zoneScanSession.result === "NO_CONCERN_DETECTED"
                                          ? "default"
                                          : zoneScanSession.status === "INCONCLUSIVE"
                                          ? "secondary"
                                          : "destructive"
                                      }
                                    >
                                      {zoneScanSession.status}
                                    </Badge>
                                  </div>

                                  <div className="bg-background p-3 rounded-lg border text-xs space-y-1.5">
                                    <p className="font-medium">
                                      {zoneScanSession.result === "NO_CONCERN_DETECTED"
                                        ? "No concerning signs detected in this scan."
                                        : zoneScanSession.status === "INCONCLUSIVE"
                                        ? "Diagnosis inconclusive / conflicting evidence across angles. Physical field inspection advised."
                                        : `Potential concern detected in Zone ${activeZone?.zoneCode || ""}.`}
                                    </p>
                                    {zoneScanSession.evidenceSummary && (
                                      <p className="text-muted-foreground text-[11px]">
                                        Evidence: {zoneScanSession.evidenceSummary}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3 pt-1">
                                    <Button
                                      onClick={handleContinueNextZone}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                                    >
                                      Next Zone
                                      <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setZoneScanSession(null)}
                                      className="text-xs"
                                    >
                                      New Scan Session
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
