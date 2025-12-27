import type { Metadata } from 'next'
import { HomePageSchemaOrg } from './schema-org'
import { HeroSection } from '@/components/home/hero-section'
import { FeaturesSection } from '@/components/home/features-section'
import { UseCasesSection } from '@/components/home/use-cases-section'
import { WorkflowSection } from '@/components/home/workflow-section'
import { ExamplesSection } from '@/components/home/examples-section'
import { TechFeaturesSection } from '@/components/home/tech-features-section'
import { CTASection } from '@/components/home/cta-section'
import { FAQSection } from '@/components/home/faq-section'

export const metadata: Metadata = {
  title: 'Neurix - 强大的 AI 助手平台，让 AI 帮你完成各种任务',
  description:
    'Neurix 是一个功能强大的 AI 助手平台，支持多会话聊天、智能对话、代码生成、文案创作、数据分析等各类 AI 任务。现在就开始体验 AI 带来的高效工作方式。',
  keywords: [
    'AI助手',
    '人工智能',
    'AI聊天',
    '代码生成',
    '文案创作',
    '数据分析',
    'AI工具',
    '智能对话',
    '多会话管理',
    'Neurix',
  ],
  authors: [{ name: 'Neurix Team' }],
  creator: 'Neurix',
  publisher: 'Neurix',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://your-domain.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Neurix - 强大的 AI 助手平台',
    description:
      '让 AI 帮你完成各种任务：聊天对话、代码生成、文案创作、数据分析，一切尽在 Neurix。',
    url: 'https://your-domain.com',
    siteName: 'Neurix',
    type: 'website',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Neurix - 强大的 AI 助手平台',
    description:
      '让 AI 帮你完成各种任务：聊天对话、代码生成、文案创作、数据分析，一切尽在 Neurix。',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

/**
 * 首页 - SEO 优化版本
 *
 * 页面结构：
 * - h1: 页面主标题（仅一个，位于 Hero 区域）
 * - h2: 各个主要章节标题（Features, Use Cases, Workflow, Examples, Tech Features, CTA, FAQ）
 * - h3: 各个章节内的子标题（功能卡片、使用场景、步骤等）
 *
 * 语义化标签：
 * - <main>: 页面主要内容区域
 * - <section>: 各个功能区块
 * - <header>: 章节标题区域
 * - <article>: 独立的内容卡片
 *
 * 所有内容都是服务器端渲染，右键查看源代码可以看到完整的 HTML 结构
 */
export default function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* 结构化数据（schema.org）- 用于搜索引擎理解页面内容 */}
      <HomePageSchemaOrg />

      {/* Hero 区域 - 包含页面唯一的 h1 标题 */}
      <HeroSection />

      {/* 核心功能展示 - h2: 强大的 AI 功能 */}
      <FeaturesSection />

      {/* 使用场景展示 - h2: 适用于各种场景 */}
      <UseCasesSection />

      {/* 工作流程展示 - h2: 简单高效的工作流程 */}
      <WorkflowSection />

      {/* 示例提示词 - h2: 实用的对话示例 */}
      <ExamplesSection />

      {/* 技术特性 - h2: 强大的技术能力 */}
      <TechFeaturesSection />

      {/* CTA 区域 - h2: 准备好开始了吗？ */}
      <CTASection />

      {/* FAQ 区域 - h2: 常见问题 */}
      <FAQSection />
    </main>
  )
}
