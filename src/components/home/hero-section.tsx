export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-br from-background via-background to-muted/30">
      {/* 背景装饰元素 - 添加动画 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-[800px] w-[800px] animate-pulse-glow rounded-full bg-primary/5 blur-3xl" />
        <div
          className="absolute -right-1/4 bottom-0 h-[600px] w-[600px] animate-pulse-glow rounded-full bg-primary/5 blur-3xl"
          style={{ animationDelay: '1s' }}
        />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 animate-float rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-32 lg:py-40">
        <header className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span>AI 驱动的智能工作平台</span>
          </div>

          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="animate-fade-in-up inline-block bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              让 AI 帮你
            </span>
            <br />
            <span className="animate-fade-in-up inline-block bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent animate-gradient">
              完成各种任务
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Neurix 是一个强大的 AI 助手平台，无论是聊天对话、代码生成、文案创作、数据分析，
            还是其他任何你能想到的 AI 任务，都可以在这里轻松完成。
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="/chat"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl animate-glow"
            >
              <span className="relative z-10">立即开始对话</span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary opacity-0 transition-opacity group-hover:opacity-100 animate-shimmer" />
            </a>
            <a
              href="#features"
              className="glow-effect inline-flex items-center justify-center rounded-lg border-2 border-border bg-background/50 px-8 py-3.5 text-base font-semibold text-foreground backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-accent hover-lift"
            >
              了解更多功能
            </a>
          </div>

          {/* 功能亮点卡片 */}
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: '智能对话', desc: '多轮对话，上下文理解' },
              { title: '代码生成', desc: '快速生成和优化代码' },
              { title: '文案创作', desc: '各类文案一键生成' },
              { title: '数据分析', desc: '智能分析和总结' },
            ].map((item, idx) => (
              <article
                key={idx}
                className="group relative overflow-hidden rounded-xl border border-border/60 bg-background/80 p-5 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg hover-lift"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100 animate-shimmer" />
                <h3 className="relative z-10 text-sm font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="relative z-10 mt-1 text-xs text-muted-foreground">{item.desc}</p>
              </article>
            ))}
          </div>
        </header>
      </div>
    </section>
  )
}
