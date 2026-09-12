"use client";

import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
  Check
} from "lucide-react";

export default function AuthPage() {
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
    { id: "Cotton", label: "Cotton (कपास)", icon: "🌿" },
    { id: "Wheat", label: "Wheat (गेहूं)", icon: "🌾" },
    { id: "Rice", label: "Rice (धान)", icon: "🍚" },
    { id: "Groundnut", label: "Groundnut (मूंगफली)", icon: "🥜" },
    { id: "Tomato", label: "Tomato (टमाटर)", icon: "🍅" },
    { id: "Potato", label: "Potato (आलू)", icon: "🥔" },
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
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden bg-[#F7FDF9]">
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-[#2e6b3b]/10 rounded-full blur-[140px]" />
        <div className="absolute top-[30%] right-[-10%] w-[40%] h-[50%] bg-[#FFCA28]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] bg-[#8bc34a]/15 rounded-full blur-[140px]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-md ring-1 ring-[#2e6b3b]/15 transition-transform group-hover:scale-105 overflow-hidden">
            <Image
              src="/kisanDost-logo.png"
              alt="KisanDost"
              width={44}
              height={44}
              priority
              className="w-11 h-11 object-contain"
            />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-[#2e6b3b] block leading-none">
              KisanDost
            </span>
            <span className="text-[11px] font-bold text-[#8bc34a] tracking-wider uppercase">
              किसान दोस्त
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <Link href="/">
            <Button variant="ghost" className="rounded-full text-xs font-bold text-muted-foreground hover:text-[#2e6b3b] hover:bg-[#2e6b3b]/10 h-9 px-4 flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-8 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* LEFT COLUMN: Rich Agricultural Showcase */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6 lg:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-[#2e6b3b]/10 border border-[#2e6b3b]/20 px-4 py-1.5 rounded-full"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#2e6b3b] animate-ping" />
              <span className="text-xs font-black text-[#2e6b3b] uppercase tracking-wider">
                India&apos;s #1 Digital Farmer Platform
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-3"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1B4332] tracking-tight leading-[1.08]">
                खेती में तकनीक, <br />
                <span className="text-[#2e6b3b] bg-gradient-to-r from-[#2e6b3b] to-[#8bc34a] bg-clip-text text-transparent">
                  खुशहाल किसान।
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 font-medium max-w-xl leading-relaxed">
                Empowering India&apos;s Annadata with instant AI disease diagnosis, mandi price intelligence, and a community of 50,000+ farmers.
              </p>
            </motion.div>

            {/* Visual Hero Showcase Card with Floating Glass Badges */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative rounded-[36px] overflow-hidden shadow-2xl border-4 border-white group hidden sm:block"
            >
              <img
                src="/images/hero-farming.jpg"
                alt="Indian Farmers with Digital Tech"
                className="w-full aspect-[16/9] object-cover group-hover:scale-105 transition-transform duration-1000 brightness-[0.98]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

              {/* Floating Top-Left Badge */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/80 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2e6b3b]" />
                <span className="text-xs font-black text-[#1B4332]">100% Free for Farmers</span>
              </div>

              {/* Floating Bottom-Right Badge */}
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-white/80 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#2e6b3b] flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#1B4332] leading-none">Instant Crop Doctor</p>
                  <p className="text-[10px] font-bold text-slate-500">Scan & cure leaf pests</p>
                </div>
              </div>
            </motion.div>

            {/* 3 Quick Value Feature Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1"
            >
              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-green-900/10 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8bc34a]/15 text-[#2e6b3b] flex items-center justify-center shrink-0">
                  <ScanEye className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#1B4332]">Crop AI Doctor</h4>
                  <p className="text-[10px] text-slate-500 font-bold">5-sec leaf scan</p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-green-900/10 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#1B4332]">Mandi Yield Intel</h4>
                  <p className="text-[10px] text-slate-500 font-bold">Max harvest profit</p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-green-900/10 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#1B4332]">Farmer Network</h4>
                  <p className="text-[10px] text-slate-500 font-bold">50k+ Kisan peers</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: The Interactive Auth Portal Card */}
          <div className="lg:col-span-6 xl:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-[480px]"
            >
              <Card className="border border-green-900/10 shadow-[0_25px_60px_rgba(46,107,59,0.14)] bg-white/95 backdrop-blur-2xl rounded-[36px] overflow-hidden">
                {/* Agricultural Gradient Top Bar */}
                <div className="h-2.5 w-full bg-gradient-to-r from-[#2e6b3b] via-[#8bc34a] to-[#FFCA28]" />

                <CardContent className="p-6 sm:p-8">
                  <AnimatePresence mode="wait">
                    {!showLanguageSelect ? (
                      <motion.div
                        key="auth-form-content"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-5"
                      >
                        {/* Title & Subtitle */}
                        <div className="text-center space-y-1">
                          <h2 className="text-2xl sm:text-3xl font-black text-[#1B4332] tracking-tight">
                            {isLogin ? "Welcome Back!" : "Join KisanDost"}
                          </h2>
                          <p className="text-xs sm:text-sm font-bold text-slate-500">
                            {isLogin ? "लॉगिन करें और अपनी खेती की जानकारी पाएं" : "नया खाता बनाएं और आधुनिक खेती शुरू करें"}
                          </p>
                        </div>

                        {/* Animated Mode Switcher (Sign In vs Register) */}
                        <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl relative border border-slate-200/60">
                          <button
                            type="button"
                            onClick={() => handleToggleMode(true)}
                            className={`relative py-2.5 text-xs sm:text-sm font-black transition-colors rounded-xl z-10 ${
                              isLogin ? "text-[#1B4332]" : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            Sign In (लॉगिन)
                            {isLogin && (
                              <motion.div
                                layoutId="auth-tab-indicator"
                                className="absolute inset-0 bg-white rounded-xl shadow-md -z-10"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                              />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleMode(false)}
                            className={`relative py-2.5 text-xs sm:text-sm font-black transition-colors rounded-xl z-10 ${
                              !isLogin ? "text-[#1B4332]" : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            Register (नया खाता)
                            {!isLogin && (
                              <motion.div
                                layoutId="auth-tab-indicator"
                                className="absolute inset-0 bg-white rounded-xl shadow-md -z-10"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                              />
                            )}
                          </button>
                        </div>

                        {/* Quick One-Click Demo Farmer Login */}
                        <button
                          type="button"
                          onClick={handleDemoLogin}
                          disabled={isLoading}
                          className="w-full py-2.5 px-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-900 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] group shadow-sm"
                        >
                          <Wheat className="w-4 h-4 text-amber-600 transition-transform group-hover:rotate-12" />
                          <span>Quick Demo Farmer Login (एक क्लिक में लॉगिन)</span>
                        </button>

                        {/* Google OAuth Button */}
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-12 rounded-2xl font-bold border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700 shadow-sm flex items-center justify-center gap-3 transition-all"
                          onClick={() => { window.location.href = "/api/auth/google"; }}
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                          <span>Continue with Google (गूगल से लॉगिन करें)</span>
                        </Button>

                        {/* Divider */}
                        <div className="relative my-2">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                          </div>
                          <div className="relative flex justify-center text-[11px] font-black uppercase tracking-wider text-slate-400">
                            <span className="px-3 bg-white">या यूज़रनेम / पासवर्ड से</span>
                          </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 font-bold"
                          >
                            <span className="shrink-0 text-base leading-none">⚠️</span>
                            <span className="leading-snug">{error}</span>
                          </motion.div>
                        )}

                        {/* Credential Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                          {!isLogin && (
                            <div className="space-y-1.5">
                              <Label htmlFor="name" className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-[#2e6b3b]" /> Full Name (पूरा नाम)
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
                                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#2e6b3b] font-medium text-sm"
                              />
                            </div>
                          )}

                          <div className="space-y-1.5">
                            <Label htmlFor="username" className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-[#2e6b3b]" /> Mobile or Username (मोबाइल या यूज़रनेम)
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
                              className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#2e6b3b] font-medium text-sm"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 text-[#2e6b3b]" /> Password (पासवर्ड)
                            </Label>
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
                                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#2e6b3b] font-medium text-sm pr-10"
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
                            <div className="space-y-1.5">
                              <Label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                                <Sprout className="w-3.5 h-3.5 text-[#2e6b3b]" /> Main Crop (मुख्य फसल)
                              </Label>
                              <div className="grid grid-cols-3 gap-1.5 pt-1">
                                {POPULAR_CROPS.map((crop) => (
                                  <button
                                    key={crop.id}
                                    type="button"
                                    onClick={() => setSelectedCrop(crop.id)}
                                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all text-center flex items-center justify-center gap-1 ${
                                      selectedCrop === crop.id
                                        ? "bg-[#2e6b3b] text-white border-[#2e6b3b] shadow-sm"
                                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                    }`}
                                  >
                                    <span>{crop.icon}</span>
                                    <span className="truncate">{crop.id}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#2e6b3b] hover:bg-[#1b4332] text-white font-black h-12 rounded-2xl shadow-lg shadow-green-900/20 text-sm sm:text-base transition-all hover:scale-[1.01] active:scale-[0.99] mt-2"
                          >
                            {isLoading ? (
                              <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processing...
                              </span>
                            ) : isLogin ? (
                              <span className="flex items-center gap-2">
                                Sign In to KisanDost <ArrowRight className="w-4 h-4" />
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                Register as Farmer <ArrowRight className="w-4 h-4" />
                              </span>
                            )}
                          </Button>
                        </form>

                        <div className="pt-2 flex items-center justify-center gap-6 border-t border-slate-100 text-[11px] font-bold text-slate-500">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#2e6b3b]" />
                            Govt Aligned
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2e6b3b]" />
                            Free Lifetime
                          </span>
                          <span className="flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-[#2e6b3b]" />
                            256-bit Secure
                          </span>
                        </div>
                      </motion.div>
                    ) : (
                      /* CELEBRATORY LANGUAGE SELECTION SCREEN */
                      <motion.div
                        key="language-celebration-content"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-6 py-2"
                      >
                        <div className="text-center space-y-2">
                          <div className="w-16 h-16 bg-[#2e6b3b]/10 rounded-3xl flex items-center justify-center mx-auto text-[#2e6b3b] shadow-inner mb-2">
                            <Sprout className="w-9 h-9" />
                          </div>
                          <h3 className="text-2xl font-black text-[#1B4332]">
                            Welcome, {user?.name || "Farmer Friend"}!
                          </h3>
                          <p className="text-xs sm:text-sm font-bold text-slate-500">
                            Choose your preferred farming language <br />
                            (अपनी भाषा का चयन करें)
                          </p>
                        </div>

                        <div className="space-y-3">
                          {/* English Option */}
                          <button
                            onClick={() => handleLanguageSelect("en")}
                            className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-[#2e6b3b] bg-white hover:bg-[#2e6b3b]/5 transition-all text-left flex items-center justify-between group shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-3xl">🇺🇸</span>
                              <div>
                                <h4 className="font-black text-[#1B4332] text-base group-hover:text-[#2e6b3b]">
                                  English
                                </h4>
                                <p className="text-xs font-medium text-slate-500">
                                  Full digital diagnostic & market analytics
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#2e6b3b] transition-transform group-hover:translate-x-1" />
                          </button>

                          {/* Hindi Option */}
                          <button
                            onClick={() => handleLanguageSelect("hi")}
                            className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-[#2e6b3b] bg-white hover:bg-[#2e6b3b]/5 transition-all text-left flex items-center justify-between group shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-3xl">🇮🇳</span>
                              <div>
                                <h4 className="font-black text-[#1B4332] text-base group-hover:text-[#2e6b3b]">
                                  हिन्दी <span className="text-xs font-bold text-slate-400 font-normal">(Hindi)</span>
                                </h4>
                                <p className="text-xs font-medium text-slate-500">
                                  नमस्ते! फसल रोग, मौसम और मंडी भाव हिंदी में
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#2e6b3b] transition-transform group-hover:translate-x-1" />
                          </button>

                          {/* Gujarati Option */}
                          <button
                            onClick={() => handleLanguageSelect("gu")}
                            className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-[#2e6b3b] bg-white hover:bg-[#2e6b3b]/5 transition-all text-left flex items-center justify-between group shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-3xl">🇮🇳</span>
                              <div>
                                <h4 className="font-black text-[#1B4332] text-base group-hover:text-[#2e6b3b]">
                                  ગુજરાતી <span className="text-xs font-bold text-slate-400 font-normal">(Gujarati)</span>
                                </h4>
                                <p className="text-xs font-medium text-slate-500">
                                  કેમ છો! રોગ નિયંત્રણ અને બજાર ભાવ ગુજરાતીમાં
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#2e6b3b] transition-transform group-hover:translate-x-1" />
                          </button>

                          {/* Marathi Option */}
                          <button
                            onClick={() => handleLanguageSelect("mr")}
                            className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-[#2e6b3b] bg-white hover:bg-[#2e6b3b]/5 transition-all text-left flex items-center justify-between group shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-3xl">🇮🇳</span>
                              <div>
                                <h4 className="font-black text-[#1B4332] text-base group-hover:text-[#2e6b3b]">
                                  मराठी <span className="text-xs font-bold text-slate-400 font-normal">(Marathi)</span>
                                </h4>
                                <p className="text-xs font-medium text-slate-500">
                                  नमस्कार! शेती सल्ला, हवामान आणि बाजार भाव मराठीत
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#2e6b3b] transition-transform group-hover:translate-x-1" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              <p className="text-center mt-6 text-xs font-bold text-slate-400">
                Designed with ❤️ for India&apos;s Farmers · 100% Free & Open
              </p>
            </motion.div>
          </div>

        </div>
      </main>

      {/* Footer Minimal Notice */}
      <footer className="relative z-10 w-full text-center py-4 border-t border-slate-200/60 bg-white/40 backdrop-blur-md">
        <p className="text-[11px] font-bold text-slate-500">
          KisanDost © 2026 · Ministry of Agriculture & Farmer Welfare Guidelines Aligned · PM-KISAN Integrated
        </p>
      </footer>
    </div>
  );
}
