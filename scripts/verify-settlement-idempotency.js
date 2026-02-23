#!/usr/bin/env node

/**
 * P0-2 Regression: Settlement Idempotency + Ledger Consistency
 *
 * Strategy: "Script Auto-Seed" (Self-contained Prisma Client)
 * 1) Load env (.env.local)
 * 2) Initialize Prisma with Driver Adapter (to ensure model delegates exist)
 * 3) Create transient test data (Buyer, Seller, Profile, Listing, Order, Delivery)
 * 4) Call executeOrderSettlement 5 times (Hard Idempotency check)
 * 5) Assert results
 *
 * Options:
 *  --cleanup   Remove seeded data on success (best-effort)
 */

const path = require("path");
const fs = require("fs");
const { Pool } = require("pg");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

// Load env before importing TS settlement module
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
} else {
  console.error("[FAIL] .env.local not found. Required for local P0-2 verification.");
  process.exit(1);
}

function hasFlag(flag) {
  return process.argv.slice(2).includes(flag);
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("[FAIL] DATABASE_URL missing in .env.local");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // Import the settlement logic (TS module)
  const settlementModule = await import("../lib/services/settlement.ts");
  // ESM interop: tsx might wrap exports in .default or .module.exports
  const executeOrderSettlement = settlementModule.executeOrderSettlement || settlementModule.default?.executeOrderSettlement;

  if (typeof executeOrderSettlement !== "function") {
    console.error("[FAIL] executeOrderSettlement is not a function. Module structure:", settlementModule);
    process.exit(1);
  }

  const timestamp = Date.now();
  const buyerEmail = `p02_buyer_${timestamp}@test.local`;
  const sellerEmail = `p02_seller_${timestamp}@test.local`;

  // record ids for optional cleanup
  const seeded = {
    buyerId: null,
    sellerId: null,
    sellerFreelancerProfileId: null,
    listingId: null,
    orderId: null,
    deliveryId: null,
  };

  try {
    console.log("--- P0-2 Idempotency Regression (Auto-Seed) ---");
    console.log("[1/3] Creating test users, profiles and listing...");

    const buyer = await prisma.user.create({
      data: {
        email: buyerEmail,
        name: "P0-2 Test Buyer",
        username: `p02_buyer_${timestamp}`,
      },
    });
    seeded.buyerId = buyer.id;

    const seller = await prisma.user.create({
      data: {
        email: sellerEmail,
        name: "P0-2 Test Seller",
        username: `p02_seller_${timestamp}`,
      },
    });
    seeded.sellerId = seller.id;

    // Seller must have a FreelancerProfile for settlement engine to resolve sellerId
    const sellerFreelancerProfile = await prisma.freelancerProfile.create({
      data: {
        userId: seller.id,
        bio: "P0-2 test freelancer",
      },
    });
    seeded.sellerFreelancerProfileId = sellerFreelancerProfile.id;

    const listing = await prisma.listing.create({
      data: {
        freelancerProfileId: sellerFreelancerProfile.id,
        title: "P0-2 Idempotency Test Service",
        price: 100,
        priceCents: 10000,
        type: "SERVICE",
        status: "active",
      },
    });
    seeded.listingId = listing.id;

    console.log("[2/3] Creating order and delivery...");

    const order = await prisma.order.create({
      data: {
        buyerId: buyer.id,
        listingId: listing.id,
        amount: 100,
        amountCents: 10000,
        status: "paid",
        deliveryStatus: "DELIVERED",
        escrowStatus: "ESCROWED",
      },
    });
    seeded.orderId = order.id;

    const delivery = await prisma.delivery.create({
      data: {
        orderId: order.id,
        content: "Test Delivery Content",
        status: "delivered",
      },
    });
    seeded.deliveryId = delivery.id;

    console.log("[3/3] Executing settlement 5 times...");

    const orderWithDetails = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        listing: {
          include: { freelancerProfile: true },
        },
      },
    });

    if (!orderWithDetails) {
      console.error("[FAIL] Could not reload seeded order with details.");
      process.exit(1);
    }

    const results = [];
    for (let i = 1; i <= 5; i++) {
      const res = await prisma.$transaction(async (tx) => {
        return await executeOrderSettlement(tx, orderWithDetails);
      });
      results.push(res);
      console.log(`     Call ${i}: alreadySettled=${res.alreadySettled}`);
    }

    console.log("--- Assertion Verification ---");

    const sellerAfter = await prisma.user.findUnique({
      where: { id: seller.id },
      select: { earningsBalanceCents: true },
    });

    const sellerEarningKey = `${order.id}-SELLER_EARNING`;
    const platformFeeKey = `${order.id}-PLATFORM_FEE`;
    const qaFeeKey = `${order.id}-QA_FEE`;

    const [sellerTxCount, platformTxCount, qaTxCount] = await Promise.all([
      prisma.transaction.count({ where: { idempotencyKey: sellerEarningKey } }),
      prisma.transaction.count({ where: { idempotencyKey: platformFeeKey } }),
      prisma.transaction.count({ where: { idempotencyKey: qaFeeKey } }),
    ]);

    const latestOrder = await prisma.order.findUnique({
      where: { id: order.id },
      select: { status: true, settledAt: true },
    });

    const successCalls = results.filter((r) => !r.alreadySettled).length;
    const skippedCalls = results.filter((r) => r.alreadySettled).length;

    console.log(`Success (First): ${successCalls}`);
    console.log(`Skipped (Idempotent): ${skippedCalls}`);
    console.log(`Final Seller Balance: ${sellerAfter?.earningsBalanceCents} cents`);
    console.log(`SELLER_EARNING tx rows by idempotencyKey: ${sellerTxCount}`);
    console.log(`PLATFORM_FEE tx rows by idempotencyKey: ${platformTxCount}`);
    console.log(`QA_FEE tx rows by idempotencyKey: ${qaTxCount}`);
    console.log(`Order status: ${latestOrder?.status} settledAt: ${latestOrder?.settledAt ? latestOrder.settledAt.toISOString() : "null"}`);

    let failed = false;

    if (successCalls !== 1) {
      console.error("[FAIL] Expected exactly 1 successful settlement call.");
      failed = true;
    }

    if (sellerTxCount !== 1) {
      console.error("[FAIL] Expected exactly 1 SELLER_EARNING transaction row (idempotencyKey unique lock).");
      failed = true;
    }

    if (platformTxCount !== 1) {
      console.error("[FAIL] Expected exactly 1 PLATFORM_FEE transaction row.");
      failed = true;
    }

    // QA disabled in this seeded order, so qa fee should not exist
    if (qaTxCount !== 0) {
      console.error("[FAIL] Expected 0 QA_FEE transaction rows for QA-disabled order.");
      failed = true;
    }

    // Expected seller net: gross 10000 - platform fee 500 (5%)
    const expectedSellerNetCents = 9500;
    if (sellerAfter?.earningsBalanceCents !== expectedSellerNetCents) {
      console.error(`[FAIL] Expected seller balance ${expectedSellerNetCents}, got ${sellerAfter?.earningsBalanceCents}`);
      failed = true;
    }

    if (latestOrder?.status !== "completed" || !latestOrder?.settledAt) {
      console.error("[FAIL] Expected order status=completed and settledAt to be set.");
      failed = true;
    }

    if (failed) {
      console.error("\n❌ [FAIL] P0-2 Hard Idempotency Regression FAILED.");
      process.exit(1);
    }

    console.log("\n✅ [PASS] P0-2 Hard Idempotency Verified.");

    if (hasFlag("--cleanup")) {
      console.log("[cleanup] Removing seeded rows (best-effort)...");
      // best-effort cleanup order: dependent rows first
      await prisma.transaction.deleteMany({ where: { orderId: seeded.orderId } }).catch(() => undefined);
      await prisma.delivery.deleteMany({ where: { orderId: seeded.orderId } }).catch(() => undefined);
      await prisma.order.deleteMany({ where: { id: seeded.orderId } }).catch(() => undefined);
      await prisma.listing.deleteMany({ where: { id: seeded.listingId } }).catch(() => undefined);
      await prisma.freelancerProfile.deleteMany({ where: { id: seeded.sellerFreelancerProfileId } }).catch(() => undefined);
      await prisma.user.deleteMany({ where: { id: seeded.buyerId } }).catch(() => undefined);
      await prisma.user.deleteMany({ where: { id: seeded.sellerId } }).catch(() => undefined);
      console.log("[cleanup] done");
    }

    process.exit(0);
  } catch (error) {
    console.error("\n❌ [ERROR] Test crashed:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect().catch(() => undefined);
    await pool.end().catch(() => undefined);
  }
}

main();
