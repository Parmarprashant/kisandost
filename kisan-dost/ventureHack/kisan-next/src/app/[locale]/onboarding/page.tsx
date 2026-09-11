"use client";

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from "@/i18n/routing";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { saveOnboardingData, checkUserExists } from "./actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const { isLoading, user } = useAuth();
  const isLoaded = !isLoading;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    mobile: "",
    village: "",
    district: "",
    mainCrop: "Wheat"
  });

  useEffect(() => {
    async function verifyUser() {
      if (isLoaded && user) {
        const exists = await checkUserExists(user.id);
        if (exists) {
          router.push("/");
        } else {
          setLoading(false);
        }
      } else if (isLoaded && !user) {
        router.push("/auth");
      }
    }
    verifyUser();
  }, [isLoaded, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mobile) {
      toast.error("Mobile number is required");
      return;
    }
    setSaving(true);
    try {
      if (!user) return;
      await saveOnboardingData({
        userId: user.id,
        name: user.name || "Farmer",
        ...formData
      });
      toast.success("Profile saved!");
      router.push("/");
    } catch (e) {
      toast.error("Error saving profile");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Complete Your Profile</CardTitle>
          <CardDescription>We need a few details to customize your experience.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={user?.name || ""} disabled className="bg-muted" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input 
                id="mobile" 
                placeholder="e.g. 9876543210" 
                value={formData.mobile}
                onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                required
                className="text-lg"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="village">Village</Label>
                <Input 
                  id="village" 
                  value={formData.village}
                  onChange={(e) => setFormData({...formData, village: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input 
                  id="district" 
                  placeholder="e.g. Ahmedabad"
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="crop">Main Crop</Label>
              <Select value={formData.mainCrop} onValueChange={(val) => setFormData({...formData, mainCrop: val || ""})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Crop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Wheat">Wheat</SelectItem>
                  <SelectItem value="Cotton">Cotton</SelectItem>
                  <SelectItem value="Sugarcane">Sugarcane</SelectItem>
                  <SelectItem value="Groundnut">Groundnut</SelectItem>
                  <SelectItem value="Rice">Rice</SelectItem>
                  <SelectItem value="Mango">Mango</SelectItem>
                  <SelectItem value="Banana">Banana</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit" className="w-full h-12 text-lg mt-4" disabled={saving}>
              {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {saving ? "Saving..." : "Start Farming"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
