"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
// import { UserButton, useUser } from "@clerk/nextjs";
import { useAuth } from "@/components/providers/AuthProvider";
import Image from "next/image";
import {
  Leaf,
  Menu,
  X,
  Bell,
  MapPin,
  RefreshCw,
  ExternalLink,
  Sprout,
  Sparkles,
  Users,
  ScanLine,
} from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useWeather, WeatherData } from "@/context/WeatherContext";
import { DualText } from "@/components/ui/DualText";

/** Returns the right translation key based on weather conditions. */
function getTipKey(w: WeatherData): string {
  const temp = Math.round(w.current.temp_c);
  const humidity = w.current.humidity;
  const windKph = w.current.wind_kph;
  const uv = w.current.uv;
  const condition = w.current.condition.text.toLowerCase();
  const isRaining =
    condition.includes("rain") ||
    condition.includes("drizzle") ||
    condition.includes("shower");
  const isStormy = condition.includes("storm") || condition.includes("thunder");
  const isClear = condition.includes("sunny") || condition.includes("clear");
  const isFoggy = condition.includes("fog") || condition.includes("mist");

  if (isStormy) return "storm";
  if (isRaining && windKph > 30) return "heavyRainWind";
  if (isRaining) return "rain";
  if (isFoggy) return "foggy";
  if (temp >= 40) return "extremeHeat";
  if (temp >= 34 && uv >= 8) return "highHeatUV";
  if (temp <= 5) return "frost";
  if (windKph > 40) return "strongWind";
  if (humidity > 85 && !isRaining) return "highHumidity";
  if (isClear && uv >= 6) return "sunnyClear";
  if (isClear) return "clear";
  return "moderate";
}

export function Navbar() {
  const t = useTranslations("Navigation");
  const tTips = useTranslations("WeatherTips");
  const tNav = useTranslations("Navbar");
  const { user, isLoading, logout } = useAuth();
  const isLoaded = !isLoading;
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { weatherData, loading, permissionDenied, lastUpdated, refetch } =
    useWeather();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsWeatherOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: t("ai"), en: "AI Profit", href: "/dashboard/profit-predictor", icon: <Sparkles className="w-5 h-5 text-amber-500" /> },
    { name: t("yieldAi"), en: "Yield AI", href: "/dashboard/yield-predictor", icon: <Sprout className="w-5 h-5 text-emerald-500" /> },
    { name: t("myCrops") || "My Crops", en: "My Crops", href: "/dashboard/my-crops", icon: <Leaf className="w-5 h-5 text-emerald-600" /> },
    { name: t("products"), en: "Products", href: "/products", icon: <Sprout className="w-5 h-5" /> },
    { name: t("communities"), en: "Communities", href: "/communities", icon: <Users className="w-5 h-5" /> },
  ];

  const temp = weatherData ? Math.round(weatherData.current.temp_c) : null;
  const conditionIcon = weatherData
    ? `https:${weatherData.current.condition.icon}`
    : null;

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="relative z-50">
      <header
        className={cn(
          "fixed left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "top-2 mx-4 bg-white/95 backdrop-blur-md shadow-lg h-16 rounded-[2rem] border border-border/50"
            : "top-4 mx-4 bg-white/80 backdrop-blur-sm shadow-sm h-16 rounded-[2rem] border border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg ring-1 ring-[#2e6b3b]/15 transition-transform group-hover:scale-110 overflow-hidden">
            <Image
              src="/kisanDost-logo.png"
              alt="KisanDost"
              width={40}
              height={40}
              priority
              className="w-10 h-10 object-contain"
            />
          </div>
          <span className="text-2xl font-black tracking-tighter text-[#2e6b3b]">
            KisanDost
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200 h-auto",
                  isActive
                    ? "text-[#2e6b3b] bg-[#2e6b3b]/10"
                    : "text-muted-foreground hover:text-[#2e6b3b] hover:bg-[#2e6b3b]/5"
                )}
              >
                {item.icon}
                <DualText native={item.name} english={item.en} />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          <div className="h-8 w-[1px] bg-border mx-1 hidden sm:block" />

          {/* ── Weather Notification Widget ── */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsWeatherOpen((p) => !p)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border transition-all duration-200 h-9",
                weatherData
                  ? "pl-2 pr-3 border-[#2e6b3b]/20 bg-[#2e6b3b]/5 hover:bg-[#2e6b3b]/10"
                  : "px-2.5 border-border bg-muted/50 hover:bg-muted"
              )}
              aria-label="Weather notifications"
            >
              {/* Live weather chip */}
              {weatherData && conditionIcon && (
                <img
                  src={conditionIcon}
                  alt=""
                  className="w-6 h-6 object-contain"
                />
              )}
              {temp !== null ? (
                <span className="text-sm font-bold text-[#2e6b3b]">
                  {temp}°C
                </span>
              ) : null}

              {/* Bell icon with pulse dot */}
              <div className="relative ml-0.5">
                <Bell
                  className={cn(
                    "w-4 h-4 transition-colors",
                    weatherData ? "text-[#2e6b3b]" : "text-muted-foreground"
                  )}
                />
                {weatherData && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500">
                    <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
                  </span>
                )}
                {loading && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
            </button>

            {/* Dropdown popover */}
            {isWeatherOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden z-50">
                {/* Header */}
                <div
                  className={cn(
                    "px-4 pt-4 pb-3",
                    weatherData?.current.is_day === 1
                      ? "bg-gradient-to-br from-green-300 via-emerald-200 to-lime-100"
                      : "bg-gradient-to-br from-green-950 via-emerald-900 to-teal-950"
                  )}
                >
                  {weatherData ? (
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p
                          className={cn(
                            "flex items-center gap-1 text-xs font-semibold",
                            weatherData.current.is_day === 1
                              ? "text-green-900/70"
                              : "text-green-200/70"
                          )}
                        >
                          <MapPin className="w-3 h-3" />
                          {weatherData.location.name}
                          {weatherData.location.region &&
                            `, ${weatherData.location.region}`}
                        </p>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span
                            className={cn(
                              "text-4xl font-extralight tabular-nums",
                              weatherData.current.is_day === 1
                                ? "text-green-900"
                                : "text-white"
                            )}
                          >
                            {Math.round(weatherData.current.temp_c)}
                          </span>
                          <span
                            className={cn(
                              "text-lg font-semibold",
                              weatherData.current.is_day === 1
                                ? "text-green-800/80"
                                : "text-green-200/80"
                            )}
                          >
                            °C
                          </span>
                        </div>
                        <p
                          className={cn(
                            "text-xs capitalize mt-0.5",
                            weatherData.current.is_day === 1
                              ? "text-green-800/80"
                              : "text-green-200/80"
                          )}
                        >
                          {weatherData.current.condition.text}
                        </p>
                      </div>
                      <img
                        src={`https:${weatherData.current.condition.icon}`}
                        alt=""
                        className="w-14 h-14 object-contain drop-shadow-sm"
                      />
                    </div>
                  ) : permissionDenied ? (
                    <div className="py-3 px-1 space-y-2">
                      <p className="text-sm font-bold text-red-700 flex items-center gap-1.5">
                        📍 {tNav("locationBlocked")}
                      </p>
                      <p className="text-xs text-green-900/80 leading-snug">
                        {tNav("locationBlockedDesc")}
                      </p>
                      <ol className="text-xs text-green-900/70 space-y-0.5 list-decimal list-inside leading-snug">
                        <li>{tNav("locationBlockedStep1")}</li>
                        <li>{tNav("locationBlockedStep2")}</li>
                        <li>{tNav("locationBlockedStep3")}</li>
                      </ol>
                      <button
                        onClick={() => { refetch(); }}
                        className="mt-1 w-full text-xs font-bold text-white bg-[#2e6b3b] hover:bg-[#1b4332] rounded-lg py-1.5 transition-colors"
                      >
                        {tNav("retryLocation")}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-3">
                      <RefreshCw className="w-4 h-4 text-green-700 animate-spin" />
                      <span className="text-sm text-green-800">
                        {tNav("detectingLocation")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Farmer Advisory Tip */}
                {weatherData && (
                  <div className="px-4 py-3 border-t border-border bg-[#2e6b3b]/5">
                    <div className="flex items-start gap-2">
                      <Sprout className="w-4 h-4 text-[#2e6b3b] mt-0.5 shrink-0" />
                      <p className="text-xs font-semibold text-[#1b4332] leading-snug">
                        {tTips(getTipKey(weatherData))}
                      </p>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/30">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        refetch();
                        setIsWeatherOpen(false);
                      }}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-[#2e6b3b] transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      {tNav("refresh")}
                    </button>
                    {lastUpdated && (
                      <span className="text-[10px] text-muted-foreground/60">
                        · {tNav("updated")} {formatTime(lastUpdated)}
                      </span>
                    )}
                  </div>
                  <Link
                    href="/weather"
                    onClick={() => setIsWeatherOpen(false)}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#2e6b3b] hover:underline"
                  >
                    {tNav("fullWeather")}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ── User ── */}
          {isLoaded && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">
                  Welcome
                </span>
                <span className="text-sm font-black text-[#2e6b3b]">
                  {user.name}
                </span>
              </div>
              <button
                onClick={logout}
                className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2 rounded-xl transition-colors text-xs"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/auth">
              <Button className="bg-[#2e6b3b] hover:bg-[#1b4332] text-white rounded-full px-6 font-bold text-sm h-10 shadow-lg shadow-green-900/20">
                {tNav("farmerLogin")}
              </Button>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-muted-foreground hover:text-[#2e6b3b]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-7 h-7" />
            ) : (
              <Menu className="w-7 h-7" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-[calc(100%+0.5rem)] left-0 right-0 bg-white border border-border rounded-[2rem] animate-in slide-in-from-top-4 duration-300 p-4 shadow-2xl z-50 overflow-hidden mx-4">
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 p-4 rounded-2xl text-lg font-bold transition-all",
                pathname === "/"
                  ? "text-[#2e6b3b] bg-[#2e6b3b]/10"
                  : "text-muted-foreground hover:bg-[#2e6b3b]/5"
              )}
            >
              <Leaf className="w-5 h-5 text-[#2e6b3b]" />
              {tNav("home")}
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-2xl text-lg font-bold transition-all",
                  pathname === item.href
                    ? "text-[#2e6b3b] bg-[#2e6b3b]/10"
                    : "text-muted-foreground hover:bg-[#2e6b3b]/5"
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}

            {/* Mobile weather summary */}
            {weatherData && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#2e6b3b]/5 border border-[#2e6b3b]/10">
                <img
                  src={`https:${weatherData.current.condition.icon}`}
                  alt=""
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <p className="text-sm font-bold text-[#2e6b3b]">
                    {Math.round(weatherData.current.temp_c)}°C —{" "}
                    {weatherData.current.condition.text}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {weatherData.location.name}, {weatherData.location.country}
                  </p>
                </div>
              </div>
            )}

            {!user && (
              <Link
                href="/auth"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-4 rounded-2xl text-lg font-bold text-[#2e6b3b] bg-[#2e6b3b]/5 border border-[#2e6b3b]/10"
              >
                <Users className="w-5 h-5" />
                {tNav("farmerLogin")}
              </Link>
            )}

            <div className="pt-4 mt-2 border-t border-border flex items-center justify-between px-2">
              <span className="font-bold text-muted-foreground">
                {tNav("selectLanguage")}
              </span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
    </div>
  );
}
