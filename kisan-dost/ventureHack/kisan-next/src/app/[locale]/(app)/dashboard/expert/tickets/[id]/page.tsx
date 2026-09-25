"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "@/i18n/routing";
import Link from "next/link";
import {
  UserCheck,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  CloudSun,
  ShieldCheck,
  History,
  Camera,
  Layers,
  Sparkles,
  Info,
  Calendar,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ExpertReviewWorkstation() {
  const { id } = useParams() as { id: string };
  const { isLoaded, isSignedIn, user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [ticketData, setTicketData] = useState<any>(null);

  // Review Form state
  const [expertDecision, setExpertDecision] = useState<string>("CONFIRMED_AI");
  const [finalDiagnosis, setFinalDiagnosis] = useState<string>("");
  const [expertNotes, setExpertNotes] = useState<string>("");
  const [reviewedChecklist, setReviewedChecklist] = useState<string[]>([
    "Foliar Lesion Margins",
    "Leaf Discoloration Pattern",
    "Growth Stage Vulnerability",
  ]);

  // Evidence Request state
  const [requestedEvidence, setRequestedEvidence] = useState<string>("");
  const [requestedPlantPart, setRequestedPlantPart] = useState<string>("leaf");
  const [requestedPhotoAngle, setRequestedPhotoAngle] = useState<string>("closeup");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/auth");
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchTicketDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/expert/tickets/${id}`);
      const data = await res.json();
      if (res.ok && data.ticket) {
        setTicketData(data);
        if (data.ticket.status === "ASSIGNED") {
          // Auto-start review
          await fetch(`/api/expert/tickets/${id}/start`, { method: "PATCH" });
        }
      } else {
        toast.error(data.error || "Failed to load ticket details");
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn && id) {
      fetchTicketDetails();
    }
  }, [isSignedIn, id]);

  const handleCheckboxToggle = (item: string) => {
    if (reviewedChecklist.includes(item)) {
      setReviewedChecklist(reviewedChecklist.filter((x) => x !== item));
    } else {
      setReviewedChecklist([...reviewedChecklist, item]);
    }
  };

  const handleSubmitReview = async () => {
    if (expertDecision === "NEEDS_MORE_IMAGES") {
      if (!requestedEvidence.trim()) {
        toast.error("Please specify what additional photographs are required.");
        return;
      }
    } else if (
      (expertDecision === "CORRECTED" || expertDecision === "ALTERNATIVE_DIAGNOSIS") &&
      !finalDiagnosis.trim()
    ) {
      toast.error("Please enter the verified final diagnosis.");
      return;
    }

    if (!expertNotes.trim()) {
      toast.error("Expert clinical notes are mandatory for verification.");
      return;
    }

    setSubmitting(true);
    try {
      let endpoint = `/api/expert/tickets/${id}/review`;
      let payload: any = {
        expertDecision,
        finalDiagnosis:
          expertDecision === "CONFIRMED_AI"
            ? ticketData.scan?.diagnosis?.primaryCondition || ticketData.ticket?.aiPredictedDisease
            : finalDiagnosis,
        expertNotes,
        evidenceReviewed: reviewedChecklist,
      };

      if (expertDecision === "NEEDS_MORE_IMAGES") {
        endpoint = `/api/expert/tickets/${id}/request-evidence`;
        payload = {
          requestedEvidence,
          requestedPlantPart,
          requestedPhotoAngle,
          expertNotes,
        };
      }

      const res = await fetch(endpoint, {
        method: expertDecision === "NEEDS_MORE_IMAGES" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Expert verification submitted successfully");
        await fetchTicketDetails();
      } else {
        toast.error(data.error || "Failed to submit review");
      }
    } catch (err: any) {
      toast.error(`Network error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ticketData) {
    return (
      <div className="min-h-screen bg-neutral-950 p-8 text-neutral-200">
        <p>Ticket not found or access denied.</p>
        <Link href="/dashboard/expert/tickets" className="text-emerald-400 underline mt-4 inline-block">
          Return to Queue
        </Link>
      </div>
    );
  }

  const { ticket, scan, review, weatherObservations, riskEvent, auditLogs } = ticketData;
  const isFinalized = ticket.status === "VERIFIED" || ticket.status === "CANCELLED";

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/expert/tickets">
              <Button variant="outline" size="sm" className="border-neutral-800 hover:bg-neutral-900">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Queue
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">Case #{ticket._id.substring(0, 8)}</h1>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  {ticket.cropName}
                </Badge>
                <Badge className="bg-neutral-800 text-neutral-300">{ticket.status}</Badge>
              </div>
              <p className="text-xs text-neutral-400">
                Trigger: <span className="font-mono text-neutral-300">{ticket.triggerType}</span> | Priority:{" "}
                <span className="font-semibold text-amber-400">{ticket.priority}</span>
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-neutral-400">
            <div>Captured: {new Date(ticket.createdAt).toLocaleString()}</div>
            <div>Farmer ID: <span className="font-mono text-neutral-300">{ticket.farmerId}</span></div>
          </div>
        </div>

        {/* 2-Column Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (5 cols): Diagnostic Image & Environmental Context */}
          <div className="lg:col-span-5 space-y-4">
            {/* Primary Diagnostic Photograph */}
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden p-3 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-400" /> Primary Diagnostic Image
                </span>
                <span className="text-xs text-neutral-500">Angle: {scan?.viewAngle || "screening"}</span>
              </div>
              <div className="rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950 aspect-[4/3] flex items-center justify-center">
                <img
                  src={ticket.imageUrl}
                  alt={ticket.cropName}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Additional Evidence if uploaded */}
            {ticket.evidenceRequest?.additionalImageUrl && (
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden p-3 space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-400" /> Farmer Supplementary Photograph
                  </span>
                  <span className="text-xs text-neutral-500">
                    {ticket.evidenceRequest.fulfilledAt &&
                      new Date(ticket.evidenceRequest.fulfilledAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950 aspect-[4/3] flex items-center justify-center">
                  <img
                    src={ticket.evidenceRequest.additionalImageUrl}
                    alt="Supplementary Evidence"
                    className="w-full h-full object-contain"
                  />
                </div>
                {ticket.evidenceRequest.farmerNotes && (
                  <p className="text-xs text-neutral-300 bg-neutral-950/60 p-2 rounded border border-neutral-800">
                    <span className="font-semibold text-neutral-400">Farmer Notes:</span>{" "}
                    {ticket.evidenceRequest.farmerNotes}
                  </p>
                )}
              </div>
            )}

            {/* Automated AI Result Card */}
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" /> Automated AI Diagnostic Output
              </span>

              <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-neutral-400">Predicted Condition:</span>
                    <h4 className="text-base font-bold text-neutral-100">{ticket.aiPredictedDisease}</h4>
                  </div>
                  <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                    {(ticket.aiConfidenceScore * 100).toFixed(1)}% Score
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-850 text-xs text-neutral-400">
                  <div>
                    Pathogen Type:{" "}
                    <span className="text-neutral-200 capitalize">
                      {scan?.diagnosis?.pathogenType || "other"}
                    </span>
                  </div>
                  <div>
                    Screening Status:{" "}
                    <span className="text-neutral-200">{scan?.screeningResult || "N/A"}</span>
                  </div>
                  <div>
                    Plant Part:{" "}
                    <span className="text-neutral-200 capitalize">
                      {scan?.diagnosis?.affectedPlantPart || "leaf"}
                    </span>
                  </div>
                  <div>
                    Growth Stage:{" "}
                    <span className="text-neutral-200">{scan?.cropStageAtScan || "Vegetative"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather & Environmental Context */}
            {weatherObservations && weatherObservations.length > 0 && (
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <CloudSun className="w-4 h-4 text-amber-400" /> Microclimate & Recent Weather
                </span>
                <div className="space-y-1.5">
                  {weatherObservations.slice(0, 3).map((w: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-neutral-950/80 p-2 rounded border border-neutral-850 text-xs flex justify-between items-center"
                    >
                      <span className="text-neutral-400">
                        {new Date(w.observationDate).toLocaleDateString()}
                      </span>
                      <span className="text-neutral-300 font-mono">
                        {w.metrics?.tempMax ?? w.metrics?.temp_max ?? "--"}°C /{" "}
                        {w.metrics?.tempMin ?? w.metrics?.temp_min ?? "--"}°C | RH:{" "}
                        {w.metrics?.humidityMax ?? w.metrics?.humidity ?? "--"}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (7 cols): Clinical Review & Decision Panel */}
          <div className="lg:col-span-7 space-y-4">
            {/* If Already Verified: Display Verified Output Report */}
            {review ? (
              <div className="bg-neutral-900/80 border border-emerald-500/30 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 border-b border-emerald-500/20 pb-3">
                  <ShieldCheck className="w-6 h-6" />
                  <div>
                    <h3 className="text-lg font-bold text-neutral-100">Human Verification Completed</h3>
                    <p className="text-xs text-neutral-400">
                      Reviewed by {review.expertId?.fullName} ({review.expertId?.institutionName})
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                  <div>
                    <span className="text-xs text-neutral-400">Expert Decision:</span>
                    <div className="text-base font-bold text-emerald-400 mt-0.5">
                      {review.expertDecision}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-400">Final Verified Diagnosis:</span>
                    <div className="text-base font-bold text-neutral-100 mt-0.5">
                      {review.finalDiagnosis}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-neutral-400">Expert Clinical Explanation:</span>
                  <p className="text-xs text-neutral-200 bg-neutral-950 p-3 rounded border border-neutral-800 whitespace-pre-wrap">
                    {review.expertNotes}
                  </p>
                </div>

                <div className="text-xs text-neutral-500">
                  Verified Timestamp: {new Date(review.createdAt).toLocaleString()}
                </div>
              </div>
            ) : (
              /* Review Submission Form */
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 space-y-5">
                <div className="border-b border-neutral-800 pb-3">
                  <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-400" />
                    Expert Diagnostic Evaluation
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Make a traceable human decision over the AI prediction. Original scan results are immutably preserved.
                  </p>
                </div>

                {/* Decision Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-300">Select Clinical Decision:</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      { id: "CONFIRMED_AI", label: "Confirm AI", desc: "AI diagnosis is accurate" },
                      { id: "CORRECTED", label: "Correct Diagnosis", desc: "Override with correct disease" },
                      { id: "ALTERNATIVE_DIAGNOSIS", label: "Alternative Diagnosis", desc: "Differential condition" },
                      { id: "NO_DISEASE", label: "Healthy / No Disease", desc: "No pathogen detected" },
                      { id: "INCONCLUSIVE", label: "Inconclusive", desc: "Unresolvable visual evidence" },
                      { id: "NEEDS_MORE_IMAGES", label: "Request More Images", desc: "Need close-ups/other angles" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setExpertDecision(opt.id)}
                        className={`p-3 rounded-lg border text-left transition ${
                          expertDecision === opt.id
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                            : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                        }`}
                      >
                        <div className="text-xs font-bold">{opt.label}</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Final Diagnosis input if Corrected / Alternative */}
                {(expertDecision === "CORRECTED" || expertDecision === "ALTERNATIVE_DIAGNOSIS") && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">
                      Verified Final Diagnosis <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Wheat Yellow Rust (Puccinia striiformis)"
                      value={finalDiagnosis}
                      onChange={(e) => setFinalDiagnosis(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                {/* Additional Evidence Form if NEEDS_MORE_IMAGES */}
                {expertDecision === "NEEDS_MORE_IMAGES" && (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Camera className="w-4 h-4" /> Specify Evidence Required from Farmer
                    </h4>
                    <div>
                      <label className="text-xs text-neutral-300">Specific Photograph / View Description:</label>
                      <input
                        type="text"
                        placeholder="e.g. Sharp close-up of lower leaf pustules in daylight"
                        value={requestedEvidence}
                        onChange={(e) => setRequestedEvidence(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-neutral-300">Plant Part:</label>
                        <select
                          value={requestedPlantPart}
                          onChange={(e) => setRequestedPlantPart(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 mt-1"
                        >
                          <option value="leaf">Leaf</option>
                          <option value="stem">Stem / Stalk</option>
                          <option value="panicle">Panicle / Earhead</option>
                          <option value="root">Root / Collar</option>
                          <option value="whole_plant">Whole Plant Habit</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-neutral-300">Recommended Angle:</label>
                        <select
                          value={requestedPhotoAngle}
                          onChange={(e) => setRequestedPhotoAngle(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 mt-1"
                        >
                          <option value="closeup">Macro / Close-up</option>
                          <option value="wide">Wide Canopy</option>
                          <option value="side">Side Profile</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Evidence Checklist */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-300">Evidence Reviewed:</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      "Foliar Lesion Margins",
                      "Leaf Discoloration Pattern",
                      "Growth Stage Vulnerability",
                      "Weather Stress Context",
                      "Vein Chlorosis / Necrosis",
                      "Pustule / Spore Aggregation",
                    ].map((item) => (
                      <label
                        key={item}
                        className="flex items-center gap-2 bg-neutral-950 p-2 rounded border border-neutral-850 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={reviewedChecklist.includes(item)}
                          onChange={() => handleCheckboxToggle(item)}
                          className="rounded text-emerald-600 focus:ring-0"
                        />
                        <span className="text-neutral-300 text-[11px]">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Expert Explanation Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Clinical Notes & Diagnostic Explanation <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe diagnostic markers, differential diagnosis considerations, and recommendations..."
                    value={expertNotes}
                    onChange={(e) => setExpertNotes(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5"
                  >
                    {submitting ? "Recording Human Verification..." : "Commit Final Clinical Decision"}
                  </Button>
                </div>
              </div>
            )}

            {/* Audit Trail Log */}
            {auditLogs && auditLogs.length > 0 && (
              <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-4 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-neutral-400" /> Immutable Case Audit Trail
                </span>
                <div className="space-y-2">
                  {auditLogs.map((log: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-neutral-950/70 p-2.5 rounded border border-neutral-850 text-xs flex justify-between items-center"
                    >
                      <div>
                        <span className="font-mono text-emerald-400 font-semibold">{log.action}</span>
                        <span className="text-neutral-500 ml-2">by {log.actor} ({log.actorRole})</span>
                      </div>
                      <span className="text-neutral-500 text-[10px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
