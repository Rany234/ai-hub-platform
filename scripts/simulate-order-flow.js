const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { setupEnv, printDbInfo } = require('./utils');
setupEnv();
printDbInfo();

function safeDbInfo(url) {
  try {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: u.port,
      db: u.pathname?.replace(/^\//, ''),
      schema: u.searchParams.get('schema') || undefined,
    };
  } catch {
    return null;
  }
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('Missing DATABASE_URL in .env.local');
    process.exit(1);
  }

  const dbInfo = safeDbInfo(url);
  if (dbInfo) {
    console.log(`DB: ${dbInfo.host}:${dbInfo.port}/${dbInfo.db}${dbInfo.schema ? `?schema=${dbInfo.schema}` : ''}`);
  }

  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('--- 开始全链路订单测试（对齐 Prisma schema）---');

    // 1) 获取测试数据
    const buyer = await prisma.user.findFirst({
      where: { email: 'featured.employer@ai-hub.local' },
    });

    const listing = await prisma.listing.findFirst({
      include: { freelancerProfile: true },
    });

    if (!buyer || !listing || !listing.freelancerProfile) {
      console.error('缺少测试数据，请先运行 npx prisma db seed');
      return;
    }

    const sellerUserId = listing.freelancerProfile.userId;
    const sellerBefore = await prisma.user.findUnique({ where: { id: sellerUserId } });
    if (!sellerBefore) {
      console.error('卖家用户不存在，请检查 seed 数据');
      return;
    }

    const listingPriceCents = (listing.priceCents ?? 0) > 0
      ? listing.priceCents
      : Math.round(Number(listing.price) * 100);

    console.log(`买家: ${buyer.email || buyer.name || buyer.id} (${buyer.id})`);
    console.log(`卖家: ${sellerUserId}`);
    console.log(`服务: ${listing.title} (价格: ¥${(listingPriceCents / 100).toFixed(2)})`);
    console.log(`卖家当前余额: ¥${(Number(sellerBefore.earningsBalanceCents || 0) / 100).toFixed(2)}`);

    // 2) 创建订单 (pending + ESCROWED)
    console.log('\n[步骤 1] 创建订单...');
    const order = await prisma.order.create({
      data: {
        buyerId: buyer.id,
        listingId: listing.id,
        amount: listingPriceCents / 100,
        amountCents: listingPriceCents,
        status: 'pending',
        deliveryStatus: 'PAID',
        escrowStatus: 'ESCROWED',
      },
    });
    console.log(`订单已创建: ${order.id}, status=${order.status}, deliveryStatus=${order.deliveryStatus}, escrow=${order.escrowStatus}`);

    // 3) 支付订单 (paid)
    console.log('\n[步骤 2] 支付订单...');
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'paid' },
    });
    console.log('订单支付成功，status=paid');

    // 4) 卖家提交交付 (DELIVERED)
    console.log('\n[步骤 3] 卖家提交交付...');
    const delivery = await prisma.delivery.create({
      data: {
        orderId: order.id,
        content: '这是自动生成的交付内容',
        status: 'pending',
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { deliveryStatus: 'DELIVERED' },
    });

    // 写入事件日志：SUBMIT_DELIVERY
    await prisma.orderEventLog.create({
      data: {
        orderId: order.id,
        userId: buyer.id, // 这里没有卖家 userId 直接可用，先用 buyer 作为 actor（后续可升级为真实卖家）
        actorType: 'USER',
        action: 'SUBMIT_DELIVERY',
        fromStatus: 'PAID',
        toStatus: 'DELIVERED',
        fromEscrow: 'ESCROWED',
        toEscrow: 'ESCROWED',
        comment: '模拟：卖家提交交付',
      },
    });

    console.log(`交付记录已创建: ${delivery.id}, deliveryStatus=DELIVERED`);

    // 5) 买家验收与结算（ACCEPTED + RELEASED）
    console.log('\n[步骤 4] 买家验收与结算...');

    const CREATOR_RATE_BPS = 9000; // 90%
    const earningCents = Math.round((listingPriceCents * CREATOR_RATE_BPS) / 10000);

    await prisma.$transaction(async (tx) => {
      await tx.delivery.update({
        where: { id: delivery.id },
        data: { status: 'approved' },
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'completed',
          deliveryStatus: 'ACCEPTED',
          escrowStatus: 'RELEASED',
        },
      });

      await tx.user.update({
        where: { id: sellerUserId },
        data: {
          earningsBalanceCents: { increment: earningCents },
          earningsBalance: { increment: earningCents / 100 },
        },
      });

      await tx.transaction.create({
        data: {
          type: 'SELLER_EARNING',
          amount: earningCents / 100,
          amountCents: earningCents,
          orderId: order.id,
          beneficiaryId: sellerUserId,
        },
      });

      // 事件日志：ACCEPT_DELIVERY
      await tx.orderEventLog.create({
        data: {
          orderId: order.id,
          userId: buyer.id,
          actorType: 'USER',
          action: 'ACCEPT_DELIVERY',
          fromStatus: 'DELIVERED',
          toStatus: 'ACCEPTED',
          fromEscrow: 'ESCROWED',
          toEscrow: 'RELEASED',
          comment: '模拟：买家验收通过并释放托管',
        },
      });

      // 事件日志：RELEASE_FUNDS
      await tx.orderEventLog.create({
        data: {
          orderId: order.id,
          userId: buyer.id,
          actorType: 'SYSTEM',
          action: 'RELEASE_FUNDS',
          fromStatus: 'ACCEPTED',
          toStatus: 'CLOSED',
          fromEscrow: 'RELEASED',
          toEscrow: 'RELEASED',
          comment: '模拟：系统结算完成',
        },
      });
    });

    console.log('订单验收成功，收益已结算。');

    // 6) 验证结果
    console.log('\n--- 最终结果验证 ---');
    const sellerAfter = await prisma.user.findUnique({ where: { id: sellerUserId } });
    const finalOrder = await prisma.order.findUnique({ where: { id: order.id } });
    const txRow = await prisma.transaction.findFirst({ where: { orderId: order.id } });
    const logCount = await prisma.orderEventLog.count({ where: { orderId: order.id } });

    const beforeCents = Number(sellerBefore.earningsBalanceCents || 0);
    const afterCents = Number(sellerAfter?.earningsBalanceCents || 0);

    console.log(`卖家最终余额: ¥${(afterCents / 100).toFixed(2)} (增加: ¥${((afterCents - beforeCents) / 100).toFixed(2)})`);
    console.log(`订单最终: status=${finalOrder?.status}, deliveryStatus=${finalOrder?.deliveryStatus}, escrow=${finalOrder?.escrowStatus}`);
    console.log(`流水记录: ${txRow ? `已生成 (¥${txRow.amount})` : '未生成'}`);
    console.log(`事件日志条数: ${logCount}`);

    console.log(`\n订单详情页（本地）: http://localhost:3000/dashboard/orders/${order.id}#timeline`);

    if (
      finalOrder?.status === 'completed' &&
      finalOrder?.deliveryStatus === 'ACCEPTED' &&
      finalOrder?.escrowStatus === 'RELEASED' &&
      afterCents > beforeCents &&
      txRow
    ) {
      console.log('\n✅ 全链路测试成功！');
    } else {
      console.log('\n❌ 测试结果不符合预期。');
    }
  } catch (e) {
    console.error('测试运行异常:', e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
