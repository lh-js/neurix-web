'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, Square, User, Bot, Zap, ZapOff } from 'lucide-react'
import { useChat } from '@/hooks/chat/use-chat'
import { ChatMessage } from '@/service/types/auth'

export default function ChatPage() {
  const {
    messages,
    isLoading,
    isStreaming,
    useStream,
    currentStreamingMessage,
    streamingTimestamp,
    sendMessage,
    stopGeneration,
    toggleStream,
  } = useChat()

  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentStreamingMessage])

  // 处理发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const message = inputValue.trim()
    setInputValue('')
    await sendMessage(message)

    // 聚焦输入框
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // 渲染消息
  const renderMessage = (message: ChatMessage, isStreamingMessage = false) => {
    const isUser = message.role === 'user'
    const content = isStreamingMessage ? currentStreamingMessage : message.content

    return (
      <div
        key={message.id}
        className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        {!isUser && (
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary">
              <Bot className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        )}

        <div
          className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}
        >
          <div
            className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-2 ${
              isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
          >
            <div className="whitespace-pre-wrap break-words text-sm sm:text-base">
              {content}
              {isStreamingMessage && (
                <span className="inline-block w-0.5 h-5 bg-current animate-pulse ml-0.5" />
              )}
            </div>
          </div>
          <div className="text-xs text-muted-foreground px-2">
            {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>

        {isUser && (
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="max-w-4xl mx-auto py-6">
          {messages.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">开始对话</h3>
              <p className="text-muted-foreground max-w-sm">
                与AI助手进行智能对话，支持流式和标准两种模式
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(message => renderMessage(message))}

              {/* 流式消息 */}
              {isStreaming &&
                currentStreamingMessage &&
                renderMessage(
                  {
                    id: 'streaming',
                    role: 'assistant',
                    content: currentStreamingMessage,
                    timestamp: streamingTimestamp ?? messages[messages.length - 1]?.timestamp ?? 0,
                  },
                  true
                )}

              {/* 加载状态 - 只在非流式模式或流式开始前显示 */}
              {isLoading && !isStreaming && (
                <div className="flex gap-3 mb-4 justify-start">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <div className="bg-muted rounded-2xl px-4 py-2">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">正在思考</span>
                        <div className="flex gap-1">
                          <div
                            className="w-1 h-1 bg-current rounded-full animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          />
                          <div
                            className="w-1 h-1 bg-current rounded-full animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          />
                          <div
                            className="w-1 h-1 bg-current rounded-full animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入您的问题..."
                  disabled={isLoading}
                  className="pr-10 sm:pr-12 min-h-[44px] sm:min-h-[48px] py-2.5 sm:py-3 text-sm sm:text-base"
                />
              </div>

              <Button
                variant={useStream ? 'secondary' : 'outline'}
                size="lg"
                onClick={toggleStream}
                disabled={isLoading}
                className="px-2 sm:px-4 whitespace-nowrap hidden sm:flex"
                title={useStream ? '流式开启' : '流式关闭'}
              >
                {useStream ? (
                  <>
                    <Zap className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">流式开启</span>
                  </>
                ) : (
                  <>
                    <ZapOff className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">流式关闭</span>
                  </>
                )}
              </Button>

              <Button
                onClick={isLoading ? stopGeneration : handleSendMessage}
                disabled={!inputValue.trim() && !isLoading}
                size="lg"
                className="px-4 sm:px-6"
              >
                {isLoading ? <Square className="w-5 h-5" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 gap-1 sm:gap-0 text-xs text-muted-foreground">
              <span className="hidden sm:inline">按 Enter 发送，Shift + Enter 换行</span>
              <span className="sm:hidden">Enter 发送</span>
              {isLoading && (
                <span className="flex items-center gap-1">
                  {isStreaming ? '正在流式生成...' : '正在生成...'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
