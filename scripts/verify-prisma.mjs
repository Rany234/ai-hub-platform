import { fileURLToPath } from "url";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { setupEnv, printDbInfo } = require("./utils");
setupEnv();
printDbInfo();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env like prisma.config.ts / Next.js local dev
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Missing DATABASE_URL. Ensure .env.local/.env is present and contains DATABASE_URL.");
    process.exitCode = 1;
    return;
  }

  const pool = new pg.Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("--- Order Verification ---");
    const orderCount = await prisma.order.count();
    console.log("orderCount:", orderCount);

    const recentOrders = await prisma.order.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: {
        listing: { select: { title: true } },
      },
    });
    console.log("recentOrders(include listing):");
    console.log(JSON.stringify(recentOrders, null, 2));

    console.log("--- Review Verification ---");
    const reviewCount = await prisma.review.count();
    console.log("reviewCount:", reviewCount);

    console.log("--- Asset Verification ---");
    const assetCount = await prisma.asset.count();
    console.log("assetCount:", assetCount);

    const assetRelationCount = await prisma.assetRelation.count();
    console.log("assetRelationCount:", assetRelationCount);

    const assetFileCount = await prisma.assetFile.count();
    console.log("assetFileCount:", assetFileCount);

    console.log("OK");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error("Verification failed:");
  console.error(e);
  process.exitCode = 1;
});
