#!/usr/bin/env bash
# scripts/deploy-tencent.sh (本地执行脚本)

echo "🚀 1. 推送代码到 GitHub..."
git add .
git commit -m "update: sync from cursor"
git push origin main

echo "🌐 2. 通知服务器执行部署..."
# 这里的 IP 已根据你之前的输出固定
ssh root@118.25.100.33 "cd /var/www/ai-hub && ./deploy.sh"

echo "✅ 全部完成！"
