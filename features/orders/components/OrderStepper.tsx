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
      <div className="absolute left-0 top-5 h-0.5 w-full bg-gray-200" />
      <div
        className="absolute left-0 top-5 h-0.5 bg-black transition-all"
        style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
      />

      {/* 节点 */}
      <div className="relative flex justify-between">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const isFuture = idx > activeIndex;

          return (
            <div key={step.key} className="flex flex-col items-center gap-2">
              <div
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                  isCompleted
                    ? "border-black bg-black text-white"
                    : isCurrent
                    ? "border-black bg-white text-black"
                    : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-xs font-semibold">{idx + 1}</span>
                )}
              </div>
              <div className="text-center">
                <div
                  className={`text-xs font-medium ${
                    isCompleted || isCurrent ? "text-black" : "text-gray-400"
                  }`}
                >
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
