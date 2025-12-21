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

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 未安装，请先安装 $1"
        exit 1
    fi
}

# 解析命令行参数
SKIP_GIT=false
SKIP_INSTALL=false
SKIP_BUILD=false
QUICK_MODE=false

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
        --quick)
            QUICK_MODE=true
            SKIP_GIT=true
            SKIP_INSTALL=true
            SKIP_BUILD=true
            shift
            ;;
        -h|--help)
            echo "用法: $0 [选项]"
            echo ""
            echo "选项:"
            echo "  --quick          快速模式（跳过 git pull、安装依赖、构建）"
            echo "  --skip-git       跳过 git pull"
            echo "  --skip-install   跳过安装依赖"
            echo "  --skip-build     跳过构建项目"
            echo "  -h, --help       显示帮助信息"
            echo ""
            echo "示例:"
            echo "  $0               完整部署"
            echo "  $0 --quick       快速重启（仅重启 PM2）"
            echo "  $0 --skip-build  跳过构建（适用于已构建项目）"
            exit 0
            ;;
        *)
            log_error "未知参数: $1"
            echo "使用 $0 --help 查看帮助信息"
            exit 1
            ;;
    esac
done

# 检查必要的命令
log_step "检查必要的命令..."
check_command "node"
check_command "pnpm"
check_command "pm2"

# 获取当前目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

log_info "当前工作目录: $SCRIPT_DIR"

# 第一步：拉取代码（可选）
if [ "$SKIP_GIT" = false ]; then
    if [ -d ".git" ]; then
        log_step "拉取代码..."
        git pull || log_warn "Git pull 失败，继续执行..."
    else
        log_warn "当前目录不是 Git 仓库，跳过 git pull"
    fi
else
    log_info "跳过 git pull"
fi

# 创建日志目录
log_info "创建日志目录..."
mkdir -p logs

# 第二步：安装依赖（可选）
if [ "$SKIP_INSTALL" = false ]; then
    log_step "安装依赖..."
    pnpm install --frozen-lockfile
else
    log_info "跳过安装依赖"
fi

# 第三步：构建项目（可选）
if [ "$SKIP_BUILD" = false ]; then
    log_step "构建项目..."
    pnpm run build
else
    log_info "跳过构建项目"
fi

# 第四步：PM2 部署
log_step "部署应用..."
APP_NAME="neurix-web"
PORT=3000

# 检查应用是否在运行
if pm2 list | grep -q "$APP_NAME"; then
    log_info "停止现有进程..."
    pm2 stop "$APP_NAME" || true
    pm2 delete "$APP_NAME" || true
    sleep 2
fi

log_info "启动应用..."
pm2 start ecosystem.config.cjs --env production
pm2 save

log_info "等待应用启动..."
sleep 5

# 检查应用状态和端口
PM2_STATUS=$(pm2 list | grep "$APP_NAME" | awk '{print $10}' || echo "")

if [ "$PM2_STATUS" = "online" ]; then
    # 检查端口是否被监听
    PORT_LISTENING=false
    
    if command -v lsof &> /dev/null; then
        if lsof -Pi :${PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
            PORT_LISTENING=true
        fi
    elif command -v netstat &> /dev/null; then
        if netstat -tlnp 2>/dev/null | grep -q ":${PORT} "; then
            PORT_LISTENING=true
        fi
    elif command -v ss &> /dev/null; then
        if ss -tlnp 2>/dev/null | grep -q ":${PORT} "; then
            PORT_LISTENING=true
        fi
    fi
    
    if [ "$PORT_LISTENING" = true ]; then
        log_info "应用启动成功 ✓ (端口 ${PORT} 正在监听)"
    else
        log_warn "PM2 显示应用在线，但端口 ${PORT} 未被监听"
        log_warn "可能应用启动后立即退出了，请查看日志: pm2 logs $APP_NAME"
    fi
else
    log_error "应用启动失败！PM2 状态: ${PM2_STATUS:-unknown}"
    log_error "请查看日志了解详情: pm2 logs $APP_NAME"
fi

log_info "部署完成！"
pm2 status

# 显示最近的错误日志（如果有）
log_info "最近的日志输出:"
pm2 logs "$APP_NAME" --lines 10 --nostream 2>&1 | tail -10 || true

echo ""
log_info "常用命令:"
echo "  查看日志: pm2 logs $APP_NAME"
echo "  查看状态: pm2 status"
echo "  重启应用: pm2 restart $APP_NAME"
echo "  停止应用: pm2 stop $APP_NAME"
