import dotenv from "dotenv";
import path from "path";

// 优先加载 .env.local (Next.js 默认)，其次加载 .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });



async function main() {
  const prisma = (await import("../lib/prisma")).default;
  const { RoyaltyService } = await import("../lib/services/royalty");

  console.log("🚀 开始验证：数字资产交易 + 90% 版税分润完整闭环...");

  // 1. 初始化环境 (随机邮箱避免冲突)
  const suffix = Math.random().toString(36).substring(7);
  const aliceEmail = `alice_${suffix}@test.com`;
  const bobEmail = `bob_${suffix}@test.com`;

  try {
    // 2. 创建角色
    console.log("--- 步骤 2: 创建角色 ---");
    const alice = await (prisma as any).user.create({
      data: {
        email: aliceEmail,
        name: "Creator Alice",
        username: `alice_${suffix}`,
      },
    });
    console.log(`✅ 已创建创作者 Alice: ${alice.id}`);

    const bob = await (prisma as any).user.create({
      data: {
        email: bobEmail,
        name: "Buyer Bob",
        username: `bob_${suffix}`,
      },
    });
    console.log(`✅ 已创建买家 Bob: ${bob.id}`);

    // 3. 发布资产 (Listing)
    console.log("--- 步骤 3: 发布数字资产 ---");
    const listing = await (prisma as any).listing.create({
      data: {
        creatorId: alice.id,
        type: "ASSET",
        price: 100.0,
        title: "STM32 HAL库终极指南",
        attachmentUrl: "https://drive.google.com/file/d/Bz...",
        instantDelivery: true,
        status: "active",
      },
    });
    console.log(`✅ Alice 已发布资产: ${listing.id}, 价格: ${listing.price}`);

    // 4. 模拟购买 (Order)
    console.log("--- 步骤 4: 模拟下单 ---");
    const order = await (prisma as any).order.create({
      data: {
        buyerId: bob.id,
        listingId: listing.id,
        amount: 100.0,
        status: "pending",
      },
    });
    console.log(`✅ Bob 已下单: ${order.id}, 状态: ${order.status}`);

    // 5. 模拟支付与分润
    console.log("--- 步骤 5: 模拟支付与调用分润引擎 ---");
    await (prisma as any).order.update({
      where: { id: order.id },
      data: { status: "paid" },
    });
    console.log(`✅ 订单 ${order.id} 已更新为 paid 状态`);

    console.log("执行 RoyaltyService.processOrderEarnings...");
    await RoyaltyService.processOrderEarnings(order.id);

    // 6. 断言验证
    console.log("--- 步骤 6: 验证结果 ---");

    // A. 验证交付链接
    const updatedOrder = await (prisma as any).order.findUnique({
      where: { id: order.id },
      include: { listing: true },
    });
    console.log(`📦 验证交付：资产链接为 ${updatedOrder?.listing.attachmentUrl}`);
    if (updatedOrder?.listing.attachmentUrl !== listing.attachmentUrl) {
      throw new Error("❌ 交付验证失败：附件链接不匹配");
    }

    // B. 验证创作者钱包余额
    const updatedAlice = await (prisma as any).user.findUnique({
      where: { id: alice.id },
    });
    const expectedBalance = 90.0;
    console.log(`💰 验证钱包：Alice 的当前余额为 ${updatedAlice?.earningsBalance}`);
    if (updatedAlice?.earningsBalance !== expectedBalance) {
      throw new Error(`❌ 钱包验证失败：期望余额 ${expectedBalance}，实际余额 ${updatedAlice?.earningsBalance}`);
    }

    // C. 验证交易流水
    const transaction = await (prisma as any).transaction.findFirst({
      where: {
        orderId: order.id,
        type: "SALE_EARNING",
      },
    });
    console.log(`📜 验证流水：找到交易类型为 ${transaction?.type}，金额为 ${transaction?.amount}`);
    if (!transaction || transaction.amount !== expectedBalance || transaction.beneficiaryId !== alice.id) {
      throw new Error("❌ 流水验证失败：Transaction 记录不正确");
    }

    console.log("\n✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨");
    console.log("✅ 验证成功：创作者获得了 90% 收益！");
    console.log("✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨\n");

  } catch (error) {
    console.error("\n❌ 验证流程出错:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
