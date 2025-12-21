#!/bin/bash

# ============================================
# Neurix Web 部署脚本
# ============================================

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 解析命令行参数
SKIP_GIT=false
SKIP_INSTALL=false
SKIP_BUILD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-git)
            SKIP_GIT=true
            shift
            ;;
        --skip-install)
            SKIP_INSTALL=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        -h|--help)
            echo "用法: $0 [选项]"
            echo ""
            echo "选项:"
            echo "  --skip-git       跳过 git pull"
            echo "  --skip-install   跳过安装依赖"
            echo "  --skip-build     跳过构建项目"
            echo "  -h, --help       显示帮助信息"
            exit 0
            ;;
        *)
            log_error "未知参数: $1"
            echo "使用 $0 --help 查看帮助信息"
            exit 1
            ;;
    esac
done

# 获取当前目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

log_info "当前工作目录: $SCRIPT_DIR"

# 第一步：拉取代码
if [ "$SKIP_GIT" = false ]; then
    if [ -d ".git" ]; then
        log_step "第一步：拉取代码..."
        git pull || log_warn "Git pull 失败，继续执行..."
    else
        log_warn "当前目录不是 Git 仓库，跳过 git pull"
    fi
else
    log_info "跳过 git pull"
fi

# 第二步：安装依赖
if [ "$SKIP_INSTALL" = false ]; then
    log_step "第二步：安装依赖..."
    pnpm install --frozen-lockfile
else
    log_info "跳过安装依赖"
fi

# 第三步：打包
if [ "$SKIP_BUILD" = false ]; then
    log_step "第三步：打包项目 (强制使用 webpack，禁用 Turbopack)..."
    NEXT_USE_TURBOPACK=0 pnpm run build -- --webpack
else
    log_info "跳过构建项目"
fi

# 第四步：PM2 部署
log_step "第四步：PM2 部署..."
APP_NAME="neurix-web"

# 检查进程是否存在
if pm2 list | grep -q "$APP_NAME"; then
    log_info "进程已存在，执行重启..."
    pm2 restart "$APP_NAME" --update-env
else
    log_info "进程不存在，启动新进程..."
    pm2 start ecosystem.config.cjs --env production
fi

pm2 save

log_info "部署完成！"
pm2 status
