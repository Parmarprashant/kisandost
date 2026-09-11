"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { CheckCircle2, XCircle, RotateCcw, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ScanResult =
  | { verified: true; product: any }
  | { verified: false; warning: string; product?: any }
  | null;

export default function QrScanner() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult>(null);

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 280, height: 280 },
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        rememberLastUsedCamera: true,
      },
      false
    );

    scanner.render(
      async (decodedText: string) => {
        scanner.clear().catch(console.error);
        setScanning(false);
        setLoading(true);

        try {
          const res = await fetch("/api/verify-pesticide", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ qrCodeId: decodedText.trim() }),
          });
          const data = await res.json();
          setResult(data);
        } catch (e) {
          setResult({ verified: false, warning: "Failed to verify. Please try again." });
        } finally {
          setLoading(false);
        }
      },
      (error: any) => {
        // Suppress common scanning errors (no QR found yet)
      }
    );

    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [scanning]);

  const handleRescan = () => {
    setResult(null);
    setScanning(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
        <p className="font-medium">Verifying pesticide...</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {result.verified ? (
          <Card className="border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
                ✅ Verified Genuine Product
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-lg font-bold">{result.product?.productName}</span>
                <Badge className="bg-emerald-600">Authentic</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Brand", value: result.product?.brandName },
                  { label: "Manufacturer", value: result.product?.manufacturer },
                  { label: "Type", value: result.product?.pesticideType },
                  { label: "License No.", value: result.product?.licenseNumber },
                  { label: "Dosage", value: result.product?.dosagePerAcre },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-200">
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300">{value}</p>
                  </div>
                ))}
              </div>
              {result.product?.usageInstructions && (
                <div className="bg-white dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-200">
                  <p className="text-xs text-muted-foreground mb-1">Usage Instructions</p>
                  <p className="text-sm">{result.product?.usageInstructions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-red-500 bg-red-50 dark:bg-red-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <XCircle className="w-6 h-6" />
                Authenticity Warning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-red-100 dark:bg-red-900/20 rounded-xl border border-red-300">
                <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 shrink-0" />
                <p className="font-semibold text-red-700 dark:text-red-400">{result.warning}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Please report this product to your local agricultural officer or the pesticide regulatory authority.
              </p>
            </CardContent>
          </Card>
        )}
        <Button onClick={handleRescan} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
          <RotateCcw className="w-4 h-4" /> Scan Another Product
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        id="qr-reader"
        className="w-full rounded-2xl overflow-hidden border-2 border-emerald-300 shadow-lg"
      />
      <p className="text-center text-sm text-muted-foreground">
        Point your camera at the QR code on the pesticide bottle.
      </p>
    </div>
  );
}
