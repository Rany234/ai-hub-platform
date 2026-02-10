import type React from "react";
import { ChevronRight, Coins, Layers, Lock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  desc: string;
  colorClassName: string;
  glowClassName: string;
};

const steps: Step[] = [
  {
    icon: ShieldCheck,
    title: "实名签约入驻",
    desc: "0 门槛开店，身份核验保障交易安全。",
    colorClassName: "group-hover:text-amber-300",
    glowClassName:
      "group-hover:shadow-[0_0_18px_rgba(245,158,11,0.18)] group-hover:border-amber-500/25",
  },
  {
    icon: Layers,
    title: "上架数字权益",
    desc: "支持 Prompt 包 (8%服务费) 与定制服务 (12%服务费)。",
    colorClassName: "group-hover:text-amber-300",
    glowClassName:
      "group-hover:shadow-[0_0_18px_rgba(245,158,11,0.18)] group-hover:border-amber-500/25",
  },
  {
    icon: Lock,
    title: "资金担保交易",
    desc: "买家付款平台托管，验收无误后放款。",
    colorClassName: "group-hover:text-amber-300",
    glowClassName:
      "group-hover:shadow-[0_0_18px_rgba(245,158,11,0.18)] group-hover:border-amber-500/25",
  },
  {
    icon: Coins,
    title: "T+14 自动结算",
    desc: "交易完成后 T+14 结算，部分收益注入社区共建基金。",
    colorClassName: "group-hover:text-amber-300",
    glowClassName:
      "group-hover:shadow-[0_0_18px_rgba(245,158,11,0.18)] group-hover:border-amber-500/25",
  },
];

export function ProcessSteps() {
  return (
    <section className="w-full bg-gradient-to-b from-white/5 to-transparent py-12">
      <div className="container mx-auto px-4 mb-10 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">4 步开启您的 AI 变现之旅</h2>
        <p className="text-slate-400 text-sm">专业、透明、安全的交易流程</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mx-auto w-full max-w-5xl px-4">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isLast = idx === steps.length - 1;

          return (
            <div key={s.title} className="relative flex flex-col items-center text-center group">
              <div className={cn(
                "w-16 h-16 rounded-2xl bg-[#151F32] border border-white/10 flex items-center justify-center mb-4 transition-all duration-300",
                "group-hover:scale-110",
                s.glowClassName,
                s.colorClassName
              )}>
                <Icon className="w-7 h-7 text-slate-500 transition-colors duration-300 group-hover:text-inherit" />
              </div>

              <div className="text-lg font-bold text-slate-500 transition-colors duration-300 group-hover:text-slate-100 mb-2">{s.title}</div>
              <div className="text-sm text-slate-400 text-center leading-relaxed max-w-[200px] mx-auto">{s.desc}</div>

              {!isLast ? (
                <div className="hidden md:block absolute top-8 -right-6">
                  <div className="flex items-center gap-2">
                    <div className="w-12 border-t border-dashed border-white/15" />
                    <ChevronRight className="w-4 h-4 text-white/25" />
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
