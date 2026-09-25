"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "@/i18n/routing";
import Link from "next/link";
import {
  FileText,
  UserCheck,
  CheckCircle2,
  Clock,
  Camera,
  AlertCircle,
  UploadCloud,
  ChevronRight,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function MyReviewsPage() {
  const { isLoaded, isSignedIn, user } = useAuth();
  const router = useRouter();

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Evidence upload modal state
  const [activeUploadTicketId, setActiveUploadTicketId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [farmerNotes, setFarmerNotes] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/auth");
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchMyTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/expert/tickets");
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets || []);
      } else {
        toast.error(data.error || "Failed to load verification tickets");
      }
    } catch (err: any) {
      toast.error(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchMyTickets();
    }
  }, [isSignedIn]);

  const handleUploadEvidence = async (ticketId: string) => {
    if (!selectedFile) {
      toast.error("Please select a photograph to upload");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("notes", farmerNotes);

      const res = await fetch(`/api/expert/tickets/${ticketId}/evidence`, {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Additional photograph uploaded successfully");
        setActiveUploadTicketId(null);
        setSelectedFile(null);
        setFarmerNotes("");
        await fetchMyTickets();
      } else {
        toast.error(data.error || "Failed to upload photograph");
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCancelTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to cancel this verification request?")) return;

    try {
      const res = await fetch(`/api/expert/tickets/${ticketId}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Cancelled by farmer" }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Verification request cancelled");
        await fetchMyTickets();
      } else {
        toast.error(data.error || "Failed to cancel ticket");
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <FileText className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight">My Expert Verification Requests</h1>
            </div>
            <p className="text-sm text-neutral-400">
              Track status, review agronomic expert decisions, and respond to supplementary photograph requests.
            </p>
          </div>

          <Link href="/dashboard/my-crops">
            <Button variant="outline" className="border-neutral-800 hover:bg-neutral-900 text-xs">
              Back to My Crops
            </Button>
          </Link>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-neutral-400">Loading your verification cases...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-neutral-900/20 border border-neutral-800 rounded-xl space-y-3">
            <CheckCircle2 className="w-10 h-10 text-neutral-600" />
            <h3 className="text-base font-semibold text-neutral-300">No active expert verification requests</h3>
            <p className="text-sm text-neutral-500 max-w-sm text-center">
              When a crop scan is low-confidence or inconclusive, you can request verification directly from your crop scan history.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((t) => (
              <div
                key={t._id}
                className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={t.imageUrl}
                      alt={t.cropName}
                      className="w-20 h-20 rounded-lg object-cover border border-neutral-800"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-neutral-100">{t.cropName}</h3>
                        <Badge
                          className={
                            t.status === "VERIFIED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : t.status === "NEEDS_MORE_EVIDENCE"
                              ? "bg-orange-500/10 text-orange-400 border-orange-500/20 animate-pulse"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }
                        >
                          {t.status === "NEEDS_MORE_EVIDENCE" ? "Action Needed: Photos" : t.status}
                        </Badge>
                      </div>

                      <div className="text-xs text-neutral-400 mt-1">
                        Initial AI Diagnosis:{" "}
                        <span className="font-semibold text-neutral-200">{t.aiPredictedDisease}</span>{" "}
                        ({(t.aiConfidenceScore * 100).toFixed(0)}% confidence)
                      </div>

                      <div className="text-[11px] text-neutral-500 mt-1">
                        Requested on {new Date(t.createdAt).toLocaleDateString()} | Ticket #{t._id.substring(0, 8)}
                      </div>
                    </div>
                  </div>

                  {t.status === "OPEN" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelTicket(t._id)}
                      className="border-neutral-800 text-rose-400 hover:bg-neutral-900 text-xs"
                    >
                      Cancel Request
                    </Button>
                  )}
                </div>

                {/* If NEEDS_MORE_EVIDENCE: Action Box for Farmer */}
                {t.status === "NEEDS_MORE_EVIDENCE" && (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-2 text-orange-400">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider">
                          Expert Requested Supplementary Photographs
                        </h4>
                        <p className="text-xs text-neutral-200 mt-1">
                          {t.evidenceRequest?.requestedEvidence ||
                            "Please provide a clearer close-up photograph of the affected plant area."}
                        </p>
                      </div>
                    </div>

                    {activeUploadTicketId === t._id ? (
                      <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 space-y-3">
                        <div>
                          <label className="text-xs text-neutral-300">Select Image File (JPEG, PNG, WebP):</label>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            className="w-full text-xs text-neutral-400 mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-neutral-300">Notes (Optional):</label>
                          <input
                            type="text"
                            placeholder="e.g. Captured in morning daylight from lower canopy"
                            value={farmerNotes}
                            onChange={(e) => setFarmerNotes(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-1.5 text-xs text-neutral-200 mt-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={uploading || !selectedFile}
                            onClick={() => handleUploadEvidence(t._id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                          >
                            {uploading ? "Uploading..." : "Submit Photograph"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveUploadTicketId(null)}
                            className="border-neutral-800 text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setActiveUploadTicketId(t._id)}
                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs flex items-center gap-1.5"
                      >
                        <Camera className="w-4 h-4" /> Upload Requested Photograph
                      </Button>
                    )}
                  </div>
                )}

                {/* If VERIFIED: Verified Outcome Banner */}
                {t.status === "VERIFIED" && t.completedReviewId && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        Official Agronomic Verification
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-neutral-400">Final Verified Diagnosis:</span>
                        <div className="text-sm font-bold text-neutral-100">
                          {t.completedReviewId.finalDiagnosis}
                        </div>
                      </div>
                      <div>
                        <span className="text-neutral-400">Decision Category:</span>
                        <div className="text-sm font-semibold text-emerald-400">
                          {t.completedReviewId.expertDecision}
                        </div>
                      </div>
                    </div>

                    {t.completedReviewId.expertNotes && (
                      <p className="text-xs text-neutral-300 bg-neutral-950/70 p-2.5 rounded border border-neutral-800">
                        <span className="font-semibold text-neutral-400">Expert Explanation:</span>{" "}
                        {t.completedReviewId.expertNotes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
