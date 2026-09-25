"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "@/i18n/routing";
import Link from "next/link";
import {
  ShieldCheck,
  UserCheck,
  Building,
  CheckCircle,
  XCircle,
  AlertOctagon,
  Search,
  Filter,
  Users,
  Award,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ExpertManagementPage() {
  const { isLoaded, isSignedIn, user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>("profiles");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [openTickets, setOpenTickets] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Assignment Modal / State
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedExpertId, setSelectedExpertId] = useState<string>("");
  const [assigning, setAssigning] = useState<boolean>(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/auth");
    }
  }, [isLoaded, isSignedIn, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch expert profiles
      const profRes = await fetch("/api/expert/profiles");
      const profData = await profRes.json();
      if (profRes.ok) setProfiles(profData.profiles || []);

      // 2. Fetch open tickets
      const tickRes = await fetch("/api/expert/tickets?status=OPEN");
      const tickData = await tickRes.json();
      if (tickRes.ok) setOpenTickets(tickData.tickets || []);

      // 3. Fetch discovery institutions
      const instRes = await fetch("/api/expert/institutions?limit=25");
      const instData = await instRes.json();
      if (instRes.ok) setInstitutions(instData.institutions || []);
    } catch (err: any) {
      toast.error(`Error loading governance data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      loadData();
    }
  }, [isSignedIn]);

  const handleUpdateStatus = async (profileId: string, status: string) => {
    try {
      const res = await fetch(`/api/expert/profiles/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Expert profile ${status.toLowerCase()} successfully`);
        await loadData();
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleAssignExpert = async () => {
    if (!selectedTicketId || !selectedExpertId) {
      toast.error("Please select both a ticket and an expert.");
      return;
    }
    setAssigning(true);
    try {
      const res = await fetch(`/api/expert/tickets/${selectedTicketId}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expertProfileId: selectedExpertId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Case assigned to expert successfully");
        setSelectedTicketId(null);
        setSelectedExpertId("");
        await loadData();
      } else {
        toast.error(data.error || "Failed to assign expert");
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setAssigning(false);
    }
  };

  const verifiedExperts = profiles.filter((p) => p.verificationStatus === "VERIFIED" && p.isActive);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight">Expert Governance & Dispatch Hub</h1>
            </div>
            <p className="text-sm text-neutral-400">
              Admin & Reviewer console for verifying agronomic experts, dispatching tickets, and reviewing institutional discovery records.
            </p>
          </div>

          <div className="flex gap-2">
            <Link href="/dashboard/expert/tickets">
              <Button variant="outline" className="border-neutral-800 hover:bg-neutral-900 text-xs">
                Review Workstation
              </Button>
            </Link>
            <Button onClick={loadData} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab("profiles")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === "profiles"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Users className="w-4 h-4" /> Expert Credentials ({profiles.length})
          </button>
          <button
            onClick={() => setActiveTab("dispatch")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === "dispatch"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <UserCheck className="w-4 h-4" /> Open Cases & Dispatch ({openTickets.length})
          </button>
          <button
            onClick={() => setActiveTab("discovery")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === "discovery"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Building className="w-4 h-4" /> Institutional Discovery (KVK & ICAR)
          </button>
        </div>

        {/* TAB 1: Expert Profiles */}
        {activeTab === "profiles" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((p) => (
                <div
                  key={p._id}
                  className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-base font-bold text-neutral-100">{p.fullName}</h4>
                        <p className="text-xs text-neutral-400">{p.designation || "Agronomic Specialist"}</p>
                      </div>
                      <Badge
                        className={
                          p.verificationStatus === "VERIFIED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : p.verificationStatus === "SUSPENDED"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }
                      >
                        {p.verificationStatus}
                      </Badge>
                    </div>

                    <div className="text-xs text-neutral-400 mt-2 space-y-1">
                      <div className="flex items-center gap-1.5 text-neutral-300">
                        <Building className="w-3.5 h-3.5 text-neutral-500" />
                        <span className="truncate">{p.institutionName}</span>
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Source: <span className="font-mono text-neutral-400">{p.sourceReference}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.crops?.map((c: string) => (
                          <span key={c} className="bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] text-neutral-300">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Admin Actions */}
                  {user?.role === "admin" && (
                    <div className="pt-3 border-t border-neutral-800 flex gap-2">
                      {p.verificationStatus !== "VERIFIED" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(p._id, "VERIFIED")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex-1"
                        >
                          Verify & Approve
                        </Button>
                      )}
                      {p.verificationStatus === "VERIFIED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(p._id, "SUSPENDED")}
                          className="border-neutral-800 text-rose-400 hover:bg-neutral-900 text-xs flex-1"
                        >
                          Suspend
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Open Cases & Dispatch */}
        {activeTab === "dispatch" && (
          <div className="space-y-4">
            {openTickets.length === 0 ? (
              <div className="p-12 text-center bg-neutral-900/30 rounded-xl border border-neutral-800">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="font-semibold text-neutral-200">No Open Tickets Waiting for Dispatch</h3>
                <p className="text-xs text-neutral-500">All expert verification cases have been assigned.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {openTickets.map((t) => (
                  <div
                    key={t._id}
                    className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={t.imageUrl}
                        alt={t.cropName}
                        className="w-16 h-16 rounded-lg object-cover border border-neutral-800"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-neutral-100">{t.cropName}</span>
                          <span className="text-xs text-neutral-400">({t.aiPredictedDisease})</span>
                          <Badge className="bg-amber-500/10 text-amber-400 text-[10px]">
                            {(t.aiConfidenceScore * 100).toFixed(0)}% AI Score
                          </Badge>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{t.requestedReason}</p>
                        <div className="text-[11px] text-neutral-500 mt-1">
                          Farmer ID: {t.farmerId} | Case ID: {t._id}
                        </div>
                      </div>
                    </div>

                    {/* Dispatch Form */}
                    <div className="flex items-center gap-2">
                      <select
                        onChange={(e) => {
                          setSelectedTicketId(t._id);
                          setSelectedExpertId(e.target.value);
                        }}
                        className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200"
                      >
                        <option value="">Select Verified Expert...</option>
                        {verifiedExperts.map((exp) => (
                          <option key={exp._id} value={exp._id}>
                            {exp.fullName} ({exp.institutionName})
                          </option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        disabled={assigning || selectedTicketId !== t._id || !selectedExpertId}
                        onClick={handleAssignExpert}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                      >
                        Assign Case
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Institutional Discovery Catalog */}
        {activeTab === "discovery" && (
          <div className="space-y-4">
            <p className="text-xs text-neutral-400">
              Discovery catalog extracted from <span className="font-mono text-emerald-400">phase-9-data/KVK.txt</span> and <span className="font-mono text-emerald-400">ICAR-Telephone-Directory-2026-1.pdf</span>. Note: Institutional entries are discovery sources, NOT automatically verified platform experts.
            </p>

            <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th className="p-3">Institution Name</th>
                    <th className="p-3">State / District</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Host Organization</th>
                    <th className="p-3">Source Provenance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850">
                  {institutions.map((inst, idx) => (
                    <tr key={idx} className="hover:bg-neutral-850/50">
                      <td className="p-3 font-semibold text-neutral-200">{inst.name}</td>
                      <td className="p-3 text-neutral-300">{inst.state} / {inst.district}</td>
                      <td className="p-3">
                        <Badge className="bg-neutral-800 text-neutral-300 text-[10px]">
                          {inst.institutionType}
                        </Badge>
                      </td>
                      <td className="p-3 text-neutral-400">{inst.hostOrganization || "--"}</td>
                      <td className="p-3 font-mono text-[10px] text-neutral-500">{inst.sourceLocation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
