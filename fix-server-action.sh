#!/bin/bash

# ============================================
# 修复 Next.js Server Action 错误脚本
# ============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

APP_NAME="neurix-web"

log_info "开始修复 Server Action 错误..."

# 1. 停止应用
log_info "停止应用..."
pm2 stop "$APP_NAME" || true
pm2 delete "$APP_NAME" || true

# 2. 清理所有 Next.js 相关进程
log_info "清理残留进程..."
pkill -f "next.*start" || true
sleep 2

# 3. 清理构建缓存
log_info "清理构建缓存..."
if [ -d ".next" ]; then
    rm -rf .next/cache
    log_info "已清理 .next/cache"
fi

# 4. 清理 PM2 日志（可选）
log_info "清理 PM2 日志..."
pm2 flush "$APP_NAME" || true

# 5. 重新构建
log_info "重新构建项目..."
pnpm run build

# 6. 启动应用
log_info "启动应用..."
pm2 start ecosystem.config.cjs --env production
pm2 save

log_info "等待应用启动..."
sleep 5

# 7. 检查状态
log_info "检查应用状态..."
pm2 status

log_info "修复完成！"
log_info "如果问题仍然存在，请检查："
echo "  1. 确保所有浏览器标签页已关闭并重新打开"
echo "  2. 清除浏览器缓存"
echo "  3. 查看日志: pm2 logs $APP_NAME"
