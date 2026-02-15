#!/bin/bash
# AI-Hub 极速部署脚本
set -e

cd /var/www/ai-hub

echo "Step 1: 检查环境..."
# 确保使用的是国内镜像
npm config set registry https://registry.npmmirror.com

# 检查 .env.local 是否完整
if [ ! -f .env.local ]; then
    echo "❌ 错误: 缺少 .env.local 文件"
    exit 1
fi

echo "Step 2: 增量安装依赖..."
# 使用 install 而不是 ci，在 node_modules 存在时会非常快
npm install

echo "Step 3: 同步数据库结构..."
npx prisma migrate deploy
npx prisma generate

echo "Step 4: 构建项目..."
# 清理缓存并构建
rm -rf .next
npm run build

echo "Step 5: 重启 PM2 服务..."
pm2 restart ai-hub --update-env

echo "✅ 部署成功！"
pm2 list
