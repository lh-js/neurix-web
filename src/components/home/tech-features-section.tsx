import { ScrollReveal } from '@/components/common/scroll-reveal'

export function TechFeaturesSection() {
  const features = [
    {
      title: '多会话管理',
      desc: '支持同时管理多个对话会话，每个会话独立保存，方便切换和回顾历史对话。支持会话重命名、删除等操作。',
      feature: '会话隔离',
    },
    {
      title: '上下文理解',
      desc: 'AI 能够记住对话历史，理解上下文关系，提供连贯和准确的回答。支持长对话场景，不会丢失上下文。',
      feature: '智能记忆',
    },
    {
      title: '实时响应',
      desc: '支持流式输出，实时显示 AI 的回复内容，提供流畅的交互体验。可以随时停止生成，控制响应速度。',
      feature: '流式输出',
    },
    {
      title: '高性能架构',
      desc: '采用现代化的技术架构，确保系统稳定性和高性能。支持高并发访问，响应速度快，用户体验流畅。',
      feature: '高性能',
    },
    {
      title: '响应式设计',
      desc: '完美适配桌面端和移动端，无论在哪里都能流畅使用。自适应布局，提供最佳的用户体验。',
      feature: '全平台',
    },
    {
      title: '持续更新',
      desc: '我们正在不断开发新功能，未来会有更多强大的 AI 能力加入平台。包括代码生成、图像处理等。',
      feature: '持续迭代',
    },
  ]

  return (
    <section className="border-b border-border/40 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-20 md:py-28">
        <ScrollReveal direction="up">
          <header className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                强大的技术能力
              </span>
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              Neurix 不仅功能强大，在技术实现上也采用了现代化的方案， 确保稳定性和性能。
            </p>
          </header>
        </ScrollReveal>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <ScrollReveal key={feature.title} direction="up" delay={idx * 100}>
              <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-background p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-lg hover-lift">
                <div className="mb-3 inline-block rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {feature.feature}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
