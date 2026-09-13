"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Sprout,
  Plus,
  MapPin,
  Compass,
  Droplets,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  CheckCircle2,
  Info,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  FlaskConical,
  RotateCcw,
  Eye,
  AlertTriangle,
  MessageSquare
} from "lucide-react";

type Crop = {
  _id: string;
  fieldId: string;
  cropName: string;
  cropMasterId?: string;
  variety?: string;
  sowingDate: string;
  cultivatedArea: number;
  cultivatedAreaUnit: "Acre" | "Hectare";
  cultivationMethod?: string;
  status: "Active" | "Harvested" | "Removed";
  notes?: string;
  createdAt: string;
};

type Field = {
  _id: string;
  name: string;
  area: number;
  areaUnit: "Acre" | "Hectare";
  location: {
    village?: string;
    taluka?: string;
    district?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
  };
  soil: {
    type?: string;
    soilTestAvailable?: boolean;
    pH?: number;
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
    organicCarbon?: number;
  };
  irrigation: {
    method?: string;
    waterSource?: string;
    frequency?: string;
  };
  previousCrop?: string;
  crops?: Crop[];
  createdAt: string;
};

type CropMasterItem = {
  cropName: string;
  varieties: string[];
};

export default function MyCropsPage() {
  const t = useTranslations("myCrop");
  
  const [fields, setFields] = useState<Field[]>([]);
  const [cropMaster, setCropMaster] = useState<CropMasterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  // Modal Controls
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1: Field, 2: Soil & Irrigation, 3: Crop, 4: Review

  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState(false);
  const [selectedFieldForCrop, setSelectedFieldForCrop] = useState<Field | null>(null);

  const [viewFieldModal, setViewFieldModal] = useState<Field | null>(null);
  const [viewCropModal, setViewCropModal] = useState<Crop | null>(null);
  const [editFieldModal, setEditFieldModal] = useState<Field | null>(null);
  const [editCropModal, setEditCropModal] = useState<Crop | null>(null);

  // Form States for Wizard (Field + Initial Crop)
  const [fieldName, setFieldName] = useState("");
  const [fieldArea, setFieldArea] = useState("");
  const [fieldAreaUnit, setFieldAreaUnit] = useState<"Acre" | "Hectare">("Acre");
  const [village, setVillage] = useState("");
  const [taluka, setTaluka] = useState("");
  const [district, setDistrict] = useState("");
  const [stateName, setStateName] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Soil Info
  const [soilType, setSoilType] = useState("Black Soil");
  const [hasSoilTest, setHasSoilTest] = useState(false);
  const [pH, setPh] = useState("");
  const [nitrogen, setNitrogen] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");
  const [organicCarbon, setOrganicCarbon] = useState("");

  // Irrigation & Previous Crop
  const [irrigationMethod, setIrrigationMethod] = useState("Drip");
  const [waterSource, setWaterSource] = useState("Borewell");
  const [irrigationFrequency, setIrrigationFrequency] = useState("Every 2–3 days");
  const [previousCrop, setPreviousCrop] = useState("Wheat");

  // Crop Info
  const [cropName, setCropName] = useState("Cotton");
  const [variety, setVariety] = useState("Bt Cotton");
  const [customVariety, setCustomVariety] = useState("");
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split("T")[0]);
  const [cultivatedArea, setCultivatedArea] = useState("");
  const [cultivatedAreaUnit, setCultivatedAreaUnit] = useState<"Acre" | "Hectare">("Acre");
  const [cultivationMethod, setCultivationMethod] = useState("Direct Sowing");
  const [cropNotes, setCropNotes] = useState("");

  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchFields();
    fetchCropMaster();
  }, []);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/fields");
      if (res.ok) {
        const data = await res.json();
        setFields(data);
      }
    } catch (err) {
      console.error("Failed to fetch fields", err);
      toast.error("Failed to load fields.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCropMaster = async () => {
    try {
      const res = await fetch("/api/crop-master");
      if (res.ok) {
        const data = await res.json();
        setCropMaster(data);
      }
    } catch (err) {
      console.error("Failed to fetch crop master", err);
    }
  };

  const resetForm = () => {
    setWizardStep(1);
    setFieldName("");
    setFieldArea("");
    setFieldAreaUnit("Acre");
    setVillage("");
    setTaluka("");
    setDistrict("");
    setStateName("");
    setLatitude(null);
    setLongitude(null);
    setSoilType("Black Soil");
    setHasSoilTest(false);
    setPh("");
    setNitrogen("");
    setPhosphorus("");
    setPotassium("");
    setOrganicCarbon("");
    setIrrigationMethod("Drip");
    setWaterSource("Borewell");
    setIrrigationFrequency("Every 2–3 days");
    setPreviousCrop("Wheat");
    setCropName("Cotton");
    setVariety("Bt Cotton");
    setCustomVariety("");
    setSowingDate(new Date().toISOString().split("T")[0]);
    setCultivatedArea("");
    setCultivatedAreaUnit("Acre");
    setCultivationMethod("Direct Sowing");
    setCropNotes("");
    setFormError("");
  };

  // Geolocation Handler
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        // Attempt reverse geocoding fallback
        try {
          const res = await fetch(`/api/location/reverse?lat=${lat}&lon=${lng}`);
          if (res.ok) {
            const data = await res.json();
            if (data.district) setDistrict(data.district);
            if (data.state) setStateName(data.state);
            if (data.village) setVillage(data.village);
          }
        } catch {}

        setIsLocating(false);
        toast.success(t("locationDetected") || "Location detected!");
      },
      (err) => {
        setIsLocating(false);
        toast.error("Could not detect location. Please enter manually.");
      },
      { timeout: 10000 }
    );
  };

  // Step Nav Validation
  const handleNextStep = () => {
    setFormError("");
    if (wizardStep === 1) {
      if (!fieldName.trim()) {
        setFormError("Please enter a field name.");
        return;
      }
      if (!fieldArea || Number(fieldArea) <= 0) {
        setFormError("Please enter a valid field area greater than 0.");
        return;
      }
      setWizardStep(2);
    } else if (wizardStep === 2) {
      setWizardStep(3);
    } else if (wizardStep === 3) {
      if (!cropName.trim()) {
        setFormError("Please select a crop.");
        return;
      }
      if (!sowingDate) {
        setFormError("Please select a valid sowing date.");
        return;
      }
      const cArea = Number(cultivatedArea || fieldArea);
      const fArea = Number(fieldArea);
      if (cArea <= 0) {
        setFormError("Crop area must be greater than 0.");
        return;
      }
      if (cArea > fArea) {
        setFormError(`Crop area (${cArea}) cannot exceed total field area (${fArea}).`);
        return;
      }
      setWizardStep(4);
    }
  };

  // Save Field + Crop
  const handleSaveFieldAndCrop = async () => {
    setFormError("");
    try {
      // 1. Create Field
      const fieldPayload = {
        name: fieldName,
        area: Number(fieldArea),
        areaUnit: fieldAreaUnit,
        location: {
          village,
          taluka,
          district,
          state: stateName,
          latitude,
          longitude,
        },
        soil: {
          type: soilType,
          soilTestAvailable: hasSoilTest,
          pH: pH ? Number(pH) : null,
          nitrogen: nitrogen ? Number(nitrogen) : null,
          phosphorus: phosphorus ? Number(phosphorus) : null,
          potassium: potassium ? Number(potassium) : null,
          organicCarbon: organicCarbon ? Number(organicCarbon) : null,
        },
        irrigation: {
          method: irrigationMethod,
          waterSource,
          frequency: irrigationFrequency,
        },
        previousCrop,
      };

      const fieldRes = await fetch("/api/fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fieldPayload),
      });

      if (!fieldRes.ok) {
        const errData = await fieldRes.json();
        throw new Error(errData.error || "Failed to create field");
      }

      const createdField = await fieldRes.json();

      // 2. Create Crop inside field
      const selectedVar = variety === "Other" ? customVariety : variety;
      const cropPayload = {
        cropName,
        variety: selectedVar,
        sowingDate,
        cultivatedArea: Number(cultivatedArea || fieldArea),
        cultivatedAreaUnit,
        cultivationMethod,
        notes: cropNotes,
      };

      const cropRes = await fetch(`/api/fields/${createdField._id}/crops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cropPayload),
      });

      if (!cropRes.ok) {
        const errData = await cropRes.json();
        throw new Error(errData.error || "Failed to register crop");
      }

      toast.success("Field and crop registered successfully!");
      setIsWizardOpen(false);
      resetForm();
      fetchFields();
    } catch (err: any) {
      setFormError(err.message);
      toast.error(err.message);
    }
  };

  // Add Crop to Existing Field Handler
  const handleAddCropToField = async () => {
    if (!selectedFieldForCrop) return;
    setFormError("");

    if (!cropName.trim()) {
      setFormError("Please select a crop name.");
      return;
    }
    const cArea = Number(cultivatedArea);
    if (!cArea || cArea <= 0) {
      setFormError("Cultivated area must be greater than 0.");
      return;
    }
    if (cArea > selectedFieldForCrop.area) {
      setFormError(`Crop area (${cArea}) cannot exceed field area (${selectedFieldForCrop.area}).`);
      return;
    }

    try {
      const selectedVar = variety === "Other" ? customVariety : variety;
      const payload = {
        cropName,
        variety: selectedVar,
        sowingDate,
        cultivatedArea: cArea,
        cultivatedAreaUnit,
        cultivationMethod,
        notes: cropNotes,
      };

      const res = await fetch(`/api/fields/${selectedFieldForCrop._id}/crops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add crop");
      }

      toast.success(`Crop added to ${selectedFieldForCrop.name}!`);
      setIsAddCropModalOpen(false);
      setSelectedFieldForCrop(null);
      resetForm();
      fetchFields();
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  // Delete Field Handler
  const handleDeleteField = async (fieldId: string) => {
    if (!confirm("Are you sure you want to delete this field and all its registered crops?")) return;
    try {
      const res = await fetch(`/api/fields/${fieldId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Field deleted successfully.");
        fetchFields();
      } else {
        toast.error("Failed to delete field.");
      }
    } catch {
      toast.error("Error deleting field.");
    }
  };

  // Delete Crop Handler
  const handleDeleteCrop = async (cropId: string) => {
    if (!confirm("Are you sure you want to delete this crop entry?")) return;
    try {
      const res = await fetch(`/api/crops/${cropId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Crop deleted.");
        fetchFields();
      } else {
        toast.error("Failed to delete crop.");
      }
    } catch {
      toast.error("Error deleting crop.");
    }
  };

  // Seed Demo Data Handler
  const handleSeedDemoData = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/seed-demo", { method: "POST" });
      if (res.ok) {
        toast.success("Demo fields and crops loaded!");
        fetchFields();
      } else {
        toast.error("Failed to seed demo data.");
      }
    } catch {
      toast.error("Error seeding demo data.");
    } finally {
      setIsSeeding(false);
    }
  };

  // 2Factor SMS Integration Test Handler
  const [isSendingSms, setIsSendingSms] = useState(false);
  const handleSendTestSMS = async () => {
    if (isSendingSms) return;
    setIsSendingSms(true);
    try {
      const res = await fetch("/api/sms/test", { method: "POST" });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || "Test SMS sent successfully.");
      } else {
        toast.error(data.error || "SMS sending failed. Check the server logs.");
      }
    } catch (err: any) {
      console.error("2Factor SMS test exception:", err);
      toast.error(err.message || "SMS sending failed. Check the server logs.");
    } finally {
      setIsSendingSms(false);
    }
  };

  // Selected Varieties for Crop Master Dropdown
  const activeVarieties = cropMaster.find((c) => c.cropName === cropName)?.varieties || [
    "Standard",
    "Hybrid",
    "Local",
    "Other",
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#1B4332] via-[#2E6B3B] to-[#4CAF50] p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#FFCA28] font-bold text-sm tracking-wide uppercase">
            <Sprout className="w-5 h-5" />
            Field & Crop Data Collection
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">{t("title")}</h1>
          <p className="text-emerald-100 max-w-xl text-sm sm:text-base">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => {
              resetForm();
              setIsWizardOpen(true);
            }}
            className="bg-[#FFCA28] hover:bg-[#ffb800] text-[#1B4332] font-bold h-12 px-6 rounded-2xl shadow-lg transition-transform active:scale-95"
          >
            <Plus className="w-5 h-5 mr-1.5" />
            {t("addField")}
          </Button>

          <Button
            onClick={handleSeedDemoData}
            disabled={isSeeding}
            variant="outline"
            className="border-white/30 bg-white/10 hover:bg-white/20 text-white font-bold h-12 px-5 rounded-2xl backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 mr-2 text-[#FFCA28]" />
            {isSeeding ? "Seeding..." : t("seedDemo")}
          </Button>

          <Button
            onClick={handleSendTestSMS}
            disabled={isSendingSms}
            variant="outline"
            className="border-amber-300/40 bg-amber-500/20 hover:bg-amber-500/30 text-white font-bold h-12 px-5 rounded-2xl backdrop-blur-md"
          >
            <MessageSquare className="w-4 h-4 mr-2 text-[#FFCA28]" />
            {isSendingSms ? "Sending SMS..." : "Send Test SMS"}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      ) : fields.length === 0 ? (
        /* Empty State */
        <Card className="border-2 border-dashed border-emerald-200 bg-white/80 backdrop-blur-md rounded-3xl text-center p-8 sm:p-12 shadow-sm">
          <CardContent className="space-y-6 flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-primary shadow-inner">
              <Layers className="w-10 h-10 text-[#2E6B3B]" />
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-2xl font-bold text-[#1B4332]">{t("noFieldsYet")}</h3>
              <p className="text-muted-foreground text-sm">{t("noFieldsDesc")}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button
                onClick={() => {
                  resetForm();
                  setIsWizardOpen(true);
                }}
                className="bg-[#2E6B3B] hover:bg-[#1B4332] text-white font-bold h-12 px-6 rounded-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t("addField")}
              </Button>
              <Button
                onClick={handleSeedDemoData}
                variant="outline"
                className="border-emerald-300 text-emerald-800 font-bold h-12 px-5 rounded-xl"
              >
                <Sparkles className="w-4 h-4 mr-2 text-[#2E6B3B]" />
                {t("seedDemo")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Fields List */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#1B4332] flex items-center gap-2">
              <Layers className="w-6 h-6 text-primary" />
              {t("myFields")} ({fields.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field) => (
              <Card
                key={field._id}
                className="border-none shadow-[0_10px_30px_rgba(0,0,0,0.05)] bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="bg-emerald-50/50 pb-4 border-b border-emerald-100/60">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-[#1B4332] flex items-center gap-2">
                          {field.name}
                        </CardTitle>
                        <CardDescription className="text-sm font-semibold text-emerald-700 mt-1 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-primary" />
                          {[
                            field.location.village,
                            field.location.taluka,
                            field.location.district,
                            field.location.state,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Location not set"}
                        </CardDescription>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs px-3 py-1 font-bold rounded-full">
                        {field.area} {field.areaUnit || "Acres"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-4">
                    {/* Metadata Pill Tags */}
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="bg-emerald-50 text-emerald-900 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                        <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
                        Soil: {field.soil.type || "Loamy"}
                      </span>
                      <span className="bg-blue-50 text-blue-900 px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-blue-600" />
                        Irrigation: {field.irrigation.method || "Drip"}
                      </span>
                      {field.previousCrop && field.previousCrop !== "None" && (
                        <span className="bg-amber-50 text-amber-900 px-3 py-1 rounded-full border border-amber-100 flex items-center gap-1">
                          <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                          Prev: {field.previousCrop}
                        </span>
                      )}
                    </div>

                    {/* Nested Crops Section */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <span>Registered Crops ({field.crops?.length || 0})</span>
                      </div>

                      {!field.crops || field.crops.length === 0 ? (
                        <div className="bg-slate-50 p-4 rounded-2xl text-center text-xs text-muted-foreground border border-slate-100">
                          {t("noCropsInField")}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {field.crops.map((crop) => (
                            <div
                              key={crop._id}
                              className="bg-emerald-50/30 p-3.5 rounded-2xl border border-emerald-100/70 flex items-center justify-between hover:bg-emerald-50/80 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-lg">
                                  🌱
                                </div>
                                <div>
                                  <div className="font-bold text-[#1B4332] text-sm flex items-center gap-2">
                                    {crop.cropName}
                                    {crop.variety && (
                                      <span className="text-xs font-medium text-muted-foreground bg-white px-2 py-0.5 rounded-md border border-gray-200">
                                        {crop.variety}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-emerald-600" />
                                      Sown: {format(new Date(crop.sowingDate), "dd MMM yyyy")}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      {crop.cultivatedArea} {crop.cultivatedAreaUnit}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setViewCropModal(crop)}
                                  className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-white"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDeleteCrop(crop._id)}
                                  className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-white"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="bg-slate-50/80 border-t border-slate-100 p-4 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFieldForCrop(field);
                      setCultivatedArea(field.area.toString());
                      setCultivatedAreaUnit(field.areaUnit);
                      setIsAddCropModalOpen(true);
                    }}
                    className="border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    {t("addCrop")}
                  </Button>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewFieldModal(field)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900"
                    >
                      {t("viewField")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteField(field._id)}
                      className="h-8 w-8 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* MULTI-STEP WIZARD MODAL FOR ADDING FIELD + CROP */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <Sprout className="w-4 h-4 text-primary" />
                Step {wizardStep} of 4
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {wizardStep === 1
                  ? t("step1")
                  : wizardStep === 2
                  ? t("step2")
                  : wizardStep === 3
                  ? t("step3")
                  : t("step4")}
              </span>
            </div>
            <DialogTitle className="text-2xl font-black text-[#1B4332] pt-3">
              {wizardStep === 1
                ? "Register Field Information"
                : wizardStep === 2
                ? "Soil & Irrigation Information"
                : wizardStep === 3
                ? "Add Crop Information"
                : t("reviewTitle")}
            </DialogTitle>
          </DialogHeader>

          {/* Form Content Steps */}
          <div className="space-y-6 py-4">
            {formError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {formError}
              </div>
            )}

            {/* STEP 1: FIELD INFO */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fieldName" className="font-bold text-[#1B4332]">
                    Field Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fieldName"
                    placeholder="e.g. North Field / Village Field"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fieldArea" className="font-bold text-[#1B4332]">
                      Field Area <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fieldArea"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 2.5"
                      value={fieldArea}
                      onChange={(e) => setFieldArea(e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fieldAreaUnit" className="font-bold text-[#1B4332]">
                      Area Unit
                    </Label>
                    <select
                      id="fieldAreaUnit"
                      value={fieldAreaUnit}
                      onChange={(e) => setFieldAreaUnit(e.target.value as any)}
                      className="w-full h-12 px-3 rounded-xl border border-input bg-background font-medium"
                    >
                      <option value="Acre">Acre</option>
                      <option value="Hectare">Hectare</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold text-[#1B4332]">Location Details</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDetectLocation}
                      disabled={isLocating}
                      className="text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50 rounded-xl"
                    >
                      <Compass className="w-3.5 h-3.5 mr-1 text-primary" />
                      {isLocating ? "Detecting..." : t("detectLocation")}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Village"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="h-10 rounded-xl text-sm"
                    />
                    <Input
                      placeholder="Taluka"
                      value={taluka}
                      onChange={(e) => setTaluka(e.target.value)}
                      className="h-10 rounded-xl text-sm"
                    />
                    <Input
                      placeholder="District"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="h-10 rounded-xl text-sm"
                    />
                    <Input
                      placeholder="State"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="h-10 rounded-xl text-sm"
                    />
                  </div>

                  {latitude && longitude && (
                    <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Coordinates Captured: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: SOIL & IRRIGATION */}
            {wizardStep === 2 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-[#1B4332]">Soil Type</Label>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="w-full h-12 px-3 rounded-xl border border-input bg-background font-medium"
                    >
                      <option value="Black Soil">Black Soil</option>
                      <option value="Loamy Soil">Loamy Soil</option>
                      <option value="Sandy Soil">Sandy Soil</option>
                      <option value="Clay Soil">Clay Soil</option>
                      <option value="Alluvial Soil">Alluvial Soil</option>
                      <option value="Other">Other</option>
                      <option value="Don't Know">Don't Know</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-[#1B4332]">Irrigation Method</Label>
                    <select
                      value={irrigationMethod}
                      onChange={(e) => setIrrigationMethod(e.target.value)}
                      className="w-full h-12 px-3 rounded-xl border border-input bg-background font-medium"
                    >
                      <option value="Drip">Drip Irrigation</option>
                      <option value="Sprinkler">Sprinkler Irrigation</option>
                      <option value="Flood">Flood Irrigation</option>
                      <option value="Rainfed">Rainfed</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-[#1B4332]">Water Source</Label>
                    <select
                      value={waterSource}
                      onChange={(e) => setWaterSource(e.target.value)}
                      className="w-full h-12 px-3 rounded-xl border border-input bg-background font-medium"
                    >
                      <option value="Borewell">Borewell</option>
                      <option value="Canal">Canal</option>
                      <option value="River">River</option>
                      <option value="Farm Pond">Farm Pond</option>
                      <option value="Rainwater">Rainwater</option>
                      <option value="Other">Other</option>
                      <option value="Don't Know">Don't Know</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-[#1B4332]">Irrigation Frequency</Label>
                    <select
                      value={irrigationFrequency}
                      onChange={(e) => setIrrigationFrequency(e.target.value)}
                      className="w-full h-12 px-3 rounded-xl border border-input bg-background font-medium"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Every 2–3 days">Every 2–3 days</option>
                      <option value="Weekly">Weekly</option>
                      <option value="As required">As required</option>
                      <option value="Rain-dependent">Rain-dependent</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-[#1B4332]">Previous Crop Grown</Label>
                  <Input
                    placeholder="e.g. Wheat / Mustard / None"
                    value={previousCrop}
                    onChange={(e) => setPreviousCrop(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>

                {/* Optional Soil Test Section */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1B4332]">
                      Do you have a Soil Test Report?
                    </span>
                    <Button
                      type="button"
                      variant={hasSoilTest ? "default" : "outline"}
                      size="sm"
                      onClick={() => setHasSoilTest(!hasSoilTest)}
                      className="rounded-xl text-xs font-bold"
                    >
                      {hasSoilTest ? "Yes (Report Available)" : "No (Skip)"}
                    </Button>
                  </div>

                  {hasSoilTest && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                      <div>
                        <Label className="text-xs font-bold text-muted-foreground">pH Level</Label>
                        <Input
                          placeholder="e.g. 7.2"
                          value={pH}
                          onChange={(e) => setPh(e.target.value)}
                          className="h-10 text-sm rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-bold text-muted-foreground">Nitrogen (N)</Label>
                        <Input
                          placeholder="kg/ha"
                          value={nitrogen}
                          onChange={(e) => setNitrogen(e.target.value)}
                          className="h-10 text-sm rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-bold text-muted-foreground">Phosphorus (P)</Label>
                        <Input
                          placeholder="kg/ha"
                          value={phosphorus}
                          onChange={(e) => setPhosphorus(e.target.value)}
                          className="h-10 text-sm rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-bold text-muted-foreground">Potassium (K)</Label>
                        <Input
                          placeholder="kg/ha"
                          value={potassium}
                          onChange={(e) => setPotassium(e.target.value)}
                          className="h-10 text-sm rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-bold text-muted-foreground">Organic Carbon (%)</Label>
                        <Input
                          placeholder="e.g. 0.65"
                          value={organicCarbon}
                          onChange={(e) => setOrganicCarbon(e.target.value)}
                          className="h-10 text-sm rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: CROP INFO */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-[#1B4332]">
                      Crop Name <span className="text-red-500">*</span>
                    </Label>
                    <select
                      value={cropName}
                      onChange={(e) => {
                        setCropName(e.target.value);
                        setVariety(
                          cropMaster.find((c) => c.cropName === e.target.value)?.varieties[0] ||
                            "Standard"
                        );
                      }}
                      className="w-full h-12 px-3 rounded-xl border border-input bg-background font-medium"
                    >
                      {cropMaster.map((c) => (
                        <option key={c.cropName} value={c.cropName}>
                          {c.cropName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-[#1B4332]">Variety</Label>
                    <select
                      value={variety}
                      onChange={(e) => setVariety(e.target.value)}
                      className="w-full h-12 px-3 rounded-xl border border-input bg-background font-medium"
                    >
                      {activeVarieties.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>

                    {variety === "Other" && (
                      <Input
                        placeholder="Enter variety name"
                        value={customVariety}
                        onChange={(e) => setCustomVariety(e.target.value)}
                        className="h-10 mt-2 rounded-xl"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-[#1B4332]">
                      Sowing / Planting Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={sowingDate}
                      onChange={(e) => setSowingDate(e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-[#1B4332]">Cultivation Method</Label>
                    <select
                      value={cultivationMethod}
                      onChange={(e) => setCultivationMethod(e.target.value)}
                      className="w-full h-12 px-3 rounded-xl border border-input bg-background font-medium"
                    >
                      <option value="Direct Sowing">Direct Sowing</option>
                      <option value="Transplanting">Transplanting</option>
                      <option value="Nursery → Transplanting">Nursery → Transplanting</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-[#1B4332]">
                      Cultivated Area <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder={`Max ${fieldArea || 0}`}
                      value={cultivatedArea}
                      onChange={(e) => setCultivatedArea(e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-[#1B4332]">Area Unit</Label>
                    <select
                      value={cultivatedAreaUnit}
                      onChange={(e) => setCultivatedAreaUnit(e.target.value as any)}
                      className="w-full h-12 px-3 rounded-xl border border-input bg-background font-medium"
                    >
                      <option value="Acre">Acre</option>
                      <option value="Hectare">Hectare</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-[#1B4332]">Additional Notes (Optional)</Label>
                  <Input
                    placeholder="e.g. Planted after first monsoon rain."
                    value={cropNotes}
                    onChange={(e) => setCropNotes(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & SAVE */}
            {wizardStep === 4 && (
              <div className="space-y-4">
                <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                    <div>
                      <h4 className="font-bold text-lg text-[#1B4332]">{fieldName}</h4>
                      <p className="text-xs text-emerald-800 font-semibold">
                        {[village, taluka, district, stateName].filter(Boolean).join(", ") ||
                          "Location details set"}
                      </p>
                    </div>
                    <Badge className="bg-emerald-200 text-emerald-900 font-bold px-3 py-1">
                      {fieldArea} {fieldAreaUnit}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-emerald-950">
                    <div>
                      <span className="text-muted-foreground block">Soil Type</span>
                      <span>{soilType}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Irrigation</span>
                      <span>
                        {irrigationMethod} ({waterSource})
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Crop Name</span>
                      <span className="text-sm font-bold text-[#1B4332]">{cropName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Variety</span>
                      <span>{variety === "Other" ? customVariety : variety}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Sowing Date</span>
                      <span>{sowingDate}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Cultivated Area</span>
                      <span>
                        {cultivatedArea || fieldArea} {cultivatedAreaUnit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    {t("advisoryNotice")} (Data collection phase active).
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex items-center justify-between pt-4 border-t border-gray-100 gap-3">
            {wizardStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setWizardStep(wizardStep - 1)}
                className="h-11 rounded-xl px-5 font-bold"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                {t("back")}
              </Button>
            ) : (
              <div />
            )}

            {wizardStep < 4 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                className="h-11 rounded-xl px-6 bg-[#2E6B3B] hover:bg-[#1B4332] text-white font-bold"
              >
                {t("next")}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSaveFieldAndCrop}
                className="h-11 rounded-xl px-8 bg-[#2E6B3B] hover:bg-[#1B4332] text-white font-bold shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                {t("saveCrop")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: ADD CROP TO EXISTING FIELD */}
      <Dialog open={isAddCropModalOpen} onOpenChange={setIsAddCropModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1B4332]">
              Add Crop to {selectedFieldForCrop?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Field Area: {selectedFieldForCrop?.area} {selectedFieldForCrop?.areaUnit}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {formError && (
              <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl">
                {formError}
              </div>
            )}

            <div className="space-y-2">
              <Label className="font-bold text-xs">Crop Name *</Label>
              <select
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border bg-background text-sm font-medium"
              >
                {cropMaster.map((c) => (
                  <option key={c.cropName} value={c.cropName}>
                    {c.cropName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-xs">Variety</Label>
              <select
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border bg-background text-sm font-medium"
              >
                {activeVarieties.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-xs">Sowing Date *</Label>
              <Input
                type="date"
                value={sowingDate}
                onChange={(e) => setSowingDate(e.target.value)}
                className="h-11 rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-bold text-xs">Cultivated Area *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={cultivatedArea}
                  onChange={(e) => setCultivatedArea(e.target.value)}
                  className="h-11 rounded-xl text-sm"
                />
              </div>
              <div>
                <Label className="font-bold text-xs">Unit</Label>
                <select
                  value={cultivatedAreaUnit}
                  onChange={(e) => setCultivatedAreaUnit(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-xl border bg-background text-sm font-medium"
                >
                  <option value="Acre">Acre</option>
                  <option value="Hectare">Hectare</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleAddCropToField}
              className="w-full h-11 bg-[#2E6B3B] hover:bg-[#1B4332] text-white font-bold rounded-xl"
            >
              {t("saveCrop")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VIEW FIELD DETAIL MODAL */}
      <Dialog open={!!viewFieldModal} onOpenChange={() => setViewFieldModal(null)}>
        {viewFieldModal && (
          <DialogContent className="max-w-lg bg-white rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#1B4332]">
                {viewFieldModal.name}
              </DialogTitle>
              <DialogDescription className="text-xs font-semibold text-emerald-800">
                {[
                  viewFieldModal.location.village,
                  viewFieldModal.location.taluka,
                  viewFieldModal.location.district,
                  viewFieldModal.location.state,
                ]
                  .filter(Boolean)
                  .join(", ") || "Location"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs font-medium py-2">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl">
                <div>
                  <span className="text-muted-foreground block">Total Area</span>
                  <span className="text-sm font-bold">
                    {viewFieldModal.area} {viewFieldModal.areaUnit}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Soil Type</span>
                  <span className="text-sm font-bold">{viewFieldModal.soil.type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Irrigation Method</span>
                  <span className="text-sm font-bold">{viewFieldModal.irrigation.method}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Water Source</span>
                  <span className="text-sm font-bold">{viewFieldModal.irrigation.waterSource}</span>
                </div>
              </div>

              {viewFieldModal.soil.soilTestAvailable && (
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <span className="font-bold text-emerald-900 block mb-1">
                    Soil Test Data Available
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-emerald-950">
                    <span>pH: {viewFieldModal.soil.pH || "N/A"}</span>
                    <span>N: {viewFieldModal.soil.nitrogen || "N/A"}</span>
                    <span>P: {viewFieldModal.soil.phosphorus || "N/A"}</span>
                    <span>K: {viewFieldModal.soil.potassium || "N/A"}</span>
                    <span>OC: {viewFieldModal.soil.organicCarbon || "N/A"}%</span>
                  </div>
                </div>
              )}

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{t("advisoryNotice")}</span>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* VIEW CROP DETAIL MODAL */}
      <Dialog open={!!viewCropModal} onOpenChange={() => setViewCropModal(null)}>
        {viewCropModal && (
          <DialogContent className="max-w-md bg-white rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-[#1B4332] flex items-center gap-2">
                🌱 {viewCropModal.cropName}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Registered on {format(new Date(viewCropModal.createdAt), "dd MMM yyyy")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <div>
                  <span className="text-muted-foreground block">Variety</span>
                  <span className="text-sm font-bold text-emerald-900">
                    {viewCropModal.variety || "Standard"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Cultivated Area</span>
                  <span className="text-sm font-bold text-emerald-900">
                    {viewCropModal.cultivatedArea} {viewCropModal.cultivatedAreaUnit}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Sowing Date</span>
                  <span className="text-sm font-bold text-emerald-900">
                    {format(new Date(viewCropModal.sowingDate), "dd MMM yyyy")}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Cultivation Method</span>
                  <span className="text-sm font-bold text-emerald-900">
                    {viewCropModal.cultivationMethod || "Direct Sowing"}
                  </span>
                </div>
              </div>

              {viewCropModal.notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-muted-foreground block text-xs">Notes:</span>
                  <span className="text-slate-800">{viewCropModal.notes}</span>
                </div>
              )}

              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-sm">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Upcoming Advisory Engine
                </div>
                <p className="text-xs font-normal">
                  {t("advisoryNotice")}
                </p>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
