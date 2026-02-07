import { notFound, redirect } from "next/navigation";
import { Star, Trophy, MapPin, Globe, Briefcase, Mail } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { getUserProfile } from "@/app/actions/profile";
import { ProfileEditDialog } from "./ProfileEditDialog";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  if (!id) return notFound();

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profileData;
  try {
    profileData = await getUserProfile(id);
  } catch (e) {
    console.error(e);
    return notFound();
  }

  const { profile, stats, reviews } = profileData;
  const isMe = user?.id === profile.id;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="relative bg-white rounded-3xl border shadow-sm overflow-hidden p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
            <AvatarImage src={profile.avatar_url ?? ""} />
            <AvatarFallback className="text-4xl">{profile.full_name?.[0] ?? "U"}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4 text-center md:text-left w-full">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{profile.full_name ?? "匿名用户"}</h1>
                <p className="text-lg text-blue-600 font-medium">{profile.title ?? "暂无头衔"}</p>
              </div>
              {isMe && (
                <ProfileEditDialog profile={profile} />
              )}
            </div>

            <div className="flex flex-wrap gap-6 justify-center md:justify-start text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-slate-900">{stats.average_rating ? stats.average_rating.toFixed(1) : "暂无评分"}</span>
                <span>评分</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-blue-500" />
                <span className="font-bold text-slate-900">{stats.total_jobs}</span>
                <span>已完成任务</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">关于我</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {profile.bio ?? "这个用户很懒，什么都没有写。"}
              </p>
              
              <div className="space-y-2 pt-4 border-t">
                <div className="text-sm font-semibold">技能</div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills && profile.skills.length > 0 ? (
                    profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none px-3 py-1">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">暂未添加技能</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Reviews */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 px-2">收到的评价 ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <div className="bg-slate-50 border border-dashed rounded-3xl p-12 text-center text-slate-500">
              暂无评价记录
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="rounded-2xl shadow-sm border-slate-100">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-200"}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">{review.comment ?? "（无评价内容）"}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
