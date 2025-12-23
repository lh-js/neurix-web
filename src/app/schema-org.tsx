// 简单的结构化数据组件，放在首页中使用（SSR 友好）

export function HomePageSchemaOrg() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Neurix AI 助手平台',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web',
    description:
      'Neurix 是面向开发者和团队的 AI 助手平台，支持多会话聊天、权限管理、调用日志审计等能力，帮助你安全高效地接入大模型。',
    url: 'https://your-domain.com',
    inLanguage: 'zh-CN',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY',
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
