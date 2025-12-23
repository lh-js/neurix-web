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
  openGraph: {
    title: 'Neurix - 强大的 AI 助手平台',
    description:
      '让 AI 帮你完成各种任务：聊天对话、代码生成、文案创作、数据分析，一切尽在 Neurix。',
    url: 'https://your-domain.com',
    type: 'website',
  },
}

// 服务器组件首页，所有文案直接在 HTML 中输出，右键"查看页面源代码"即可看到完整内容
export default function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* 结构化数据（schema.org） */}
      <HomePageSchemaOrg />

      {/* Hero 区域 */}
      <HeroSection />

      {/* 核心功能展示 */}
      <FeaturesSection />

      {/* 使用场景展示 */}
      <UseCasesSection />

      {/* 工作流程展示 */}
      <WorkflowSection />

      {/* 示例提示词 */}
      <ExamplesSection />

      {/* 技术特性 */}
      <TechFeaturesSection />

      {/* CTA 区域 */}
      <CTASection />

      {/* FAQ 区域 */}
      <FAQSection />
    </main>
  )
}
