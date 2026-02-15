import type { Listing, Prisma } from "@prisma/client";

export const PLATFORM_FEE_RATE = 0.1;

export type ListingWithParent = Listing & {
  parent?: Listing | null;
};

export type RevenueSplitResult = {
  platformFee: number;
  royaltyFee: number;
  sellerRevenue: number;
  splits: {
    platform: number;
    originalCreator: number;
    seller: number;
  };
  beneficiaries: {
    sellerId: string;
    originalCreatorId?: string;
  };
};

function roundMoney(n: number) {
  // Round to cents to avoid floating drift
  return Math.round(n * 100) / 100;
}

/**
 * Pure math utility to calculate revenue splits for a listing sale.
 *
 * Assumes:
 * - listing.creatorId is the seller.
 * - if listing.parentId exists and listing.parent is provided, the parent.creatorId is the original creator.
 */
export function calculateRevenueSplit(listing: ListingWithParent, amount: number): RevenueSplitResult {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Invalid amount");
  }

  const sellerId = listing.creatorId;
  const platformFee = roundMoney(amount * PLATFORM_FEE_RATE);

  const isChild = Boolean(listing.parentId);
  const hasParentLoaded = Boolean(listing.parent);

  if (isChild && hasParentLoaded && listing.parent) {
    const royaltyRate = typeof (listing as any).royaltyRate === "number" ? (listing as any).royaltyRate : 0.1;
    const royaltyFee = roundMoney(amount * royaltyRate);
    const sellerRevenue = roundMoney(amount - platformFee - royaltyFee);

    const originalCreatorId = listing.parent.creatorId;

    return {
      platformFee,
      royaltyFee,
      sellerRevenue,
      splits: {
        platform: platformFee,
        originalCreator: royaltyFee,
        seller: sellerRevenue,
      },
      beneficiaries: {
        sellerId,
        originalCreatorId,
      },
    };
  }

  // Original asset (or parent not loaded)
  const royaltyFee = 0;
  const sellerRevenue = roundMoney(amount - platformFee);

  return {
    platformFee,
    royaltyFee,
    sellerRevenue,
    splits: {
      platform: platformFee,
      originalCreator: 0,
      seller: sellerRevenue,
    },
    beneficiaries: {
      sellerId,
    },
  };
}
