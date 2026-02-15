#!/usr/bin/env bash
set -euo pipefail

# deploy-tencent.sh
#
# 作用：将本地项目源码同步到腾讯云服务器，并在服务器端安装依赖、生成 Prisma Client、构建 Next.js、用 PM2 启动/重启服务。
# 特点：不依赖 GitHub（通过 rsync/scp 上传源码），并且默认在服务器上构建，避免跨平台构建兼容问题。
#
# 前置条件：
# - 本机：bash、ssh、rsync
# - 服务器：Node.js(v18+)、npm、pm2(全局)、以及已配置好 DATABASE_URL 等环境变量
#
# 使用：
#   chmod +x scripts/deploy-tencent.sh
#   ./scripts/deploy-tencent.sh

# ============ 用户需要填写的变量 ============
SERVER_IP="YOUR_SERVER_IP"
SERVER_USER="ubuntu"
REMOTE_DIR="/var/www/ai-hub"

# 端口（与 package.json 的 start 保持一致）
APP_PORT="3000"
PM2_APP_NAME="ai-hub"

# ============ 选择构建方式 ============
echo "选择构建方式："
echo "  1) 上传后在服务器构建（推荐）"
echo "  2) 本地构建后上传（不推荐，可能有 OS 兼容问题）"
read -r -p "请输入 1 或 2 (默认 1): " BUILD_MODE
BUILD_MODE=${BUILD_MODE:-1}

if [[ "${SERVER_IP}" == "YOUR_SERVER_IP" ]]; then
  echo "ERROR: 请先在脚本顶部填写 SERVER_IP / SERVER_USER / REMOTE_DIR"
  exit 1
fi

# ============ 确保远端目录存在 ============
echo "[1/4] 准备远端目录: ${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}"
ssh "${SERVER_USER}@${SERVER_IP}" "mkdir -p '${REMOTE_DIR}'"

# ============ 同步文件 ============
echo "[2/4] 同步源码到服务器（排除 node_modules/.next/.git/.env.local）"
rsync -az --delete \
  --exclude "node_modules" \
  --exclude ".next" \
  --exclude ".git" \
  --exclude ".env.local" \
  --exclude ".env" \
  --exclude "*.log" \
  ./ "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/"

# ============ 远端执行命令 ============
echo "[3/4] 在服务器端安装依赖 / generate / build / pm2"

REMOTE_CMD="set -euo pipefail; cd '${REMOTE_DIR}'; \
  echo 'Node:'; node -v; echo 'NPM:'; npm -v; \
  if [[ '${BUILD_MODE}' == '2' ]]; then \
    echo '本地构建模式：跳过服务器 build（仍会 npm install / prisma generate / pm2 restart）'; \
  fi; \
  npm install; \
  npx prisma generate; \
  if [[ '${BUILD_MODE}' == '1' ]]; then \
    npm run build; \
  fi; \
  pm2 restart '${PM2_APP_NAME}' || pm2 start npm --name '${PM2_APP_NAME}' -- start; \
  pm2 save; \
  echo 'Done.'"

ssh "${SERVER_USER}@${SERVER_IP}" "bash -lc \"${REMOTE_CMD}\""

# ============ 完成提示 ============
echo "[4/4] 部署完成。"
echo "- PM2 应用名: ${PM2_APP_NAME}"
echo "- 应用端口: ${APP_PORT}"
echo "- 如使用 Nginx，请确保反代到 127.0.0.1:${APP_PORT}"
