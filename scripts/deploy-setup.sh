#!/usr/bin/env bash
set -euo pipefail

# deploy-setup.sh
#
# 作用：在一台全新的 Linux 服务器（Ubuntu/Debian 或 CentOS/RHEL）上快速安装运行本项目所需的基础环境。
# 包含：Node.js (LTS v18+)、Nginx、PM2、Git。
# 可选：PostgreSQL（如果你不使用腾讯云的数据库实例）。
#
# 使用方式：
#   chmod +x scripts/deploy-setup.sh
#   sudo ./scripts/deploy-setup.sh

if [[ $EUID -ne 0 ]]; then
  echo "Please run as root: sudo $0"
  exit 1
fi

OS_FAMILY="unknown"
if command -v apt-get >/dev/null 2>&1; then
  OS_FAMILY="debian"
elif command -v yum >/dev/null 2>&1; then
  OS_FAMILY="rhel"
elif command -v dnf >/dev/null 2>&1; then
  OS_FAMILY="rhel"
fi

echo "Detected OS family: ${OS_FAMILY}"

install_node_debian() {
  # 安装 Node.js LTS（v18+）
  # 使用 NodeSource 官方源，避免系统自带版本过旧
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get update -y
  apt-get install -y nodejs
}

install_node_rhel() {
  # 安装 Node.js LTS（v18+）
  curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
  if command -v dnf >/dev/null 2>&1; then
    dnf install -y nodejs
  else
    yum install -y nodejs
  fi
}

install_nginx_debian() {
  # 安装 Nginx：用于 80 端口反向代理到 3000
  apt-get update -y
  apt-get install -y nginx
  systemctl enable nginx
  systemctl start nginx
}

install_nginx_rhel() {
  # 安装 Nginx：用于 80 端口反向代理到 3000
  if command -v dnf >/dev/null 2>&1; then
    dnf install -y nginx
  else
    yum install -y nginx
  fi
  systemctl enable nginx
  systemctl start nginx
}

install_git_debian() {
  # 安装 Git：用于拉取项目代码
  apt-get update -y
  apt-get install -y git
}

install_git_rhel() {
  # 安装 Git：用于拉取项目代码
  if command -v dnf >/dev/null 2>&1; then
    dnf install -y git
  else
    yum install -y git
  fi
}

install_pm2() {
  # 安装 PM2：Node 进程守护与开机自启
  npm i -g pm2
  pm2 -v
}

install_postgres_debian() {
  # 可选：安装 PostgreSQL（若使用云数据库可跳过）
  apt-get update -y
  apt-get install -y postgresql postgresql-contrib
  systemctl enable postgresql
  systemctl start postgresql
}

install_postgres_rhel() {
  # 可选：安装 PostgreSQL（若使用云数据库可跳过）
  if command -v dnf >/dev/null 2>&1; then
    dnf install -y postgresql-server postgresql-contrib
  else
    yum install -y postgresql-server postgresql-contrib
  fi
  # 初始化数据库（仅首次）
  if [[ -x "$(command -v postgresql-setup 2>/dev/null)" ]]; then
    postgresql-setup --initdb
  fi
  systemctl enable postgresql
  systemctl start postgresql
}

echo "Installing Git..."
if [[ "${OS_FAMILY}" == "debian" ]]; then
  install_git_debian
elif [[ "${OS_FAMILY}" == "rhel" ]]; then
  install_git_rhel
else
  echo "Unsupported OS. Please install Git manually."
fi

echo "Installing Node.js (LTS v20.x)..."
if [[ "${OS_FAMILY}" == "debian" ]]; then
  install_node_debian
elif [[ "${OS_FAMILY}" == "rhel" ]]; then
  install_node_rhel
else
  echo "Unsupported OS. Please install Node.js manually (v18+)."
fi

node -v
npm -v

echo "Installing Nginx..."
if [[ "${OS_FAMILY}" == "debian" ]]; then
  install_nginx_debian
elif [[ "${OS_FAMILY}" == "rhel" ]]; then
  install_nginx_rhel
else
  echo "Unsupported OS. Please install Nginx manually."
fi

echo "Installing PM2..."
install_pm2

cat <<'EOF'

✅ 基础环境安装完成。

下一步建议：
1) 将 Nginx 配置模板复制到 /etc/nginx/conf.d/ 或 /etc/nginx/sites-available/ 并 reload Nginx。
2) 拉取项目代码：git clone ...
3) 安装依赖：npm ci
4) 构建：npm run build
5) 用 PM2 启动：pm2 start npm --name ai-hub -- start
6) 设置开机自启：pm2 startup && pm2 save

可选：若你需要本机 PostgreSQL：
- Ubuntu/Debian: sudo apt-get install -y postgresql
- CentOS/RHEL: sudo yum/dnf install -y postgresql-server

EOF
