import { ScrollReveal } from '@/components/common/scroll-reveal'

export function FAQSection() {
  const faqs = [
    {
      q: 'Neurix 现在有哪些功能？',
      a: '目前 Neurix 主要提供智能聊天对话功能，支持多会话管理、上下文理解、流式输出等。我们正在不断开发新功能，未来会有更多强大的 AI 能力加入，包括代码生成、图像处理、文档分析等。',
    },
    {
      q: '如何开始使用 Neurix？',
      a: '非常简单！点击页面上的"立即开始对话"按钮，或者直接访问 /chat 页面，就可以开始与 AI 对话了。你可以创建多个会话，每个会话都是独立的，方便管理不同的任务。',
    },
    {
      q: 'Neurix 会记录我的对话内容吗？',
      a: '是的，Neurix 会保存你的对话历史，这样你可以在任何时候回顾之前的对话内容。所有数据都安全存储，只有你可以访问自己的对话记录。我们非常重视用户隐私和数据安全。',
    },
    {
      q: '未来会有哪些新功能？',
      a: '我们正在规划更多功能，包括但不限于：代码生成工具、文档生成器、数据分析助手、图像处理、语音交互等。我们会根据用户需求持续迭代和优化，让 Neurix 成为最强大的 AI 工作平台。',
    },
    {
      q: 'Neurix 支持哪些 AI 模型？',
      a: 'Neurix 目前支持多种主流 AI 模型，包括 DeepSeek、GPT 等。我们正在不断接入更多优秀的 AI 模型，为用户提供更多选择。你可以在设置中选择不同的模型来满足不同的需求。',
    },
    {
      q: '如何提高 AI 回答的质量？',
      a: '提供更详细的上下文信息、明确你的需求、使用具体的示例，都能帮助 AI 生成更好的回答。你也可以通过多轮对话来逐步完善结果，让 AI 根据你的反馈不断优化。',
    },
  ]

  return (
    <section className="border-b border-border/40">
      <div className="mx-auto max-w-4xl px-4 py-20 md:py-28">
        <ScrollReveal direction="up">
          <header className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                常见问题
              </span>
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              关于 Neurix 的一些常见问题解答
            </p>
          </header>
        </ScrollReveal>

        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <ScrollReveal key={faq.q} direction="up" delay={idx * 100}>
              <article className="rounded-xl border border-border/60 bg-background p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md hover-lift">
                <h3 className="mb-3 text-lg font-semibold text-foreground">{faq.q}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
