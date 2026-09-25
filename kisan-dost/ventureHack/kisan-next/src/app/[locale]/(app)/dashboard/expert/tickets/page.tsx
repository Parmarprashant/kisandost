"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "@/i18n/routing";
import Link from "next/link";
import {
  UserCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  Search,
  Filter,
  ChevronRight,
  ShieldAlert,
  Camera,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ExpertTicketSummary {
  _id: string;
  status: string;
  priority: string;
  triggerType: string;
  cropName: string;
  aiPredictedDisease: string;
  aiConfidenceScore: number;
  aiScreeningResult?: string | null;
  imageUrl: string;
  requestedReason: string;
  createdAt: string;
  assignedExpertId?: {
    fullName: string;
    institutionName: string;
  } | null;
}

export default function ExpertTicketsPage() {
  const { isLoaded, isSignedIn, user } = useAuth();
  const router = useRouter();

  const [tickets, setTickets] = useState<ExpertTicketSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/auth");
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      let url = "/api/expert/tickets?";
      if (statusFilter !== "all") url += `status=${statusFilter}&`;
      if (priorityFilter !== "all") url += `priority=${priorityFilter}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.tickets) {
        setTickets(data.tickets);
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
      fetchTickets();
    }
  }, [isSignedIn, statusFilter, priorityFilter]);

  const filteredTickets = tickets.filter((t) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.cropName.toLowerCase().includes(query) ||
      t.aiPredictedDisease.toLowerCase().includes(query) ||
      t.requestedReason.toLowerCase().includes(query) ||
      t._id.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Open Case</Badge>;
      case "ASSIGNED":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Assigned</Badge>;
      case "IN_REVIEW":
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">In Review</Badge>;
      case "NEEDS_MORE_EVIDENCE":
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">Awaiting Evidence</Badge>;
      case "VERIFIED":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Verified</Badge>;
      case "CANCELLED":
        return <Badge className="bg-neutral-500/10 text-neutral-400 border-neutral-500/20">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return <span className="inline-flex items-center text-xs font-semibold text-rose-500"><ShieldAlert className="w-3.5 h-3.5 mr-1" /> Critical</span>;
      case "HIGH":
        return <span className="inline-flex items-center text-xs font-semibold text-orange-500"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> High</span>;
      case "MEDIUM":
        return <span className="inline-flex items-center text-xs font-medium text-amber-500">Medium</span>;
      default:
        return <span className="inline-flex items-center text-xs text-neutral-400">Low</span>;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <UserCheck className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight">Expert Verification Portal</h1>
            </div>
            <p className="text-sm text-neutral-400">
              Human-in-the-loop diagnostic review workstation for inconclusive, low-confidence, and escalated cases.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user?.role === "admin" && (
              <Button
                variant="outline"
                className="border-neutral-800 hover:bg-neutral-900"
                onClick={() => router.push("/dashboard/expert-management")}
              >
                Admin Governance
              </Button>
            )}
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={fetchTickets}
            >
              Refresh Queue
            </Button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by crop, predicted disease, or ticket ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="OPEN">Open Cases</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="NEEDS_MORE_EVIDENCE">Awaiting Evidence</option>
              <option value="VERIFIED">Verified</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Priorities</option>
              <option value="CRITICAL">Critical Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Tickets Grid / List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-neutral-400">Loading verification queue...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-neutral-900/20 border border-neutral-800 rounded-xl space-y-3">
            <CheckCircle2 className="w-10 h-10 text-neutral-600" />
            <h3 className="text-base font-semibold text-neutral-300">No verification tickets found</h3>
            <p className="text-sm text-neutral-500 max-w-sm text-center">
              All assigned cases are resolved or no tickets match the active filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTickets.map((t) => (
              <div
                key={t._id}
                className="bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition rounded-xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail & Badges */}
                  <div className="relative h-44 w-full bg-neutral-950">
                    <img
                      src={t.imageUrl}
                      alt={t.cropName}
                      className="w-full h-full object-cover opacity-90 hover:opacity-100 transition"
                    />
                    <div className="absolute top-2 left-2 flex gap-2">
                      {getStatusBadge(t.status)}
                    </div>
                    <div className="absolute top-2 right-2 bg-neutral-950/80 backdrop-blur px-2 py-1 rounded border border-neutral-800">
                      {getPriorityBadge(t.priority)}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                          {t.cropName}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-neutral-100 truncate mt-1">
                        {t.aiPredictedDisease}
                      </h3>
                    </div>

                    <div className="bg-neutral-950/70 p-2.5 rounded-lg border border-neutral-800/80 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">AI Confidence:</span>
                        <span className="font-semibold text-neutral-200">
                          {(t.aiConfidenceScore * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Trigger:</span>
                        <span className="text-neutral-300 font-mono">{t.triggerType}</span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-400 line-clamp-2">
                      {t.requestedReason}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 pt-0">
                  <Link href={`/dashboard/expert/tickets/${t._id}`}>
                    <Button className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 justify-between text-xs">
                      <span>Open Review Workstation</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
