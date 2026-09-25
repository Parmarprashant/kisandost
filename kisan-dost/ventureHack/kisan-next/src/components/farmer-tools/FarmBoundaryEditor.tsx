"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
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
  Target,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";
import { GeoPolygon, isPointInRing } from "@/lib/geoUtils";
import { useWeather } from "@/context/WeatherContext";

// Set Mapbox token from env
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

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

export function FarmBoundaryEditor({
  fieldId,
  fieldName,
  initialCenter = [23.2156, 72.6369],
  initialArea,
  areaUnit = "Acre",
  onBoundarySaved,
}: FarmBoundaryEditorProps) {
  // Weather context gives us the user's already-acquired GPS location
  const { weatherData } = useWeather();
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingZones, setGeneratingZones] = useState(false);
  const [resolvingPoint, setResolvingPoint] = useState(false);

  // Field boundary data
  const [savedBoundary, setSavedBoundary] = useState<GeoPolygon | null>(null);
  const [calculatedArea, setCalculatedArea] = useState<number | null>(null);

  // Drawing state: Array of [lng, lat] (GeoJSON order — Mapbox native)
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);

  // Monitoring zones
  const [zones, setZones] = useState<ZoneItem[]>([]);

  // GPS Point testing
  const [testPoint, setTestPoint] = useState<[number, number] | null>(null); // [lat, lng]
  const [pointResolution, setPointResolution] = useState<{
    insideFarm: boolean;
    matchedZone: { zoneId: string; zoneCode: string; zoneName: string } | null;
    message: string;
    distanceMeters?: number;
  } | null>(null);
  // Separate state for browser GPS acquisition (before API call)
  const [gpsLoading, setGpsLoading] = useState(false);

  // Map center: [lat, lng] for our logic (converted to [lng, lat] for Mapbox)
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter);

  // Mapbox refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const centroidMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const testMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const isDrawingRef = useRef(false);
  const handleTestGpsCoordinateRef = useRef<(lat: number, lng: number) => void>(() => {});

  // ─── Derived: convert saved boundary to GeoJSON coords for Mapbox ─────────
  const savedRingLngLat = useMemo<[number, number][]>(() => {
    if (!savedBoundary?.coordinates?.[0]) return [];
    return savedBoundary.coordinates[0] as [number, number][];
  }, [savedBoundary]);

  // ─── Derived: zone polygon display data ───────────────────────────────────
  const zonePolygons = useMemo(() => {
    return zones.map((z, idx) => {
      const color = ZONE_COLORS[idx % ZONE_COLORS.length];
      return { ...z, color };
    });
  }, [zones]);

  // ─── Fetch boundary + zones on mount ─────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const bRes = await fetch(`/api/fields/${fieldId}/boundary`);
        if (bRes.ok) {
          const bData = await bRes.json();
          if (bData.hasBoundary && bData.boundary) {
            setSavedBoundary(bData.boundary);
            setCalculatedArea(bData.calculatedArea);
            const ring = bData.boundary.coordinates[0];
            if (ring?.length > 0) {
              const avgLng = ring.reduce((s: number, p: number[]) => s + p[0], 0) / ring.length;
              const avgLat = ring.reduce((s: number, p: number[]) => s + p[1], 0) / ring.length;
              setMapCenter([avgLat, avgLng]);
            }
          } else if (bData.location?.latitude && bData.location?.longitude) {
            setMapCenter([bData.location.latitude, bData.location.longitude]);
          }
        }

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

    if (fieldId) loadData();
  }, [fieldId]);

  // ─── Initialize Mapbox map ────────────────────────────────────────────────
  useEffect(() => {
    if (loading || !mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/standard-satellite",
      center: [mapCenter[1], mapCenter[0]], // [lng, lat]
      zoom: 16,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new mapboxgl.ScaleControl({ unit: "metric" }), "bottom-left");

    map.on("load", () => {
      // ── Centroid marker ──────────────────────────────────────────────────
      const el = document.createElement("div");
      el.className = "mapbox-centroid-marker";
      el.innerHTML = `<div style="
        width:28px;height:28px;background:#059669;border:3px solid #fff;
        border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);
        display:flex;align-items:center;justify-content:center;
      ">
        <svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/><circle cx='12' cy='10' r='3'/></svg>
      </div>`;
      centroidMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([mapCenter[1], mapCenter[0]])
        .addTo(map);

      // ── Farm boundary source & layers ────────────────────────────────────
      map.addSource("farm-boundary", {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [] } },
      });
      map.addLayer({
        id: "farm-boundary-fill",
        type: "fill",
        source: "farm-boundary",
        paint: { "fill-color": "#10b981", "fill-opacity": 0.2 },
      });
      map.addLayer({
        id: "farm-boundary-line",
        type: "line",
        source: "farm-boundary",
        paint: { "line-color": "#059669", "line-width": 3, "line-dasharray": [] },
      });

      // ── Zone sources & layers ────────────────────────────────────────────
      for (let i = 0; i < 6; i++) {
        const color = ZONE_COLORS[i];
        map.addSource(`zone-${i}`, {
          type: "geojson",
          data: { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [] } },
        });
        map.addLayer({
          id: `zone-fill-${i}`,
          type: "fill",
          source: `zone-${i}`,
          paint: { "fill-color": color.fill, "fill-opacity": 0.35 },
        });
        map.addLayer({
          id: `zone-line-${i}`,
          type: "line",
          source: `zone-${i}`,
          paint: { "line-color": color.stroke, "line-width": 2 },
        });
      }

      // ── Drawing preview source & layers ──────────────────────────────────
      map.addSource("draw-preview", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "draw-fill",
        type: "fill",
        source: "draw-preview",
        filter: ["==", "$type", "Polygon"],
        paint: { "fill-color": "#fb923c", "fill-opacity": 0.2 },
      });
      map.addLayer({
        id: "draw-line",
        type: "line",
        source: "draw-preview",
        filter: ["==", "$type", "LineString"],
        paint: { "line-color": "#f97316", "line-width": 2.5, "line-dasharray": [4, 4] },
      });
      map.addLayer({
        id: "draw-points",
        type: "circle",
        source: "draw-preview",
        filter: ["==", "$type", "Point"],
        paint: {
          "circle-radius": ["case", ["==", ["get", "isFirst"], true], 8, 5],
          "circle-color": ["case", ["==", ["get", "isFirst"], true], "#16a34a", "#ea580c"],
          "circle-stroke-color": "#fff",
          "circle-stroke-width": 2,
        },
      });

      mapRef.current = map;
      syncMapLayers();
    });

    // Map click for drawing or GPS point testing
    map.on("click", (e) => {
      if (isDrawingRef.current) {
        const { lng, lat } = e.lngLat;
        setDrawingPoints((prev) => [...prev, [lng, lat]]);
      } else {
        const { lng, lat } = e.lngLat;
        handleTestGpsCoordinateRef.current(lat, lng);
      }
    });

    map.on("mousemove", () => {
      if (!map) return;
      map.getCanvas().style.cursor = isDrawingRef.current ? "crosshair" : "pointer";
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // ─── Sync all map layers whenever data changes ────────────────────────────
  const syncMapLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // Boundary
    const boundarySource = map.getSource("farm-boundary") as mapboxgl.GeoJSONSource | undefined;
    if (boundarySource) {
      if (savedRingLngLat.length >= 3) {
        boundarySource.setData({
          type: "Feature",
          properties: {},
          geometry: { type: "Polygon", coordinates: [savedRingLngLat] },
        });
        // Hide fill if zones are active
        map.setPaintProperty("farm-boundary-fill", "fill-opacity", zones.length > 0 ? 0 : 0.2);
      } else {
        boundarySource.setData({
          type: "Feature",
          properties: {},
          geometry: { type: "Polygon", coordinates: [] },
        });
      }
    }

    // Zones
    zonePolygons.forEach((z, i) => {
      const src = map.getSource(`zone-${i}`) as mapboxgl.GeoJSONSource | undefined;
      if (!src) return;
      if (z.polygon?.coordinates?.[0]) {
        src.setData({
          type: "Feature",
          properties: {},
          geometry: { type: "Polygon", coordinates: z.polygon.coordinates },
        });
      } else {
        src.setData({
          type: "Feature",
          properties: {},
          geometry: { type: "Polygon", coordinates: [] },
        });
      }
    });
    // Clear unused zone layers
    for (let i = zonePolygons.length; i < 6; i++) {
      const src = map.getSource(`zone-${i}`) as mapboxgl.GeoJSONSource | undefined;
      if (src) {
        src.setData({
          type: "Feature",
          properties: {},
          geometry: { type: "Polygon", coordinates: [] },
        });
      }
    }
  }, [savedRingLngLat, zones, zonePolygons]);

  useEffect(() => {
    syncMapLayers();
  }, [syncMapLayers]);

  // ─── Sync draw preview layer ──────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource("draw-preview") as mapboxgl.GeoJSONSource | undefined;
    if (!src) return;

    if (!isDrawing || drawingPoints.length === 0) {
      src.setData({ type: "FeatureCollection", features: [] });
      return;
    }

    const features: GeoJSON.Feature[] = [];

    // Points
    drawingPoints.forEach((pt, idx) => {
      features.push({
        type: "Feature",
        properties: { isFirst: idx === 0 },
        geometry: { type: "Point", coordinates: pt },
      });
    });

    // Connecting line
    if (drawingPoints.length >= 2) {
      features.push({
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: drawingPoints },
      });
    }

    // Preview polygon
    if (drawingPoints.length >= 3) {
      features.push({
        type: "Feature",
        properties: {},
        geometry: { type: "Polygon", coordinates: [[...drawingPoints, drawingPoints[0]]] },
      });
    }

    src.setData({ type: "FeatureCollection", features });
  }, [isDrawing, drawingPoints]);

  // ─── Keep isDrawingRef in sync with state (for map click handler) ─────────
  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);

  // ─── Re-center map when mapCenter changes ────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({ center: [mapCenter[1], mapCenter[0]], duration: 600 });
    centroidMarkerRef.current?.setLngLat([mapCenter[1], mapCenter[0]]);
  }, [mapCenter]);

  // ─── Test marker ─────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    testMarkerRef.current?.remove();
    testMarkerRef.current = null;

    if (!testPoint) return;

    // Build popup content
    const coordsLine = `${testPoint[0].toFixed(5)}°N, ${testPoint[1].toFixed(5)}°E`;
    let resolutionLine = "";
    if (pointResolution) {
      const col = pointResolution.insideFarm ? "#15803d" : "#b91c1c";
      resolutionLine = `<br/><span style="color:${col};font-weight:600;font-size:12px">${pointResolution.message}</span>`;
      if (pointResolution.matchedZone) {
        resolutionLine += `<br/><span style="background:#15803d;color:white;padding:1px 6px;border-radius:4px;font-size:11px">Zone: ${pointResolution.matchedZone.zoneCode}</span>`;
      }
    } else if (resolvingPoint) {
      resolutionLine = `<br/><span style="color:#64748b">Checking zone…</span>`;
    }

    const popup = new mapboxgl.Popup({ offset: 18, closeButton: true, maxWidth: "220px" }).setHTML(
      `<div style="font-size:12px;font-family:system-ui;line-height:1.6;padding:2px 4px">
        <strong style="font-size:13px">📍 GPS Test Point</strong><br/>
        <span style="color:#475569">${coordsLine}</span>
        ${resolutionLine}
      </div>`
    );

    const el = document.createElement("div");
    el.innerHTML = `<div style="
      width:26px;height:26px;
      background:radial-gradient(circle, #f87171 30%, #dc2626 100%);
      border:3px solid #fff;
      border-radius:50%;
      box-shadow:0 0 0 3px rgba(220,38,38,0.3), 0 3px 10px rgba(0,0,0,0.4);
      cursor:pointer;
    "></div>`;

    const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
      .setLngLat([testPoint[1], testPoint[0]])
      .setPopup(popup)
      .addTo(map);
    testMarkerRef.current = marker;

    // Auto-open popup so user sees the result immediately
    marker.togglePopup();
  }, [testPoint, pointResolution, resolvingPoint]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleStartDrawing = () => {
    setIsDrawing(true);
    setDrawingPoints([]);
    setPointResolution(null);
    const map = mapRef.current;
    if (map) map.getCanvas().style.cursor = "crosshair";
  };

  const handleUndoPoint = () => {
    setDrawingPoints((prev) => prev.slice(0, -1));
  };

  const handleCancelDrawing = () => {
    setIsDrawing(false);
    setDrawingPoints([]);
    const map = mapRef.current;
    if (map) map.getCanvas().style.cursor = "";
  };

  const handleSaveBoundary = async () => {
    // drawingPoints are [lng, lat] (GeoJSON order)
    if (drawingPoints.length < 3) {
      toast.error("Please add at least 3 points on the map to define a valid boundary polygon.");
      return;
    }

    const geoRing = [...drawingPoints, drawingPoints[0]]; // close ring
    const newPolygon: GeoPolygon = { type: "Polygon", coordinates: [geoRing] };

    setSaving(true);
    try {
      const res = await fetch(`/api/fields/${fieldId}/boundary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boundary: newPolygon, updateFieldArea: true }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save boundary");

      setSavedBoundary(data.boundary);
      setCalculatedArea(data.calculatedArea);
      setIsDrawing(false);
      setDrawingPoints([]);
      const map = mapRef.current;
      if (map) map.getCanvas().style.cursor = "";

      toast.success("Farm boundary saved successfully!");
      if (onBoundarySaved) onBoundarySaved(data.boundary, data.calculatedArea);

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
      if (!res.ok) throw new Error(data.error || "Failed to generate monitoring zones");
      setZones(data.zones || []);
      toast.success(data.message || "Monitoring zones generated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to generate monitoring zones");
    } finally {
      setGeneratingZones(false);
    }
  };

  const handleTestGpsCoordinate = async (lat: number, lng: number) => {
    setResolvingPoint(true);
    // Place marker immediately so user sees the pin straight away
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
        setPointResolution({
          insideFarm: false,
          matchedZone: null,
          message: data.error || "Could not resolve zone (no boundary defined yet)",
        });
        return;
      }
      setPointResolution({
        insideFarm: data.insideFarm,
        matchedZone: data.matchedZone,
        message: data.message,
        distanceMeters: data.distanceMeters,
      });
      if (data.insideFarm && data.matchedZone) {
        toast.success(`✅ Inside farm — Zone ${data.matchedZone.zoneCode}`);
      } else if (data.insideFarm) {
        toast.info("📍 Coordinate is inside the farm boundary.");
      } else {
        toast.warning(data.message || "⚠️ Coordinate is outside the farm boundary.");
      }
    } catch (err: any) {
      console.error(err);
      setPointResolution({
        insideFarm: false,
        matchedZone: null,
        message: "Zone lookup failed — check your connection.",
      });
    } finally {
      setResolvingPoint(false);
    }
  };

  // Keep ref up to date for map click events
  handleTestGpsCoordinateRef.current = handleTestGpsCoordinate;

  // ─── Find guaranteed interior point for any polygon ───────────────────────
  const getInteriorPoint = (boundary: GeoPolygon | null): [number, number] | null => {
    if (!boundary?.coordinates?.[0] || boundary.coordinates[0].length < 3) return null;
    const ring = boundary.coordinates[0];

    // 1. Try arithmetic centroid
    const avgLng = ring.reduce((s, p) => s + p[0], 0) / ring.length;
    const avgLat = ring.reduce((s, p) => s + p[1], 0) / ring.length;
    if (isPointInRing([avgLng, avgLat], ring)) {
      return [avgLat, avgLng];
    }

    // 2. Try triangle centroids formed by consecutive triplets
    for (let i = 0; i < ring.length - 2; i++) {
      const tLng = (ring[i][0] + ring[i + 1][0] + ring[i + 2][0]) / 3;
      const tLat = (ring[i][1] + ring[i + 1][1] + ring[i + 2][1]) / 3;
      if (isPointInRing([tLng, tLat], ring)) {
        return [tLat, tLng];
      }
    }

    // 3. Fallback: nudge vertex towards center
    const nudgeLng = ring[0][0] * 0.85 + avgLng * 0.15;
    const nudgeLat = ring[0][1] * 0.85 + avgLat * 0.15;
    return [nudgeLat, nudgeLng];
  };

  // ─── Test point guaranteed to be INSIDE farm / monitoring zone ───────────
  const handleTestInsideFarm = () => {
    if (!savedBoundary) {
      toast.error("Please draw and save a farm boundary polygon first.");
      return;
    }

    // If monitoring zones exist, prioritize testing inside Zone A (first zone)
    if (zones.length > 0 && zones[0]?.polygon?.coordinates?.[0]) {
      const zonePt = getInteriorPoint(zones[0].polygon);
      if (zonePt) {
        toast.success(`📍 Testing inside ${zones[0].zoneName || zones[0].zoneCode}`);
        if (mapRef.current) {
          mapRef.current.easeTo({ center: [zonePt[1], zonePt[0]], zoom: 17 });
        }
        handleTestGpsCoordinate(zonePt[0], zonePt[1]);
        return;
      }
    }

    // Otherwise test farm centroid
    const pt = getInteriorPoint(savedBoundary);
    if (pt) {
      toast.success("📍 Testing inside farm boundary center");
      if (mapRef.current) {
        mapRef.current.easeTo({ center: [pt[1], pt[0]], zoom: 17 });
      }
      handleTestGpsCoordinate(pt[0], pt[1]);
    }
  };

  // ─── Center map on detected user coordinates (Weather API or GPS) ─────────
  const handleFlyToMyLocation = async () => {
    let targetLat: number | null = null;
    let targetLng: number | null = null;
    let label = "Detected Location";

    // 1. Try WeatherContext coordinates first (instant, reliable)
    if (weatherData?.location?.lat && weatherData?.location?.lon) {
      targetLat = Number(weatherData.location.lat);
      targetLng = Number(weatherData.location.lon);
      label = weatherData.location.name || "Weather Location";
    }

    // 2. Try browser GPS
    if (navigator.geolocation) {
      const pos = await new Promise<GeolocationPosition | null>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (p) => resolve(p),
          () => resolve(null),
          { timeout: 5000, enableHighAccuracy: false }
        );
      });
      if (pos) {
        targetLat = pos.coords.latitude;
        targetLng = pos.coords.longitude;
        label = "GPS Device Location";
      }
    }

    if (targetLat != null && targetLng != null) {
      setMapCenter([targetLat, targetLng]);
      if (mapRef.current) {
        mapRef.current.flyTo({ center: [targetLng, targetLat], zoom: 16 });
      }
      toast.success(`📍 Centered map on ${label} (${targetLat.toFixed(4)}, ${targetLng.toFixed(4)})`);
    } else {
      toast.error("Could not acquire your current location.");
    }
  };

  // ─── GPS handler — Device GPS with fallback to Weather API location ───────
  const handleUseDeviceGps = async () => {
    setGpsLoading(true);
    let coords: { lat: number; lng: number; source: string } | null = null;

    // Priority 1: Real browser GPS (most accurate on phone/field)
    if (navigator.geolocation) {
      toast.info("📡 Acquiring device location...");
      const pos = await new Promise<GeolocationPosition | null>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (p) => resolve(p),
          () => resolve(null),
          { enableHighAccuracy: false, timeout: 6000, maximumAge: 30000 }
        );
      });
      if (pos) {
        coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          source: `Device GPS (±${Math.round(pos.coords.accuracy)}m)`,
        };
      }
    }

    // Priority 2: Weather context location (already acquired on app load)
    if (!coords && weatherData?.location?.lat && weatherData?.location?.lon) {
      coords = {
        lat: Number(weatherData.location.lat),
        lng: Number(weatherData.location.lon),
        source: `Weather Location (${weatherData.location.name || "Local Area"})`,
      };
    }

    // Priority 3: Direct weather IP endpoint
    if (!coords) {
      try {
        const res = await fetch("/api/weather?q=auto:ip");
        if (res.ok) {
          const data = await res.json();
          if (data?.location?.lat && data?.location?.lon) {
            coords = {
              lat: Number(data.location.lat),
              lng: Number(data.location.lon),
              source: `Network Location (${data.location.name || "IP"})`,
            };
          }
        }
      } catch {
        /* silent */
      }
    }

    setGpsLoading(false);

    if (coords) {
      toast.info(`📍 Testing from ${coords.source}`);
      if (mapRef.current) {
        mapRef.current.easeTo({ center: [coords.lng, coords.lat], zoom: 16 });
      }
      handleTestGpsCoordinate(coords.lat, coords.lng);
    } else {
      // If no remote location detected, test farm interior directly
      toast.info("Location service unavailable. Testing farm interior coordinates.");
      handleTestInsideFarm();
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
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
                {fieldName} — Boundary &amp; Monitoring Zones
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

                {/* Primary Demo / Inside Farm Test Button */}
                {savedBoundary && (
                  <Button
                    onClick={handleTestInsideFarm}
                    disabled={resolvingPoint}
                    variant="outline"
                    size="sm"
                    className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 text-xs font-medium"
                    title="Simulate GPS inside the farm boundary and verify zone detection"
                  >
                    <Target className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                    Test Inside Farm
                  </Button>
                )}

                {/* Real Device GPS Test Button */}
                <Button
                  onClick={handleUseDeviceGps}
                  disabled={gpsLoading || resolvingPoint}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  title="Test GPS at your current physical/device location"
                >
                  {gpsLoading ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin text-blue-600" />
                  ) : resolvingPoint ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin text-emerald-600" />
                  ) : (
                    <Crosshair className="w-3.5 h-3.5 mr-1 text-blue-600" />
                  )}
                  {gpsLoading ? "Locating…" : resolvingPoint ? "Checking zone…" : "Test My Device GPS"}
                </Button>

                {/* Center Map on My Location Button */}
                <Button
                  onClick={handleFlyToMyLocation}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  title="Center map on your detected GPS/weather coordinates"
                >
                  <Navigation className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  Center On Me
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

          {/* Mapbox GL Map Container */}
          <div className="relative w-full h-[450px] rounded-lg overflow-hidden border shadow-inner">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Drawing mode cursor hint overlay */}
            {isDrawing ? (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                <span className="bg-amber-600/90 text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
                  Click to place vertices • {drawingPoints.length} placed
                </span>
              </div>
            ) : savedBoundary ? (
              <div className="absolute top-3 left-3 z-10 pointer-events-none">
                <span className="bg-slate-900/80 text-white text-[10px] font-medium px-2.5 py-1 rounded-md shadow-md backdrop-blur-sm flex items-center gap-1.5 border border-white/10">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  Click anywhere on map to test GPS verification
                </span>
              </div>
            ) : null}
          </div>

          {/* GPS Point Resolution Status Banner */}
          {pointResolution && (
            <div
              className={`p-3.5 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 border shadow-xs transition-all ${
                pointResolution.insideFarm
                  ? "bg-emerald-50 text-emerald-950 border-emerald-300 ring-1 ring-emerald-400/25"
                  : "bg-amber-50/90 text-amber-950 border-amber-300 ring-1 ring-amber-400/20"
              }`}
            >
              <div className="flex items-start sm:items-center gap-2.5">
                {pointResolution.insideFarm ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                )}
                <div>
                  <div className="font-semibold text-sm flex items-center gap-2">
                    <span>GPS Verification:</span>
                    {pointResolution.insideFarm ? (
                      <span className="text-emerald-700">Verified Inside Farm</span>
                    ) : (
                      <span className="text-amber-800">Outside Farm Boundary</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {pointResolution.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {pointResolution.matchedZone && (
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs px-2.5 py-1 shadow-xs">
                    {pointResolution.matchedZone.zoneCode} — {pointResolution.matchedZone.zoneName}
                  </Badge>
                )}
                {!pointResolution.insideFarm && savedBoundary && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleTestInsideFarm}
                    className="h-8 text-xs bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 font-medium shadow-2xs"
                  >
                    <Target className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Test Inside Farm
                  </Button>
                )}
              </div>
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
                      <span
                        className="font-bold font-mono px-1.5 py-0.5 rounded text-white text-[11px]"
                        style={{ backgroundColor: z.color.stroke }}
                      >
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
