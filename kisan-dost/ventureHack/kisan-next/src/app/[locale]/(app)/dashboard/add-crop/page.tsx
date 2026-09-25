"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Tractor, Sprout, Loader2, MapPin } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface FieldSummary {
  _id: string;
  name: string;
  area: number;
  areaUnit: string;
  location?: {
    village?: string;
    district?: string;
  };
}

export default function AddCropPage() {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<FieldSummary[]>([]);
  const [loadingFields, setLoadingFields] = useState(true);

  const [formData, setFormData] = useState({
    fieldId: searchParams.get("fieldId") || "",
    cropType: "",
    variety: "",
    plantationDate: new Date().toISOString().split("T")[0],
    landArea: "",
    location: "",
    phoneNumber: "",
  });

  useEffect(() => {
    async function fetchFields() {
      try {
        const res = await fetch("/api/fields");
        if (res.ok) {
          const data: FieldSummary[] = await res.json();
          setFields(data);
          const paramFieldId = searchParams.get("fieldId");
          const targetField = paramFieldId
            ? data.find((f) => f._id === paramFieldId)
            : data[0];

          if (targetField) {
            setFormData((prev) => ({
              ...prev,
              fieldId: targetField._id,
              landArea: prev.landArea || String(targetField.area),
              location:
                prev.location ||
                [targetField.location?.village, targetField.location?.district]
                  .filter(Boolean)
                  .join(", ") ||
                "",
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load fields in AddCropPage:", err);
      } finally {
        setLoadingFields(false);
      }
    }
    fetchFields();
  }, [searchParams]);

  const handleFieldChange = (fieldId: string | null) => {
    if (!fieldId) return;
    const selected = fields.find((f) => f._id === fieldId);
    setFormData((prev) => ({
      ...prev,
      fieldId,
      landArea: selected ? String(selected.area) : prev.landArea,
      location: selected
        ? [selected.location?.village, selected.location?.district]
            .filter(Boolean)
            .join(", ")
        : prev.location,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cropType) {
      toast.error("Please select a crop type");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("/api/farmer-crops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "Failed to register crop");
      }

      toast.success("Crop successfully registered and planted on field!");
      router.push("/dashboard/my-crops");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred while registering your crop.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary flex items-center justify-center">
          <Tractor className="w-8 h-8 md:w-10 md:h-10 text-emerald-600 mr-2" />
          Add New Crop
        </h1>
        <p className="text-muted-foreground">
          Register your crop to enable precision lifecycle monitoring, spatial scouting, and SMS alerts.
        </p>
      </div>

      <Card className="border-t-4 border-emerald-500 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl inline-flex items-center">
            <Sprout className="w-5 h-5 mr-2 text-emerald-500" />
            Crop & Field Details
          </CardTitle>
          <CardDescription>
            Link your crop to a farm field to track growth stages and thermal time (GDD).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Target Field Selector */}
            {fields.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="fieldSelect">Select Farm Field</Label>
                <Select
                  value={formData.fieldId}
                  onValueChange={handleFieldChange}
                >
                  <SelectTrigger id="fieldSelect">
                    <SelectValue placeholder="Choose a field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((f) => (
                      <SelectItem key={f._id} value={f._id}>
                        {f.name} ({f.area} {f.areaUnit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  The crop will be planted in this field and appear on its spatial monitoring board.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cropType">Crop Type *</Label>
                <Select
                  value={formData.cropType}
                  onValueChange={(val) => setFormData({ ...formData, cropType: val || "" })}
                  required
                >
                  <SelectTrigger id="cropType">
                    <SelectValue placeholder="Select a crop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cotton">Cotton</SelectItem>
                    <SelectItem value="wheat">Wheat</SelectItem>
                    <SelectItem value="rice">Rice / Paddy</SelectItem>
                    <SelectItem value="sugarcane">Sugarcane</SelectItem>
                    <SelectItem value="soybean">Soybean</SelectItem>
                    <SelectItem value="maize">Maize / Corn</SelectItem>
                    <SelectItem value="tomato">Tomato</SelectItem>
                    <SelectItem value="potato">Potato</SelectItem>
                    <SelectItem value="onion">Onion</SelectItem>
                    <SelectItem value="groundnut">Groundnut</SelectItem>
                    <SelectItem value="chickpea">Chickpea / Chana</SelectItem>
                    <SelectItem value="mustard">Mustard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="variety">Cultivar / Variety</Label>
                <Input
                  id="variety"
                  placeholder="e.g. BT Cotton, HD-2967, Lok 1"
                  value={formData.variety}
                  onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plantationDate">Plantation / Sowing Date *</Label>
                <Input
                  id="plantationDate"
                  type="date"
                  value={formData.plantationDate || ""}
                  onChange={(e) => setFormData({ ...formData, plantationDate: e.target.value })}
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="landArea">Cultivated Area (Acres) *</Label>
                <Input
                  id="landArea"
                  type="number"
                  placeholder="e.g. 5.5"
                  step="0.01"
                  min="0.01"
                  value={formData.landArea}
                  onChange={(e) => setFormData({ ...formData, landArea: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Farm Location</Label>
                <Input
                  id="location"
                  placeholder="e.g. Surat, Gujarat"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number (For SMS Alerts)</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving crop profile...
                </>
              ) : (
                "Enroll Crop & Plant in Field"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
