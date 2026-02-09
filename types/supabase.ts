export type PackageTierKey = "basic" | "standard" | "premium";

export interface ListingPackage {
  price: number;
  delivery_days: number;
  revisions: number;
  features: string[];
}

export type ListingPackages = Record<PackageTierKey, ListingPackage>;
