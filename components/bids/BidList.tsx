import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function formatDeliveryTime(value?: string | null) {
  if (!value) return "-";
  if (value === "3d") return "3 天";
  if (value === "7d") return "1 周";
  if (value === "14d") return "2 周";
  if (value === "30d") return "1 个月";
  if (value === "custom") return "可协商";
  return value;
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

type BidWithProfile = {
  id: string;
  amount: number | string | null;
  delivery_time: string | null;
  proposal: string | null;
  created_at: string | null;
  bidder_id: string | null;
  profiles?:
    | {
        id: any;
        full_name: any;
        avatar_url: any;
        role: any;
      }
    | Array<{
        id: any;
        full_name: any;
        avatar_url: any;
        role: any;
      }>;
};

export function BidList({ bids, isEmployer }: { bids: BidWithProfile[]; isEmployer: boolean }) {
  if (!isEmployer) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-muted-foreground">
        已收到投标：{bids?.length ?? 0}
      </div>
    );
  }

  if (!bids || bids.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-muted-foreground">
        暂无投标
      </div>
    );
  }

  return (
    <div>
      {bids.map((bid) => {
        const profileRaw = bid?.profiles;
        const profile = Array.isArray(profileRaw) ? profileRaw?.[0] : profileRaw;

        const amountNum = bid?.amount !== null && bid?.amount !== undefined ? Number(bid.amount) : NaN;
        const amountLabel = Number.isFinite(amountNum) ? `￥${amountNum}` : "-";

        return (
          <div key={bid.id} className="bg-white border border-slate-100 rounded-2xl p-6 mb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url ?? ""} />
                  <AvatarFallback>{profile?.full_name?.[0] ?? "U"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="font-medium truncate">{profile?.full_name ?? "匿名用户"}</div>
                  <div className="text-xs text-muted-foreground">{formatDateTime(bid.created_at)}</div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-mono text-xl text-blue-600">{amountLabel}</div>
                <div className="text-xs text-muted-foreground">交付周期：{formatDeliveryTime(bid.delivery_time)}</div>
              </div>
            </div>

            {bid?.proposal ? (
              <div className="mt-4 text-sm text-slate-700 whitespace-pre-wrap break-words">
                {bid.proposal}
              </div>
            ) : (
              <div className="mt-4 text-sm text-muted-foreground">（未填写方案）</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
