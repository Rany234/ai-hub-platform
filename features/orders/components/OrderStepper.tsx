import { Check } from "lucide-react";

type Step = {
  key: string;
  label: string;
};

const STEPS: Step[] = [
  { key: "pending", label: "提交订单" },
  { key: "paid", label: "资金托管" },
  { key: "delivered", label: "服务交付" },
  { key: "completed", label: "交易完成" },
];

export function OrderStepper({ currentStatus }: { currentStatus: string }) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStatus);
  const activeIndex = Math.max(0, currentIndex);

  return (
    <div className="relative">
      {/* 连接线 */}
      <div className="absolute left-0 top-5 h-0.5 w-full bg-slate-700" />
      <div
        className="absolute left-0 top-5 h-0.5 bg-emerald-500 transition-all duration-500"
        style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
      />

      {/* 节点 */}
      <div className="relative flex justify-between">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          let containerClasses = "border-slate-700 bg-slate-800 text-slate-600";
          let textClasses = "text-slate-600";

          if (isCompleted) {
            containerClasses = "border-emerald-400/20 bg-emerald-400/10 text-emerald-400";
            textClasses = "text-emerald-400";
          } else if (isCurrent) {
            containerClasses = "border-amber-400/20 bg-amber-400/10 text-amber-400 animate-pulse";
            textClasses = "text-amber-400 font-bold";
          }

          return (
            <div key={step.key} className="flex flex-col items-center gap-2">
              <div
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${containerClasses}`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-xs font-semibold">{idx + 1}</span>
                )}
              </div>
              <div className="text-center">
                <div className={`text-xs font-medium transition-colors duration-300 ${textClasses}`}>
                  {step.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
