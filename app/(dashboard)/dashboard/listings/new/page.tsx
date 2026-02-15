import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { ListingForm } from "@/features/listings/components/ListingForm";

export default async function NewListingPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?redirectedFrom=/dashboard/listings/new");
  }

  const { id } = await searchParams;

  let initialData = null;
  if (id) {
    const listing = await prisma.listing.findFirst({
      where: { id, creatorId: session.user.id },
    });

    // ListingForm 仍复用旧 Listing 类型字段（snake_case），这里做一个兼容映射
    initialData = listing
      ? ({
          id: listing.id,
          created_at: listing.createdAt.toISOString(),
          creator_id: listing.creatorId,
          title: listing.title,
          description: listing.description,
          price: listing.price,
          category: listing.category,
          metadata: listing.metadata as any,
          preview_url: listing.previewUrl,
          options: (listing.options as any) ?? [],
          status: listing.status,
          packages: (listing.metadata as any)?.packages,
        } as any)
      : null;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <nav className="flex text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/dashboard/services" className="hover:text-foreground">
                我的服务
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium">{id ? "编辑服务" : "发布新服务"}</li>
          </ol>
        </nav>
      </div>

      <ListingForm mode={id ? "edit" : "create"} initialData={initialData} />
    </div>
  );
}
