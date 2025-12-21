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
    # 清理旧的构建缓存，避免 Server Action ID 冲突
    if [ -d ".next" ]; then
        log_info "清理旧的构建缓存..."
        # 清理缓存目录（包含 Server Action 的 ID 映射）
        rm -rf .next/cache
        # 清理 server 目录中的旧文件（可能包含旧的 Server Action）
        if [ -d ".next/server" ]; then
            find .next/server -name "*.js" -type f -delete 2>/dev/null || true
        fi
        # 清理 standalone 目录（如果使用 standalone 输出）
        if [ -d ".next/standalone" ]; then
            rm -rf .next/standalone/.next/cache 2>/dev/null || true
        fi
        # 清理路由缓存（可能包含旧的 Server Action ID）
        if [ -f ".next/routes-manifest.json" ]; then
            rm -f .next/routes-manifest.json 2>/dev/null || true
        fi
    fi
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
    # 等待进程完全停止
    sleep 3
    # 确保进程已完全停止
    if pgrep -f "next.*start" > /dev/null; then
        log_warn "检测到残留的 Next.js 进程，正在清理..."
        pkill -f "next.*start" || true
        sleep 2
    fi
    # 清理构建缓存，避免 Server Action ID 冲突
    if [ -d ".next" ]; then
        log_info "清理旧的构建缓存（避免 Server Action 错误）..."
        # 清理缓存目录（包含 Server Action 的 ID 映射）
        rm -rf .next/cache
        # 清理 server 目录中的旧文件（可能包含旧的 Server Action）
        if [ -d ".next/server" ]; then
            find .next/server -name "*.js" -type f -delete 2>/dev/null || true
        fi
        # 清理 standalone 目录（如果使用 standalone 输出）
        if [ -d ".next/standalone" ]; then
            rm -rf .next/standalone/.next/cache 2>/dev/null || true
        fi
        # 清理路由缓存（可能包含旧的 Server Action ID）
        if [ -d ".next/routes-manifest.json" ]; then
            rm -f .next/routes-manifest.json 2>/dev/null || true
        fi
    fi
fi

log_info "启动应用..."
pm2 start ecosystem.config.cjs --env production
pm2 save

log_info "等待应用启动..."
# 增加等待时间，确保应用完全启动
sleep 8

# 再次检查，如果还没就绪，再等待
for i in {1..5}; do
    if pm2 list | grep -q "$APP_NAME.*online"; then
        break
    fi
    log_info "应用还在启动中，等待 ${i} 秒..."
    sleep 2
done

# 检查应用状态和端口
# 优先使用 pm2 jlist 获取 JSON 格式（最可靠）
PM2_STATUS=""
if command -v jq &> /dev/null; then
    PM2_STATUS=$(pm2 jlist 2>/dev/null | jq -r ".[] | select(.name==\"$APP_NAME\") | .pm2_env.status" 2>/dev/null || echo "")
fi

# 如果 jq 不可用，从表格输出中提取（状态在第5列）
if [ -z "$PM2_STATUS" ] || [ "$PM2_STATUS" = "null" ]; then
    # PM2 表格格式：│ id │ name │ mode │ ↺ │ status │ cpu │ memory │
    # 状态在第5列（用 │ 分隔），需要去除空格
    # 格式：│ 9  │ neurix-web │ fork │ 0 │ online │ 0% │ 169.3mb │
    # 使用简单的方法：找到包含应用名称的行，然后提取第5列
    PM2_STATUS=$(pm2 list 2>/dev/null | grep "$APP_NAME" | awk -F'│' '{
        # 清理所有列的空格
        for(i=1;i<=NF;i++) {
            gsub(/^[ \t]+|[ \t]+$/, "", $i)
        }
        # 状态在第5列
        if (NF >= 5) {
            status = $5
            # 只输出有效状态
            if (status == "online" || status == "stopped" || status == "errored" || status == "launching" || status == "stopping") {
                print status
            }
        }
    }' | head -1 || echo "")
fi

# 如果还是失败，尝试使用 pm2 describe（最后的手段）
if [ -z "$PM2_STATUS" ] || [ "$PM2_STATUS" = "null" ]; then
    # pm2 describe 输出格式可能不同，尝试多种方式
    PM2_STATUS=$(pm2 describe "$APP_NAME" 2>/dev/null | grep -i "status" | grep -v "restart" | head -1 | awk -F'│' '{gsub(/^[ \t]+|[ \t]+$/, "", $2); if ($2 ~ /online|stopped|errored/) print $2}' || echo "")
fi

# 清理状态值，确保只包含有效的状态（避免获取到版本号等无效值）
if [ -n "$PM2_STATUS" ]; then
    case "$PM2_STATUS" in
        online|stopped|errored|launching|stopping)
            # 有效状态，保持不变
            ;;
        *)
            # 无效状态（可能是版本号或其他值），清空它，依赖端口检查
            log_warn "检测到无效的 PM2 状态值: '$PM2_STATUS'，将依赖端口检查"
            PM2_STATUS=""
            ;;
    esac
fi

# 检查端口是否被监听（这是最可靠的判断方式）
PORT_LISTENING=false

# 多次尝试检查端口，因为应用可能需要一些时间才能完全启动
for i in {1..3}; do
    if command -v lsof &> /dev/null; then
        if lsof -Pi :${PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
            PORT_LISTENING=true
            break
        fi
    elif command -v netstat &> /dev/null; then
        if netstat -tlnp 2>/dev/null | grep -q ":${PORT} "; then
            PORT_LISTENING=true
            break
        fi
    elif command -v ss &> /dev/null; then
        if ss -tlnp 2>/dev/null | grep -q ":${PORT} "; then
            PORT_LISTENING=true
            break
        fi
    fi
    
    if [ $i -lt 3 ]; then
        log_info "端口 ${PORT} 尚未监听，等待 2 秒后重试..."
        sleep 2
    fi
done

# 判断应用是否成功启动
if [ "$PM2_STATUS" = "online" ] || [ "$PORT_LISTENING" = true ]; then
    if [ "$PORT_LISTENING" = true ]; then
        if [ "$PM2_STATUS" = "online" ]; then
            log_info "应用启动成功 ✓ (PM2 状态: online, 端口 ${PORT} 正在监听)"
        else
            log_info "应用启动成功 ✓ (端口 ${PORT} 正在监听, PM2 状态检查失败但应用正常运行)"
        fi
    else
        log_warn "PM2 显示应用在线，但端口 ${PORT} 未被监听"
        log_warn "可能应用启动后立即退出了，请查看日志: pm2 logs $APP_NAME"
    fi
else
    log_error "应用启动失败！PM2 状态: ${PM2_STATUS:-unknown}, 端口 ${PORT} 未监听"
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
