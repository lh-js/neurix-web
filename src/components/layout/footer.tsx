import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm">
      <div className="container">
        <div className="flex flex-col gap-6 py-8 md:py-10 px-4 sm:px-6 lg:px-8">
          {/* 主要内容区域 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* 品牌信息 */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Neurix
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                智能AI平台，为您提供强大的AI能力和优质的服务体验。
              </p>
            </div>

            {/* 快速链接 */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-sm font-semibold text-foreground">快速链接</h3>
              <nav className="flex flex-col space-y-3">
                <Link 
                  href="/" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 w-fit"
                >
                  首页
                </Link>
                <Link 
                  href="/home" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 w-fit"
                >
                  主页
                </Link>
                <Link 
                  href="/login" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 w-fit"
                >
                  管理员登录
                </Link>
              </nav>
            </div>

            {/* 资源 */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-sm font-semibold text-foreground">资源</h3>
              <nav className="flex flex-col space-y-3">
                <a 
                  href="#" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 w-fit"
                >
                  文档
                </a>
                <a 
                  href="#" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 w-fit"
                >
                  API 参考
                </a>
                <a 
                  href="#" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 w-fit"
                >
                  帮助中心
                </a>
              </nav>
            </div>

            {/* 联系信息 */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-sm font-semibold text-foreground">联系我们</h3>
              <div className="flex flex-col space-y-3">
                <a 
                  href="mailto:support@neurix.com" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 w-fit"
                >
                  support@neurix.com
                </a>
                <a 
                  href="#" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 w-fit"
                >
                  意见反馈
                </a>
              </div>
            </div>
          </div>

          {/* 分隔线 */}
          <div className="border-t border-border/40" />

          {/* 底部版权信息 */}
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row pt-2">
            <p className="text-xs text-muted-foreground text-center md:text-left">
              © {currentYear} Neurix. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <a 
                href="#" 
                className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                隐私政策
              </a>
              <a 
                href="#" 
                className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                服务条款
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

