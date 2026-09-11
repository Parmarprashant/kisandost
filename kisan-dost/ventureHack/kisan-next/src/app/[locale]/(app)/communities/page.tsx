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
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const VIDEOS = [
  { id: "fuE750JhA2U", title: "PM Kisan Scheme - Farmer Benefits", date: "2 days ago" },
  { id: "0ZTcuWp0eXA", title: "How to Check PM Kisan Status Online", date: "1 week ago" },
  { id: "flBkER1gsQI", title: "PM Kisan 12th Installment Release", date: "2 weeks ago" },
  { id: "wSW9PKMNt9A", title: "PM Kisan Scheme - Complete Guide", date: "3 weeks ago" },
  { id: "-Q3hqgNmQ1w", title: "Farmers Welfare Schemes 2024", date: "1 month ago" },
  // { id: "wSW9PKMNt9A", title: "PM Kisan Helpline Numbers", date: "1 month ago" },
  { id: "0kbEZy_k1ts", title: "Direct Benefit Transfer (DBT) Explained", date: "2 months ago" },
  { id: "hbVMJ0gAoso", title: "E-KYC Registration Tutorial", date: "2 months ago" },
  { id: "flBkER1gsQI", title: "PMAY and PM Kisan Synergy", date: "3 months ago" },
];


export default function CommunitiesPage() {
  const t = useTranslations("Navigation");
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
    if (navigator.share) {
      navigator.share({
        title: "PM-KISAN Samman Nidhi",
        text: "PM-KISAN provides ₹6000 annual financial support to farmers. Check your eligibility now!",
        url: "https://pmkisan.gov.in/",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-[#2e6b3b] tracking-tighter uppercase">
          {t("communities")}
        </h1>
        <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
          Connecting farmers with government initiatives and peer knowledge.
        </p>
      </div>

      {/* PM Kisan Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌾</span>
          <h2 className="text-3xl font-black text-[#2e6b3b] tracking-tight">
            PM Kisan Samman Nidhi Yojana
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
                  Official Government Initiative
                </div>

                <h3 className="text-4xl font-black leading-none text-slate-800">
                  Official YouTube Channel
                </h3>

                <p className="text-lg font-medium text-slate-600 leading-relaxed bg-[#e8f0fe]/50 p-6 rounded-3xl border-l-[6px] border-orange-400 italic">
                  &quot;Launched on 24th February 2019 by Hon&apos;ble Prime Minister, Shri Narendra Modi.
                  Became operational on 1st December 2018. Provides income support to eligible farmer families.&quot;
                </p>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-50 border border-slate-100 text-slate-600 font-bold text-sm">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    Operational: 01 Dec 2018
                  </div>
                  <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-50 border border-slate-100 text-slate-600 font-bold text-sm">
                    <Rocket className="w-4 h-4 text-[#2e6b3b]" />
                    Launch: 24 Feb 2019
                  </div>
                  <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-50 border border-slate-100 text-slate-600 font-bold text-sm">
                    <Users className="w-4 h-4 text-blue-500" />
                    Beneficiaries: Crores of farmers
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
        <div className="space-y-8 pt-12">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <Play className="w-6 h-6 text-[#2e6b3b]" />
              LATEST VIDEOS
            </h3>
            <a
              href="https://www.youtube.com/@pmkisanofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-[#2e6b3b] font-black text-sm hover:underline"
            >
              Visit Channel <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
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
                    title={video.title}
                  />
                </div>
                <div className="p-6 space-y-3">
                  <h4 className="text-lg font-black text-slate-800 group-hover:text-[#2e6b3b] transition-colors line-clamp-2">
                    {video.title}
                  </h4>
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    {video.date}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!showAllVideos ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Button
                onClick={() => setShowAllVideos(true)}
                className="h-14 px-12 rounded-full bg-white border-2 border-[#2e6b3b] text-[#2e6b3b] hover:bg-[#2e6b3b] hover:text-white font-black transition-all group shadow-lg active:scale-95"
              >
                Load More Videos
                <ChevronDown className="ml-2 w-5 h-5 transition-transform group-hover:translate-y-1" />
              </Button>
              <a
                href="https://www.youtube.com/@pmkisanofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="h-14 px-12 inline-flex items-center justify-center rounded-full bg-[#ff0000] text-white font-black transition-all hover:bg-[#cc0000] shadow-lg active:scale-95 group"
              >
                <Play className="mr-2 w-5 h-5 fill-current" />
                Visit YouTube Channel
                <ExternalLink className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          ) : (
            <div className="text-center pt-8">
              <a
                href="https://www.youtube.com/@pmkisanofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="h-14 px-12 inline-flex items-center justify-center rounded-full bg-[#ff0000] text-white font-black transition-all hover:bg-[#cc0000] shadow-lg active:scale-95 group"
              >
                <Play className="mr-2 w-5 h-5 fill-current" />
                Watch More on YouTube
                <ExternalLink className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          )}
        </div>
      </section>


      {/* Farmers' Welfare Portal Section */}
      <section className="space-y-8 pt-12">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚜</span>
          <h2 className="text-3xl font-black text-[#2e6b3b] tracking-tight text-center lg:text-left w-full">
            Farmers&apos; Welfare Schemes
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
                  Fully Online
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleShare}
                className="rounded-full h-12 px-6 border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share This
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-slate-50 p-8 rounded-[32px] border-l-8 border-[#2e7d32]">
                  <p className="text-lg font-medium text-slate-700 leading-relaxed">
                    PM-KISAN is a government scheme offering financial support to small and marginal farmers across India. Under this initiative, eligible farmers receive <strong className="text-[#2e7d32]">₹6,000 annually</strong> in three equal installments directly into their bank accounts. Fully funded by the Government of India, PM-KISAN ensures timely financial aid to strengthen farmers&apos; livelihoods and promote agricultural growth.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#2e7d32]">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-emerald-900">₹6,000 per year</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-600">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-orange-900">3 equal installments</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600">
                      <Landmark className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-blue-900">Direct bank transfer</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-purple-600">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-purple-900">Small & marginal farmers</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-8 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-6 flex-wrap">
                <span className="text-slate-800 font-black text-lg">Rate this:</span>
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
                    Like
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
                    Dislike
                  </Button>
                </div>
                <span className="text-sm font-bold text-slate-400">
                  {likes} people found this helpful
                </span>
              </div>

              <a
                href="https://pmkisan.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-black rounded-full shadow-lg shadow-emerald-200 transition-all hover:scale-105 active:scale-95"
              >
                <span>🌾</span> Visit Official Portal
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
            Farmer e-Services
          </h2>
        </div>
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: "🪪",
                  title: "Complete e-KYC for PM-Kisan",
                  maturity: "Fully Online",
                  maturityColor: "emerald",
                  description:
                    "The e-KYC service is essential for verifying the identity of beneficiaries under the PM-Kisan scheme. Farmers can complete their KYC process online, ensuring they meet eligibility criteria and receive timely disbursements.",
                  link: "https://pmkisan.gov.in/",
                },
                {
                  icon: "🗺️",
                  title: "Check Land Records in Gujarat Online",
                  maturity: "Fully Online",
                  maturityColor: "emerald",
                  description:
                    "Get the Record of Rights (RoR) online for various villages of Gujarat. Provided by the Department of Revenue, Gujarat. Users can get RoR details by selecting district, taluka, village, and survey number.",
                  link: "https://anyror.gujarat.gov.in/",
                },
                {
                  icon: "🔍",
                  title: "Check PM-Kisan Application Status",
                  maturity: "Fully Online",
                  maturityColor: "emerald",
                  description:
                    "This service enables farmers to check the status of their PM-Kisan applications. By entering registration details, applicants can track submissions and verify if they have been approved to receive financial benefits.",
                  link: "https://pmkisan.gov.in/",
                },
                {
                  icon: "🏠",
                  title: "PM Awaas Yojana-Gramin Dashboard",
                  maturity: "Fully Online",
                  maturityColor: "emerald",
                  description:
                    "This digital dashboard enables officials from states and banks to track the performance of PMAY-Gramin. It provides real-time data and performance metrics to monitor implementation of affordable rural housing.",
                  link: "https://pmayg.nic.in/",
                },
                {
                  icon: "🌾",
                  title: "National Food Security Portal",
                  maturity: "Partially Online",
                  maturityColor: "amber",
                  description:
                    "Ensures all people at all times have access to basic food for an active and healthy life. Characterized by availability, access, utilization and stability of food across the country.",
                  link: "https://nfsa.gov.in/",
                },
                {
                  icon: "📝",
                  title: "Register as New Farmer for PM-Kisan",
                  maturity: "Fully Online",
                  maturityColor: "emerald",
                  description:
                    "Farmers may register for the PM-Kisan Samman Nidhi scheme. By providing necessary details, farmers can apply to receive financial support from the government to ensure economic stability and agricultural productivity.",
                  link: "https://pmkisan.gov.in/",
                },
                {
                  icon: "🖥️",
                  title: "Extension Reforms Monitoring System (EMS)",
                  maturity: "Partially Online",
                  maturityColor: "amber",
                  description: "The EMS is a web-enabled online monitoring system for Monthly Progress Reports (MPR) under the ATMA Programme. It monitors the physical and financial progress of all scheme components. States and districts can log in using designated credentials to submit and track reports.",
                  link: "https://extensionreforms.gov.in/"
                },
                {
                  icon: "🌾",
                  title: "Kisaan Knowledge Management System",
                  maturity: "Fully Online",
                  maturityColor: "emerald",
                  description: "The Kisaan Knowledge Management System is an initiative by the Ministry of Agriculture to assist farmers by providing services such as toll-free numbers to contact the Kisaan Call Center, an online forum for agriculture-related discussions, and access to useful farming-specific information such as timely weather updates and the Farmer Portal.",
                  link: "https://mkisan.gov.in/"
                },
                {
                  icon: "👨‍🌾",
                  title: "Pradhan Mantri Kisan Samman Nidhi (PM-Kisan)",
                  maturity: "Fully Online",
                  maturityColor: "emerald",
                  description: "The PM-KISAN scheme aims to supplement the financial needs of Small and Marginal Farmers (SMFs) by providing direct income support of Rs. 6000 per year, transferred in three equal installments of Rs. 2000 each every four months into the Aadhaar-seeded bank accounts of eligible landholding families.",
                  link: "https://pmkisan.gov.in/"
                },
              ].map((service, idx) => (
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
                        {service.title}
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
                        {service.maturity}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed flex-grow mb-6">
                    {service.description}
                  </p>
                  <a
                    href={service.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-2 px-5 py-2.5 bg-[#2e6b3b] hover:bg-[#1b5e20] text-white font-bold text-sm rounded-full transition-all hover:scale-105 w-fit"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> More
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <div className="text-center pt-12">
        <p className="text-sm font-medium text-slate-400">
          * Information based on official PM Kisan YouTube channel and government sources.
        </p>
      </div>
    </div>
  );
}
