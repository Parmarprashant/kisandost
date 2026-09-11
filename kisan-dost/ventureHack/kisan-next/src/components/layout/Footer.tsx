"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { 
  Leaf, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  ArrowRight,
  Sprout,
  ShieldCheck,
  LifeBuoy
} from "lucide-react";
import { DualText } from "@/components/ui/DualText";

export function Footer() {
  const tNav = useTranslations("Navigation");
  const tFooter = useTranslations("Footer");
  
  const sections = [
    {
      title: tFooter("quickLinks"),
      links: [
        { name: tNav("ai"), en: "AI Profit", href: "/dashboard/profit-predictor" },
        { name: tNav("yieldAi"), en: "Yield AI", href: "/dashboard/yield-predictor" },
        { name: tNav("products"), en: "Marketplace", href: "/products" },
        { name: tNav("communities"), en: "Farmer Community", href: "/communities" },
      ]
    },
    {
      title: tFooter("farmerTools"),
      links: [
        { name: tFooter("weatherUpdates"), en: "Weather Updates", href: "/weather" },
        { name: tFooter("fertilizerCalc"), en: "Fertilizer Calc", href: "/fertilizer-calculator" },
        { name: tFooter("diseaseDetection"), en: "Disease Detection", href: "/diseases" },
      ]
    },
    {
      title: tFooter("support"),
      links: [
        { name: tFooter("helpCenter"), en: "Help Center", href: "#" },
        { name: tFooter("privacyPolicy"), en: "Privacy Policy", href: "#" },
        { name: tFooter("termsOfUse"), en: "Terms of Use", href: "#" },
        { name: tFooter("contactUs"), en: "Contact Us", href: "#" },
      ]
    }
  ];

  return (
    <footer className="bg-gradient-to-b from-white to-[#f4f7f4] border-t border-slate-100 pt-24 pb-12 overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none">
        <Sprout className="w-[500px] h-[500px] text-[#2e6b3b] -rotate-12 -translate-y-20 translate-x-20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-20">
          {/* Brand Identity */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-[#2e6b3b]/10 border border-[#2e6b3b]/10 transition-transform group-hover:scale-110 overflow-hidden">
                <img
                  src="/kisanDost-logo.png"
                  alt="KisanDost Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <span className="text-3xl font-black tracking-tighter text-[#1b4332]">
                KisanDost
              </span>
            </Link>
            
            <p className="text-slate-600 font-medium leading-relaxed max-w-sm text-base">
              {tFooter("description")}
            </p>

            <div className="flex items-center gap-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:bg-[#8bc34a] hover:border-[#8bc34a] hover:text-[#1b4332] hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-10">
            {sections.slice(0, 2).map((section, idx) => (
              <div key={idx} className="space-y-6">
                <h4 className="text-sm font-black text-[#1b4332] uppercase tracking-widest relative inline-block">
                  {section.title}
                  <span className="absolute -bottom-2 left-0 w-8 h-1 bg-[#8bc34a] rounded-full"></span>
                </h4>
                <ul className="space-y-4 pt-2">
                  {section.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link 
                        href={link.href} 
                        className="text-slate-500 hover:text-[#2e6b3b] font-semibold text-base transition-colors flex items-center gap-2 group"
                      >
                        <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 text-[#8bc34a] transition-all" />
                        <DualText native={link.name} english={link.en} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[32px] p-8 shadow-2xl shadow-[#2e6b3b]/5 border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
                <Sprout className="w-32 h-32 text-[#2e6b3b]" />
              </div>
              
              <h4 className="text-xl font-black text-[#1b4332] leading-tight mb-8 flex items-center gap-3">
                <span className="w-2 h-8 bg-[#8bc34a] rounded-full inline-block"></span>
                {tFooter("getInTouch")}
              </h4>
              
              <div className="space-y-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="pt-2">
                    <span className="block font-black text-slate-800">+91 9512628557</span>
                    <span className="text-sm font-medium text-slate-500">{tFooter("workingHours")}</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="pt-2">
                    <span className="block font-black text-slate-800">support@kisandost.com</span>
                    <span className="text-sm font-medium text-slate-500">{tFooter("online247")}</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="pt-2">
                    <span className="block font-black text-slate-800 leading-tight">{tFooter("krishiBhawan")}</span>
                    <span className="text-sm font-medium text-slate-500">{tFooter("newDelhi")}</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-slate-100 flex flex-wrap items-center gap-3 relative z-10">
                <div className="px-4 py-2 bg-emerald-100/50 text-emerald-700 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-200">
                  <ShieldCheck className="w-4 h-4" />
                  {tFooter("verified")}
                </div>
                <div className="px-4 py-2 bg-blue-100/50 text-blue-700 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 border border-blue-200">
                  <LifeBuoy className="w-4 h-4" />
                  {tFooter("supportBadge")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-500 text-sm font-medium">
            © 2026 <span className="font-bold text-[#1b4332]">KisanDost</span>. {tFooter("allRightsReserved")} <span className="text-red-500 animate-pulse inline-block">❤️</span> {tFooter("forIndianFarmers")}
          </p>
          
          <div className="flex items-center gap-6">
            <span className="text-slate-400 text-sm font-bold bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">v1.2.0</span>
            <div className="flex items-center gap-2 bg-emerald-50/50 px-4 py-1.5 rounded-full border border-emerald-100">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
              <span className="text-emerald-800 text-xs font-black uppercase tracking-widest">{tFooter("operational")}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
