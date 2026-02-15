const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is missing in .env.local');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No user found in database. Please register a user first.');
      return;
    }

    const listing = await prisma.listing.create({
      data: {
        creatorId: user.id,
        title: '精选 AI 提示词库',
        description: '包含 50+ 个经过优化的 GPT-4 和 Midjourney 提示词，助力高效创作。',
        price: 49.0,
        category: 'assets',
        status: 'active',
        metadata: {
          sub_category: 'prompt',
          delivery_days: 1
        },
        previewUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
      }
    });

    console.log('Successfully created test listing:', listing.id);
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await pool.end();
  }
}

main();
