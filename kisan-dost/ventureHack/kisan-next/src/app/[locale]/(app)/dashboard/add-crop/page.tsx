"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Tractor, Sprout, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddCropPage() {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    cropType: "",
    plantationDate: "",
    landArea: "",
    location: "",
    phoneNumber: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/farmer-crops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to register crop");
      }

      toast.success("Crop successfully registered for SMS Advisory!");
      router.push("/dashboard/my-crops");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while registering your crop. Please try again.");
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
          Register your crop to receive automated SMS alerts for pesticide and fertilizer schedules.
        </p>
      </div>

      <Card className="border-t-4 border-emerald-500 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl inline-flex items-center">
             <Sprout className="w-5 h-5 mr-2 text-emerald-500"/>
             Crop Details
          </CardTitle>
          <CardDescription>
            Enter the details of your plantation to start tracking the lifecycle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cropType">Crop Type</Label>
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
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plantationDate">Plantation Date</Label>
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
                <Label htmlFor="landArea">Land Area (Acres)</Label>
                <Input
                  id="landArea"
                  type="number"
                  placeholder="e.g. 5.5"
                  step="0.1"
                  min="0.1"
                  value={formData.landArea}
                  onChange={(e) => setFormData({ ...formData, landArea: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Farm Location</Label>
                <Input
                  id="location"
                  placeholder="e.g. Surat, Gujarat"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number (For SMS Alerts)</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+91 9876543210"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground mt-1 text-center sm:text-left">
                We'll send daily pesticide application reminders to this number.
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> saving crop profile...
                </>
              ) : (
                "Enroll for Smart Advisory"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
