"use client";

import dynamic from "next/dynamic";
import { LocateFixed } from "lucide-react";
import { useTranslations } from "next-intl";

const MapLoadingFallback = () => {
  const t = useTranslations("CropSuggestion");
  return (
    <div className="w-full h-[500px] bg-slate-50 animate-pulse rounded-lg flex items-center justify-center border border-slate-200">
      <p className="text-muted-foreground font-medium flex items-center gap-2">
        <LocateFixed className="w-5 h-5 animate-spin" /> {t("loadingMap")}
      </p>
    </div>
  );
};

// Dynamically import the map to avoid SSR issues with Leaflet
const AIMapComponent = dynamic(
  () => import("@/components/farmer-tools/AIMapComponent").then((mod) => mod.AIMapComponent),
  {
    ssr: false,
    loading: () => <MapLoadingFallback />,
  }
);

export default function CropSuggestionPage() {
  const t = useTranslations("CropSuggestion");

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 pt-32">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-[#2e6b3b] tracking-tighter uppercase">
            {t("title")}
          </h1>
          <div className="h-1.5 w-24 bg-purple-400 mx-auto rounded-full" />
          <p className="text-xl text-muted-foreground font-medium">
            {t("description")}
          </p>
        </div>

        <AIMapComponent />
      </div>
    </div>
  );
}
