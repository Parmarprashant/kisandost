"use client";

import { useState } from "react";
import {
  X,
  UploadCloud,
  Loader2,
  Sprout,
  Plus,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";

const CROPS = [
  "Cotton",
  "Wheat",
  "Rice",
  "Tomato",
  "Onion",
  "Potato",
  "Soybean",
  "Sugarcane",
  "Chilli",
  "Mustard",
  "Groundnut",
  "Maize",
  "Gram (Chana)",
  "Other",
];

const CROP_STAGES = [
  "Seedling",
  "Vegetative",
  "Tillering",
  "Flowering",
  "Fruiting",
  "Bulb Development",
  "Pod Formation",
  "Harvest",
  "Post-Harvest",
];

const POST_TYPES = [
  { value: "Farmer Experience", label: "👨‍🌾 Farmer Experience (Real Field Solution)" },
  { value: "Crop Problem", label: "🚨 Crop Problem (Facing an Issue)" },
  { value: "Ask Farmers", label: "❓ Ask Farmers (Question / Advice Needed)" },
  { value: "Success Story", label: "🏆 Success Story (Harvest or Yield Achievement)" },
  { value: "Prevention Tip", label: "🛡️ Prevention Tip (Best Practices & Precautions)" },
];

const INDIAN_STATES = [
  "Gujarat",
  "Maharashtra",
  "Punjab",
  "Rajasthan",
  "Madhya Pradesh",
  "Uttar Pradesh",
  "Haryana",
  "Karnataka",
  "Telangana",
  "Andhra Pradesh",
  "Tamil Nadu",
  "Bihar",
  "West Bengal",
  "Other",
];

interface ShareExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export default function ShareExperienceModal({
  isOpen,
  onClose,
  onPostCreated,
}: ShareExperienceModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [postType, setPostType] = useState("Farmer Experience");
  const [crop, setCrop] = useState("Cotton");
  const [customCrop, setCustomCrop] = useState("");
  const [cropStage, setCropStage] = useState("Flowering");
  const [state, setState] = useState(user?.district ? "Gujarat" : "Gujarat");
  const [district, setDistrict] = useState(user?.village || "");
  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [symptomsInput, setSymptomsInput] = useState("");
  const [whatIDid, setWhatIDid] = useState("");
  const [result, setResult] = useState("");
  const [precautions, setPrecautions] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file must be under 5MB");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/community/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setImageUrls((prev) => [...prev, data.url]);
        toast.success("Crop photo uploaded successfully");
      } else {
        toast.error(data.error || "Failed to upload image");
      }
    } catch {
      toast.error("Error uploading image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to share your experience with other farmers");
      return;
    }

    const selectedCrop = crop === "Other" ? customCrop.trim() : crop;
    if (!selectedCrop) {
      toast.error("Please select or enter a crop name");
      return;
    }

    if (!title.trim() || !problem.trim()) {
      toast.error("Please provide both a title and describe the problem / experience");
      return;
    }

    if (!district.trim()) {
      toast.error("Please enter your district name");
      return;
    }

    setIsSubmitting(true);

    const symptomsList = symptomsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postType,
          crop: selectedCrop,
          cropStage,
          location: {
            state,
            district: district.trim(),
          },
          title: title.trim(),
          problem: problem.trim(),
          symptoms: symptomsList,
          whatIDid: whatIDid.trim(),
          result: result.trim(),
          precautions: precautions.trim(),
          images: imageUrls,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Your farming experience has been published to the Farmer Network!");
        onPostCreated();
        onClose();
      } else {
        toast.error(data.error || "Failed to create post");
      }
    } catch {
      toast.error("Failed to post experience");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 md:px-8 py-5 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#2e6b3b] flex items-center justify-center text-xl">
              🌾
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Share Your Farming Experience</h3>
              <p className="text-xs text-slate-500 font-medium">
                Help fellow farmers across India learn from your field practices and results.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {/* Post Type Selector */}
          <div className="space-y-2">
            <Label className="font-bold text-slate-800 text-sm">1. Post Type</Label>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              className="w-full h-11 px-4 rounded-2xl bg-slate-50 border border-slate-200 font-medium text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2e6b3b]"
            >
              {POST_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Crop & Crop Stage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold text-slate-800 text-sm">2. Crop</Label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full h-11 px-4 rounded-2xl bg-slate-50 border border-slate-200 font-medium text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2e6b3b]"
              >
                {CROPS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {crop === "Other" && (
                <Input
                  value={customCrop}
                  onChange={(e) => setCustomCrop(e.target.value)}
                  placeholder="Enter crop name (e.g. Mustard, Pomegranate)"
                  className="rounded-2xl mt-2 text-sm"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-800 text-sm">3. Crop Stage</Label>
              <select
                value={cropStage}
                onChange={(e) => setCropStage(e.target.value)}
                className="w-full h-11 px-4 rounded-2xl bg-slate-50 border border-slate-200 font-medium text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2e6b3b]"
              >
                {CROP_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s} Stage
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location: State & District */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold text-slate-800 text-sm">4. State</Label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full h-11 px-4 rounded-2xl bg-slate-50 border border-slate-200 font-medium text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2e6b3b]"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-800 text-sm">5. District</Label>
              <Input
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Rajkot, Yavatmal, Ludhiana"
                className="rounded-2xl h-11 text-sm bg-slate-50 border-slate-200"
                required
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label className="font-bold text-slate-800 text-sm">
              6. Title <span className="text-rose-500">*</span>
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Whitefly problem in my cotton crop during flowering"
              className="rounded-2xl h-11 text-sm bg-slate-50 border-slate-200 font-semibold"
              required
            />
          </div>

          {/* Problem / Question */}
          <div className="space-y-2">
            <Label className="font-bold text-slate-800 text-sm">
              7. Problem / Question Description <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Describe what happened on your farm in detail..."
              rows={3}
              className="rounded-2xl text-sm bg-slate-50 border-slate-200"
              required
            />
          </div>

          {/* Symptoms */}
          <div className="space-y-2">
            <Label className="font-bold text-slate-800 text-sm">
              8. Observed Symptoms (comma-separated)
            </Label>
            <Input
              value={symptomsInput}
              onChange={(e) => setSymptomsInput(e.target.value)}
              placeholder="e.g. Leaf curling, yellow spots, sticky honeydew"
              className="rounded-2xl h-11 text-sm bg-slate-50 border-slate-200"
            />
          </div>

          {/* What I Did */}
          <div className="space-y-2">
            <Label className="font-bold text-slate-800 text-sm">
              9. What I Did (Actions & Treatment Taken)
            </Label>
            <Textarea
              value={whatIDid}
              onChange={(e) => setWhatIDid(e.target.value)}
              placeholder="e.g. Removed affected leaves, installed yellow sticky traps, sprayed neem oil 1500ppm..."
              rows={3}
              className="rounded-2xl text-sm bg-slate-50 border-slate-200"
            />
          </div>

          {/* Result & Precautions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold text-slate-800 text-sm">10. Result</Label>
              <Textarea
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="e.g. Infestation reduced by 80% within 4 days..."
                rows={2}
                className="rounded-2xl text-sm bg-slate-50 border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-800 text-sm">11. Precautions / Lessons Learned</Label>
              <Textarea
                value={precautions}
                onChange={(e) => setPrecautions(e.target.value)}
                placeholder="e.g. Always inspect leaf undersides early in morning..."
                rows={2}
                className="rounded-2xl text-sm bg-slate-50 border-slate-200"
              />
            </div>
          </div>

          {/* Images Upload */}
          <div className="space-y-3">
            <Label className="font-bold text-slate-800 text-sm">12. Crop Images (Optional)</Label>

            {/* Uploaded Images Preview */}
            {imageUrls.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shrink-0">
                    <img src={url} alt="Uploaded preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrls((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4">
              <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 font-bold text-xs transition-colors">
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#2e6b3b]" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 text-[#2e6b3b]" />
                    <span>Add Crop Photo (PNG/JPG)</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-full px-6 border-slate-200 text-slate-600 font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="rounded-full px-8 bg-[#2e6b3b] hover:bg-[#1b5e20] text-white font-black shadow-lg shadow-emerald-200 transition-all hover:scale-105 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <span>🌾</span> Publish to Farmer Network
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
