import { ScrollReveal } from '@/components/common/scroll-reveal'

export function WorkflowSection() {
  const steps = [
    {
      step: '1',
      title: '描述你的需求',
      desc: '用自然语言告诉 AI 你想要完成什么任务，越详细越好。',
    },
    {
      step: '2',
      title: '提供必要信息',
      desc: '上传相关文档、代码、数据或其他素材，帮助 AI 更好地理解你的需求。',
    },
    {
      step: '3',
      title: 'AI 生成结果',
      desc: 'AI 会根据你的需求快速生成结果，包括代码、文案、分析报告等。',
    },
    {
      step: '4',
      title: '迭代优化',
      desc: '如果结果不满意，继续与 AI 对话，让它不断改进直到符合你的要求。',
    },
  ]

  return (
    <section className="border-b border-border/40 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-20 md:py-28">
        <ScrollReveal direction="up">
          <header className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                简单高效的工作流程
              </span>
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              只需几个简单步骤， 就能让 AI 帮你完成复杂的任务。
            </p>
          </header>
        </ScrollReveal>

        <div className="relative">
          {/* 连接线（桌面端显示）- 添加动画 */}
          <div className="absolute left-0 top-1/2 hidden h-0.5 w-full -translate-y-1/2 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 animate-gradient lg:block" />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, idx) => (
              <ScrollReveal key={step.step} direction="up" delay={idx * 150}>
                <div className="relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-primary bg-primary/10 text-2xl font-bold text-primary shadow-lg animate-glow hover-lift">
                    {step.step}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
