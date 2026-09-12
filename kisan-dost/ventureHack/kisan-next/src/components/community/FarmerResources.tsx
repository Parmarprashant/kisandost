"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  Sprout,
  ExternalLink,
  Play,
  ChevronDown,
  Wallet,
  Landmark,
  UserCheck,
  Calendar,
  Rocket,
  Users,
  ThumbsUp,
  ThumbsDown,
  Share2,
  CheckCircle2,
  Landmark as LandmarkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const VIDEOS = [
  { id: "fuE750JhA2U", titleKey: "v1", dateKey: "v1" },
  { id: "0ZTcuWp0eXA", titleKey: "v2", dateKey: "v2" },
  { id: "flBkER1gsQI", titleKey: "v3", dateKey: "v3" },
  { id: "wSW9PKMNt9A", titleKey: "v4", dateKey: "v4" },
  { id: "-Q3hqgNmQ1w", titleKey: "v5", dateKey: "v5" },
  { id: "0kbEZy_k1ts", titleKey: "v6", dateKey: "v6" },
  { id: "hbVMJ0gAoso", titleKey: "v7", dateKey: "v7" },
  { id: "flBkER1gsQI", titleKey: "v8", dateKey: "v8" },
];

const E_SERVICE_CARDS = [
  { icon: "🪪", key: "ekyc", maturityKey: "fullyOnline", maturityColor: "emerald", link: "https://pmkisan.gov.in/" },
  { icon: "🗺️", key: "landRecords", maturityKey: "fullyOnline", maturityColor: "emerald", link: "https://anyror.gujarat.gov.in/" },
  { icon: "🔍", key: "appStatus", maturityKey: "fullyOnline", maturityColor: "emerald", link: "https://pmkisan.gov.in/" },
  { icon: "🏠", key: "pmayDashboard", maturityKey: "fullyOnline", maturityColor: "emerald", link: "https://pmayg.nic.in/" },
  { icon: "🌾", key: "foodSecurity", maturityKey: "partiallyOnline", maturityColor: "amber", link: "https://nfsa.gov.in/" },
  { icon: "📝", key: "registerFarmer", maturityKey: "fullyOnline", maturityColor: "emerald", link: "https://pmkisan.gov.in/" },
  { icon: "🖥️", key: "ems", maturityKey: "partiallyOnline", maturityColor: "amber", link: "https://extensionreforms.gov.in/" },
  { icon: "🌾", key: "kkms", maturityKey: "fullyOnline", maturityColor: "emerald", link: "https://mkisan.gov.in/" },
  { icon: "👨‍🌾", key: "pmKisanScheme", maturityKey: "fullyOnline", maturityColor: "emerald", link: "https://pmkisan.gov.in/" },
];

export default function FarmerResources() {
  const tComm = useTranslations("Communities");
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [userRating, setUserRating] = useState<"like" | "dislike" | null>(null);
  const [likes, setLikes] = useState(124);

  const visibleVideos = showAllVideos ? VIDEOS : VIDEOS.slice(0, 3);

  const handleRate = (type: "like" | "dislike") => {
    if (userRating === type) {
      setUserRating(null);
      if (type === "like") setLikes(prev => prev - 1);
    } else {
      if (userRating === "like") setLikes(prev => prev - 1);
      if (type === "like") setLikes(prev => prev + 1);
      setUserRating(type);
    }
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: "PM-KISAN Samman Nidhi",
        text: tComm("pmKisanDesc"),
        url: "https://pmkisan.gov.in/",
      });
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* PM Kisan Section */}
      <section className="space-y-8 mt-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌾</span>
          <h2 className="text-3xl font-black text-[#2e6b3b] tracking-tight">
            {tComm("pmKisanTitle")}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Featured Content Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                <Sprout className="w-64 h-64 text-[#2e6b3b]" />
              </div>

              <div className="relative z-10 space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2e6b3b]/10 text-[#2e6b3b] text-sm font-bold">
                  <Rocket className="w-4 h-4" />
                  {tComm("officialInitiative")}
                </div>

                <h3 className="text-4xl font-black leading-none text-slate-800">
                  {tComm("officialChannel")}
                </h3>

                <p className="text-lg font-medium text-slate-600 leading-relaxed bg-[#e8f0fe]/50 p-6 rounded-3xl border-l-[6px] border-orange-400 italic">
                  {tComm("quote")}
                </p>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-50 border border-slate-100 text-slate-600 font-bold text-sm">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    {tComm("operationalDate")}
                  </div>
                  <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-50 border border-slate-100 text-slate-600 font-bold text-sm">
                    <Rocket className="w-4 h-4 text-[#2e6b3b]" />
                    {tComm("launchDate")}
                  </div>
                  <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-50 border border-slate-100 text-slate-600 font-bold text-sm">
                    <Users className="w-4 h-4 text-blue-500" />
                    {tComm("beneficiaries")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Icon/Brand Area */}
          <div className="lg:col-span-4 flex items-center justify-center">
            <div className="w-64 h-64 bg-gradient-to-br from-[#2d5a2d] to-[#1e3f1e] rounded-[60px] shadow-2xl flex items-center justify-center text-8xl transform hover:rotate-6 transition-transform duration-500 border-8 border-white">
              🌾
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="space-y-8 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <Play className="w-6 h-6 text-[#2e6b3b]" />
              {tComm("latestVideos")}
            </h3>
            <a
              href="https://www.youtube.com/@pmkisanofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-[#2e6b3b] font-black text-sm hover:underline"
            >
              {tComm("visitChannel")} <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleVideos.map((video, idx) => (
              <div
                key={idx}
                className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group"
              >
                <div className="aspect-video relative bg-slate-100">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}`}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                    title={tComm(`videoTitles.${video.titleKey}`)}
                  />
                </div>
                <div className="p-6 space-y-3">
                  <h4 className="text-lg font-black text-slate-800 group-hover:text-[#2e6b3b] transition-colors line-clamp-2">
                    {tComm(`videoTitles.${video.titleKey}`)}
                  </h4>
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    {tComm(`videoDates.${video.dateKey}`)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!showAllVideos ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                onClick={() => setShowAllVideos(true)}
                className="h-14 px-12 rounded-full bg-white border-2 border-[#2e6b3b] text-[#2e6b3b] hover:bg-[#2e6b3b] hover:text-white font-black transition-all group shadow-lg active:scale-95"
              >
                {tComm("loadMore")}
                <ChevronDown className="ml-2 w-5 h-5 transition-transform group-hover:translate-y-1" />
              </Button>
              <a
                href="https://www.youtube.com/@pmkisanofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="h-14 px-12 inline-flex items-center justify-center rounded-full bg-[#ff0000] text-white font-black transition-all hover:bg-[#cc0000] shadow-lg active:scale-95 group"
              >
                <Play className="mr-2 w-5 h-5 fill-current" />
                {tComm("visitYoutube")}
                <ExternalLink className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          ) : (
            <div className="text-center pt-4">
              <a
                href="https://www.youtube.com/@pmkisanofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="h-14 px-12 inline-flex items-center justify-center rounded-full bg-[#ff0000] text-white font-black transition-all hover:bg-[#cc0000] shadow-lg active:scale-95 group"
              >
                <Play className="mr-2 w-5 h-5 fill-current" />
                {tComm("watchMore")}
                <ExternalLink className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Farmers' Welfare Portal Section */}
      <section className="space-y-8 pt-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚜</span>
          <h2 className="text-3xl font-black text-[#2e6b3b] tracking-tight text-center lg:text-left w-full">
            {tComm("welfareSchemes")}
          </h2>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex flex-wrap items-center gap-4">
                <h3 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[#2e7d32] to-[#1b5e20] bg-clip-text text-transparent">
                  PM-KISAN Samman Nidhi
                </h3>
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4" />
                  {tComm("fullyOnline")}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleShare}
                className="rounded-full h-12 px-6 border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {tComm("shareThis")}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-slate-50 p-8 rounded-[32px] border-l-8 border-[#2e7d32]">
                  <p className="text-lg font-medium text-slate-700 leading-relaxed">
                    {tComm("pmKisanDesc")}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#2e7d32]">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-emerald-900">{tComm("annualSupport")}</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-600">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-orange-900">{tComm("installments")}</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600">
                      <Landmark className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-blue-900">{tComm("directTransfer")}</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-purple-600">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-purple-900">{tComm("forFarmers")}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-8 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-6 flex-wrap">
                <span className="text-slate-800 font-black text-lg">{tComm("rateThis")}</span>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => handleRate("like")}
                    variant={userRating === "like" ? "default" : "outline"}
                    className={cn(
                      "rounded-full h-11 px-6 font-bold transition-all",
                      userRating === "like" ? "bg-[#2e7d32] border-[#2e7d32]" : "text-slate-600 border-slate-200"
                    )}
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    {tComm("like")}
                  </Button>
                  <Button
                    onClick={() => handleRate("dislike")}
                    variant={userRating === "dislike" ? "destructive" : "outline"}
                    className={cn(
                      "rounded-full h-11 px-6 font-bold transition-all",
                      userRating === "dislike" ? "" : "text-slate-600 border-slate-200"
                    )}
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    {tComm("dislike")}
                  </Button>
                </div>
                <span className="text-sm font-bold text-slate-400">
                  {likes} {tComm("peopleHelpful")}
                </span>
              </div>

              <a
                href="https://pmkisan.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-black rounded-full shadow-lg shadow-emerald-200 transition-all hover:scale-105 active:scale-95"
              >
                <span>🌾</span> {tComm("visitPortal")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Farmer Welfare Services Grid */}
      <section className="space-y-8 pt-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌱</span>
          <h2 className="text-3xl font-black text-[#2e6b3b] tracking-tight">
            {tComm("eServices")}
          </h2>
        </div>
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {E_SERVICE_CARDS.map((service, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col h-full"
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shrink-0">
                      {service.icon}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-lg font-black text-slate-800 leading-tight">
                        {tComm(`eServiceCards.${service.key}.title`)}
                      </h3>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full w-fit",
                          service.maturityColor === "emerald"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        )}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {tComm(service.maturityKey)}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed flex-grow mb-6">
                    {tComm(`eServiceCards.${service.key}.description`)}
                  </p>
                  <a
                    href={service.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-2 px-5 py-2.5 bg-[#2e6b3b] hover:bg-[#1b5e20] text-white font-bold text-sm rounded-full transition-all hover:scale-105 w-fit"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> {tComm("more")}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <div className="text-center pt-8">
        <p className="text-sm font-medium text-slate-400">
          {tComm("footerNote")}
        </p>
      </div>
    </div>
  );
}
