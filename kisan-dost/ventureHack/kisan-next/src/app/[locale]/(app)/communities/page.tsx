"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import FarmerResources from "@/components/community/FarmerResources";
import FarmerNetwork from "@/components/community/FarmerNetwork";

export default function CommunitiesPage() {
  const tNav = useTranslations("Navigation");
  const tComm = useTranslations("Communities");
  const [activeTab, setActiveTab] = useState<"network" | "resources">("network");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-10 animate-in fade-in duration-700">
      {/* Community Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-100">
          <Sparkles className="w-3.5 h-3.5 text-[#2e6b3b]" />
          🌾 KisanDost Community
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-[#2e6b3b] tracking-tighter uppercase">
          {tComm("title")}
        </h1>
        <p className="text-base md:text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
          {tComm("subtitle")}
        </p>
      </div>

      {/* Dual Section Navigation Tabs */}
      <div className="flex justify-center">
        <div className="bg-slate-100/90 p-1.5 rounded-full border border-slate-200/80 shadow-inner flex max-w-lg w-full">
          <button
            onClick={() => setActiveTab("network")}
            className={cn(
              "flex-1 py-3 px-4 md:px-6 rounded-full font-black text-sm md:text-base flex items-center justify-center gap-2 transition-all duration-300",
              activeTab === "network"
                ? "bg-[#2e6b3b] text-white shadow-lg shadow-emerald-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            )}
          >
            <span className="text-lg">👨‍🌾</span>
            <span>{tComm("networkTab") || "Farmer Network"}</span>
          </button>

          <button
            onClick={() => setActiveTab("resources")}
            className={cn(
              "flex-1 py-3 px-4 md:px-6 rounded-full font-black text-sm md:text-base flex items-center justify-center gap-2 transition-all duration-300",
              activeTab === "resources"
                ? "bg-[#2e6b3b] text-white shadow-lg shadow-emerald-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            )}
          >
            <span className="text-lg">🏛️</span>
            <span>{tComm("resourcesTab") || "Farmer Resources"}</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-500">
        {activeTab === "network" ? (
          <FarmerNetwork />
        ) : (
          <FarmerResources />
        )}
      </div>
    </div>
  );
}
