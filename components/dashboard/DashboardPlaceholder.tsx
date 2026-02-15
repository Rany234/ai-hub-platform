import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, ArrowRight, LucideIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface DashboardPlaceholderProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  type?: 'deprecated' | 'coming-soon';
}

export function DashboardPlaceholder({
  title,
  description,
  icon: Icon = LayoutDashboard,
  type = 'deprecated'
}: DashboardPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center animate-in fade-in duration-500">
      <div className="mb-6 p-4 rounded-full bg-slate-900/50 ring-1 ring-white/10">
        <Icon className="w-12 h-12 text-slate-400" />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-slate-400 max-w-md mb-8">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild variant="default" className="bg-white text-black hover:bg-slate-200">
          <Link href="/dashboard" className="flex items-center gap-2">
            返回仪表盘 <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="border-white/10 hover:bg-white/5">
          <Link href="/">
            前往服务市场
          </Link>
        </Button>
      </div>

      {type === 'coming-soon' && (
        <div className="mt-8 px-3 py-1 rounded-full bg-brand-action/10 border border-brand-action/20">
          <span className="text-xs font-medium text-brand-action">功能开发中</span>
        </div>
      )}
    </div>
  );
}
