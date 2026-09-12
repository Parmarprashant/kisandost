"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
// import { useUser, useClerk } from "@clerk/nextjs";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Globe, Sprout, ArrowRight } from "lucide-react";

export default function AuthPage() {
  const t = useTranslations("Index");
  const { user, login, checkSession } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);

  useEffect(() => {
    if (user) {
      setShowLanguageSelect(true);
    }
    
    const urlSuccess = searchParams.get('success');
    if (urlSuccess === 'google_login') {
      checkSession();
    }

    const urlError = searchParams.get('error');
    if (urlError) {
      if (urlError === 'google_auth_failed') setError('Google authentication failed. Please try again.');
      else if (urlError === 'token_exchange_failed') setError('Server configuration error: Token exchange failed. Ensure Google Client ID/Secret are set.');
      else if (urlError === 'profile_fetch_failed') setError('Failed to fetch your Google profile.');
      else if (urlError === 'server_error') setError('An internal server error occurred during authentication.');
      else setError('An unknown authentication error occurred.');
    }
  }, [user, searchParams, checkSession]);

  const clearUrlParams = () => {
    if (typeof window !== 'undefined' && window.location.search) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const handleToggleMode = () => {
    setIsLogin((prev) => !prev);
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
      const payload = isLogin ? { username, password } : { username, password, name, mobile: "", mainCrop: "" };
      
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

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#F7FDF9]">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FFCA28]/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <Card className="border-none shadow-[0_20px_50px_rgba(46,107,59,0.12)] bg-white/80 backdrop-blur-xl rounded-[32px] overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-primary via-[#4CAF50] to-[#FFCA28]" />
          
          <CardHeader className="text-center pt-10 pb-6">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 shadow-inner"
            >
              <Sprout className="w-12 h-12 text-primary" />
            </motion.div>
            
            <CardTitle className="text-4xl font-black text-[#1B4332] tracking-tight mb-2">
              KisanDost
            </CardTitle>
            <CardDescription className="text-base font-medium text-muted-foreground px-4">
              {showLanguageSelect ? "Choose your preferred language to continue" : t("subtitle")}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            <AnimatePresence mode="wait">
              {!showLanguageSelect ? (
                <motion.div
                  key="login-content"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          type="text" 
                          placeholder="Your Name" 
                          value={name} 
                          onChange={(e) => {
                            setName(e.target.value);
                            if (error) setError("");
                          }} 
                          required={!isLogin} 
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        type="text" 
                        placeholder="Enter username" 
                        value={username} 
                        onChange={(e) => {
                          setUsername(e.target.value);
                          if (error) setError("");
                        }} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={password} 
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError("");
                        }} 
                        required 
                      />
                    </div>
                    
                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                    
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#2e6b3b] hover:bg-[#1b4332] text-white font-bold h-12 rounded-xl"
                    >
                      {isLoading ? "Processing..." : (isLogin ? "Sign In" : "Register")}
                    </Button>
                  </form>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white/80 backdrop-blur-xl text-gray-500 font-medium">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 rounded-xl font-bold border-gray-300 hover:bg-gray-50"
                    onClick={() => { window.location.href = '/api/auth/google'; }}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
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
                    Google
                  </Button>
                  
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-500">
                      {isLogin ? "Don't have an account? " : "Already have an account? "}
                      <button 
                        type="button" 
                        onClick={handleToggleMode} 
                        className="text-[#2e6b3b] font-bold underline"
                      >
                        {isLogin ? "Register here" : "Sign in"}
                      </button>
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-6 pt-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                      Secure Login
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                      <Globe className="w-3.5 h-3.5 text-primary" />
                      Free Access
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="language-content"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <Button onClick={() => handleLanguageSelect("en")} variant="outline" className="w-full h-16 justify-between px-6 font-bold text-lg"><span className="flex items-center gap-4"><span className="text-2xl">🇺🇸</span> English</span><ArrowRight className="text-slate-400 w-5 h-5"/></Button>
                  <Button onClick={() => handleLanguageSelect("hi")} variant="outline" className="w-full h-16 justify-between px-6 font-bold text-lg"><span className="flex items-center gap-4"><span className="text-2xl">🇮🇳</span> हिंदी <span className="text-sm text-muted-foreground font-medium ml-2">(Hindi)</span></span><ArrowRight className="text-slate-400 w-5 h-5"/></Button>
                  <Button onClick={() => handleLanguageSelect("gu")} variant="outline" className="w-full h-16 justify-between px-6 font-bold text-lg"><span className="flex items-center gap-4"><span className="text-2xl">🇮🇳</span> ગુજરાતી <span className="text-sm text-muted-foreground font-medium ml-2">(Gujarati)</span></span><ArrowRight className="text-slate-400 w-5 h-5"/></Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-sm font-medium text-muted-foreground/60"
        >
          Designed with ❤️ for the Indian Farmer
        </motion.p>
      </motion.div>
    </div>
  );
}
