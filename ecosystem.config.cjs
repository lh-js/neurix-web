/**
 * PM2 配置文件
 * 用于部署和管理 Next.js 应用
 */
module.exports = {
  apps: [
    {
      name: 'neurix-web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: './',
      instances: 1, // 单实例运行，如需集群模式可设置为 'max' 或具体数字
      exec_mode: 'fork', // fork 模式，集群模式使用 'cluster'
      watch: false, // 生产环境建议关闭文件监听
      max_memory_restart: '1G', // 内存超过 1G 自动重启
      env: {
        NODE_ENV: 'production',
        PORT: 3000, // Next.js 默认端口
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      // 日志配置
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true, // 日志添加时间戳
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true, // 合并日志
      // 自动重启配置
      autorestart: true,
      max_restarts: 10, // 最大重启次数
      min_uptime: '10s', // 最小运行时间，少于此时长视为异常重启
      restart_delay: 4000, // 重启延迟（毫秒）
      // 优雅关闭配置，避免 Server Action 冲突
      kill_timeout: 5000, // 优雅关闭超时时间
      wait_ready: true, // 等待应用就绪
      listen_timeout: 10000, // 监听超时时间
      // 其他配置
      kill_timeout: 5000, // 优雅关闭超时时间
      listen_timeout: 10000, // 监听超时时间
      shutdown_with_message: true, // 关闭时发送消息
    },
  ],
}
