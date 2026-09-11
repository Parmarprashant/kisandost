"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ShieldCheck, Lock, Crown, Loader2, QrCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Dynamically import the QR scanner (no SSR - camera requires browser)
const QrScanner = dynamic(() => import("@/components/pesticide/QrScanner"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
    </div>
  ),
});

export default function PesticideScannerPage() {
  const [membershipStatus, setMembershipStatus] = useState<"loading" | "active" | "inactive">("loading");

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await fetch("/api/membership");
        const data = await res.json();
        setMembershipStatus(data.hasActiveMembership ? "active" : "inactive");
      } catch {
        setMembershipStatus("inactive");
      }
    };
    checkAccess();
  }, []);

  if (membershipStatus === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (membershipStatus === "inactive") {
    return (
      <div className="container max-w-lg mx-auto py-20 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="border-2 border-amber-300 bg-amber-50 dark:bg-amber-950/20 shadow-xl text-center">
          <CardHeader className="pb-2">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl text-amber-800 dark:text-amber-300">
              Premium Feature
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The Pesticide QR Scanner is available exclusively for <strong>KisanDost Premium</strong> members.
            </p>
            <ul className="text-sm space-y-2 text-left bg-white dark:bg-amber-900/10 rounded-xl p-4 border border-amber-200">
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Verify pesticide authenticity</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Automated SMS crop advisories</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Full crop lifecycle tracking</li>
            </ul>
            <Link href="/pricing">
              <Button className="w-full bg-amber-600 hover:bg-amber-700 gap-2">
                <Crown className="w-4 h-4" /> Upgrade to Premium
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4 animate-in mt-20 fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
            <QrCode className="w-6 h-6 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">Pesticide Scanner</h1>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold border border-amber-300">PREMIUM</span>
        </div>
        <p className="text-muted-foreground">
          Scan the QR code on your pesticide bottle to verify its authenticity and get dosage instructions.
        </p>
      </div>

      <QrScanner />
    </div>
  );
}
