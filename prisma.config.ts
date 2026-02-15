import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';
import path from 'path';

// 强制加载 .env.local，因为 Next.js 习惯把本地开发变量放这里
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config(); // 兜底加载 .env

if (!process.env.DATABASE_URL) {
  throw new Error('错误：无法读取 DATABASE_URL。请确保根目录下有 .env.local 或 .env 文件且包含该变量。');
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
