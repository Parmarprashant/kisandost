"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Zap, Droplets } from "lucide-react";
import districtsData from "@/data/districts-dataset.json";
import { Button } from "@/components/ui/button";

// Fix Leaflet marker icon issue in Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type DistrictData = {
  district: string;
  season: string;
  water_availability: string;
  crops: string[];
  reason: string;
};

// Component to handle map clicks
function MapEvents({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function AIMapComponent() {
  const t = useTranslations("CropSuggestion");
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [districtInfo, setDistrictInfo] = useState<DistrictData | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);

  const getDistrictData = (districtName: string): DistrictData | undefined => {
    if (!districtName) return undefined;
    
    // First: Exact match (case insensitive)
    let bestMatch = (districtsData as DistrictData[]).find(
      (d: DistrictData) => 
        d.district.toLowerCase() === districtName.toLowerCase() ||
        districtName.toLowerCase().includes(d.district.toLowerCase())
    );
    
    return bestMatch;
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    setLoading(true);
    setError(null);
    setSuggestion(null);
    setDistrictInfo(null);
    setLocationName(null);

    try {
      // Reverse geocoding using Weather API
      const res = await fetch(`/api/weather?q=${lat},${lng}`);
      if (!res.ok) throw new Error("Failed to get location details from weather API. Please try again.");

      const data = await res.json();
      const location = data.location;

      if (!location) throw new Error("Could not parse location from weather data");

      // Attempt to extract district name from name or region
      let townName = location.name || "";
      let regionName = location.region || "";
      
      // Clean names
      townName = townName.replace(/ district/i, "").trim();
      regionName = regionName.replace(/ district/i, "").trim();

      setLocationName(townName || regionName || "Unknown Location");

      // Try matching the town name first, then the region name
      let localData = getDistrictData(townName) || getDistrictData(regionName);

      if (!localData) {
        throw new Error(
          `We couldn't find agricultural data for ${
            townName || "this location"
          }. Please select a district within Gujarat.`
        );
      }

      setDistrictInfo(localData);

      // Call Gemini API
      const aiRes = await fetch("/api/gemini/district-suggestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          district: localData.district,
          season: localData.season,
          waterAvailability: localData.water_availability,
          recommendedCrops: localData.crops,
        }),
      });

      if (!aiRes.ok) {
        throw new Error("Failed to get AI suggestion");
      }

      const aiData = await aiRes.json();
      setSuggestion(aiData.advisory);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="border-border shadow-sm h-fit">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#2e6b3b]" /> {t("selectLocationTitle")}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {t("selectLocationDesc")}
          </p>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[500px] rounded-lg overflow-hidden border border-slate-200">
            <MapContainer
              center={[22.2587, 71.1924]} // Center of Gujarat
              zoom={7}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapEvents onLocationSelect={handleLocationSelect} />
              {position && (
                <Marker position={position} icon={customIcon}>
                  <Popup>{t("selectedLocation")}</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {loading && (
          <Card className="border-border shadow-sm h-full flex items-center justify-center min-h-[300px]">
            <CardContent className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-[#2e6b3b] animate-spin" />
              <p className="text-muted-foreground font-medium">
                {t("analyzing")}
              </p>
            </CardContent>
          </Card>
        )}

        {error && !loading && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </CardContent>
          </Card>
        )}

        {!loading && !suggestion && !error && (
          <Card className="border-border shadow-sm h-full flex flex-col items-center justify-center min-h-[300px] p-10 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
              <Zap className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-400">{t("awaitingLocation")}</h3>
            <p className="text-slate-400 font-medium">
              {t("awaitingLocationDesc")}
            </p>
          </Card>
        )}

        {suggestion && districtInfo && !loading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
            <Card className="border-border shadow-sm bg-gradient-to-br from-[#8bc34a]/5 to-white border-[#8bc34a]/30">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Zap className="w-6 h-6 text-[#8bc34a]" /> {t("aiAdvisory", { district: districtInfo.district })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-[#2e6b3b] mb-3">{t("geminiInsight")}</h3>
                  <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      {suggestion}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[#2e6b3b] mb-3">{t("bestCrops")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {districtInfo.crops.map((crop) => (
                      <span
                        key={crop}
                        className="px-4 py-1.5 rounded-full bg-[#2e6b3b] text-white text-xs font-bold tracking-wide shadow-md"
                      >
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm text-muted-foreground italic font-medium">
                    &quot;{districtInfo.reason}&quot;
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="border-blue-100 bg-blue-50/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Water Level</p>
                    <p className="text-lg font-black text-blue-900">{districtInfo.water_availability}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-100 bg-orange-50/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">Season</p>
                    <p className="text-lg font-black text-orange-900">{districtInfo.season}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
