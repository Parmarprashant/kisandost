"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ExternalLink,
  CheckCircle2,
  ChevronDown,
  Landmark,
  Loader2,
  FileText,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GovScheme } from "@/lib/schemes/governmentSchemes";

interface CategoryOption {
  id: string;
  label: string;
  icon: string;
}

const INITIAL_VISIBLE = 6;

export default function GovernmentSchemes() {
  const tComm = useTranslations("Communities");

  const [schemes, setSchemes] = useState<GovScheme[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch("/api/schemes");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setSchemes(data.schemes ?? []);
        setCategories(data.categories ?? []);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filtering stays client-side so typing and category switches feel instant.
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return schemes.filter((s) => {
      const matchesCategory =
        activeCategory === "all" || s.category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.shortName.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.ministry.toLowerCase().includes(q)
      );
    });
  }, [schemes, query, activeCategory]);

  const visible = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE);

  return (
    <section className="space-y-8 pt-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🏛️</span>
        <h2 className="text-3xl font-black text-[#2e6b3b] tracking-tight">
          {tComm("govSchemesTitle")}
        </h2>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden">
        <div className="p-8 md:p-12 space-y-8">
          <p className="text-lg font-medium text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-3xl border-l-[6px] border-[#2e6b3b]">
            {tComm("govSchemesIntro")}
          </p>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowAll(false);
              }}
              placeholder={tComm("govSchemesSearch")}
              aria-label={tComm("govSchemesSearch")}
              className="w-full h-14 pl-14 pr-6 rounded-full border-2 border-slate-100 bg-slate-50 text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#2e6b3b] focus:bg-white transition-colors"
            />
          </div>

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setShowAll(false);
                }}
                className={cn(
                  "px-5 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95",
                  activeCategory === "all"
                    ? "bg-[#2e6b3b] text-white shadow-lg"
                    : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                )}
              >
                {tComm("govSchemesAll")}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setShowAll(false);
                  }}
                  className={cn(
                    "px-5 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95 inline-flex items-center gap-2",
                    activeCategory === cat.id
                      ? "bg-[#2e6b3b] text-white shadow-lg"
                      : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                  )}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* States */}
          {loading && (
            <div className="flex items-center justify-center gap-3 py-16 text-slate-400 font-bold">
              <Loader2 className="w-6 h-6 animate-spin" />
              {tComm("govSchemesLoading")}
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-16 space-y-2">
              <p className="text-lg font-black text-slate-700">
                {tComm("govSchemesError")}
              </p>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-16 space-y-2">
              <span className="text-5xl">🔍</span>
              <p className="text-lg font-black text-slate-700 pt-3">
                {tComm("govSchemesEmpty")}
              </p>
            </div>
          )}

          {/* Scheme cards */}
          {!loading && !error && filtered.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visible.map((scheme) => {
                  const isOpen = expanded === scheme.id;
                  return (
                    <div
                      key={scheme.id}
                      className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col h-full"
                    >
                      <div className="flex items-start gap-4 mb-5">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shrink-0">
                          {scheme.icon}
                        </div>
                        <div className="flex flex-col gap-1.5 min-w-0">
                          <h3 className="text-lg font-black text-slate-800 leading-tight">
                            {scheme.shortName}
                          </h3>
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full w-fit bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <BadgeCheck className="w-3 h-3" />
                            {tComm("govSchemesCentral")}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm font-bold text-slate-700 leading-snug mb-2">
                        {scheme.name}
                      </p>

                      <p className="text-slate-500 font-medium text-sm leading-relaxed mb-4">
                        {scheme.description}
                      </p>

                      <div className="flex items-center gap-2 text-slate-400 font-bold text-xs mb-5">
                        <Landmark className="w-3.5 h-3.5 shrink-0" />
                        <span className="leading-tight">{scheme.ministry}</span>
                      </div>

                      {isOpen && (
                        <div className="space-y-5 mb-5 animate-in fade-in duration-300">
                          <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-100">
                            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 mb-3">
                              {tComm("govSchemesBenefits")}
                            </h4>
                            <ul className="space-y-2">
                              {scheme.benefits.map((b, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-sm font-medium text-slate-600"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-blue-50/60 rounded-2xl p-5 border border-blue-100">
                            <h4 className="text-xs font-black uppercase tracking-wider text-blue-800 mb-3">
                              {tComm("govSchemesEligibility")}
                            </h4>
                            <ul className="space-y-2">
                              {scheme.eligibility.map((e, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-sm font-medium text-slate-600"
                                >
                                  <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                  <span>{e}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {scheme.launched && (
                            <p className="text-xs font-bold text-slate-400">
                              {tComm("govSchemesLaunched")}: {scheme.launched}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
                        <button
                          onClick={() => setExpanded(isOpen ? null : scheme.id)}
                          aria-expanded={isOpen}
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-sm rounded-full transition-all active:scale-95"
                        >
                          {isOpen
                            ? tComm("govSchemesLess")
                            : tComm("govSchemesDetails")}
                          <ChevronDown
                            className={cn(
                              "w-3.5 h-3.5 transition-transform",
                              isOpen && "rotate-180"
                            )}
                          />
                        </button>
                        <a
                          href={scheme.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2e6b3b] hover:bg-[#1b5e20] text-white font-bold text-sm rounded-full transition-all hover:scale-105 active:scale-95"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          {tComm("govSchemesApply")}
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filtered.length > INITIAL_VISIBLE && !showAll && (
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={() => setShowAll(true)}
                    className="h-14 px-12 rounded-full bg-white border-2 border-[#2e6b3b] text-[#2e6b3b] hover:bg-[#2e6b3b] hover:text-white font-black transition-all group shadow-lg active:scale-95"
                  >
                    {tComm("govSchemesShowAll")} ({filtered.length})
                    <ChevronDown className="ml-2 w-5 h-5 transition-transform group-hover:translate-y-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
