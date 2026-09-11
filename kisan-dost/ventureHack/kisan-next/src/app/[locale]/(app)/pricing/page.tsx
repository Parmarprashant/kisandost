"use client";

import { useState } from "react";
import { CheckCircle2, Crown, Sprout, QrCode, MessageSquare, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const DURATIONS = [
  { label: "1 Month", value: 1, price: 65, badge: null },
  { label: "6 Months", value: 6, price: 23, badge: "Save 64%", total: 139 },
  { label: "1 Year", value: 12, price: 17, badge: "Best Value", total: 199 },
];

const features = [
  { icon: <Sprout className="w-5 h-5 text-emerald-600" />, label: "Crop Lifecycle Tracking", desc: "Monitor growth stages from sowing to harvest" },
  { icon: <MessageSquare className="w-5 h-5 text-blue-600" />, label: "Daily SMS Advisories", desc: "Automatic pesticide & fertilizer guidance every morning" },
  { icon: <QrCode className="w-5 h-5 text-indigo-600" />, label: "Pesticide QR Scanner", desc: "Verify product authenticity before you spray" },
  { icon: <ShieldCheck className="w-5 h-5 text-amber-600" />, label: "Priority AI Tools", desc: "AI Profit Predictor & Yield Forecast with no limits" },
];

export default function PricingPage() {
  const [selectedDuration, setSelectedDuration] = useState(DURATIONS[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-emerald-950/20 dark:via-background dark:to-amber-950/10 py-20 px-4">
      <div className="container max-w-4xl mx-auto space-y-14 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="mb-2 bg-amber-100 text-amber-700 border-amber-300 px-4 py-1 text-sm">
            <Crown className="w-3.5 h-3.5 inline mr-1.5" />KisanDost Premium
          </Badge>
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-500 bg-clip-text text-transparent">
            Grow Smarter
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            One subscription unlocks <strong>My Crops</strong>, SMS advisories, the Pesticide QR Scanner, and more.
          </p>
        </div>

        {/* Duration Selector */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Select Plan Duration</p>
          <div className="flex gap-3 flex-wrap justify-center">
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => setSelectedDuration(d)}
                className={`relative px-6 py-3 rounded-2xl border-2 font-semibold transition-all text-sm ${
                  selectedDuration.value === d.value
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-100"
                    : "border-border bg-white hover:border-emerald-300 text-muted-foreground"
                }`}
              >
                {d.badge && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    {d.badge}
                  </span>
                )}
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className="text-xl">Free Plan</CardTitle>
              <p className="text-4xl font-black mt-2">₹0<span className="text-base font-normal text-muted-foreground">/month</span></p>
            </CardHeader>
            <CardContent className="space-y-3">
              {["AI Profit Predictor", "Yield AI Map", "Weather Insights", "Fertilizer Calculator"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{f}</span>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled>Current Plan</Button>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-emerald-500 shadow-xl shadow-emerald-100 dark:shadow-emerald-900/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Premium Plan</CardTitle>
                <Badge className="bg-emerald-600">Most Popular</Badge>
              </div>
              <div className="mt-2 flex items-end gap-2">
                <p className="text-4xl font-black text-emerald-700">₹{(selectedDuration as any).total ?? selectedDuration.price}</p>
                <p className="text-muted-foreground pb-1">
                  {selectedDuration.value === 1 ? "/month" : `for ${selectedDuration.value} months`}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedDuration.value === 1
                  ? "Billed monthly"
                  : `₹${Math.round(((selectedDuration as any).total) / selectedDuration.value)}/month avg · Billed upfront`}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Everything in Free, plus:</p>
              {features.map((f) => (
                <div key={f.label} className="flex items-start gap-3">
                  <div className="mt-0.5">{f.icon}</div>
                  <div>
                    <p className="text-sm font-semibold">{f.label}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2 text-base py-6">
                <Crown className="w-5 h-5" /> Get Premium — ₹{(selectedDuration as any).total ?? selectedDuration.price}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Scanner Note */}
        <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-200 p-5 flex gap-4 items-start">
          <QrCode className="w-8 h-8 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-indigo-800 dark:text-indigo-300">Pesticide Scanner is part of My Crops</p>
            <p className="text-sm text-muted-foreground mt-1">
              Once subscribed, visit <Link href="/dashboard/my-crops" className="font-medium underline text-indigo-600">My Crops</Link> to access the QR code pesticide scanner — no separate navigation needed. Your active plan grants access for the full selected duration.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          * Demo platform — no real payment required. Insert a <code>UserMembership</code> record in MongoDB to simulate access.
        </p>
      </div>
    </div>
  );
}

