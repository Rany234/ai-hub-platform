import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { ListingForm } from "@/features/listings/components/ListingForm";

function assertString(v: unknown): string {
  if (typeof v !== "string" || v.length === 0) throw new Error("无效的服务 ID");
  return v;
}

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  const { id } = await params;
  const listingId = assertString(id);

  if (!session?.user?.id) {
    redirect(`/login?redirectedFrom=/dashboard/listings/${listingId}/edit`);
  }

  const listing = await prisma.listing.findFirst({
    where: { id: listingId, creatorId: session.user.id },
  });

  if (!listing) {
    notFound();
  }

  const initialData = {
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
  } as any;

  return (
    <div className="p-6 max-w-6xl">
      <ListingForm mode="edit" initialData={initialData} />
    </div>
  );
}
