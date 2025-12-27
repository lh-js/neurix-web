// 简单的结构化数据组件，放在首页中使用（SSR 友好）

export function HomePageSchemaOrg() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Neurix AI 助手平台',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web',
    description:
      'Neurix 是一个功能强大的 AI 助手平台，支持多会话聊天、智能对话、代码生成、文案创作、数据分析等各类 AI 任务。让 AI 帮你完成各种任务，提高工作效率。',
    url: 'https://your-domain.com',
    inLanguage: 'zh-CN',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY',
      availability: 'https://schema.org/InStock',
    },
    featureList: ['智能聊天对话', '代码生成与优化', '文案创作助手', '数据分析与总结', '多会话管理'],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      ratingCount: '1',
    },
  }

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Neurix',
    url: 'https://your-domain.com',
    logo: 'https://your-domain.com/logo.png',
    description:
      'Neurix 是一个功能强大的 AI 助手平台，支持多会话聊天、智能对话、代码生成、文案创作、数据分析等各类 AI 任务。',
    sameAs: [],
  }

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Neurix',
    url: 'https://your-domain.com',
    description:
      'Neurix 是一个功能强大的 AI 助手平台，支持多会话聊天、智能对话、代码生成、文案创作、数据分析等各类 AI 任务。',
    inLanguage: 'zh-CN',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://your-domain.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
    </>
  )
}
