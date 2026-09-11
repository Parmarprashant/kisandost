"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { useState } from "react";
import { 
  ArrowRight, 
  ScanEye, 
  CloudRain, 
  Calculator, 
  ShieldCheck, 
  ChevronRight, 
  Info,
  ExternalLink,
  LocateFixed,
  Sprout,
  Users,
  Trophy,
  Newspaper
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CROPS, CropData, CropDisease, TranslationMap } from "@/data/crops";
import { cn } from "@/lib/utils";

export default function Home() {

  const navT = useTranslations("Navigation");
  const farmT = useTranslations("FarmingFeature");
  const tHero = useTranslations("Hero");
  const tServices = useTranslations("Services");
  const tCropCare = useTranslations("HomeCropCare");
  const tTrust = useTranslations("TrustSection");
  const locale = useLocale();
  const [selectedCrop, setSelectedCrop] = useState<CropData | null>(null);
  const [selectedDisease, setSelectedDisease] = useState<CropDisease | null>(null);

  const services = [
    { 
      title: navT("diseases"), 
      desc: tServices("diseaseDesc"), 
      icon: <ScanEye className="w-8 h-8" />, 
      color: "bg-[#8bc34a]/10 text-[#8bc34a]", 
      link: "/diseases" 
    },
    { 
      title: navT("calculator"), 
      desc: tServices("fertilizerDesc"), 
      icon: <Calculator className="w-8 h-8" />, 
      color: "bg-[#2e6b3b]/10 text-[#2e6b3b]", 
      link: "/fertilizer-calculator" 
    },
    { 
      title: navT("weather"), 
      desc: tServices("weatherDesc"), 
      icon: <CloudRain className="w-8 h-8" />, 
      color: "bg-blue-50 text-blue-600", 
      link: "/weather" 
    },
    { 
      title: tServices("cropSuggestionTitle"), 
      desc: tServices("cropSuggestionDesc"), 
      icon: <LocateFixed className="w-8 h-8" />, 
      color: "bg-purple-50 text-purple-600", 
      link: "/crop-suggestion" 
    },
  ];

  const handleCropSelect = (crop: CropData) => {
    setSelectedCrop(crop);
    setSelectedDisease(crop.diseases[0] || null);
    // Scroll to disease section on mobile
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById("disease-details")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <div className="space-y-32 pb-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-36 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ">
          <div className="space-y-10 animate-in slide-in-from-left duration-1000">
          
            
            <h1 className="text-6xl md:text-8xl font-black text-[#2e6b3b] tracking-tighter leading-[0.85]">
              {tHero("titleLine1")} <br />
              {tHero("titleLine2")} <br />
              <span className="text-[#8bc34a]">{tHero("titleLine3")}</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-xl font-medium leading-relaxed">
              {tHero("subtitle")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <a href="https://docs.google.com/uc?export=download&id=1kyd-79MdIl2IlpW3zFGVh2_V26ZJnqk9" target="_blank" rel="noopener noreferrer" className="hidden md:flex">
                <Button className="h-16 px-10 rounded-2xl bg-[#2e6b3b] hover:bg-[#1b4332] text-white shadow-2xl shadow-green-900/20 text-xl font-bold transition-all hover:scale-105 active:scale-95 group">
                  {tHero("downloadNow")} <ArrowRight className="w-6 h-6 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
              <div className="flex items-center gap-4 px-6 border-l-4 border-orange-400">
               
              </div>
            </div>
          </div>

          <div className="relative animate-in slide-in-from-right duration-1000 mt-12 lg:mt-0">
            <div className="absolute -inset-10 bg-[#8bc34a]/20 rounded-[100px] blur-3xl -z-10 animate-pulse" />
            <img
              src="/images/hero-farming.jpg"
              alt={tHero("indianFarming")}
              className="w-full aspect-[4/3] object-cover rounded-[40px] md:rounded-[60px] shadow-2xl border-4 md:border-8 border-white"
            />
            {/* Overlay Badges */}
            <div className="absolute top-10 -left-10 bg-white p-6 rounded-3xl shadow-2xl border border-border/50 max-w-[200px] hidden md:block">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                  <Sprout className="w-6 h-6" />
                </div>
                <p className="text-sm font-black">{tHero("cropHealth")}</p>
              </div>
              <p className="text-xs text-muted-foreground font-medium">{tHero("cropHealthDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Farming is Important Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content: Image */}
            <div className="relative order-2 lg:order-1">
              <div className="absolute -inset-4 bg-[#8bc34a]/10 rounded-3xl blur-2xl -z-10" />
              <div className="relative rounded-[40px] overflow-hidden shadow-2xl border-4 md:border-8 border-white group">
                <img
                  src="/images/kisan-family.png"
                  alt={tHero("kisanFamily")}
                  className="w-full h-full object-cover aspect-video lg:aspect-square group-hover:scale-105 transition-all duration-1000 contrast-125 saturate-150 brightness-110"
                />
                {/* Stats badge overlay */}
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/50">
                  <p className="text-4xl font-black text-[#2e6b3b]">18%</p>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">{farmT("gdp")}</p>
                </div>
              </div>
            </div>

            {/* Right Content: Text */}
            <div className="space-y-8 order-1 lg:order-2">
              <div className="space-y-4">
                <span className="px-5 py-2 bg-[#8bc34a]/10 text-[#2e6b3b] font-black uppercase tracking-widest text-sm rounded-full inline-block mb-2">{farmT("badge")}</span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1b4332] tracking-tight leading-tight">
                  {farmT("title1")} <br className="hidden md:block" />
                  <span className="text-[#8bc34a]">{farmT("title2")}</span>
                </h2>
                <div className="h-1.5 w-24 bg-orange-400 rounded-full" />
              </div>

              <div className="space-y-6">
                <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
                  {farmT("description")}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6">
                  <div className="flex flex-col gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
                      <Trophy className="w-7 h-7 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="text-xl text-[#1b4332] font-black mb-1">{farmT("pillarTitle")}</h4>
                      <p className="text-base text-muted-foreground font-medium leading-snug">{farmT("pillarDesc")}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                      <Users className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-xl text-[#1b4332] font-black mb-1">{farmT("employmentTitle")}</h4>
                      <p className="text-base text-muted-foreground font-medium leading-snug">{farmT("employmentDesc")}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100">
                  <p className="text-xl text-muted-foreground font-medium leading-relaxed italic border-l-4 border-[#8bc34a] pl-6 py-2">
                    {farmT("quote")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-[#2e6b3b] tracking-tighter uppercase">{tServices("title")}</h2>
          <div className="h-1.5 w-24 bg-orange-400 mx-auto rounded-full" />
          <p className="text-xl text-muted-foreground font-medium">{tServices("subtitle")}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, idx) => (
            <Link key={idx} href={service.link} className="group">
              <div className="h-full bg-white p-10 rounded-[40px] border border-border/50 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:border-[#8bc34a]/30 group-hover:-translate-y-3">
                <div className={cn("w-20 h-20 rounded-3xl mb-8 flex items-center justify-center transition-all duration-500 group-hover:rotate-6 shadow-inner", service.color)}>
                  {service.icon}
                </div>
                <h3 className="text-2xl font-black text-foreground mb-4 leading-tight">{service.title}</h3>
                <p className="text-muted-foreground font-medium mb-8 leading-relaxed italic">&quot;{service.desc}&quot;</p>
                <div className="flex items-center text-[#2e6b3b] font-bold text-sm">
                  {tServices("exploreService")} <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Crop Disease Section - The Interactive Grid */}
       <section className="max-w-7xl mx-auto px-4 space-y-16 py-20">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-5xl md:text-6xl font-black text-[#2e6b3b] tracking-tighter leading-none">{tCropCare("titleLine1")} <br />{tCropCare("titleLine2")}</h2>
            <p className="text-xl text-muted-foreground font-medium">{tCropCare("description")}</p>
          </div>
          <Link href="/diseases">
            <Button variant="outline" className="h-14 px-8 rounded-2xl border-2 border-[#8bc34a] text-[#2e6b3b] font-black hover:bg-[#8bc34a]/10 group">
              {tCropCare("viewAllCrops")} <ExternalLink className="w-5 h-5 ml-2 transition-transform group-hover:scale-110" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Crop Sidebar/Grid */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-4 h-fit">
            {CROPS.map((crop) => (
              <button
                key={crop.id}
                onClick={() => handleCropSelect(crop)}
                className={cn(
                  "relative group aspect-square flex flex-col items-center justify-center p-6 rounded-[32px] border-2 transition-all duration-500 overflow-hidden",
                  selectedCrop?.id === crop.id 
                    ? "bg-[#2e6b3b] border-[#2e6b3b] text-white shadow-2xl scale-105" 
                    : "bg-white border-slate-100 text-foreground hover:border-[#8bc34a]/40 hover:shadow-xl"
                )}
              >
                <div className="absolute inset-0 opacity-10 group-hover:scale-125 transition-transform duration-700">
                  <img src={crop.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="relative z-10 w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg mb-3">
                  <img src={crop.image} alt={crop.id} className="w-full h-full object-cover" />
                </div>
                <span className="relative z-10 font-black tracking-tight text-lg uppercase">{crop.name[locale as "en" | "hi" | "gu"]}</span>
                {selectedCrop?.id === crop.id && (
                  <div className="absolute bottom-2 right-2">
                    <ShieldCheck className="w-6 h-6 text-[#8bc34a]" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Disease Detail Panel */}
          <div 
            id="disease-details" 
            className="lg:col-span-8 bg-white rounded-[60px] p-8 md:p-16 border border-slate-100 shadow-2xl min-h-[600px] flex flex-col relative overflow-hidden"
          >
            {/* Dynamic Background Image */}
            {selectedCrop && (
              <div 
                className="absolute inset-0 z-0 opacity-10 transition-opacity duration-700 pointer-events-none"
                style={{
                  backgroundImage: selectedCrop.id === "maize" 
                    ? "url('/images/bg/maize-bg.png')" 
                    : selectedCrop.id === "cotton" 
                    ? "url('/images/bg/cotton-bg.png')" 
                    : selectedCrop.id === "groundnut" 
                    ? "url('/images/bg/groundnut-bg.png')" 
                    : "none",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            )}

            {selectedCrop ? (
              <div className="relative z-10 space-y-12 animate-in fade-in slide-in-from-right-10 duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                  <div className="space-y-2">
                    <h3 className="text-4xl font-black text-[#2e6b3b] uppercase">{selectedCrop.name[locale as keyof TranslationMap]} {tCropCare("careTitleSuffix")}</h3>
                    <p className="text-muted-foreground font-bold flex items-center gap-2">
                      <LocateFixed className="w-4 h-4 text-[#8bc34a]" /> {tCropCare("bestSeason")}: {selectedCrop.season[locale as keyof TranslationMap]}
                    </p>
                  </div>
                  <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
                    {selectedCrop.diseases.map((d, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedDisease(d)}
                        className={cn(
                          "px-6 py-3 rounded-xl font-black text-sm transition-all",
                          selectedDisease?.name.en === d.name.en 
                            ? "bg-white text-[#2e6b3b] shadow-md" 
                            : "text-muted-foreground hover:text-[#2e6b3b]"
                        )}
                      >
                        {d.name[locale as keyof TranslationMap]}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedDisease && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-10">
                      <div className="p-10 rounded-[40px] bg-amber-50 border border-amber-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                          <Info className="w-32 h-32 text-amber-600" />
                        </div>
                        <h4 className="text-xl font-black text-amber-900 mb-6 flex items-center gap-3">
                          <Info className="w-6 h-6" /> {tCropCare("symptoms")}
                        </h4>
                        <p className="text-lg font-medium text-amber-900/80 leading-relaxed italic">
                          &quot;{selectedDisease.symptoms[locale as keyof TranslationMap]}&quot;
                        </p>
                      </div>

                      <div className="p-10 rounded-[40px] bg-blue-50 border border-blue-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
                          <CloudRain className="w-32 h-32 text-blue-600" />
                        </div>
                        <h4 className="text-xl font-black text-blue-900 mb-6 flex items-center gap-3">
                          <CloudRain className="w-6 h-6" /> {tCropCare("diseaseFavorable")}
                        </h4>
                        <p className="text-lg font-medium text-blue-900/80 leading-relaxed">
                          {selectedDisease.favorableConditions[locale as keyof TranslationMap]}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-10">
                      <div className="p-10 rounded-[40px] bg-[#2e6b3b] text-white shadow-2xl shadow-green-900/40 relative overflow-hidden group">
                        <div className="absolute -bottom-10 -right-10 p-6 opacity-10 group-hover:-translate-x-5 transition-transform duration-1000">
                          <ShieldCheck className="w-48 h-48" />
                        </div>
                        <h4 className="text-xl font-black mb-8 flex items-center gap-3">
                          <ShieldCheck className="w-8 h-8 text-[#8bc34a]" /> {tCropCare("pestControl")}
                        </h4>
                        <div className="space-y-8 relative z-10">
                          <p className="text-2xl font-black leading-tight border-l-4 border-[#8bc34a] pl-6">
                            {selectedDisease.management[locale as keyof TranslationMap]}
                          </p>
                          <div className="space-y-4 pt-4 border-t border-white/20">
                            <p className="text-white/70 text-sm font-bold uppercase tracking-widest">{tCropCare("generalPrecaution")}</p>
                            <p className="text-lg font-medium italic">
                              {selectedCrop.precautions[locale as keyof TranslationMap]}
                            </p>
                          </div>
                        </div>
                        <Button className="mt-12 w-full h-16 bg-[#8bc34a] hover:bg-[#7cb342] text-[#2e6b3b] rounded-2xl font-black text-lg transition-all active:scale-95">
                          {tCropCare("viewStore")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 p-10 border-4 border-dashed border-slate-100 rounded-[50px]">
                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center animate-bounce">
                  <Sprout className="w-16 h-16 text-slate-300" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-slate-400 uppercase">{tCropCare("doctorTitle")}</h3>
                  <p className="text-xl text-slate-400/80 font-bold">{tCropCare("doctorDesc")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-[#2e6b3b] py-24 text-white overflow-hidden relative mb-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
           {/* Lattice pattern could go here */}
        </div>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
          <div className="space-y-4">
            <p className="text-6xl font-black text-[#8bc34a]">20+</p>
            <p className="text-xl font-bold uppercase tracking-tighter">{tTrust("districts")}</p>
          </div>
          <div className="space-y-4">
            <p className="text-6xl font-black text-[#8bc34a]">100%</p>
            <p className="text-xl font-bold uppercase tracking-tighter">{tTrust("safe")}</p>
          </div>
          <div className="space-y-4">
            <p className="text-6xl font-black text-[#8bc34a]">24/7</p>
            <p className="text-xl font-bold uppercase tracking-tighter">{tTrust("satellite")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
