"use client";

import { useState, useEffect } from "react";
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from "@/i18n/routing";
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  BookOpen, 
  FlaskConical, 
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface IpmRule {
  _id: string;
  ruleCode: string;
  cropName: string;
  targetThreatName: string;
  threatType: string;
  applicableStages: string[];
  symptoms: string[];
  economicThreshold?: string | null;
  culturalControl: string[];
  biologicalControl: string[];
  chemicalOption?: {
    activeIngredient: string | null;
    formulation: string | null;
    dosage: string | null;
    unit: string | null;
    waitingPeriodDays: number | null;
    safetyPrecaution: string | null;
  } | null;
  source: {
    organization: string;
    title: string;
    page: number;
    publicationDate?: string | null;
    version?: string | null;
  };
  validationStatus: string;
  validationNotes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
}

export default function KnowledgeGovernancePage() {
  const { isLoaded, isSignedIn, user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>("VALIDATION_REQUIRED");
  const [selectedCrop, setSelectedCrop] = useState<string>("all");
  const [rules, setRules] = useState<IpmRule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRule, setSelectedRule] = useState<IpmRule | null>(null);
  const [actionNotes, setActionNotes] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/auth");
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchRules = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/ipm-rules?status=${activeTab}`;
      if (selectedCrop !== "all") {
        url += `&crop=${selectedCrop}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.rules) {
        setRules(data.rules);
        if (data.rules.length > 0) {
          setSelectedRule(data.rules[0]);
        } else {
          setSelectedRule(null);
        }
      } else {
        toast.error(data.error || "Failed to load IPM rules");
      }
    } catch (err: any) {
      toast.error(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchRules();
    }
  }, [activeTab, selectedCrop, isSignedIn]);

  const handleAction = async (action: 'validate' | 'reject' | 'flag_conflict' | 'supersede') => {
    if (!selectedRule) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/ipm-rules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ruleId: selectedRule._id,
          action,
          notes: actionNotes || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || `Action ${action} successful!`);
        setActionNotes("");
        fetchRules();
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch (err: any) {
      toast.error(`Action error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VALIDATED":
        return <Badge className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">VALIDATED (Active)</Badge>;
      case "VALIDATION_REQUIRED":
        return <Badge className="bg-amber-600/20 text-amber-400 border border-amber-500/30">VALIDATION REQUIRED</Badge>;
      case "CONFLICTING_SOURCES":
        return <Badge className="bg-rose-600/20 text-rose-400 border border-rose-500/30">CONFLICTING</Badge>;
      case "SUPERSEDED":
        return <Badge className="bg-slate-600/20 text-slate-400 border border-slate-500/30">SUPERSEDED</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-600/20 text-red-400 border border-red-500/30">REJECTED</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/20 text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Agricultural Knowledge Governance
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Verification & Human Review Console for ICAR, NIPHM & CIB&RC IPM Rules
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchRules}
            disabled={loading}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: "VALIDATION_REQUIRED", label: "Pending Review", icon: Clock },
          { id: "VALIDATED", label: "Validated Rules", icon: CheckCircle },
          { id: "CONFLICTING_SOURCES", label: "Conflicting", icon: AlertTriangle },
          { id: "SUPERSEDED", label: "Superseded", icon: BookOpen },
          { id: "REJECTED", label: "Rejected", icon: XCircle },
          { id: "all", label: "All Rules", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-slate-900/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}

        {/* Crop Filter Dropdown */}
        <div className="ml-auto flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary"
          >
            <option value="all">All Crops</option>
            <option value="Wheat">Wheat</option>
            <option value="Rice">Rice</option>
            <option value="Maize">Maize</option>
            <option value="Mustard">Mustard</option>
            <option value="Chickpea">Chickpea</option>
            <option value="Cotton">Cotton</option>
          </select>
        </div>
      </div>

      {/* Main Grid: List + Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rules Sidebar List */}
        <div className="lg:col-span-4 space-y-3 max-h-[750px] overflow-y-auto pr-1">
          {loading ? (
            <div className="p-8 text-center text-slate-400 bg-slate-900/30 rounded-xl border border-slate-800">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
              Loading agricultural rules...
            </div>
          ) : rules.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-slate-900/20 rounded-xl border border-slate-800/60">
              No rules found for status: <span className="text-slate-400">{activeTab}</span>
            </div>
          ) : (
            rules.map((rule) => {
              const isSelected = selectedRule?._id === rule._id;
              return (
                <div
                  key={rule._id}
                  onClick={() => setSelectedRule(rule)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-800/80 border-primary/50 shadow-md shadow-primary/5"
                      : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-primary font-semibold">{rule.ruleCode}</span>
                    {getStatusBadge(rule.validationStatus)}
                  </div>
                  <h3 className="text-sm font-bold text-white">{rule.targetThreatName}</h3>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    <span className="text-emerald-400 font-medium">{rule.cropName}</span>
                    <span>•</span>
                    <span className="capitalize">{rule.threatType}</span>
                    <span>•</span>
                    <span>Pg {rule.source?.page || 1}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detailed Inspector & Action Panel */}
        <div className="lg:col-span-8 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-6">
          {selectedRule ? (
            <>
              {/* Rule Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">{selectedRule.targetThreatName}</h2>
                    {getStatusBadge(selectedRule.validationStatus)}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Rule Code: {selectedRule.ruleCode} | Crop: <span className="text-emerald-400 font-semibold">{selectedRule.cropName}</span>
                  </p>
                </div>
              </div>

              {/* Source Provenance Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  Source Citation & Provenance
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Document Title:</span>
                    <p className="text-white font-medium">{selectedRule.source?.title}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Issuing Organization:</span>
                    <p className="text-white font-medium">{selectedRule.source?.organization}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Page Reference:</span>
                    <p className="text-amber-400 font-bold">Page {selectedRule.source?.page}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Publication Cutoff:</span>
                    <p className="text-slate-300">{selectedRule.source?.publicationDate || "CIB&RC 2026 Baseline"}</p>
                  </div>
                </div>
              </div>

              {/* Symptoms & Agronomic Thresholds */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase text-slate-400">Biological Symptoms & Economic Threshold (ETL)</h4>
                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div>
                    <span className="text-slate-500">Symptoms:</span>
                    <ul className="list-disc list-inside text-slate-300 mt-1 space-y-1">
                      {selectedRule.symptoms?.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  {selectedRule.economicThreshold && (
                    <div className="pt-2 border-t border-slate-850">
                      <span className="text-slate-500">Economic Threshold Level (ETL):</span>
                      <p className="text-amber-300 font-medium mt-0.5">{selectedRule.economicThreshold}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cultural & Biological Control */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs">
                  <span className="text-emerald-400 font-semibold uppercase">Cultural Controls:</span>
                  <ul className="list-disc list-inside text-slate-300 mt-1.5 space-y-1">
                    {selectedRule.culturalControl?.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs">
                  <span className="text-sky-400 font-semibold uppercase">Biological Controls:</span>
                  <ul className="list-disc list-inside text-slate-300 mt-1.5 space-y-1">
                    {selectedRule.biologicalControl?.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Chemical Option & Safety Metric Gate */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
                  <FlaskConical className="w-4 h-4" />
                  Strict Chemical Action Gate (CIB&RC MUP)
                </div>
                {selectedRule.chemicalOption && selectedRule.chemicalOption.activeIngredient ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-slate-500">Active Ingredient:</span>
                      <p className="text-white font-bold">{selectedRule.chemicalOption.activeIngredient}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Formulation:</span>
                      <p className="text-slate-200">{selectedRule.chemicalOption.formulation || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Dosage:</span>
                      <p className="text-emerald-400 font-medium">
                        {selectedRule.chemicalOption.dosage} {selectedRule.chemicalOption.unit}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Pre-Harvest Interval (PHI):</span>
                      <p className="text-amber-400 font-bold">
                        {selectedRule.chemicalOption.waitingPeriodDays !== null 
                          ? `${selectedRule.chemicalOption.waitingPeriodDays} Days` 
                          : "MISSING (Gate Active)"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No chemical action is recommended. (Strict non-chemical or vascular root pathology).
                  </p>
                )}
              </div>

              {/* Human Review & Governance Actions */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold uppercase text-slate-400">Reviewer Governance Actions</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter audit review notes or conflict justification..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-750 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    disabled={actionLoading || selectedRule.validationStatus === "VALIDATED"}
                    onClick={() => handleAction("validate")}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    Approve / Validate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionLoading || selectedRule.validationStatus === "CONFLICTING_SOURCES"}
                    onClick={() => handleAction("flag_conflict")}
                    className="border-amber-600/50 text-amber-400 hover:bg-amber-950/40 text-xs"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                    Flag Conflict
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionLoading || selectedRule.validationStatus === "SUPERSEDED"}
                    onClick={() => handleAction("supersede")}
                    className="border-slate-700 text-slate-400 hover:bg-slate-800 text-xs"
                  >
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    Mark Superseded
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionLoading || selectedRule.validationStatus === "REJECTED"}
                    onClick={() => handleAction("reject")}
                    className="border-rose-600/50 text-rose-400 hover:bg-rose-950/40 text-xs"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1.5" />
                    Reject Rule
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500">
              Select an agricultural rule from the sidebar to inspect provenance and perform governance actions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
