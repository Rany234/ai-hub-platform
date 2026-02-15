import { CheckCircle2, Clock, Package, CreditCard, MessageSquare } from "lucide-react";
import { OrderStatus } from "@prisma/client";

interface TimelineEvent {
  id: string;
  label: string;
  time?: Date;
  isCompleted: boolean;
  icon: React.ReactNode;
}

export function OrderTimeline({ 
  status, 
  createdAt, 
  paidAt, 
  deliveredAt, 
  completedAt,
  hasRequirements 
}: { 
  status: OrderStatus; 
  createdAt: Date;
  paidAt?: Date;
  deliveredAt?: Date;
  completedAt?: Date;
  hasRequirements?: boolean;
}) {
  const events: TimelineEvent[] = [
    {
      id: "created",
      label: "提交订单",
      time: createdAt,
      isCompleted: true,
      icon: <Clock className="h-4 w-4" />,
    },
    {
      id: "paid",
      label: "资金托管",
      time: paidAt,
      isCompleted: ["paid", "delivered", "completed"].includes(status),
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      id: "requirements",
      label: "补充需求",
      isCompleted: !!hasRequirements,
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      id: "delivered",
      label: "服务交付",
      time: deliveredAt,
      isCompleted: ["delivered", "completed"].includes(status),
      icon: <Package className="h-4 w-4" />,
    },
    {
      id: "completed",
      label: "交易完成",
      time: completedAt,
      isCompleted: status === "completed",
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
        <Clock className="h-4 w-4" />
        订单时间轴
      </h3>
      <div className="relative pl-6 space-y-6">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-800" />
        
        {events.map((event) => (
          <div key={event.id} className="relative flex items-start gap-4">
            <div 
              className={`absolute -left-[19px] p-1 rounded-full border-2 transition-colors ${
                event.isCompleted 
                ? "bg-emerald-500 border-emerald-500 text-white" 
                : "bg-slate-900 border-slate-700 text-slate-600"
              }`}
            >
              {event.isCompleted ? <CheckCircle2 className="h-3 w-3" /> : event.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-bold ${event.isCompleted ? "text-slate-200" : "text-slate-500"}`}>
                {event.label}
              </div>
              {event.time && (
                <div className="text-xs text-slate-600 mt-0.5">
                  {new Date(event.time).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
