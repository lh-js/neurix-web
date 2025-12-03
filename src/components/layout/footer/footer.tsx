import { FooterBrand } from './components/footer-brand'
import { FooterLinksSection } from './components/footer-links-section'
import { FooterContact } from './components/footer-contact'
import { FooterBottom } from './components/footer-bottom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm">
      <div className="container">
        <div className="flex flex-col gap-6 py-8 md:py-10 px-4 sm:px-6 lg:px-8">
          {/* 主要内容区域 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FooterBrand />
            <FooterLinksSection
              title="快速链接"
              links={[
                { label: '首页', href: '/' },
                { label: '管理员登录', href: '/login' },
              ]}
            />
            <FooterLinksSection
              title="资源"
              links={[
                { label: '文档', href: '#', external: true },
                { label: 'API 参考', href: '#', external: true },
                { label: '帮助中心', href: '#', external: true },
              ]}
            />
            <FooterContact />
          </div>

          {/* 分隔线 */}
          <div className="border-t border-border/40" />

          {/* 底部版权信息 */}
          <FooterBottom year={currentYear} />
        </div>
      </div>
    </footer>
  )
}
