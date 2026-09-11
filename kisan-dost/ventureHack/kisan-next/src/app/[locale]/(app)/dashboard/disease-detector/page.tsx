"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, Camera, CheckCircle2, AlertTriangle, Sprout, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DiseaseDetectorPage() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null); // Reset previous results
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedImage);

    try {
      const res = await fetch("/api/detect-disease", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze image");
      }

      setResult(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-emerald-950 dark:text-emerald-50 mb-3">
          AI Crop Disease Detector
        </h1>
        <p className="text-base sm:text-lg text-emerald-800/70 dark:text-emerald-200/70 max-w-2xl">
          Upload a clear photo of an infected leaf. Our AI model will instantly identify the disease and recommend the best treatment products.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Upload Area */}
        <Card className="border-2 border-emerald-100 shadow-xl shadow-emerald-50 dark:border-emerald-900 dark:shadow-none bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600" />
              Upload Leaf Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`
                relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer
                transition-all duration-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 group
                ${previewUrl ? 'border-emerald-500 bg-emerald-50/50' : 'border-emerald-200 hover:border-emerald-400'}
              `}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                capture="environment" // Suggests camera on mobile
              />
              
              {previewUrl ? (
                <div className="relative w-full aspect-square max-h-64 rounded-xl overflow-hidden shadow-md">
                  <Image src={previewUrl} alt="Leaf preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-medium flex items-center gap-2"><UploadCloud className="w-5 h-5"/> Change Image</p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 py-8">
                  <div className="bg-emerald-100 p-3 sm:p-4 rounded-full inline-block dark:bg-emerald-900/50">
                    <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-semibold text-emerald-900 dark:text-emerald-100">Click or drag & drop</p>
                    <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                </div>
              )}
            </div>

            <Button 
              className="w-full h-12 text-lg font-semibold shadow-lg shadow-emerald-200"
              size="lg"
              onClick={analyzeImage}
              disabled={!selectedImage || isAnalyzing}
            >
              {isAnalyzing ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing Image...</>
              ) : (
                <><Sprout className="w-5 h-5 mr-2" /> Detect Disease</>
              )}
            </Button>

          </CardContent>
        </Card>

        {/* Right Column: Results Area */}
        <div className="space-y-6">
          {!result && !isAnalyzing && (
            <Card className="bg-emerald-50/50 border-emerald-100 border-dashed dark:bg-transparent">
              <CardContent className="flex flex-col items-center justify-center text-center p-12 text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mb-4 text-emerald-200" />
                <p>Upload an image and hit detect to see AI analysis results here.</p>
              </CardContent>
            </Card>
          )}

          {isAnalyzing && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                <div className="space-y-1 text-center">
                  <p className="font-semibold text-lg animate-pulse">Running AI Model</p>
                  <p className="text-sm text-muted-foreground">Extracting features and matching pathogens...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Core Diagnosis Card */}
              <Card className="border-2 border-emerald-500 shadow-xl shadow-emerald-100 relative overflow-hidden">
                <div className={`absolute top-0 right-0 left-0 h-2 ${result.diseaseName === "Healthy Plant" || result.diseaseName === "Healthy Crop" ? "bg-emerald-500" : "bg-red-500"}`} />
                <CardHeader className="pb-4 pt-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Detected Crop</p>
                      <CardTitle className="text-3xl sm:text-5xl font-black text-emerald-950 mb-4">
                        {result.cropName || "Unknown Crop"}
                      </CardTitle>
                      
                      <div className="flex items-center gap-3">
                        <Badge 
                          className={`px-4 py-1.5 text-sm font-bold uppercase tracking-wider ${
                            result.diseaseName === "Healthy Plant" || result.diseaseName === "Healthy Crop" 
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                              : "bg-red-100 text-red-800 border-red-300 animate-pulse"
                          }`}
                          variant="outline"
                        >
                          {result.diseaseName === "Healthy Plant" || result.diseaseName === "Healthy Crop" ? "STATUS: HEALTHY" : "STATUS: INFECTED"}
                        </Badge>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200">
                          {result.confidence}% AI Confidence
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-5 border-t border-border/50">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Diagnosis Details</p>
                    <p className={`text-lg font-medium ${result.diseaseName === "Healthy Plant" || result.diseaseName === "Healthy Crop" ? "text-emerald-700" : "text-red-700"}`}>
                      {result.diseaseName}
                    </p>
                    <p className="text-sm mt-2 text-muted-foreground leading-relaxed">{result.description}</p>
                  </div>
                </CardHeader>
                
                {result.symptoms?.length > 0 && (
                  <CardContent className="pb-4">
                    <p className="font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Symptoms</p>
                    <ul className="space-y-1.5 list-disc pl-5 text-sm text-muted-foreground marker:text-amber-300">
                      {result.symptoms.map((sym: string, i: number) => <li key={i}>{sym}</li>)}
                    </ul>
                  </CardContent>
                )}

                {result.causes?.length > 0 && (
                  <CardContent className="pb-4">
                    <p className="font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-500" /> Causes</p>
                    <ul className="space-y-1.5 list-disc pl-5 text-sm text-muted-foreground marker:text-rose-300">
                      {result.causes.map((cause: string, i: number) => <li key={i}>{cause}</li>)}
                    </ul>
                  </CardContent>
                )}

                {result.precautions?.length > 0 && (
                  <CardContent className="pt-0">
                    <p className="font-semibold mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Precautions</p>
                    <ul className="space-y-1.5 list-disc pl-5 text-sm text-muted-foreground marker:text-emerald-300">
                      {result.precautions.map((pre: string, i: number) => <li key={i}>{pre}</li>)}
                    </ul>
                  </CardContent>
                )}
              </Card>

              {/* Treatment Recommendations */}
              {(result.recommendedPesticides?.length > 0 || result.recommendedFertilizers?.length > 0) && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-emerald-950 flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-emerald-600" /> Recommended Treatment
                  </h3>
                  
                  <div className="grid gap-3">
                    {result.recommendedPesticides?.map((p: any) => (
                      <Card key={p.productId} className="flex justify-between items-center p-3 hover:border-emerald-300 transition-colors">
                        <div>
                          <p className="font-semibold">{p.name}</p>
                          <Badge variant="outline" className="text-xs text-red-600 border-red-200 bg-red-50 mt-1">Pesticide</Badge>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => router.push(`/marketplace/product/${p.productId}`)}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          View Details
                        </Button>
                      </Card>
                    ))}
                    
                    {result.recommendedFertilizers?.map((f: any) => (
                      <Card key={f.productId} className="flex justify-between items-center p-3 hover:border-emerald-300 transition-colors">
                        <div>
                          <p className="font-semibold">{f.name}</p>
                          <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50 mt-1">Fertilizer</Badge>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => router.push(`/marketplace/product/${f.productId}`)}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          View Details
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
