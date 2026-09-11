"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, Zap, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";
import districtsData from "@/data/districts-dataset.json";

type DistrictData = {
  district: string;
  season: string;
  water_availability: string;
  crops: string[];
  reason: string;
};

const GUJARATI_DISTRICTS = districtsData.map((d: DistrictData) => d.district);

export function DistrictMap() {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [districtInfo, setDistrictInfo] = useState<DistrictData | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getDistrictData = (district: string): DistrictData | undefined => {
    return (districtsData as DistrictData[]).find(
      (d: DistrictData) => d.district.toLowerCase() === district.toLowerCase()
    );
  };

  const getGeminiSuggestion = async (district: string) => {
    setLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      // Get local district data first
      const localData = getDistrictData(district);
      if (localData) {
        setDistrictInfo(localData);
      }

      // Call the Gemini API through your backend
      const response = await fetch("/api/gemini/district-suggestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          district: district,
          season: localData?.season || "Kharif",
          waterAvailability: localData?.water_availability,
          recommendedCrops: localData?.crops,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get suggestion");
      }

      const data = await response.json();
      setSuggestion(data.advisory);
    } catch (err: any) {
      setError(err.message || "Failed to get AI suggestion. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDistrictSelect = async (district: string) => {
    setSelectedDistrict(district);
    await getGeminiSuggestion(district);
  };

  return (
    <div className="space-y-8">
      {/* Districts Grid */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#2e6b3b]" /> Select Your District
          </CardTitle>
          <CardDescription>
            Choose your district to get personalized farming suggestions and crop recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {GUJARATI_DISTRICTS.map((district) => (
              <button
                key={district}
                onClick={() => handleDistrictSelect(district)}
                disabled={loading && selectedDistrict !== district}
                className={cn(
                  "p-4 rounded-lg border-2 font-semibold transition-all duration-300 text-sm",
                  "hover:shadow-md disabled:opacity-50",
                  selectedDistrict === district
                    ? "bg-[#2e6b3b] text-white border-[#2e6b3b] shadow-lg"
                    : "bg-white border-slate-200 text-slate-900 hover:border-[#8bc34a]"
                )}
              >
                {loading && selectedDistrict === district ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  district
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      {suggestion && districtInfo && (
        <div className="grid md:grid-cols-2 gap-6 animate-in fade-in">
          <Card className="border-border shadow-sm bg-gradient-to-br from-[#8bc34a]/5 to-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#8bc34a]" /> AI Advisory for {districtInfo.district}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-[#2e6b3b] mb-2">Gemini AI Suggestions</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{suggestion}</p>
              </div>

              <div>
                <h3 className="font-bold text-sm text-[#2e6b3b] mb-2">Recommended Crops</h3>
                <div className="flex flex-wrap gap-2">
                  {districtInfo.crops.map((crop) => (
                    <span
                      key={crop}
                      className="px-3 py-1 rounded-full bg-[#8bc34a]/20 text-[#2e6b3b] text-xs font-semibold"
                    >
                      {crop}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <p className="text-xs text-muted-foreground italic">{districtInfo.reason}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">District Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-600 font-semibold mb-1">Season</p>
                <p className="text-lg font-bold text-blue-900">{districtInfo.season}</p>
              </div>

              <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                <p className="text-xs text-orange-600 font-semibold mb-1 flex items-center gap-1">
                  <Droplets className="w-3 h-3" /> Water Availability
                </p>
                <p className="text-lg font-bold text-orange-900">{districtInfo.water_availability}</p>
              </div>

              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-xs text-green-600 font-semibold mb-1">District</p>
                <p className="text-sm font-semibold text-green-900">{districtInfo.district}</p>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedDistrict(null);
                  setDistrictInfo(null);
                  setSuggestion(null);
                }}
              >
                Select Different District
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading && !suggestion && (
        <Card className="border-border shadow-sm">
          <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-[#2e6b3b] animate-spin" />
            <p className="text-muted-foreground">Getting AI suggestions for {selectedDistrict}...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
