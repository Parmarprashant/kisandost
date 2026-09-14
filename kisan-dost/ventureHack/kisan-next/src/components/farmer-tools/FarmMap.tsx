"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Loader2, MapPin } from "lucide-react";
import { useWeather } from "@/context/WeatherContext";
import { useTranslations } from "next-intl";

// Shared icon configuration - initialized on demand
const createDefaultIcon = () => L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface FarmMapProps {
  onLocationSelect: (lat: number, lon: number) => void;
}

// Sub-component to handle map interaction
function LocationMarker({ onLocationSelect }: FarmMapProps) {
  const { weatherData } = useWeather();
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [icon, setIcon] = useState<L.Icon | null>(null);

  useEffect(() => {
    setIcon(createDefaultIcon());
  }, []);

  // Initialize marker to weather location if available
  useEffect(() => {
    if (weatherData?.location && !position) {
      const lat = Number(weatherData.location.lat);
      const lon = Number(weatherData.location.lon);
      if (!isNaN(lat) && !isNaN(lon) && (lat !== 0 || lon !== 0)) {
        setPosition([lat, lon]);
      }
    }
  }, [weatherData, position]);

  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  if (position === null || !icon) return null;
  return <Marker position={position} icon={icon}></Marker>;
}

// Sub-component to handle centering WITHOUT re-mounting the entire map
function RecenterMap({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const prevCenterRef = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (!map) return;

    const [lat, lon] = center;
    if (typeof lat !== "number" || typeof lon !== "number" || isNaN(lat) || isNaN(lon)) {
      return;
    }

    // Skip on first mount because MapContainer already set the initial view
    if (!prevCenterRef.current) {
      prevCenterRef.current = [lat, lon];
      return;
    }

    // If coordinates haven't changed, skip
    if (prevCenterRef.current[0] === lat && prevCenterRef.current[1] === lon) {
      return;
    }

    prevCenterRef.current = [lat, lon];

    let isMounted = true;

    map.whenReady(() => {
      if (!isMounted) return;
      try {
        const container = map.getContainer?.();
        const mapPane = map.getPane?.("mapPane");
        if (!container || !mapPane || !(map as any)._loaded) {
          return;
        }

        const currentCenter = map.getCenter?.();
        if (currentCenter) {
          const dist = map.distance([currentCenter.lat, currentCenter.lng], [lat, lon]);
          const currentZoom = map.getZoom?.();
          if (dist < 10 && currentZoom === zoom) {
            return;
          }
        }

        map.setView([lat, lon], zoom, { animate: true });
      } catch (err) {
        console.warn("[FarmMap] Safe catch recentering map:", err);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [center[0], center[1], zoom, map]);

  return null;
}

export function FarmMap({ onLocationSelect }: FarmMapProps) {
  const t = useTranslations("YieldPredictor");
  const { weatherData } = useWeather();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Safe icon fix
    L.Marker.prototype.options.icon = createDefaultIcon();
  }, []);

  // Stable memoized default coordinates
  const center: [number, number] = useMemo(() => {
    const lat = Number(weatherData?.location?.lat);
    const lon = Number(weatherData?.location?.lon);
    if (!isNaN(lat) && !isNaN(lon) && (lat !== 0 || lon !== 0)) {
      return [lat, lon];
    }
    return [20.5937, 78.9629];
  }, [weatherData?.location?.lat, weatherData?.location?.lon]);

  const zoom = weatherData?.location ? 12 : 5;

  if (!isClient) {
    return (
      <div className="w-full h-[350px] bg-muted/20 flex items-center justify-center animate-pulse rounded-2xl">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full relative rounded-2xl overflow-hidden border-2 border-emerald-500/20 shadow-lg group z-0">
      <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md dark:bg-zinc-900/90 text-sm font-semibold px-4 py-2 rounded-full shadow border flex items-center gap-2 pointer-events-none transition-transform group-hover:-translate-y-1">
        <MapPin className="w-4 h-4 text-emerald-600" />
        {t("mapInstruction", { default: "Click on your farm to auto-fetch weather & predict yield" })}
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-[350px]"
      >
        <RecenterMap center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.google.com/intl/en_US/help/terms_maps.html">Google Maps</a>'
          url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          maxZoom={20}
        />
        <LocationMarker onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  );
}
