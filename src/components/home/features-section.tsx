import { ScrollReveal } from '@/components/common/scroll-reveal'

export function FeaturesSection() {
  const features = [
    {
      title: '智能聊天对话',
      desc: '支持多轮对话，AI 能够理解上下文，记住之前的对话内容，提供连贯的回答和建议。',
      icon: '💬',
      gradient: 'from-blue-500/10 to-cyan-500/10',
      border: 'border-blue-500/20',
      delay: 100,
    },
    {
      title: '代码生成与优化',
      desc: '描述你的需求，AI 就能生成代码。也可以让 AI 帮你优化、重构、解释代码，提高开发效率。',
      icon: '💻',
      gradient: 'from-purple-500/10 to-pink-500/10',
      border: 'border-purple-500/20',
      delay: 200,
    },
    {
      title: '文案创作助手',
      desc: '无论是营销文案、产品介绍、邮件内容还是社交媒体文案，AI 都能帮你快速生成和优化。',
      icon: '✍️',
      gradient: 'from-amber-500/10 to-orange-500/10',
      border: 'border-amber-500/20',
      delay: 300,
    },
    {
      title: '数据分析与总结',
      desc: '上传数据、日志或文档，AI 帮你分析、总结、提取关键信息，快速获得洞察。',
      icon: '📊',
      gradient: 'from-emerald-500/10 to-teal-500/10',
      border: 'border-emerald-500/20',
      delay: 400,
    },
    {
      title: '多会话管理',
      desc: '同时管理多个对话会话，每个会话独立保存，方便切换和回顾，让工作更有条理。',
      icon: '📁',
      gradient: 'from-indigo-500/10 to-blue-500/10',
      border: 'border-indigo-500/20',
      delay: 500,
    },
    {
      title: '持续更新中',
      desc: '我们正在不断开发新的 AI 功能，未来会有更多强大的能力加入，敬请期待。',
      icon: '🚀',
      gradient: 'from-rose-500/10 to-pink-500/10',
      border: 'border-rose-500/20',
      delay: 600,
    },
  ]

  return (
    <section id="features" className="border-b border-border/40 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-20 md:py-28">
        <ScrollReveal direction="up">
          <header className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                强大的 AI 功能
              </span>
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              无论你需要什么样的 AI 帮助，Neurix 都能为你提供强大的支持。现在从聊天对话开始，
              未来还会有更多功能陆续上线。
            </p>
          </header>
        </ScrollReveal>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map(feature => (
            <ScrollReveal key={feature.title} direction="up" delay={feature.delay}>
              <article
                className={`group relative overflow-hidden rounded-2xl border ${feature.border} bg-gradient-to-br ${feature.gradient} bg-background p-6 shadow-sm transition-all hover:scale-[1.02] hover:shadow-xl hover-lift`}
              >
                <div className="mb-4 text-4xl animate-float">{feature.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
