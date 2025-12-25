'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, Square, User, Bot, Zap, ZapOff, Menu } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { useChat } from '@/hooks/chat/use-chat'
import { useChatSessions } from '@/hooks/chat/use-chat-sessions'
import { SessionList } from '@/components/chat/session-list'
import { MarkdownContent } from '@/components/chat/markdown-content'
import { ChatMessage } from '@/service/types/chat-message'

export default function ChatPage() {
  const {
    sessions,
    currentSession,
    currentSessionId,
    loading: sessionsLoading,
    loadingMessages,
    deletingSessionId,
    creatingSession,
    updatingTitleSessionId,
    createSession,
    deleteSession,
    switchSession,
    updateSessionMessages,
    updateSessionTitle,
  } = useChatSessions()

  const messages = useMemo(() => currentSession?.messages || [], [currentSession?.messages])
  const [inputValue, setInputValue] = useState('')
  const [mobileSessionListOpen, setMobileSessionListOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesRef = useRef<ChatMessage[]>([])
  const inputContainerRef = useRef<HTMLDivElement>(null)
  const isKeyboardOpenRef = useRef(false)
  const focusTimeoutsRef = useRef<NodeJS.Timeout[]>([])

  // 当会话切换时，确保有当前会话
  useEffect(() => {
    if (!currentSessionId && sessions.length === 0 && !sessionsLoading) {
      createSession().catch(() => {
        // 创建失败时静默处理，避免无限循环
      })
    }
  }, [currentSessionId, sessions.length, sessionsLoading, createSession])

  const {
    isLoading,
    isStreaming,
    useStream,
    currentStreamingMessage,
    streamingTimestamp,
    sendMessage: sendChatMessage,
    stopGeneration,
    toggleStream,
  } = useChat({
    messages,
    conversationId: currentSessionId || undefined,
    onMessagesChange: newMessagesOrUpdater => {
      if (currentSessionId) {
        // 处理函数式更新，使用 ref 确保获取最新状态
        const newMessages =
          typeof newMessagesOrUpdater === 'function'
            ? newMessagesOrUpdater(messagesRef.current)
            : newMessagesOrUpdater
        // 由于使用了自动保存，这里只需要更新本地状态
        // 后端会自动保存，我们只需要刷新消息列表
        updateSessionMessages(currentSessionId, newMessages)
      }
    },
    onMessageSaved: () => {
      // AI 响应完成后，updateSessionMessages 已经会刷新消息列表
      // 这里不需要额外操作，避免重复调用
    },
  })

  // 同步 messages 到 ref
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  // 使用 useMemo 派生流式消息的 key 和时间
  const streamingKey = useMemo(() => {
    if (streamingTimestamp !== null && currentSessionId) {
      return `streaming-${currentSessionId}-${streamingTimestamp}`
    }
    return `streaming-${currentSessionId || 'none'}`
  }, [streamingTimestamp, currentSessionId])

  const streamingCreateTime = useMemo(() => {
    if (streamingTimestamp !== null) {
      return new Date(streamingTimestamp).toISOString()
    }
    return new Date().toISOString()
  }, [streamingTimestamp])

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentStreamingMessage])

  // 处理发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !currentSessionId) return

    const message = inputValue.trim()
    setInputValue('')
    await sendChatMessage(message)

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

  // 处理输入框触摸开始事件（移动端提前处理）
  // 注意：不在这里滚动，让浏览器自然处理键盘弹出
  const handleInputTouchStart = () => {
    // 清除之前的延迟定时器，准备新的调整
    focusTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    focusTimeoutsRef.current = []
  }

  // 处理输入框失去焦点事件（更新键盘状态并重置页面位置）
  // 在 iOS 上，点击键盘关闭按钮时，浏览器会自动将页面滚动到输入框的自然位置
  // 我们需要模拟这个行为，确保点击页面其他位置时也能正确重置
  const handleInputBlur = () => {
    // 更新键盘状态为关闭
    isKeyboardOpenRef.current = false
    // 清除所有延迟定时器
    focusTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    focusTimeoutsRef.current = []

    // 检测是否为移动设备
    const isMobile =
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      (typeof window !== 'undefined' && window.innerWidth < 768)

    if (!isMobile || !inputContainerRef.current) return

    // 延迟重置页面位置，等待键盘收起动画完成
    // 模拟点击键盘关闭按钮的行为：将页面滚动到输入框的自然位置
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.visualViewport) {
        const viewport = window.visualViewport
        const windowHeight = window.innerHeight
        // 如果键盘已经收起（视口高度接近窗口高度）
        if (viewport.height >= windowHeight * 0.9) {
          // 使用 scrollIntoView 将输入框滚动到自然位置
          // 这模拟了点击键盘关闭按钮时浏览器的行为
          // 使用 'nearest' 和 'end' 确保输入框在视口底部可见
          inputContainerRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest',
          })

          // 额外处理：确保输入框在视口内的合适位置
          // 延迟执行，等待 scrollIntoView 完成
          setTimeout(() => {
            if (inputContainerRef.current) {
              const inputRect = inputContainerRef.current.getBoundingClientRect()
              const viewportHeight = viewport.height

              // 如果输入框太靠近底部或超出视口，调整位置
              // 但不要调整太多，保持输入框在自然位置
              if (inputRect.bottom > viewportHeight - 20) {
                // 轻微调整，让输入框在视口内可见
                const scrollOffset = inputRect.bottom - viewportHeight + 30
                window.scrollBy({
                  top: scrollOffset,
                  behavior: 'smooth',
                })
              }
            }
          }, 100)
        }
      } else {
        // 降级方案：如果没有 visualViewport，直接使用 scrollIntoView
        if (inputContainerRef.current) {
          inputContainerRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest',
          })
        }
      }
    }, 300) // 等待键盘收起动画完成
  }

  // 处理输入框焦点事件（移动端键盘弹出问题修复）
  // 不在这里立即滚动，让浏览器自然处理键盘弹出，我们只做微调
  const handleInputFocus = () => {
    // 检测是否为移动设备
    const isMobile =
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      (typeof window !== 'undefined' && window.innerWidth < 768)

    if (!isMobile || !inputContainerRef.current) return

    // 清除之前的延迟定时器
    focusTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    focusTimeoutsRef.current = []

    // 不在这里预调整，让 visualViewport 监听来处理，保持平滑效果
  }

  // 监听 visualViewport 变化（键盘弹出/收起）
  // 这是主要的调整逻辑，只在键盘真正弹出时才调整位置
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return

    const viewport = window.visualViewport
    let lastHeight = viewport.height

    const handleViewportResize = () => {
      // 快速检查：如果输入框没有焦点，直接返回
      if (inputRef.current !== document.activeElement) {
        lastHeight = viewport.height
        return
      }

      const currentHeight = viewport.height
      const heightDiff = lastHeight - currentHeight

      // 最低触发阈值 1px，键盘刚开始弹出立即检测，最快响应
      if (heightDiff > 1) {
        isKeyboardOpenRef.current = true

        // 立即同步调整，确保最快响应
        if (inputContainerRef.current) {
          const inputRect = inputContainerRef.current.getBoundingClientRect()
          const viewportHeight = currentHeight

          // 计算输入框是否被键盘遮挡（无容差，立即触发）
          const distanceToBottom = inputRect.bottom - viewportHeight

          // 如果输入框被键盘遮挡或接近底部，立即调整位置
          if (distanceToBottom > 0) {
            const scrollOffset = distanceToBottom + 20 // 20px 额外间距
            // 使用 smooth 平滑滚动，保持过渡效果，同时保持快速响应
            window.scrollBy({
              top: scrollOffset,
              behavior: 'smooth', // 平滑滚动，保持过渡效果
            })
          }
        }
      } else if (heightDiff < -1) {
        // 键盘收起
        isKeyboardOpenRef.current = false
      }

      lastHeight = currentHeight
    }

    viewport.addEventListener('resize', handleViewportResize)
    viewport.addEventListener('scroll', handleViewportResize)

    return () => {
      viewport.removeEventListener('resize', handleViewportResize)
      viewport.removeEventListener('scroll', handleViewportResize)
    }
  }, [])

  // 渲染消息（不包含 key，key 在 map 中处理）
  const renderMessage = (message: ChatMessage, isStreamingMessage = false) => {
    const isUser = message.role === 'user'
    const content = isStreamingMessage ? currentStreamingMessage : message.content

    return (
      <div
        className={`flex gap-3 mb-4 animate-message-in ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        {!isUser && (
          <Avatar className="w-8 h-8 flex-shrink-0 animate-avatar-bounce">
            <AvatarFallback className="bg-primary/10 text-primary relative overflow-visible">
              <Bot className="w-4 h-4" />
              {isStreamingMessage && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
              )}
            </AvatarFallback>
          </Avatar>
        )}

        <div
          className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}
        >
          <div
            className={`group relative rounded-2xl px-3 py-2 sm:px-4 sm:py-2 transition-all duration-300 ${
              isUser
                ? 'bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02]'
                : 'bg-muted hover:bg-muted/80 shadow-sm hover:shadow-md'
            }`}
          >
            {/* 用户消息的光晕效果 */}
            {isUser && (
              <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            )}
            <div className="break-words text-sm sm:text-base relative z-10">
              {isUser ? (
                // 用户消息保持纯文本，不渲染 Markdown
                <div className="whitespace-pre-wrap">{content.trimEnd()}</div>
              ) : (
                // AI 消息支持 Markdown
                <MarkdownContent content={content.trimEnd()} />
              )}
            </div>
          </div>
          <div className="text-xs text-muted-foreground px-2 animate-fade-in">
            {new Date(message.createTime).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>

        {isUser && (
          <Avatar className="w-8 h-8 flex-shrink-0 animate-avatar-bounce">
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background relative overflow-hidden">
      {/* 背景装饰效果 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* 移动端会话列表遮罩 */}
        {mobileSessionListOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileSessionListOpen(false)}
          />
        )}

        {/* 会话列表侧边栏 */}
        <div
          className={`${
            mobileSessionListOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 md:z-auto w-64 border-r border-border/40 flex-shrink-0 bg-background transition-transform duration-300`}
        >
          <SessionList
            sessions={sessions}
            currentSessionId={currentSessionId}
            loading={sessionsLoading}
            loadingMessages={loadingMessages}
            deletingSessionId={deletingSessionId}
            creatingSession={creatingSession}
            updatingTitleSessionId={updatingTitleSessionId}
            onSelectSession={id => {
              switchSession(id)
              setMobileSessionListOpen(false)
            }}
            onCreateSession={() => {
              createSession()
              setMobileSessionListOpen(false)
            }}
            onDeleteSession={deleteSession}
            onUpdateTitle={updateSessionTitle}
          />
        </div>

        {/* 聊天内容区域 */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 移动端会话列表按钮 */}
          <div className="md:hidden p-2 border-b border-border/40 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSessionListOpen(true)}
              className="h-8 w-8"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex-1 text-sm font-medium truncate">
              {currentSession?.title || '新对话'}
            </div>
          </div>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 relative">
            {/* 渐变遮罩效果 */}
            <div className="sticky top-0 h-8 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
            <div className="max-w-4xl mx-auto py-6">
              {currentSessionId &&
              loadingMessages.has(currentSessionId) &&
              messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Spinner className="h-8 w-8 mb-4" />
                  <p className="text-muted-foreground">加载消息中...</p>
                </div>
              ) : messages.length === 0 && !isLoading && !sessionsLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-float relative">
                    <Bot className="w-8 h-8 text-primary relative z-10" />
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">开始对话</h3>
                  <p className="text-muted-foreground max-w-sm">
                    与AI助手进行智能对话，支持流式和标准两种模式
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    // 为每个消息生成唯一的 key
                    const messageKey =
                      message.id > 0
                        ? `msg-${message.id}`
                        : `temp-${index}-${message.role}-${message.createTime}-${message.content.slice(0, 20)}`
                    return <div key={messageKey}>{renderMessage(message, false)}</div>
                  })}

                  {/* 流式消息 - 只在没有对应的助手消息时显示 */}
                  {isStreaming &&
                    currentStreamingMessage &&
                    !messages.some(
                      msg =>
                        msg.role === 'assistant' &&
                        msg.id === 0 &&
                        msg.content === currentStreamingMessage
                    ) && (
                      <div key={streamingKey}>
                        {renderMessage(
                          {
                            id: -1, // 使用 -1 作为流式消息的特殊 ID
                            conversationId: currentSessionId || 0,
                            role: 'assistant',
                            content: currentStreamingMessage,
                            createTime: streamingCreateTime,
                          },
                          true
                        )}
                      </div>
                    )}

                  {/* 加载状态 - 只在非流式模式或流式开始前显示 */}
                  {isLoading && !isStreaming && (
                    <div className="flex gap-3 mb-4 justify-start animate-message-in">
                      <Avatar className="w-8 h-8 flex-shrink-0 animate-avatar-bounce">
                        <AvatarFallback className="bg-primary/10 text-primary relative">
                          <Bot className="w-4 h-4" />
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-1">
                        <div className="bg-muted rounded-2xl px-4 py-2 shadow-sm animate-pulse">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">正在思考</span>
                            <div className="flex gap-1">
                              <div
                                className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                                style={{ animationDelay: '0ms' }}
                              />
                              <div
                                className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                                style={{ animationDelay: '150ms' }}
                              />
                              <div
                                className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
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
          <div
            ref={inputContainerRef}
            className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative"
          >
            {/* 输入框区域的渐变效果 */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />
            <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 relative z-10">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-2 sm:gap-3">
                  <div className="flex-1 relative group">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      onTouchStart={handleInputTouchStart}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="输入您的问题..."
                      disabled={isLoading}
                      className="pr-10 sm:pr-12 min-h-[44px] sm:min-h-[48px] py-2.5 sm:py-3 text-base transition-all duration-300 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 group-hover:border-primary/30"
                    />
                    {/* 输入框聚焦时的光晕效果 */}
                    <div className="absolute inset-0 rounded-md bg-primary/0 group-focus-within:bg-primary/5 blur-xl transition-all duration-300 pointer-events-none -z-10" />
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
                    className="px-4 sm:px-6 relative overflow-hidden group/btn transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <>
                        <Square className="w-5 h-5 relative z-10" />
                        <span className="absolute inset-0 bg-primary/20 animate-pulse" />
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 relative z-10 transition-transform group-hover/btn:translate-x-0.5" />
                        <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                      </>
                    )}
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
      </div>
    </div>
  )
}
