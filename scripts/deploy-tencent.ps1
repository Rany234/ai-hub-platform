<#
 deploy-tencent.ps1

 作用：将本地项目源码同步到腾讯云服务器，并在服务器端安装依赖、生成 Prisma Client、构建 Next.js、用 PM2 启动/重启服务。
 特点：不依赖 GitHub（通过 scp 上传源码），并且默认在服务器上构建，避免跨平台构建兼容问题。

 前置条件：
 - 本机 Windows：PowerShell 7+，OpenSSH Client（Windows 可选功能），tar（Windows 11 通常自带 bsdtar）
 - 服务器：Node.js(v18+)、npm、pm2(全局)、以及已配置好 DATABASE_URL 等环境变量

 使用：
   1) 修改下方 SERVER_IP / SERVER_USER / REMOTE_DIR
   2) 在项目根目录执行：
      powershell -ExecutionPolicy Bypass -File .\scripts\deploy-tencent.ps1
#>

$ErrorActionPreference = "Stop"

# ============ 用户需要填写的变量 ============
$SERVER_IP = "YOUR_SERVER_IP"
$SERVER_USER = "ubuntu"
$REMOTE_DIR = "/var/www/ai-hub"

$PM2_APP_NAME = "ai-hub"
$APP_PORT = 3000

if ($SERVER_IP -eq "YOUR_SERVER_IP") {
  Write-Host "ERROR: 请先在脚本顶部填写 SERVER_IP / SERVER_USER / REMOTE_DIR" -ForegroundColor Red
  exit 1
}

Write-Host "选择构建方式：" -ForegroundColor Cyan
Write-Host "  1) 上传后在服务器构建（推荐）"
Write-Host "  2) 本地构建后上传（不推荐，可能有 OS 兼容问题）"
$BUILD_MODE = Read-Host "请输入 1 或 2 (默认 1)"
if ([string]::IsNullOrWhiteSpace($BUILD_MODE)) { $BUILD_MODE = "1" }

# 打包时排除的目录/文件
$EXCLUDES = @(
  "node_modules",
  ".next",
  ".git",
  ".env.local",
  ".env",
  "*.log"
)

$archiveName = "ai-hub-deploy.tgz"
$archivePath = Join-Path (Get-Location) $archiveName

# 生成 tar 排除参数
$tarExcludeArgs = @()
foreach ($e in $EXCLUDES) {
  $tarExcludeArgs += "--exclude=$e"
}

Write-Host "[1/4] 打包源码（排除 node_modules/.next/.git/.env.local/.env）" -ForegroundColor Cyan
if (Test-Path $archivePath) { Remove-Item $archivePath -Force }

# 使用 tar 打包当前目录
# 注意：Windows tar 通常是 bsdtar，参数兼容 --exclude
$tarCmd = @("tar", "-czf", $archiveName) + $tarExcludeArgs + @(".")
& $tarCmd[0] $tarCmd[1..($tarCmd.Length-1)]

Write-Host "[2/4] 上传压缩包到服务器" -ForegroundColor Cyan
$remote = "$SERVER_USER@$SERVER_IP"
scp $archiveName "$remote:/tmp/$archiveName" | Out-Null

Write-Host "[3/4] 远端解压并安装 / generate / build / pm2" -ForegroundColor Cyan

$remoteScript = @"
set -euo pipefail
mkdir -p '$REMOTE_DIR'
cd '$REMOTE_DIR'

tar -xzf /tmp/$archiveName
rm -f /tmp/$archiveName

echo 'Node:'
node -v

echo 'NPM:'
npm -v

npm install
npx prisma generate

if [ '$BUILD_MODE' = '1' ]; then
  npm run build
else
  echo '本地构建模式：跳过服务器 build（仍会 npm install / prisma generate / pm2 restart）'
fi

pm2 restart '$PM2_APP_NAME' || pm2 start npm --name '$PM2_APP_NAME' -- start
pm2 save

echo 'Done.'
"@

ssh $remote "bash -lc '$remoteScript'"

Write-Host "[4/4] 部署完成。" -ForegroundColor Green
Write-Host "- PM2 应用名: $PM2_APP_NAME"
Write-Host "- 应用端口: $APP_PORT"
Write-Host "- 如使用 Nginx，请确保反代到 127.0.0.1:$APP_PORT"

# 清理本地打包文件
Remove-Item $archivePath -Force
