"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
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
  const { user, login } = useAuth();
  const router = useRouter();
  
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
  }, [user]);

  const handleLanguageSelect = (locale: string) => {
    router.replace("/", { locale });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

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
                          onChange={(e) => setName(e.target.value)} 
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
                        onChange={(e) => setUsername(e.target.value)} 
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
                        onChange={(e) => setPassword(e.target.value)} 
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
                  
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-500">
                      {isLogin ? "Don't have an account? " : "Already have an account? "}
                      <button 
                        type="button" 
                        onClick={() => setIsLogin(!isLogin)} 
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
