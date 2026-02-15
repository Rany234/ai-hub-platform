import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { ListingsClient } from "./ListingsClient";

export default async function ListingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?redirectedFrom=/dashboard/listings");
  }

  const listings = await prisma.listing.findMany({
    where: {
      creatorId: session.user.id,
      NOT: { status: "archived" },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold">🛍️ 我发布的服务</h1>
        <Link className="rounded-md bg-black text-white px-4 py-2 text-sm" href="/dashboard/listings/new">
          发布新服务
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="mt-10 border rounded-lg p-8 text-center">
          <h2 className="text-lg font-semibold">暂无内容</h2>
          <p className="mt-2 text-sm text-muted-foreground">你还没有发布任何服务。</p>
          <Link
            className="inline-flex mt-4 items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm"
            href="/dashboard/listings/new"
          >
            去发布
          </Link>
        </div>
      ) : (
        <ListingsClient listings={(listings as any) ?? []} />
      )}
    </div>
  );
}
