"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, ArrowRight, ThumbsUp, MapPin, Loader2, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SimilarExperiencesProps {
  cropName?: string;
  diseaseName?: string;
}

export default function SimilarExperiences({ cropName, diseaseName }: SimilarExperiencesProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!cropName && !diseaseName) return;

    const searchTerm = diseaseName && diseaseName !== "Healthy Plant" && diseaseName !== "Healthy Crop"
      ? diseaseName
      : cropName || "";

    if (!searchTerm) return;

    setIsLoading(true);
    fetch(`/api/community/posts?search=${encodeURIComponent(searchTerm)}&limit=3`)
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts || []);
      })
      .catch((err) => console.error("Failed to load similar experiences", err))
      .finally(() => setIsLoading(false));
  }, [cropName, diseaseName]);

  if (!cropName && !diseaseName) return null;

  return (
    <Card className="border-2 border-emerald-200/80 bg-gradient-to-br from-emerald-50/40 via-white to-green-50/30 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#2e6b3b]/10 text-[#2e6b3b] flex items-center justify-center text-base">
              👨‍🌾
            </div>
            <div>
              <CardTitle className="text-lg font-black text-slate-800">
                Similar Farmer Experiences
              </CardTitle>
              <p className="text-xs text-slate-500 font-medium">
                See how other farmers in India handled similar conditions on their fields
              </p>
            </div>
          </div>
          <Link href="/en/communities">
            <Button variant="ghost" size="sm" className="text-xs font-bold text-[#2e6b3b] hover:bg-emerald-50">
              Community Feed <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#2e6b3b]" />
            Matching farmer field reports...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-4 bg-white/70 rounded-2xl border border-dashed border-slate-200 p-4">
            <p className="text-xs text-slate-500 font-medium">
              No direct farmer discussions found yet for &ldquo;{diseaseName || cropName}&rdquo;.
            </p>
            <Link href="/en/communities" className="mt-2 inline-block">
              <Button size="sm" variant="outline" className="text-xs font-bold rounded-full mt-1">
                Ask the Farmer Community
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{post.authorName}</span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      {post.location?.district}, {post.location?.state}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold border-emerald-200 text-emerald-800 bg-emerald-50">
                    {post.crop}
                  </Badge>
                </div>

                <h5 className="text-xs md:text-sm font-bold text-slate-900 line-clamp-1">
                  {post.title}
                </h5>

                {post.whatIDid && (
                  <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <strong className="text-[#2e6b3b]">What Worked:</strong> {post.whatIDid}
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-semibold text-slate-600">
                      <ThumbsUp className="w-3 h-3 text-emerald-600" /> {post.helpfulCount} found helpful
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> {post.commentCount} comments
                    </span>
                  </div>
                  <Link
                    href={`/en/communities?search=${encodeURIComponent(post.crop)}`}
                    className="font-bold text-[#2e6b3b] hover:underline flex items-center gap-0.5"
                  >
                    Read More <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
