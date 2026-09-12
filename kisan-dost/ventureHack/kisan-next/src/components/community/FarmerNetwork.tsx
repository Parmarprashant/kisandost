"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Filter,
  RotateCcw,
  Sparkles,
  Loader2,
  Bookmark,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import FarmerPostCard, { FarmerPostData } from "./FarmerPostCard";
import ShareExperienceModal from "./ShareExperienceModal";

const POST_TYPE_FILTERS = [
  { id: "All", label: "All Experiences" },
  { id: "Farmer Experience", label: "👨‍🌾 Experiences" },
  { id: "Crop Problem", label: "🚨 Crop Problems" },
  { id: "Ask Farmers", label: "❓ Ask Farmers" },
  { id: "Success Story", label: "🏆 Success Stories" },
  { id: "Prevention Tip", label: "🛡️ Prevention Tips" },
];

const CROPS = [
  "All",
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
];

const STATES = [
  "All",
  "Gujarat",
  "Maharashtra",
  "Punjab",
  "Rajasthan",
  "Madhya Pradesh",
  "Uttar Pradesh",
  "Haryana",
];

const STAGES = ["All", "Seedling", "Vegetative", "Flowering", "Fruiting", "Harvest"];

export default function FarmerNetwork() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FarmerPostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedCrop, setSelectedCrop] = useState("All");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedStage, setSelectedStage] = useState("All");
  const [savedOnly, setSavedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Fetch posts from MongoDB API
  const fetchPosts = useCallback(
    async (currentPage = 1, append = false) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set("search", searchQuery.trim());
        if (selectedType !== "All") params.set("postType", selectedType);
        if (selectedCrop !== "All") params.set("crop", selectedCrop);
        if (selectedState !== "All") params.set("state", selectedState);
        if (selectedStage !== "All") params.set("cropStage", selectedStage);
        if (savedOnly) params.set("saved", "true");
        params.set("page", currentPage.toString());
        params.set("limit", "15");

        const res = await fetch(`/api/community/posts?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (append) {
            setPosts((prev) => [...prev, ...(data.posts || [])]);
          } else {
            setPosts(data.posts || []);
          }
          setTotalCount(data.total || 0);
          setTotalPages(data.totalPages || 1);
          setPage(data.page || 1);
        } else {
          toast.error("Failed to load community experiences");
        }
      } catch (e) {
        console.error("Fetch community posts error:", e);
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, selectedType, selectedCrop, selectedState, selectedStage, savedOnly]
  );

  // Trigger search on filter changes with debounce for text search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts(1, false);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchPosts]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedType("All");
    setSelectedCrop("All");
    setSelectedState("All");
    setSelectedStage("All");
    setSavedOnly(false);
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchPosts(page + 1, true);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Network Header Banner */}
      <div className="bg-white rounded-[40px] p-8 md:p-10 border border-slate-100 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2e6b3b]/10 text-[#2e6b3b] text-sm font-bold">
              <Users className="w-4 h-4" />
              Farmer-to-Farmer Knowledge Sharing
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              👨‍🌾 Farmer Network
            </h2>
            <p className="text-slate-600 font-medium text-base md:text-lg max-w-2xl">
              &quot;Learn from farmers. Share your experience. Help another farmer.&quot; Real field observations, pest outbreaks, and proven solutions.
            </p>
          </div>

          <Button
            onClick={() => {
              if (!user) {
                toast.error("Please login to share your experience");
              } else {
                setIsShareModalOpen(true);
              }
            }}
            className="h-14 px-8 rounded-full bg-[#2e6b3b] hover:bg-[#1b5e20] text-white font-black shadow-xl shadow-emerald-200 transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center gap-2.5 text-base"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            Share Your Experience
          </Button>
        </div>
      </div>

      {/* Search Bar & Primary Post Type Filter Pills */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search crop, disease, pest, farming problem (e.g. cotton whitefly, tomato blight, yellow leaves)..."
            className="h-14 pl-14 pr-6 rounded-full bg-white border-2 border-slate-200/80 shadow-sm text-base text-slate-800 placeholder:text-slate-400 focus-visible:border-[#2e6b3b] focus-visible:ring-0"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Post Type Filters Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {POST_TYPE_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setSelectedType(f.id);
                setSavedOnly(false);
              }}
              className={cn(
                "px-5 py-2.5 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all shadow-xs shrink-0",
                selectedType === f.id && !savedOnly
                  ? "bg-[#2e6b3b] text-white shadow-md shadow-emerald-200"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              {f.label}
            </button>
          ))}

          {/* Bookmarks filter */}
          {user && (
            <button
              onClick={() => {
                setSavedOnly(!savedOnly);
                setSelectedType("All");
              }}
              className={cn(
                "px-5 py-2.5 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all shadow-xs shrink-0 flex items-center gap-1.5",
                savedOnly
                  ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <Bookmark className="w-4 h-4" />
              My Saved Posts
            </button>
          )}
        </div>

        {/* Granular Secondary Filters: Crop, State, Stage */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-[#2e6b3b]" />
            Filters:
          </div>

          {/* Crop Selector */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Crop:</span>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-800 text-xs focus:ring-1 focus:ring-[#2e6b3b] outline-none"
            >
              {CROPS.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All Crops" : c}
                </option>
              ))}
            </select>
          </div>

          {/* State Selector */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-800 text-xs focus:ring-1 focus:ring-[#2e6b3b] outline-none"
            >
              {STATES.map((st) => (
                <option key={st} value={st}>
                  {st === "All" ? "All States" : st}
                </option>
              ))}
            </select>
          </div>

          {/* Crop Stage Selector */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Stage:</span>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-800 text-xs focus:ring-1 focus:ring-[#2e6b3b] outline-none"
            >
              {STAGES.map((sg) => (
                <option key={sg} value={sg}>
                  {sg === "All" ? "All Stages" : sg}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {(selectedCrop !== "All" ||
            selectedState !== "All" ||
            selectedStage !== "All" ||
            selectedType !== "All" ||
            searchQuery ||
            savedOnly) && (
            <button
              onClick={handleResetFilters}
              className="ml-auto flex items-center gap-1 text-[#2e6b3b] hover:underline font-bold text-xs"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All
            </button>
          )}
        </div>
      </div>

      {/* Feed Content */}
      <div className="space-y-6">
        {isLoading && posts.length === 0 ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm animate-pulse space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-slate-100 rounded-md" />
                    <div className="w-48 h-3 bg-slate-100 rounded-md" />
                  </div>
                </div>
                <div className="w-3/4 h-6 bg-slate-100 rounded-md" />
                <div className="w-full h-20 bg-slate-100 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 text-center border border-slate-100 shadow-sm space-y-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-3xl mx-auto text-[#2e6b3b]">
              🌱
            </div>
            <h4 className="text-xl font-black text-slate-800">No farmer experiences found</h4>
            <p className="text-slate-500 font-medium text-sm max-w-md mx-auto">
              We couldn&apos;t find any posts matching your current filters or search query.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="rounded-full px-6 font-bold"
              >
                Reset Filters
              </Button>
              <Button
                onClick={() => setIsShareModalOpen(true)}
                className="rounded-full px-6 bg-[#2e6b3b] hover:bg-[#1b5e20] text-white font-bold"
              >
                Share First Experience
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-2">
              <span>Showing {posts.length} of {totalCount} farmer experiences</span>
              <span>Updated in real time</span>
            </div>

            {posts.map((post) => (
              <FarmerPostCard
                key={post.id || post._id}
                post={post}
                onPostUpdated={() => fetchPosts(page, false)}
              />
            ))}

            {page < totalPages && (
              <div className="text-center pt-4">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  variant="outline"
                  className="rounded-full px-8 h-12 border-2 border-[#2e6b3b] text-[#2e6b3b] hover:bg-[#2e6b3b] hover:text-white font-black transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading more...
                    </>
                  ) : (
                    "Load More Experiences"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Share Experience Modal */}
      <ShareExperienceModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onPostCreated={() => {
          handleResetFilters();
          fetchPosts(1, false);
        }}
      />
    </div>
  );
}
