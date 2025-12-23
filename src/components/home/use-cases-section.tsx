import { ScrollReveal } from '@/components/common/scroll-reveal'

export function UseCasesSection() {
  const useCases = [
    {
      role: '开发者',
      tasks: ['代码生成和优化', 'Bug 排查和修复', '技术文档编写', '代码审查建议', 'API 设计优化'],
      icon: '👨‍💻',
    },
    {
      role: '产品经理',
      tasks: ['需求文档整理', '产品方案设计', '用户反馈分析', '竞品分析报告', '功能规划建议'],
      icon: '👨‍💼',
    },
    {
      role: '运营人员',
      tasks: ['营销文案创作', '活动方案策划', '数据分析报告', '内容运营策略', '用户增长方案'],
      icon: '📈',
    },
    {
      role: '其他角色',
      tasks: ['邮件和文档撰写', '会议纪要整理', '学习计划制定', '知识问答助手', '创意灵感获取'],
      icon: '👤',
    },
  ]

  return (
    <section className="border-b border-border/40">
      <div className="mx-auto max-w-7xl px-4 py-20 md:py-28">
        <ScrollReveal direction="up">
          <header className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                适用于各种场景
              </span>
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              无论你是开发者、产品经理、运营人员还是其他角色， Neurix 都能帮助你提高工作效率。
            </p>
          </header>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {useCases.map((scene, idx) => (
            <ScrollReveal
              key={scene.role}
              direction={idx % 2 === 0 ? 'left' : 'right'}
              delay={idx * 100}
            >
              <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-background p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-lg hover-lift">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg animate-float">
                    {scene.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{scene.role}</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {scene.tasks.map(task => (
                    <li key={task} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
