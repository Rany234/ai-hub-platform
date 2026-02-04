import { Star } from "lucide-react";

function formatTime(ts: string) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleString();
}

type ReviewItem = {
  rating: number;
  content: string;
  created_at: string;
  profiles:
    | {
        id: string;
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
      }
    | null;
};

export function ReviewsSection({ reviews }: { reviews: ReviewItem[] }) {
  return (
    <div className="mt-10 border-t pt-6">
      <h2 className="text-lg font-semibold">用户评价</h2>

      {reviews.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">暂无评价。</p>
      ) : (
        <div className="mt-4 space-y-4">
          {reviews.map((r, idx) => {
            const p = r.profiles;
            const name = p?.full_name || p?.username || (p?.id ? p.id.slice(0, 6) : "匿名用户");
            return (
              <div key={`${r.created_at}-${idx}`} className="border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full border overflow-hidden bg-white flex items-center justify-center text-xs text-muted-foreground">
                      {p?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt="avatar" src={p.avatar_url} className="h-full w-full object-cover" />
                      ) : (
                        "无"
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{name}</div>
                      <div className="mt-1 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const active = i + 1 <= r.rating;
                          return (
                            <Star key={i} className={active ? "h-4 w-4 fill-black" : "h-4 w-4"} />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{formatTime(r.created_at)}</div>
                </div>

                <div className="mt-3 whitespace-pre-wrap text-sm">{r.content}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
