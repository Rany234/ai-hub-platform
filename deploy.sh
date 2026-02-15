#!/bin/bash
# AI-Hub 一键部署脚本

echo "🚀 开始部署更新..."

# 1. 进入项目目录
cd /var/www/ai-hub || exit

# 2. 清理旧缓存 (解决 Server Action 冲突的关键)
echo "清理旧缓存..."
rm -rf .next

# 3. 重新构建
echo "正在重新构建项目..."
npm run build

# 4. 重启 PM2 服务
echo "重启服务..."
pm2 restart ai-hub

echo "✅ 部署完成！"
pm2 list
