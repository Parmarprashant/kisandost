"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";

interface Comment {
  id: string;
  authorName: string;
  authorLocation?: string;
  content: string;
  createdAt: string;
}

interface PostCommentsProps {
  postId: string;
  initialCommentCount: number;
  onCommentAdded?: () => void;
}

export default function PostComments({ postId, initialCommentCount, onCommentAdded }: PostCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (e) {
      console.error("Failed to fetch comments", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!user) {
      toast.error("Please login to comment and join farmer discussions");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      const data = await res.json();
      if (res.ok && data.comment) {
        setComments((prev) => [...prev, data.comment]);
        setNewComment("");
        toast.success("Comment posted successfully");
        if (onCommentAdded) onCommentAdded();
      } else {
        toast.error(data.error || "Failed to post comment");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-4 mt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
        <MessageSquare className="w-4 h-4 text-[#2e6b3b]" />
        <span>Farmer Responses & Discussion ({comments.length || initialCommentCount})</span>
      </div>

      {/* Comment Input */}
      <form onSubmit={handleAddComment} className="flex gap-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={user ? "Share your thoughts or ask a question..." : "Login to join the discussion..."}
          disabled={isSubmitting}
          className="rounded-full bg-slate-50 border-slate-200 text-sm focus-visible:ring-[#2e6b3b]"
        />
        <Button
          type="submit"
          disabled={isSubmitting || !newComment.trim()}
          size="sm"
          className="rounded-full px-5 bg-[#2e6b3b] hover:bg-[#1b5e20] text-white font-bold"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>

      {/* Comment List */}
      {isLoading ? (
        <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2e6b3b]" /> Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div className="py-3 text-center text-xs text-slate-400 italic">
          No comments yet. Be the first farmer to share your perspective!
        </div>
      ) : (
        <div className="space-y-3 pt-2">
          {comments.map((c) => (
            <div key={c.id} className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100/80 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#2e6b3b] flex items-center justify-center text-[10px]">
                    <User className="w-3 h-3" />
                  </div>
                  <span>{c.authorName}</span>
                  {c.authorLocation && (
                    <span className="text-[11px] font-normal text-slate-400">({c.authorLocation})</span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date(c.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium pl-6 leading-relaxed">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
