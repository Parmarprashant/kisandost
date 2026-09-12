"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ThumbsUp,
  MessageSquare,
  Bookmark,
  AlertTriangle,
  MapPin,
  Sprout,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import PostComments from "./PostComments";

export interface FarmerPostData {
  id: string;
  _id?: string;
  authorName: string;
  postType: "Farmer Experience" | "Crop Problem" | "Ask Farmers" | "Success Story" | "Prevention Tip";
  crop: string;
  cropStage?: string;
  location: {
    state: string;
    district: string;
  };
  title: string;
  problem: string;
  symptoms?: string[];
  whatIDid?: string;
  result?: string;
  precautions?: string;
  images?: string[];
  helpfulCount: number;
  commentCount: number;
  isHelpfulByMe?: boolean;
  isSavedByMe?: boolean;
  createdAt: string;
}

interface FarmerPostCardProps {
  post: FarmerPostData;
  onPostUpdated?: () => void;
}

export default function FarmerPostCard({ post, onPostUpdated }: FarmerPostCardProps) {
  const { user } = useAuth();
  const [isHelpful, setIsHelpful] = useState(post.isHelpfulByMe || false);
  const [helpfulCount, setHelpfulCount] = useState(post.helpfulCount || 0);
  const [isSaved, setIsSaved] = useState(post.isSavedByMe || false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [isReporting, setIsReporting] = useState(false);

  const postId = post.id || post._id || "";

  // Helpful toggle
  const handleToggleHelpful = async () => {
    if (!user) {
      toast.error("Please login to mark this post as helpful");
      return;
    }

    // Optimistic update
    const previousState = isHelpful;
    const previousCount = helpfulCount;
    setIsHelpful(!previousState);
    setHelpfulCount(previousState ? previousCount - 1 : previousCount + 1);

    try {
      const res = await fetch(`/api/community/posts/${postId}/helpful`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setIsHelpful(previousState);
        setHelpfulCount(previousCount);
        toast.error(data.error || "Failed to update reaction");
      } else {
        setIsHelpful(data.isHelpfulByMe);
        setHelpfulCount(data.helpfulCount);
      }
    } catch {
      setIsHelpful(previousState);
      setHelpfulCount(previousCount);
      toast.error("Network error updating reaction");
    }
  };

  // Save / Bookmark toggle
  const handleToggleSave = async () => {
    if (!user) {
      toast.error("Please login to save posts to your bookmarks");
      return;
    }

    const previousState = isSaved;
    setIsSaved(!previousState);

    try {
      const res = await fetch(`/api/community/posts/${postId}/save`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setIsSaved(data.isSavedByMe);
        toast.success(data.message);
      } else {
        setIsSaved(previousState);
        toast.error(data.error || "Failed to save post");
      }
    } catch {
      setIsSaved(previousState);
      toast.error("Network error saving post");
    }
  };

  // Report post
  const handleReport = async () => {
    if (!user) {
      toast.error("Please login to report a post");
      return;
    }

    const reason = prompt("Why are you reporting this post? (e.g. Inappropriate, misleading, harmful chemicals, spam):");
    if (!reason || !reason.trim()) return;

    try {
      const res = await fetch(`/api/community/posts/${postId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Post reported for moderation review");
      } else {
        toast.error(data.error || "Failed to report post");
      }
    } catch {
      toast.error("Error reporting post");
    }
  };

  const getPostTypeBadge = (type: string) => {
    switch (type) {
      case "Crop Problem":
        return <Badge className="bg-red-50 text-red-700 border-red-200 font-bold">🚨 Crop Problem</Badge>;
      case "Ask Farmers":
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-bold">❓ Ask Farmers</Badge>;
      case "Success Story":
        return <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 font-bold">🏆 Success Story</Badge>;
      case "Prevention Tip":
        return <Badge className="bg-amber-50 text-amber-800 border-amber-200 font-bold">🛡️ Prevention Tip</Badge>;
      default:
        return <Badge className="bg-[#2e6b3b]/10 text-[#2e6b3b] border-[#2e6b3b]/20 font-bold">👨‍🌾 Farmer Experience</Badge>;
    }
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-200 flex items-center justify-center text-2xl shadow-inner border border-white">
            👨‍🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base md:text-lg font-black text-slate-800">{post.authorName}</h4>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 mt-0.5">
              <span className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {post.location.district}, {post.location.state}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <Sprout className="w-3.5 h-3.5 text-[#2e6b3b]" />
                {post.crop} {post.cropStage && `(${post.cropStage})`}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        <div>{getPostTypeBadge(post.postType)}</div>
      </div>

      {/* Title */}
      <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-snug tracking-tight">
        {post.title}
      </h3>

      {/* Images Gallery */}
      {post.images && post.images.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {post.images.map((img, idx) => (
            <div
              key={idx}
              className="relative w-48 h-32 md:w-64 md:h-40 rounded-2xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-sm"
            >
              <Image
                src={img}
                alt={`${post.crop} leaf damage`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                unoptimized
              />
            </div>
          ))}
        </div>
      )}

      {/* Structured Sections */}
      <div className="space-y-4 text-sm">
        {/* Problem */}
        <div className="bg-slate-50/70 p-4 md:p-5 rounded-2xl border border-slate-100/90 space-y-1.5">
          <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-rose-700">
            <AlertTriangle className="w-4 h-4" />
            <span>Problem Faced</span>
          </div>
          <p className="text-slate-700 font-medium leading-relaxed">{post.problem}</p>
        </div>

        {/* Symptoms */}
        {post.symptoms && post.symptoms.length > 0 && (
          <div className="bg-amber-50/40 p-4 md:p-5 rounded-2xl border border-amber-100/60 space-y-2">
            <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-amber-800">
              <Info className="w-4 h-4 text-amber-600" />
              <span>Observed Symptoms</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.symptoms.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 bg-white rounded-full border border-amber-200 text-amber-900 shadow-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* What I Did */}
        {post.whatIDid && (
          <div className="bg-emerald-50/40 p-4 md:p-5 rounded-2xl border border-emerald-100/60 space-y-1.5">
            <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-[#2e6b3b]">
              <Sprout className="w-4 h-4" />
              <span>What I Did (Action Taken)</span>
            </div>
            <p className="text-slate-700 font-medium leading-relaxed">{post.whatIDid}</p>
          </div>
        )}

        {/* Result & Precautions in 2 Columns if both present */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {post.result && (
            <div className="bg-blue-50/40 p-4 rounded-2xl border border-blue-100/60 space-y-1.5">
              <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-blue-700">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Result & Outcome</span>
              </div>
              <p className="text-slate-700 font-medium leading-relaxed text-xs md:text-sm">{post.result}</p>
            </div>
          )}

          {post.precautions && (
            <div className="bg-orange-50/40 p-4 rounded-2xl border border-orange-100/60 space-y-1.5">
              <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-orange-800">
                <ShieldAlert className="w-4 h-4 text-orange-600" />
                <span>Precautions & Lessons</span>
              </div>
              <p className="text-slate-700 font-medium leading-relaxed text-xs md:text-sm">{post.precautions}</p>
            </div>
          )}
        </div>
      </div>

      {/* Community Knowledge Note */}
      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 text-[11px] font-semibold">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Farmer Experience — Peer knowledge sharing based on field practice. Always verify with local agricultural experts for critical crop diseases.</span>
      </div>

      {/* Footer Actions Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {/* Helpful Button */}
          <Button
            variant={isHelpful ? "default" : "outline"}
            size="sm"
            onClick={handleToggleHelpful}
            className={cn(
              "rounded-full h-10 px-4 font-bold text-xs md:text-sm transition-all shadow-xs",
              isHelpful
                ? "bg-[#2e6b3b] hover:bg-[#1b5e20] text-white"
                : "border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-[#2e6b3b]"
            )}
          >
            <ThumbsUp className={cn("w-4 h-4 mr-1.5", isHelpful && "fill-current")} />
            <span>Helpful ({helpfulCount})</span>
          </Button>

          {/* Comments Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="rounded-full h-10 px-4 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs md:text-sm"
          >
            <MessageSquare className="w-4 h-4 mr-1.5 text-slate-500" />
            <span>Comments ({commentCount})</span>
            {showComments ? <ChevronUp className="w-3.5 h-3.5 ml-1 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 ml-1 text-slate-400" />}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Save / Bookmark Button */}
          <Button
            variant={isSaved ? "default" : "ghost"}
            size="sm"
            onClick={handleToggleSave}
            className={cn(
              "rounded-full h-10 px-3.5 font-bold text-xs transition-all",
              isSaved
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            )}
            title={isSaved ? "Saved in Bookmarks" : "Save Experience"}
          >
            <Bookmark className={cn("w-4 h-4 mr-1", isSaved && "fill-current")} />
            <span>{isSaved ? "Saved" : "Save"}</span>
          </Button>

          {/* Report Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReport}
            className="rounded-full h-10 px-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold"
            title="Report inaccurate or harmful post"
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            <span>Report</span>
          </Button>
        </div>
      </div>

      {/* Expandable Comments Drawer */}
      {showComments && (
        <PostComments
          postId={postId}
          initialCommentCount={commentCount}
          onCommentAdded={() => {
            setCommentCount((prev) => prev + 1);
            if (onPostUpdated) onPostUpdated();
          }}
        />
      )}
    </div>
  );
}
