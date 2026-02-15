"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { 
  ClipboardList, 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MessageSquare,
  ArrowRight,
  PlusCircle,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type WorkbenchClientProps = {
  postedJobs: any[];
  myBids: any[];
};

export function WorkbenchClient({ postedJobs, myBids }: WorkbenchClientProps) {
  const [activeTab, setActiveTab] = useState<"posted" | "bids">("posted");

  const getJobStatusStyles = (status: string) => {
    switch (status.toUpperCase()) {
      case "OPEN": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "IN_PROGRESS": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "COMPLETED": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "CANCELLED": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getBidStatusStyles = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "ACCEPTED": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "REJECTED": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">我的工作台</h1>
          <p className="text-slate-400 mt-1">管理您发布的悬赏需求与参与的投标项目。</p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="bg-brand-action hover:bg-brand-action/90 text-white font-bold shadow-lg shadow-brand-action/20">
            <Link href="/dashboard/jobs/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              发布新需求
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex border-b border-brand-border space-x-8">
        <button
          onClick={() => setActiveTab("posted")}
          className={cn(
            "pb-4 text-sm font-bold transition-all relative",
            activeTab === "posted" ? "text-brand-action" : "text-slate-500 hover:text-slate-300"
          )}
        >
          我发布的悬赏 ({postedJobs.length})
          {activeTab === "posted" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-action rounded-full" />}
        </button>
        <button
          onClick={() => setActiveTab("bids")}
          className={cn(
            "pb-4 text-sm font-bold transition-all relative",
            activeTab === "bids" ? "text-brand-action" : "text-slate-500 hover:text-slate-300"
          )}
        >
          我的创作与投标 ({myBids.length})
          {activeTab === "bids" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-action rounded-full" />}
        </button>
      </div>

      <div className="grid gap-6">
        {activeTab === "posted" ? (
          postedJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-brand-surface/30 rounded-2xl border border-dashed border-brand-border">
              <ClipboardList className="h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-300">您还没有发布过悬赏</h3>
              <p className="text-slate-500 mt-1 mb-6">发布需求，吸引最优秀的 AI 开发者为您创作。</p>
              <Button asChild variant="outline" className="border-brand-border hover:bg-white/5">
                <Link href="/dashboard/jobs/new">立即发布</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {postedJobs.map((job) => (
                <Card key={job.id} className="bg-brand-surface border-brand-border hover:border-brand-action/50 transition-all group overflow-hidden flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className={cn("px-2 py-0", getJobStatusStyles(job.status))}>
                        {job.status === "OPEN" ? "招募中" : job.status === "IN_PROGRESS" ? "进行中" : "已完成"}
                      </Badge>
                      <span className="text-sm font-extrabold text-brand-action">¥{job.budget}</span>
                    </div>
                    <CardTitle className="text-lg text-slate-100 line-clamp-1 group-hover:text-brand-action transition-colors">
                      {job.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-slate-400 h-10">
                      {job.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 flex-1 flex flex-col justify-between">
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 mt-2">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {job.bid_count} 人投标
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(job.created_at), "MM-dd")}
                      </div>
                    </div>
                    <Button asChild variant="secondary" size="sm" className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border-none">
                      <Link href={`/dashboard/jobs/${job.id}`}>
                        管理任务 <ArrowRight className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          myBids.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-brand-surface/30 rounded-2xl border border-dashed border-brand-border">
              <Send className="h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-300">您还没有参与过投标</h3>
              <p className="text-slate-500 mt-1 mb-6">前往任务大厅，发现感兴趣的项目。</p>
              <Button asChild variant="outline" className="border-brand-border hover:bg-white/5">
                <Link href="/dashboard/jobs">去逛逛</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {myBids.map((bid) => (
                <div key={bid.id} className="bg-brand-surface border border-brand-border rounded-xl p-5 hover:border-brand-action/30 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Link href={`/dashboard/jobs/${bid.job.id}`} className="font-bold text-slate-100 hover:text-brand-action transition-colors">
                        {bid.job.title}
                      </Link>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>报价: <span className="text-brand-action font-medium">¥{bid.amount}</span></span>
                        <span>•</span>
                        <span>日期: {format(new Date(bid.createdAt), "yyyy-MM-dd")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={cn("px-3 py-1", getBidStatusStyles(bid.status))}>
                        {bid.status === "PENDING" ? "等待中" : bid.status === "ACCEPTED" ? "已中标" : "未选中"}
                      </Badge>
                      <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-white/5">
                        <Link href={`/dashboard/jobs/${bid.job.id}`}>
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
