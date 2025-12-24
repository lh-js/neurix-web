'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface MarkdownContentProps {
  content: string
  className?: string
}

export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // 复制失败时静默处理
    }
  }

  return (
    <div className={`markdown-content ${className} [&>*:last-child]:mb-0`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // 自定义代码块样式
          code(props) {
            const { inline, className, children, ...rest } = props as {
              inline?: boolean
              className?: string
              children?: React.ReactNode
            }
            const match = /language-(\w+)/.exec(className || '')
            // 更健壮地获取代码文本，避免出现 [object Object]
            const codeText = Array.isArray(children)
              ? children
                  .map(child => (typeof child === 'string' ? child : ''))
                  .join('')
                  .replace(/\n$/, '')
              : String(children).replace(/\n$/, '')

            return !inline && match ? (
              <div className="relative my-3 group/code">
                {/* 语言标签 + 复制按钮区域 */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-xs font-mono z-10">
                  <span className="px-2 py-0.5 rounded bg-background/90 border border-border/40 text-muted-foreground/80">
                    {match[1]}
                  </span>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      handleCopy(codeText)
                    }}
                    className="px-2 py-0.5 rounded bg-background/90 border border-border/40 text-muted-foreground/80 hover:bg-muted/80 transition-colors"
                  >
                    {copied ? '已复制' : '复制'}
                  </button>
                </div>

                <pre className="overflow-x-auto rounded-lg text-sm hljs">
                  <code className={`${className || ''} hljs`} {...rest}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono" {...props}>
                {children}
              </code>
            )
          },
          // 自定义段落样式
          p({ children }) {
            return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
          },
          // 自定义标题样式
          h1({ children }) {
            return <h1 className="text-xl font-bold mb-2 mt-4 first:mt-0">{children}</h1>
          },
          h2({ children }) {
            return <h2 className="text-lg font-semibold mb-2 mt-3 first:mt-0">{children}</h2>
          },
          h3({ children }) {
            return <h3 className="text-base font-semibold mb-1 mt-2 first:mt-0">{children}</h3>
          },
          // 自定义列表样式
          ul({ children }) {
            return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
          },
          li({ children }) {
            return <li className="ml-2">{children}</li>
          },
          // 自定义引用样式
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary/30 pl-4 my-2 italic text-muted-foreground">
                {children}
              </blockquote>
            )
          },
          // 自定义链接样式
          a({ children, href }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80 transition-colors"
              >
                {children}
              </a>
            )
          },
          // 自定义表格样式
          table({ children }) {
            return (
              <div className="overflow-x-auto my-2">
                <table className="markdown-table min-w-full border-collapse border rounded-lg">
                  {children}
                </table>
              </div>
            )
          },
          thead({ children }) {
            return <thead className="bg-muted">{children}</thead>
          },
          th({ children }) {
            return <th className="px-3 py-2 text-left font-semibold">{children}</th>
          },
          td({ children }) {
            return <td className="px-3 py-2">{children}</td>
          },
          // 自定义分隔线
          hr() {
            return <hr className="my-4 border-border" />
          },
          // 自定义强调
          strong({ children }) {
            return <strong className="font-semibold">{children}</strong>
          },
          em({ children }) {
            return <em className="italic">{children}</em>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
