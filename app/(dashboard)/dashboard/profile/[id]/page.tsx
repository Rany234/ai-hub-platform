import { notFound, redirect } from "next/navigation";
import { Star, Trophy, MapPin, Globe, Briefcase, Mail, CalendarClock, MessageSquareQuote } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { getUserProfile } from "@/app/actions/profile";
import { getWorkerServices } from "@/app/actions/services";
import { ProfileEditDialog } from "./ProfileEditDialog";
import { ServiceCreateDialog } from "./ServiceCreateDialog";
import { EmptyState } from "@/components/ui/empty-state";

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
  const services = await getWorkerServices(id);
  const isMe = user?.id === profile.id;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="relative bg-[#151F32] rounded-3xl border border-[#334155] shadow-2xl overflow-hidden p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <Avatar className="h-32 w-32 border-4 border-[#334155] shadow-2xl">
            <AvatarImage src={profile.avatar_url ?? ""} />
            <AvatarFallback className="text-4xl bg-[#0B1121] text-slate-400">{profile.full_name?.[0] ?? "U"}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4 text-center md:text-left w-full">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">{profile.full_name ?? "匿名用户"}</h1>
                <p className="text-lg text-brand-action font-medium">{profile.title ?? "暂无头衔"}</p>
              </div>
              {isMe && (
                <ProfileEditDialog profile={profile} />
              )}
            </div>

            <div className="flex flex-wrap gap-6 justify-center md:justify-start text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                <span className="font-bold text-slate-100">{stats.average_rating ? stats.average_rating.toFixed(1) : "暂无评分"}</span>
                <span>评分</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-blue-400" />
                <span className="font-bold text-slate-100">{stats.total_jobs}</span>
                <span>已完成任务</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="rounded-2xl shadow-xl border-[#334155] bg-[#151F32]">
            <CardHeader>
              <CardTitle className="text-lg text-white">关于我</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
                {profile.bio ?? "这个用户很懒，什么都没有写。"}
              </p>
              
              <div className="space-y-2 pt-4 border-t border-[#334155]">
                <div className="text-sm font-semibold text-slate-200">技能</div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills && profile.skills.length > 0 ? (
                    profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-brand-action/10 text-brand-action border border-brand-action/20 px-3 py-1">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">暂未添加技能</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Services & Reviews */}
        <div className="md:col-span-2 space-y-10">
          {/* Services Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-bold text-white">我的服务</h2>
              {isMe && <ServiceCreateDialog />}
            </div>
            
            {services.length === 0 ? (
              <EmptyState
                title="暂无服务"
                description="尚未发布任何技能服务"
                icon={CalendarClock}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <Card key={service.id} className="rounded-2xl shadow-xl hover:shadow-2xl transition-all border-[#334155] bg-[#151F32] overflow-hidden flex flex-col">
                    <CardHeader className="bg-black/20 pb-4 border-b border-[#334155]">
                      <CardTitle className="text-base line-clamp-1 text-white">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 flex-1 flex flex-col justify-between gap-4">
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                        <div className="text-brand-action font-bold">
                          ¥{Number(service.price).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <CalendarClock className="size-3" />
                          {service.delivery_days} 天交付
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Reviews Section */}
          <section className="space-y-6 pt-4 border-t border-[#334155]">
            <h2 className="text-2xl font-bold text-white px-2">收到的评价 ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <EmptyState
                title="暂无评价"
                description="暂无评价记录"
                icon={MessageSquareQuote}
              />
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="rounded-2xl shadow-xl border-[#334155] bg-[#151F32]">
                    <CardContent className="p-6 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-700 fill-slate-700"}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">{review.comment ?? "（无评价内容）"}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
