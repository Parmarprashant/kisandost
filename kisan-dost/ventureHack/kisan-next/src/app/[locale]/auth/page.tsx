"use client";

import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Sprout, 
  ArrowRight, 
  ArrowLeft,
  Sparkles, 
  ScanEye, 
  TrendingUp, 
  Users, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Phone, 
  CheckCircle2,
  Wheat,
  Check,
  Zap,
  BadgeCheck,
  Activity,
  Layers,
  HelpCircle
} from "lucide-react";

function AuthContent() {
  const t = useTranslations("Index");
  const { user, login, checkSession } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("Cotton");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);

  const POPULAR_CROPS = [
    { id: "Cotton", label: "Cotton", sub: "कपास", icon: "🌿" },
    { id: "Wheat", label: "Wheat", sub: "गेहूं", icon: "🌾" },
    { id: "Rice", label: "Rice", sub: "धान", icon: "🍚" },
    { id: "Groundnut", label: "Groundnut", sub: "मूंगफली", icon: "🥜" },
    { id: "Tomato", label: "Tomato", sub: "टमाटर", icon: "🍅" },
    { id: "Potato", label: "Potato", sub: "आलू", icon: "🥔" },
  ];

  useEffect(() => {
    if (user) {
      setShowLanguageSelect(true);
    }
    
    const urlSuccess = searchParams.get("success");
    if (urlSuccess === "google_login") {
      checkSession();
    }

    const urlError = searchParams.get("error");
    if (urlError) {
      if (urlError === "google_auth_failed") setError("Google authentication failed. Please try again.");
      else if (urlError === "token_exchange_failed") setError("Server configuration error: Token exchange failed. Ensure Google Client ID/Secret are set.");
      else if (urlError === "profile_fetch_failed") setError("Failed to fetch your Google profile.");
      else if (urlError === "server_error") setError("An internal server error occurred during authentication.");
      else setError("An unknown authentication error occurred.");
    }
  }, [user, searchParams, checkSession]);

  const clearUrlParams = () => {
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  };

  const handleToggleMode = (mode: boolean) => {
    setIsLogin(mode);
    setError("");
    clearUrlParams();
  };

  const handleLanguageSelect = (locale: string) => {
    router.replace("/", { locale });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    clearUrlParams();

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin 
        ? { username, password } 
        : { username, password, name, mobile: "", mainCrop: selectedCrop };
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      login(data.user);
      setShowLanguageSelect(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError("");
    clearUrlParams();

    try {
      let res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "demo_farmer", password: "kisanPassword123" }),
      });
      let data = await res.json();

      if (!res.ok) {
        // Automatically create demo account if not exists
        res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "demo_farmer",
            password: "kisanPassword123",
            name: "Ramesh Patel (Demo Farmer)",
            mainCrop: "Cotton",
          }),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || "Demo login failed");
      }

      login(data.user);
      setShowLanguageSelect(true);
    } catch (err: any) {
      setError(err.message || "Failed to log in with demo account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between bg-gradient-to-br from-slate-50 via-[#f4f9f5] to-emerald-50/40 text-slate-800 antialiased overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Subtle Mesh Background Gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-teal-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 w-[36rem] h-[24rem] bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200/80 transition-transform group-hover:scale-105 overflow-hidden">
            <Image
              src="/kisanDost-logo.png"
              alt="KisanDost"
              width={38}
              height={38}
              priority
              className="w-9 h-9 object-contain"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Kisan<span className="text-emerald-600">Dost</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                AgriShield AI
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              भारत का डिजिटल किसान साथी
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="bg-white/80 backdrop-blur-sm rounded-full border border-slate-200 shadow-2xs">
            <LanguageSwitcher />
          </div>
          <Link href="/">
            <Button 
              variant="ghost" 
              size="sm"
              className="rounded-full text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 h-9 px-3.5 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Platform</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-8 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* LEFT SHOWCASE COLUMN: Enterprise Agricultural Trust & Intelligence */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6 lg:space-y-7">
            
            {/* Trust Pill */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md border border-emerald-500/20 px-3.5 py-1.5 rounded-full shadow-2xs"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <span className="text-xs font-semibold text-slate-800">
                ICAR Aligned • <strong className="text-emerald-700 font-bold">50,000+ Active Farmers</strong>
              </span>
            </motion.div>

            {/* Powerful Bilingual Hero Statement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-3"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                खेती में तकनीक, <br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                  खुशहाल और समृद्ध किसान।
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
                Empowering India&apos;s agricultural community with instant AI foliar disease diagnosis, precision micro-climate telemetry, and real-time mandi rate intelligence.
              </p>
            </motion.div>

            {/* Hero Visual Card with High-Tech Telemetry Overlays */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-900 group hidden sm:block"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                <Image
                  src="/images/hero-farming.jpg"
                  alt="Modern Indian Agriculture with Smart Telemetry"
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.92]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              </div>

              {/* Floating Live Telemetry Badge (Top Left) */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-md border border-white/60 flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-[11px] font-bold text-slate-800 leading-none">98.4% AI Accuracy</p>
                  <p className="text-[9px] text-slate-500 font-medium">Ultra-v5 Vision Engine</p>
                </div>
              </div>

              {/* Floating Mandi Pulse (Top Right) */}
              <div className="absolute top-4 right-4 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-md border border-slate-700/60 flex items-center gap-2 text-white">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-[11px] font-bold text-slate-100 leading-none">Mandi Rates Live</p>
                  <p className="text-[9px] text-emerald-300 font-medium">+4.2% Kharif Forecast</p>
                </div>
              </div>

              {/* Bottom Card Footer Details */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-950/70 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/30">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100 text-xs leading-none">AgriShield 360° Real-time Scouting</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Phenology • Weather Radar • Foliar Vision</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>100% Free Forever</span>
                </div>
              </div>
            </motion.div>

            {/* 3 Modern Feature Metric Cards */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition-colors flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 flex items-center justify-center shrink-0">
                  <ScanEye className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">Crop AI Doctor</h4>
                  <p className="text-[11px] text-slate-500 truncate">5-sec leaf disease scan</p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-amber-300 transition-colors flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">Mandi Intel</h4>
                  <p className="text-[11px] text-slate-500 truncate">Max harvest APMC profit</p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-sky-300 transition-colors flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 ring-1 ring-sky-600/20 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">Farmer Network</h4>
                  <p className="text-[11px] text-slate-500 truncate">Peer community advice</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Modern Enterprise Authentication Terminal */}
          <div className="lg:col-span-6 xl:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-[460px]"
            >
              <Card className="border border-slate-200 shadow-xl bg-white rounded-3xl overflow-hidden">
                
                {/* Subtle Brand Accent Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-400" />

                <CardContent className="p-6 sm:p-8">
                  <AnimatePresence mode="wait">
                    {!showLanguageSelect ? (
                      <motion.div
                        key="auth-form-content"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-5"
                      >
                        {/* Title & Subtitle */}
                        <div className="text-center space-y-1">
                          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            {isLogin ? "Welcome Back" : "Create Farmer Account"}
                          </h2>
                          <p className="text-xs font-medium text-slate-500">
                            {isLogin 
                              ? "Sign in to manage your fields, advisories & mandi rates" 
                              : "Register your farm to unlock precision AI disease screening"}
                          </p>
                        </div>

                        {/* Animated Mode Switcher (Sign In vs Register) */}
                        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl relative border border-slate-200/80">
                          <button
                            type="button"
                            onClick={() => handleToggleMode(true)}
                            className={`relative py-2 text-xs font-bold transition-all rounded-lg z-10 ${
                              isLogin ? "text-slate-900 font-extrabold" : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            Sign In
                            {isLogin && (
                              <motion.div
                                layoutId="auth-tab-pill"
                                className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
                                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                              />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleMode(false)}
                            className={`relative py-2 text-xs font-bold transition-all rounded-lg z-10 ${
                              !isLogin ? "text-slate-900 font-extrabold" : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            New Account
                            {!isLogin && (
                              <motion.div
                                layoutId="auth-tab-pill"
                                className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
                                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                              />
                            )}
                          </button>
                        </div>

                        {/* Quick One-Click Demo Access Chip */}
                        <button
                          type="button"
                          onClick={handleDemoLogin}
                          disabled={isLoading}
                          className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-900 font-semibold text-xs flex items-center justify-between transition-all group shadow-2xs hover:shadow-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded-md bg-emerald-600 text-white group-hover:scale-110 transition-transform">
                              <Zap className="w-3.5 h-3.5 fill-current" />
                            </span>
                            <div className="text-left">
                              <span className="font-bold text-emerald-950 block leading-tight">Explore 1-Click Demo</span>
                              <span className="text-[10px] text-emerald-700">Instant test login with pre-configured crops</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                            Instant Access
                          </span>
                        </button>

                        {/* Google OAuth Button */}
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-10 rounded-xl font-semibold border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 shadow-2xs text-xs flex items-center justify-center gap-2.5 transition-all"
                          onClick={() => { window.location.href = "/api/auth/google"; }}
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          <span>Continue with Google</span>
                        </Button>

                        {/* Divider */}
                        <div className="relative my-1">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                          </div>
                          <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <span className="px-3 bg-white">or username / mobile</span>
                          </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 font-medium"
                          >
                            <span className="shrink-0 text-sm">⚠️</span>
                            <span className="leading-snug">{error}</span>
                          </motion.div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-3.5">
                          {!isLogin && (
                            <div className="space-y-1">
                              <Label htmlFor="name" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-slate-500" /> Full Name
                              </Label>
                              <Input
                                id="name"
                                type="text"
                                placeholder="e.g. Ramesh Patel"
                                value={name}
                                onChange={(e) => {
                                  setName(e.target.value);
                                  if (error) setError("");
                                }}
                                required={!isLogin}
                                className="h-10 rounded-xl bg-slate-50/70 border-slate-200 focus:bg-white focus:border-emerald-600 text-xs sm:text-sm font-medium"
                              />
                            </div>
                          )}

                          <div className="space-y-1">
                            <Label htmlFor="username" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-500" /> Mobile Number or Username
                            </Label>
                            <Input
                              id="username"
                              type="text"
                              placeholder="e.g. 9876543210 or kisan_ramesh"
                              value={username}
                              onChange={(e) => {
                                setUsername(e.target.value);
                                if (error) setError("");
                              }}
                              required
                              className="h-10 rounded-xl bg-slate-50/70 border-slate-200 focus:bg-white focus:border-emerald-600 text-xs sm:text-sm font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="password" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-slate-500" /> Password
                              </Label>
                              {isLogin && (
                                <button
                                  type="button"
                                  onClick={() => alert("Please use your registered mobile number or Contact Support to reset your password.")}
                                  className="text-[11px] font-semibold text-emerald-700 hover:underline"
                                >
                                  Forgot?
                                </button>
                              )}
                            </div>
                            <div className="relative">
                              <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => {
                                  setPassword(e.target.value);
                                  if (error) setError("");
                                }}
                                required
                                className="h-10 rounded-xl bg-slate-50/70 border-slate-200 focus:bg-white focus:border-emerald-600 text-xs sm:text-sm font-medium pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {!isLogin && (
                            <div className="space-y-1.5 pt-1">
                              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                <Sprout className="w-3.5 h-3.5 text-emerald-600" /> Primary Crop
                              </Label>
                              <div className="grid grid-cols-3 gap-1.5">
                                {POPULAR_CROPS.map((crop) => (
                                  <button
                                    key={crop.id}
                                    type="button"
                                    onClick={() => setSelectedCrop(crop.id)}
                                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
                                      selectedCrop === crop.id
                                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                    }`}
                                  >
                                    <span className="text-sm">{crop.icon}</span>
                                    <span className="font-bold text-[11px] truncate w-full">{crop.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl shadow-md shadow-emerald-700/15 text-xs sm:text-sm transition-all hover:scale-[1.005] active:scale-[0.99] mt-2"
                          >
                            {isLoading ? (
                              <span className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Authenticating...
                              </span>
                            ) : isLogin ? (
                              <span className="flex items-center gap-1.5">
                                Sign In to KisanDost <ArrowRight className="w-4 h-4" />
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5">
                                Register Farm Account <ArrowRight className="w-4 h-4" />
                              </span>
                            )}
                          </Button>
                        </form>

                        {/* Security Micro Badges */}
                        <div className="pt-2 flex items-center justify-center gap-5 border-t border-slate-100 text-[10px] font-medium text-slate-500">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Govt Aligned
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            100% Free
                          </span>
                          <span className="flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-emerald-600" />
                            256-bit SSL
                          </span>
                        </div>
                      </motion.div>
                    ) : (
                      /* CELEBRATORY LANGUAGE SELECTION SCREEN (Post Login) */
                      <motion.div
                        key="language-celebration-content"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        className="space-y-5 py-2"
                      >
                        <div className="text-center space-y-1.5">
                          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner mb-1">
                            <Sprout className="w-6 h-6" />
                          </div>
                          <h3 className="text-xl font-extrabold text-slate-900">
                            Welcome, {user?.name || "Farmer Friend"}!
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">
                            Choose your preferred language for farm advisories <br />
                            (अपनी पसंदीदा भाषा का चयन करें)
                          </p>
                        </div>

                        <div className="space-y-2.5">
                          {/* English Option */}
                          <button
                            onClick={() => handleLanguageSelect("en")}
                            className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 transition-all text-left flex items-center justify-between group shadow-2xs hover:shadow-xs"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">🇺🇸</span>
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700">
                                  English
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                  Full digital diagnostic & market analytics
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1" />
                          </button>

                          {/* Hindi Option */}
                          <button
                            onClick={() => handleLanguageSelect("hi")}
                            className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 transition-all text-left flex items-center justify-between group shadow-2xs hover:shadow-xs"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">🇮🇳</span>
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700">
                                  हिन्दी <span className="text-xs text-slate-400 font-normal">(Hindi)</span>
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                  फसल रोग निदान, मौसम और मंडी भाव हिंदी में
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1" />
                          </button>

                          {/* Gujarati Option */}
                          <button
                            onClick={() => handleLanguageSelect("gu")}
                            className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 transition-all text-left flex items-center justify-between group shadow-2xs hover:shadow-xs"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">🇮🇳</span>
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700">
                                  ગુજરાતી <span className="text-xs text-slate-400 font-normal">(Gujarati)</span>
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                  રોગ નિયંત્રણ, ખેતી સલાહ અને બજાર ભાવ ગુજરાતીમાં
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1" />
                          </button>

                          {/* Marathi Option */}
                          <button
                            onClick={() => handleLanguageSelect("mr")}
                            className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 transition-all text-left flex items-center justify-between group shadow-2xs hover:shadow-xs"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">🇮🇳</span>
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700">
                                  मराठी <span className="text-xs text-slate-400 font-normal">(Marathi)</span>
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                  शेती सल्ला, हवामान आणि बाजार भाव मराठीत
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* Minimal Bottom Help / Note */}
              <p className="text-center mt-4 text-[11px] font-medium text-slate-400">
                Ministry of Agriculture Guidelines Aligned • 100% Free & Open
              </p>
            </motion.div>
          </div>

        </div>
      </main>

      {/* Footer Minimal Notice */}
      <footer className="relative z-10 w-full text-center py-3 border-t border-slate-200/60 bg-white/60 backdrop-blur-md">
        <p className="text-[11px] font-medium text-slate-500">
          KisanDost © 2026 • AI Driven Agricultural Decision Support System • PM-KISAN Compatible
        </p>
      </footer>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
