# PM2 部署指南

本文档说明如何使用 PM2 部署和管理 Next.js 应用。

## 前置要求

1. **Node.js** (推荐 v18+)
2. **pnpm** (项目使用的包管理器)
3. **PM2** (进程管理器)

### 安装 PM2

```bash
npm install -g pm2
```

## 配置文件说明

### ecosystem.config.cjs

PM2 配置文件，包含以下主要配置：

- **应用名称**: `neurix-web`
- **运行模式**: `fork` (单实例)
- **端口**: `3000` (可在配置文件中修改)
- **内存限制**: 超过 1G 自动重启
- **日志目录**: `./logs/`
- **自动重启**: 启用

### 环境变量

在 `ecosystem.config.cjs` 中配置环境变量，或使用 `.env` 文件。

**注意**: 生产环境的环境变量（如 API 地址、密钥等）应通过以下方式配置：

1. 在 `ecosystem.config.cjs` 的 `env_production` 中添加
2. 使用 `.env.production` 文件
3. 使用系统环境变量

## 部署步骤

### 1. 完整部署（推荐首次部署）

```bash
./deploy.sh
```

此脚本会：
- 检查必要的命令（node, pnpm, pm2）
- 拉取代码（如果存在 Git 仓库）
- 创建日志目录
- 安装依赖 (`pnpm install`)
- 构建项目 (`pnpm build`)
- 停止并删除旧进程
- 启动 PM2 应用
- 检查应用状态和端口监听
- 保存 PM2 进程列表
- 显示最近的日志

### 2. 快速重启（已构建项目）

```bash
./deploy.sh --quick
```

或使用其他选项：

```bash
# 跳过 git pull
./deploy.sh --skip-git

# 跳过安装依赖
./deploy.sh --skip-install

# 跳过构建
./deploy.sh --skip-build

# 组合使用
./deploy.sh --skip-git --skip-build
```

### 3. 查看帮助

```bash
./deploy.sh --help
```

### 3. 手动部署

```bash
# 1. 拉取代码（可选）
git pull

# 2. 安装依赖
pnpm install

# 3. 构建项目
pnpm build

# 4. 停止旧进程（如果存在）
pm2 stop neurix-web || true
pm2 delete neurix-web || true

# 5. 启动应用
pm2 start ecosystem.config.cjs --env production

# 6. 保存进程列表
pm2 save
```

## PM2 常用命令

### 查看应用状态

```bash
pm2 status
pm2 list
```

### 查看日志

```bash
# 查看所有日志
pm2 logs

# 查看指定应用日志
pm2 logs neurix-web

# 查看最近 100 行日志
pm2 logs neurix-web --lines 100

# 实时查看日志（类似 tail -f）
pm2 logs neurix-web --lines 0
```

### 重启应用

```bash
# 重启应用
pm2 restart neurix-web

# 重启并更新环境变量
pm2 restart neurix-web --update-env

# 优雅重启（零停机）
pm2 reload neurix-web
```

### 停止应用

```bash
# 停止应用
pm2 stop neurix-web

# 停止所有应用
pm2 stop all
```

### 删除应用

```bash
# 删除应用（从 PM2 列表中移除）
pm2 delete neurix-web

# 删除所有应用
pm2 delete all
```

### 监控

```bash
# 打开监控面板
pm2 monit

# 查看详细信息
pm2 show neurix-web
```

### 保存和恢复

```bash
# 保存当前进程列表
pm2 save

# 恢复保存的进程列表
pm2 resurrect

# 设置开机自启（需要先保存）
pm2 startup
```

## 集群模式（可选）

如果需要使用集群模式提高性能，修改 `ecosystem.config.cjs`:

```javascript
{
  instances: 'max', // 或具体数字，如 4
  exec_mode: 'cluster',
}
```

**注意**: Next.js 在集群模式下需要确保应用是无状态的。

## 环境变量配置

### 方式 1: 在 ecosystem.config.cjs 中配置

```javascript
env_production: {
  NODE_ENV: 'production',
  PORT: 3000,
  NEXT_PUBLIC_API_BASE_URL: 'https://api.example.com',
  // 其他环境变量...
}
```

### 方式 2: 使用 .env 文件

在项目根目录创建 `.env.production`:

```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

### 方式 3: 系统环境变量

在服务器上设置系统环境变量，PM2 会自动读取。

## 日志管理

日志文件位置：
- 错误日志: `./logs/pm2-error.log`
- 输出日志: `./logs/pm2-out.log`
- 合并日志: `./logs/pm2-combined.log`

### 日志轮转

PM2 支持日志轮转，安装 pm2-logrotate：

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 故障排查

### 应用无法启动

1. 检查端口是否被占用：
   ```bash
   lsof -i :3000
   ```

2. 查看错误日志：
   ```bash
   pm2 logs neurix-web --err
   ```

3. 检查环境变量：
   ```bash
   pm2 show neurix-web
   ```

### 应用频繁重启

1. 查看日志找出错误原因
2. 检查内存使用情况：`pm2 monit`
3. 调整 `max_memory_restart` 配置

### 性能问题

1. 使用集群模式提高并发处理能力
2. 监控资源使用：`pm2 monit`
3. 检查 Next.js 构建优化

## 安全建议

1. **不要提交敏感信息**: 确保 `.env*` 文件在 `.gitignore` 中
2. **使用环境变量**: 生产环境密钥通过环境变量配置
3. **定期更新**: 保持 Node.js 和依赖包的最新版本
4. **日志权限**: 确保日志文件权限设置正确

## 生产环境检查清单

- [ ] PM2 已安装并配置
- [ ] 环境变量已正确配置
- [ ] 日志目录已创建
- [ ] 应用已构建 (`pnpm build`)
- [ ] 应用已启动并运行正常
- [ ] PM2 进程列表已保存 (`pm2 save`)
- [ ] 开机自启已配置 (`pm2 startup`)
- [ ] 日志轮转已配置
- [ ] 监控已设置

## 相关资源

- [PM2 官方文档](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [PM2 最佳实践](https://pm2.keymetrics.io/docs/usage/application-declaration/)
