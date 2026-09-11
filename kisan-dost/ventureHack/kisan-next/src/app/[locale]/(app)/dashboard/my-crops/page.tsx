"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tractor, Sprout, AlertCircle, Calendar, Lock, Crown, ShieldCheck, MessageSquare, QrCode, RefreshCw, Trash2, BellRing, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { requestNotificationPermission, getFCMToken, saveFCMTokenToBackend, setupForegroundMessageListener } from "@/lib/fcm";

type Crop = {
  _id: string;
  cropType: string;
  plantationDate: string;
  landArea: number;
  location: string;
  phoneNumber: string;
  lastAdvisorySent?: string;
};

type StageData = {
  daysAfterSowing: number;
  currentStage: string;
  currentAdvisory: any | null;
  nextAdvisory: any | null;
};

export default function MyCropsPage() {
  const t = useTranslations("Dashboard");
  const [crops, setCrops] = useState<Crop[]>([]);
  const [stages, setStages] = useState<Record<string, StageData>>({});
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // FCM UI State
  const [fcmEnabled, setFcmEnabled] = useState(false);
  const [isFcmLoading, setIsFcmLoading] = useState(false);
  const [fcmStatusUI, setFcmStatusUI] = useState("");

  useEffect(() => {
    // First, check membership access
    const checkAccess = async () => {
      try {
        const res = await fetch("/api/membership");
        const data = await res.json();
        setHasAccess(data.hasActiveMembership);
      } catch {
        setHasAccess(false);
      }
    };

    const checkFCMStatus = async () => {
      try {
        const res = await fetch("/api/notifications/status");
        if (res.ok) {
          const data = await res.json();
          setFcmEnabled(data.enabled);
        }
      } catch (err) {
        console.error("Failed to check FCM status", err);
      }
    };

    checkAccess();
    checkFCMStatus();

    // Setup foreground listening
    const unsubscribe = setupForegroundMessageListener((payload) => {
      // Optional: also show an in-app toast
      toast.success(payload.notification?.title || "New notification received!");
    });
    
    return () => unsubscribe();
  }, []);

  const handleRefreshAdvisories = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/cron/process-advisories");
      const data = await res.json();
      if (res.ok) {
        toast.success(`Successfully processed advisories. ${data.smsSent} messages sent (simulated).`);
        // Force refresh crop data to show new "Last Notified" badges
        window.location.reload(); 
      } else {
        toast.error("Failed to process advisories.");
      }
    } catch (error) {
      console.error("Manual refresh failed", error);
      toast.error("Internal error occurred during refresh.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEnableNotifications = async () => {
    setIsFcmLoading(true);
    setFcmStatusUI("Requesting permission...");
    try {
      const permRes = await requestNotificationPermission();
      if (!permRes.success) {
        toast.error("Notice: Permission denied. Please enable notifications in your browser settings.");
        setFcmStatusUI("");
        setIsFcmLoading(false);
        return;
      }
      
      setFcmStatusUI("Generating token...");
      const tokenRes = await getFCMToken();
      if (!tokenRes.token) {
        toast.error("Failed to fetch notification token. Make sure you aren't blocking web workers.");
        setFcmStatusUI("");
        setIsFcmLoading(false);
        return;
      }

      setFcmStatusUI("Saving...");
      const saveRes = await saveFCMTokenToBackend(tokenRes.token);
      if (saveRes.success) {
        setFcmEnabled(true);
        toast.success("Advisory notifications successfully enabled!");
      } else {
        toast.error(saveRes.error || "Server error. Could not link notifications.");
      }
      setFcmStatusUI("");
    } catch (err) {
      console.error(err);
      toast.error("Error enabling notifications.");
      setFcmStatusUI("");
    }
    setIsFcmLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/farmer-crops/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`${name} removed successfully.`);
        setCrops(prev => prev.filter(c => c._id !== id));
      } else {
        toast.error("Failed to delete crop.");
      }
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Error deleting crop.");
    }
  };

  useEffect(() => {
    if (hasAccess !== true) { setLoading(false); return; }
    const fetchCrops = async () => {
      try {
        const res = await fetch("/api/farmer-crops");
        const data = await res.json();
        setCrops(data);

        // Fetch stage data for each crop
        const stageMap: Record<string, StageData> = {};
        for (const crop of data) {
          const stageRes = await fetch(`/api/crop-stage?cropType=${crop.cropType}&plantationDate=${crop.plantationDate}`);
          if (stageRes.ok) {
            stageMap[crop._id] = await stageRes.json();
          }
        }
        setStages(stageMap);
      } catch (error) {
        console.error("Failed to fetch crops", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCrops();
  }, [hasAccess]);

  // Non-member detailed feature section
  if (hasAccess === false) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background py-16 px-4 mt-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="container max-w-4xl mx-auto space-y-16">

          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 text-emerald-700 font-semibold text-sm">
              <Crown className="w-4 h-4" /> KisanDost Premium
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Your Complete <span className="text-emerald-600">Crop Assistant</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              My Crops is a powerful premium tool designed to help Indian farmers track their fields, receive expert pesticide guidance automatically, and verify product authenticity — all in one place.
            </p>
          </div>

          {/* Feature Details */}
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: <Sprout className="w-6 h-6 text-emerald-600" />,
                title: "Crop Lifecycle Tracking",
                bg: "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200",
                description: "Register your crops with planting date and land area. The system automatically calculates which growth stage your crop is in today — from seedling to harvest — so you always know what phase your field is in.",
              },
              {
                icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
                title: "Daily SMS Advisory Alerts",
                bg: "bg-blue-50 dark:bg-blue-900/10 border-blue-200",
                description: "Every morning at 6 AM, our system checks the current crop stage and sends you a tailored SMS with the exact pesticide name, dosage calculation for your land size, and the purpose of the spray. No more guessing.",
              },
              {
                icon: <QrCode className="w-6 h-6 text-indigo-600" />,
                title: "Pesticide QR Code Scanner",
                bg: "bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200",
                description: "Counterfeit pesticides are a major problem in rural India. Scan the QR code on any pesticide bottle to instantly verify if it is from a certified manufacturer. Fake products are flagged with a red warning.",
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-amber-600" />,
                title: "Protected AI Tools Access",
                bg: "bg-amber-50 dark:bg-amber-900/10 border-amber-200",
                description: "Premium members also get full priority access to the AI Profit Predictor and Yield Forecast systems, with higher usage limits and real-time market price suggestions for harvesting at the right time.",
              },
            ].map((f) => (
              <Card key={f.title} className={`border ${f.bg} hover:shadow-md transition-shadow`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white dark:bg-background border">{f.icon}</div>
                    <CardTitle className="text-base">{f.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* How It Works */}
          <div className="bg-white dark:bg-muted/10 rounded-3xl border border-border p-8">
            <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              {[
                { step: "1", label: "Subscribe", desc: "Choose a plan and pay securely. Access is activated instantly." },
                { step: "2", label: "Register Crop", desc: "Enter your crop type, plantation date, and farm size." },
                { step: "3", label: "Get Alerts", desc: "Receive automatic SMS advisories every morning." },
                { step: "4", label: "Scan & Verify", desc: "Use the QR scanner to confirm pesticide authenticity." },
              ].map((s) => (
                <div key={s.step} className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black text-lg flex items-center justify-center mx-auto">
                    {s.step}
                  </div>
                  <p className="font-semibold">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4">
            <p className="font-semibold text-lg">Ready to protect and grow your farm?</p>
            <Link href="/pricing">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 gap-2 px-10 text-base py-6 rounded-2xl shadow-lg shadow-emerald-200">
                <Crown className="w-5 h-5" /> View Plans & Subscribe
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground">Choose monthly or long-term plans on the pricing page. Access starts immediately after payment.</p>
          </div>

        </div>
      </div>
    );
  }


  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 space-y-6">
        <h1 className="text-3xl font-extrabold flex items-center mb-8"><Tractor className="w-8 h-8 mr-2 text-primary" /> My Crops</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
              <CardContent><Skeleton className="h-24 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 space-y-8 animate-in mt-20 fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary flex items-center">
            <Tractor className="w-8 h-8 text-emerald-600 mr-2" />
            My Crops
          </h1>
          <p className="text-muted-foreground mt-1">Track growth stages and manage pesticide advisories.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            onClick={fcmEnabled ? undefined : handleEnableNotifications}
            disabled={isFcmLoading || fcmEnabled}
            className={
              fcmEnabled 
                ? "bg-emerald-50/80 text-emerald-700 border-emerald-100 cursor-default hover:bg-emerald-50/80 opacity-100 shadow-sm" 
                : "border-sky-200 text-sky-700 hover:bg-sky-50 bg-white"
            }
          >
            {isFcmLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-sky-600" /> : <BellRing className={`w-4 h-4 mr-2 ${fcmEnabled ? "text-emerald-500" : "text-sky-600"}`} />}
            {fcmEnabled ? "Alerts Enabled" : (fcmStatusUI || "Enable Free Alerts")}
          </Button>

          <Button 
            variant="outline" 
            onClick={handleRefreshAdvisories} 
            disabled={isRefreshing}
            className="border-emerald-200 hover:bg-emerald-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Processing SMS..." : "Refresh Advisories"}
          </Button>
          <Link href="/dashboard/add-crop">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Sprout className="w-4 h-4 mr-2" /> Add New Crop
            </Button>
          </Link>
        </div>
      </div>

      {crops.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 border-2 border-dashed rounded-3xl mx-auto max-w-lg">
          <Tractor className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No crops registered yet</h3>
          <p className="text-muted-foreground mb-6">Register a crop to receive automated SMS advisories.</p>
          <Link href="/dashboard/add-crop">
            <Button variant="outline"><Sprout className="w-4 h-4 mr-2" /> Start Tracking</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((crop) => {
            const stageInfo = stages[crop._id];
            return (
              <Card key={crop._id} className="overflow-hidden hover:shadow-lg transition-shadow border-emerald-100">
                <div className="h-2 w-full bg-emerald-500" />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl capitalize">{crop.cropType}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => handleDelete(crop._id, crop.cropType)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        {crop.landArea} Acres
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Calendar className="w-4 h-4 mr-1" /> Planted {format(new Date(crop.plantationDate), "MMM d, yyyy")}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stageInfo ? (
                    <div className="bg-secondary/40 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center border-b border-border pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Current Stage</span>
                        <span className="font-semibold text-primary">{stageInfo.currentStage}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Age</span>
                        <span className="font-semibold">{stageInfo.daysAfterSowing} Days</span>
                      </div>
                      
                      {stageInfo.nextAdvisory && (
                        <div className="mt-4 pt-3 border-t border-border/50">
                          <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1 text-orange-500" />
                            Next Advisory Target
                          </h4>
                          <p className="text-sm font-medium">{stageInfo.nextAdvisory.purpose}</p>
                          <p className="text-xs text-muted-foreground mt-1">Expected at {stageInfo.nextAdvisory.daysAfterSowingStart} days</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-xl flex items-center justify-center">
                      <Skeleton className="h-6 w-32" />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-muted/10 border-t px-6 py-4 flex flex-col items-center gap-2">
                  <p className="text-xs text-muted-foreground">Location: {crop.location}</p>
                  {crop.lastAdvisorySent ? (
                    <Badge variant="secondary" className="text-[10px] font-normal py-0">
                      Last Notified: {crop.lastAdvisorySent}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] font-normal py-0 opacity-50">
                      No advisory sent yet
                    </Badge>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
