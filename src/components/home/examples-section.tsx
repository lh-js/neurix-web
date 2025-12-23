import { ScrollReveal } from '@/components/common/scroll-reveal'

export function ExamplesSection() {
  const categories = [
    {
      category: '代码开发',
      examples: [
        '帮我写一个 React 组件，实现用户登录功能',
        '解释一下这段代码的作用，并优化它',
        '生成这个接口的单元测试代码',
        '帮我排查这个错误的原因和解决方案',
        '重构这段代码，提高可读性和性能',
      ],
      icon: '💻',
    },
    {
      category: '文案创作',
      examples: [
        '为这个产品写一份吸引人的产品介绍',
        '帮我写一封给客户的商务邮件',
        '生成 5 条不同风格的营销文案',
        '帮我润色这段文字，让它更专业',
        '写一份产品发布公告',
      ],
      icon: '✍️',
    },
    {
      category: '数据分析',
      examples: [
        '分析这些数据，总结主要趋势',
        '从这份报告中提取关键信息',
        '帮我整理成结构化的会议纪要',
        '根据这些反馈，给出改进建议',
        '对比这两组数据，找出差异点',
      ],
      icon: '📊',
    },
    {
      category: '学习助手',
      examples: [
        '用通俗的语言解释这个概念',
        '帮我制定一个学习计划',
        '总结这篇文章的核心观点',
        '帮我准备这个主题的演讲稿',
        '生成一份知识要点总结',
      ],
      icon: '📚',
    },
    {
      category: '日常办公',
      examples: [
        '帮我写一份周报总结',
        '整理这份文档的要点',
        '生成一个项目计划大纲',
        '帮我写一份工作总结',
        '整理会议讨论的关键决策',
      ],
      icon: '📝',
    },
    {
      category: '创意灵感',
      examples: [
        '给我一些产品命名的建议',
        '想一些活动主题的创意',
        '帮我设计一个营销方案',
        '提供一些内容创作的思路',
        '生成几个创新的解决方案',
      ],
      icon: '💡',
    },
  ]

  return (
    <section className="border-b border-border/40">
      <div className="mx-auto max-w-7xl px-4 py-20 md:py-28">
        <ScrollReveal direction="up">
          <header className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                实用的对话示例
              </span>
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              以下是一些可以直接使用的提示词示例，帮助你快速上手。每个类别都提供了多个实际场景，
              你可以直接复制使用或根据需求调整。
            </p>
          </header>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, idx) => (
            <ScrollReveal key={category.category} direction="up" delay={idx * 100}>
              <article className="group relative overflow-hidden rounded-xl border border-border/60 bg-background p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-lg hover-lift">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-2xl animate-float">{category.icon}</span>
                  <h3 className="text-lg font-semibold text-foreground">{category.category}</h3>
                </div>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  {category.examples.map(example => (
                    <li key={example} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-primary/40" />
                      <span className="leading-relaxed">{example}</span>
                    </li>
                  ))}
                </ul>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
