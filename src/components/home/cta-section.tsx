import { ScrollReveal } from '@/components/common/scroll-reveal'

export function CTASection() {
  return (
    <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
      <div className="absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[400px] w-[400px] animate-pulse-glow rounded-full bg-primary/10 blur-3xl" />
        <div
          className="absolute right-1/4 bottom-0 h-[400px] w-[400px] animate-pulse-glow rounded-full bg-primary/10 blur-3xl"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 animate-rotate rounded-full bg-primary/5 blur-2xl"
          style={{ animationDuration: '30s' }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-20 md:py-28 text-center">
        <ScrollReveal direction="up">
          <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              准备好开始了吗？
            </span>
          </h2>
          <p className="mb-10 text-lg text-muted-foreground md:text-xl">
            立即开始体验 Neurix 的强大功能，让 AI 帮你提高工作效率。 无需注册，直接开始使用。
          </p>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={200}>
          <a
            href="/chat"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-primary px-10 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl animate-glow"
          >
            <span className="relative z-10">立即开始对话</span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary opacity-0 transition-opacity group-hover:opacity-100 animate-shimmer" />
          </a>
        </ScrollReveal>
      </div>
    </section>
  )
}
