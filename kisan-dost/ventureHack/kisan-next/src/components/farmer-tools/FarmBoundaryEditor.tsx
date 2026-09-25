"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Polyline,
  CircleMarker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  MapPin,
  Pencil,
  Check,
  RotateCcw,
  Layers,
  Crosshair,
  Compass,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { GeoPolygon } from "@/lib/geoUtils";

// Fix Leaflet marker icons in Next.js
const defaultMarkerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const gpsPinIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Distinct colors for up to 6 monitoring zones
const ZONE_COLORS = [
  { stroke: "#2563eb", fill: "#3b82f6" }, // Blue
  { stroke: "#059669", fill: "#10b981" }, // Emerald
  { stroke: "#d97706", fill: "#f59e0b" }, // Amber
  { stroke: "#7c3aed", fill: "#8b5cf6" }, // Purple
  { stroke: "#dc2626", fill: "#ef4444" }, // Red
  { stroke: "#0891b2", fill: "#06b6d4" }, // Cyan
];

interface ZoneItem {
  _id: string;
  zoneCode: string;
  zoneName: string;
  area?: number;
  areaUnit?: string;
  polygon?: GeoPolygon;
}

interface FarmBoundaryEditorProps {
  fieldId: string;
  fieldName: string;
  initialCenter?: [number, number];
  initialArea?: number;
  areaUnit?: string;
  onBoundarySaved?: (boundary: GeoPolygon, area: number) => void;
}

// Map Click Handler for drawing vertices
function BoundaryDrawHandler({
  isDrawing,
  onAddPoint,
}: {
  isDrawing: boolean;
  onAddPoint: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (isDrawing) {
        onAddPoint(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Centering Controller
function CenterController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, map.getZoom() || 16);
    }
  }, [center, map]);
  return null;
}

export function FarmBoundaryEditor({
  fieldId,
  fieldName,
  initialCenter = [23.2156, 72.6369],
  initialArea,
  areaUnit = "Acre",
  onBoundarySaved,
}: FarmBoundaryEditorProps) {
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingZones, setGeneratingZones] = useState(false);
  const [resolvingPoint, setResolvingPoint] = useState(false);

  // Field boundary data
  const [savedBoundary, setSavedBoundary] = useState<GeoPolygon | null>(null);
  const [calculatedArea, setCalculatedArea] = useState<number | null>(null);

  // Drawing state: Array of [lat, lng]
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);

  // Monitoring zones
  const [zones, setZones] = useState<ZoneItem[]>([]);

  // GPS Point testing
  const [testPoint, setTestPoint] = useState<[number, number] | null>(null);
  const [pointResolution, setPointResolution] = useState<{
    insideFarm: boolean;
    matchedZone: { zoneId: string; zoneCode: string; zoneName: string } | null;
    message: string;
  } | null>(null);

  // Centroid
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter);

  // Fetch field boundary and zones on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // 1. Fetch Boundary
        const bRes = await fetch(`/api/fields/${fieldId}/boundary`);
        if (bRes.ok) {
          const bData = await bRes.json();
          if (bData.hasBoundary && bData.boundary) {
            setSavedBoundary(bData.boundary);
            setCalculatedArea(bData.calculatedArea);

            // Compute center of saved polygon for map
            const ring = bData.boundary.coordinates[0];
            if (ring && ring.length > 0) {
              const avgLng = ring.reduce((s: number, p: number[]) => s + p[0], 0) / ring.length;
              const avgLat = ring.reduce((s: number, p: number[]) => s + p[1], 0) / ring.length;
              setMapCenter([avgLat, avgLng]);
            }
          } else if (bData.location?.latitude && bData.location?.longitude) {
            setMapCenter([bData.location.latitude, bData.location.longitude]);
          }
        }

        // 2. Fetch Zones
        const zRes = await fetch(`/api/fields/${fieldId}/zones`);
        if (zRes.ok) {
          const zData = await zRes.json();
          setZones(zData.zones || []);
        }
      } catch (err) {
        console.error("Error loading boundary/zone data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (fieldId) {
      loadData();
    }
  }, [fieldId]);

  // Handle adding point while drawing
  const handleAddPoint = (lat: number, lng: number) => {
    setDrawingPoints((prev) => [...prev, [lat, lng]]);
  };

  // Start Drawing
  const handleStartDrawing = () => {
    setIsDrawing(true);
    setDrawingPoints([]);
    setPointResolution(null);
  };

  // Undo Last Point
  const handleUndoPoint = () => {
    setDrawingPoints((prev) => prev.slice(0, -1));
  };

  // Clear / Cancel Drawing
  const handleCancelDrawing = () => {
    setIsDrawing(false);
    setDrawingPoints([]);
  };

  // Save Confirmed Boundary
  const handleSaveBoundary = async () => {
    if (drawingPoints.length < 3) {
      toast.error("Please add at least 3 points on the map to define a valid boundary polygon.");
      return;
    }

    // Convert [lat, lng] array to GeoJSON ring [[lng, lat], ...]
    const geoRing: number[][] = drawingPoints.map(([lat, lng]) => [lng, lat]);
    // Close the ring
    geoRing.push([geoRing[0][0], geoRing[0][1]]);

    const newPolygon: GeoPolygon = {
      type: "Polygon",
      coordinates: [geoRing],
    };

    setSaving(true);
    try {
      const res = await fetch(`/api/fields/${fieldId}/boundary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boundary: newPolygon, updateFieldArea: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save boundary");
      }

      setSavedBoundary(data.boundary);
      setCalculatedArea(data.calculatedArea);
      setIsDrawing(false);
      setDrawingPoints([]);

      toast.success("Farm boundary saved successfully!");
      if (onBoundarySaved) {
        onBoundarySaved(data.boundary, data.calculatedArea);
      }

      // If zones need regeneration
      if (data.zonesRequireRegeneration) {
        toast.info("Existing monitoring zones must be regenerated to match the new boundary.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save farm boundary");
    } finally {
      setSaving(false);
    }
  };

  // Generate / Regenerate Monitoring Zones
  const handleGenerateZones = async () => {
    if (!savedBoundary) {
      toast.error("Please save a farm boundary polygon first.");
      return;
    }

    setGeneratingZones(true);
    try {
      const res = await fetch(`/api/fields/${fieldId}/zones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerate: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate monitoring zones");
      }

      setZones(data.zones || []);
      toast.success(data.message || "Monitoring zones generated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to generate monitoring zones");
    } finally {
      setGeneratingZones(false);
    }
  };

  // Test GPS Coordinate Resolution
  const handleTestGpsCoordinate = async (lat: number, lng: number) => {
    setResolvingPoint(true);
    setTestPoint([lat, lng]);
    setPointResolution(null);

    try {
      const res = await fetch(`/api/fields/${fieldId}/resolve-point`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to resolve GPS coordinate");
      }

      setPointResolution({
        insideFarm: data.insideFarm,
        matchedZone: data.matchedZone,
        message: data.message,
      });

      if (data.insideFarm && data.matchedZone) {
        toast.success(`Coordinate matched to Zone ${data.matchedZone.zoneCode}`);
      } else if (data.insideFarm) {
        toast.info("Coordinate is inside farm boundary.");
      } else {
        toast.warning("Coordinate is outside farm boundary.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error resolving GPS coordinate");
    } finally {
      setResolvingPoint(false);
    }
  };

  // Use Device GPS
  const handleUseDeviceGps = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    toast.info("Acquiring GPS location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCenter([latitude, longitude]);
        handleTestGpsCoordinate(latitude, longitude);
      },
      (err) => {
        toast.error(`GPS Error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Convert saved GeoPolygon to Leaflet [lat, lng][] format
  const savedPolygonLatLngs = useMemo<[number, number][]>(() => {
    if (!savedBoundary || !savedBoundary.coordinates || !savedBoundary.coordinates[0]) {
      return [];
    }
    return savedBoundary.coordinates[0].map(([lng, lat]) => [lat, lng]);
  }, [savedBoundary]);

  // Convert zone polygons to Leaflet format
  const zonePolygons = useMemo(() => {
    return zones.map((z, idx) => {
      const color = ZONE_COLORS[idx % ZONE_COLORS.length];
      const ring = z.polygon?.coordinates?.[0] || [];
      const latlngs: [number, number][] = ring.map(([lng, lat]) => [lat, lng]);
      return {
        ...z,
        color,
        latlngs,
      };
    });
  }, [zones]);

  if (loading) {
    return (
      <Card className="p-8 flex flex-col items-center justify-center min-h-[350px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
        <p className="text-sm text-muted-foreground">Loading farm boundary spatial data...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Toolbar Card */}
      <Card className="border-t-4 border-emerald-500 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-600" />
                {fieldName} — Boundary & Monitoring Zones
              </CardTitle>
              <CardDescription>
                Define plot boundaries and create spatial monitoring micro-zones for precision disease scouting.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {savedBoundary ? (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs py-1">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Boundary Configured ({calculatedArea || initialArea} {areaUnit})
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs py-1">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" /> No Boundary Defined
                </Badge>
              )}
              {zones.length > 0 && (
                <Badge variant="secondary" className="text-xs py-1">
                  <Layers className="w-3.5 h-3.5 mr-1" /> {zones.length} Zones
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Action Button Row */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t">
            {!isDrawing ? (
              <>
                <Button
                  onClick={handleStartDrawing}
                  variant={savedBoundary ? "outline" : "default"}
                  size="sm"
                  className={!savedBoundary ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                >
                  <Pencil className="w-4 h-4 mr-1.5" />
                  {savedBoundary ? "Redraw Boundary" : "Draw Boundary"}
                </Button>

                {savedBoundary && (
                  <Button
                    onClick={handleGenerateZones}
                    disabled={generatingZones}
                    variant="outline"
                    size="sm"
                    className="border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                  >
                    {generatingZones ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                      <Layers className="w-4 h-4 mr-1.5 text-emerald-600" />
                    )}
                    {zones.length > 0 ? "Regenerate Zones" : "Generate Monitoring Zones"}
                  </Button>
                )}

                <Button
                  onClick={handleUseDeviceGps}
                  disabled={resolvingPoint}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  <Crosshair className="w-3.5 h-3.5 mr-1 text-blue-600" />
                  Test GPS At My Location
                </Button>
              </>
            ) : (
              <>
                <Badge variant="default" className="bg-amber-600 text-white py-1 px-3 animate-pulse">
                  Drawing Mode: Click on map to place polygon vertices ({drawingPoints.length} points)
                </Badge>

                <Button
                  onClick={handleUndoPoint}
                  disabled={drawingPoints.length === 0}
                  variant="outline"
                  size="sm"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Undo
                </Button>

                <Button
                  onClick={handleSaveBoundary}
                  disabled={drawingPoints.length < 3 || saving}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-1.5" />
                  )}
                  Confirm Boundary ({drawingPoints.length} Vertices)
                </Button>

                <Button onClick={handleCancelDrawing} variant="ghost" size="sm">
                  Cancel
                </Button>
              </>
            )}
          </div>

          {/* Interactive Leaflet Map Container */}
          <div className="relative w-full h-[450px] rounded-lg overflow-hidden border shadow-inner">
            <MapContainer
              center={mapCenter}
              zoom={16}
              scrollWheelZoom={true}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <CenterController center={mapCenter} />
              <BoundaryDrawHandler isDrawing={isDrawing} onAddPoint={handleAddPoint} />

              {/* Centroid marker */}
              <Marker position={mapCenter} icon={defaultMarkerIcon}>
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold">{fieldName}</p>
                    <p>Centroid Location</p>
                  </div>
                </Popup>
              </Marker>

              {/* Drawing In Progress: Points & Connecting Lines */}
              {isDrawing && (
                <>
                  {drawingPoints.map((pt, idx) => (
                    <CircleMarker
                      key={`draw-pt-${idx}`}
                      center={pt}
                      radius={idx === 0 ? 8 : 5}
                      pathOptions={{
                        color: idx === 0 ? "#16a34a" : "#ea580c",
                        fillColor: idx === 0 ? "#22c55e" : "#f97316",
                        fillOpacity: 0.9,
                        weight: 2,
                      }}
                    />
                  ))}
                  {drawingPoints.length >= 2 && (
                    <Polyline
                      positions={drawingPoints}
                      pathOptions={{ color: "#f97316", weight: 3, dashArray: "6, 6" }}
                    />
                  )}
                  {drawingPoints.length >= 3 && (
                    <Polygon
                      positions={drawingPoints}
                      pathOptions={{ color: "#ea580c", fillColor: "#fb923c", fillOpacity: 0.25 }}
                    />
                  )}
                </>
              )}

              {/* Saved Farm Boundary Polygon */}
              {!isDrawing && savedPolygonLatLngs.length >= 3 && (
                <Polygon
                  positions={savedPolygonLatLngs}
                  pathOptions={{
                    color: "#059669",
                    weight: 3,
                    fillColor: zones.length === 0 ? "#10b981" : "transparent",
                    fillOpacity: zones.length === 0 ? 0.2 : 0,
                  }}
                >
                  <Popup>
                    <div className="text-xs">
                      <p className="font-bold text-emerald-800">{fieldName} Boundary</p>
                      <p>Calculated Area: {calculatedArea || initialArea} {areaUnit}</p>
                    </div>
                  </Popup>
                </Polygon>
              )}

              {/* Monitoring Zones Subdivisions */}
              {!isDrawing &&
                zonePolygons.map((z) => (
                  <Polygon
                    key={z._id}
                    positions={z.latlngs}
                    pathOptions={{
                      color: z.color.stroke,
                      weight: 2,
                      fillColor: z.color.fill,
                      fillOpacity: 0.35,
                    }}
                  >
                    <Popup>
                      <div className="text-xs space-y-1">
                        <p className="font-bold" style={{ color: z.color.stroke }}>
                          Zone {z.zoneCode}: {z.zoneName}
                        </p>
                        <p className="text-muted-foreground">Area: {z.area || "-"} {z.areaUnit || areaUnit}</p>
                        <p className="text-[10px] text-muted-foreground italic">
                          Monitoring zone for localized pest & disease tracking.
                        </p>
                      </div>
                    </Popup>
                  </Polygon>
                ))}

              {/* GPS Test Marker */}
              {testPoint && (
                <Marker position={testPoint} icon={gpsPinIcon}>
                  <Popup>
                    <div className="text-xs">
                      <p className="font-bold">Tested GPS Point</p>
                      <p>{testPoint[0].toFixed(5)}, {testPoint[1].toFixed(5)}</p>
                      {pointResolution && (
                        <p className={pointResolution.insideFarm ? "text-emerald-700 font-semibold" : "text-red-600 font-semibold"}>
                          {pointResolution.message}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          {/* GPS Point Resolution Status Banner */}
          {pointResolution && (
            <div
              className={`p-3 rounded-md text-xs flex items-center justify-between border ${
                pointResolution.insideFarm
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>
                  <strong>GPS Verification:</strong> {pointResolution.message}
                </span>
              </div>
              {pointResolution.matchedZone && (
                <Badge className="bg-emerald-600 text-white font-mono text-xs">
                  {pointResolution.matchedZone.zoneCode}
                </Badge>
              )}
            </div>
          )}

          {/* Zones Summary Grid */}
          {zones.length > 0 && !isDrawing && (
            <div className="space-y-2 pt-2 border-t">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                Active Monitoring Zones ({zones.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {zonePolygons.map((z) => (
                  <div
                    key={z._id}
                    className="p-2.5 rounded-lg border bg-card text-xs space-y-1 shadow-xs hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono px-1.5 py-0.5 rounded text-white text-[11px]" style={{ backgroundColor: z.color.stroke }}>
                        {z.zoneCode}
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        {z.area} {z.areaUnit || areaUnit}
                      </span>
                    </div>
                    <p className="font-medium text-foreground truncate">{z.zoneName}</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground italic">
                * Note: Monitoring zones are spatial monitoring subdivisions for targeted crop disease scouting. They do not represent soil or cadastral boundaries.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
