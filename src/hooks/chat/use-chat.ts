import { useState, useCallback, useRef, useEffect } from 'react'
import { aiChat, aiChatStream } from '@/service/api/auth'
import { AIChatRequest, ChatMessage } from '@/service/types/auth'

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [useStream, setUseStream] = useState(true)
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<string>('')
  const [streamingTimestamp, setStreamingTimestamp] = useState<number | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // 添加用户消息
  const addUserMessage = useCallback((content: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMessage])
    return userMessage
  }, [])

  // 添加助手消息
  const addAssistantMessage = useCallback((content: string) => {
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, assistantMessage])
    return assistantMessage
  }, [])

  // 发送消息
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      // 添加用户消息
      addUserMessage(content)

      setIsLoading(true)
      setCurrentStreamingMessage('')

      try {
        // 构建请求数据
        const chatMessages = messages.concat([
          {
            id: `user-${Date.now()}`,
            role: 'user' as const,
            content,
            timestamp: Date.now(),
          },
        ])

        const requestData: AIChatRequest = {
          messages: chatMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          stream: useStream,
        }

        if (useStream) {
          // 流式请求
          let fullContent = ''

          await aiChatStream(
            requestData,
            chunk => {
              // 第一次接收到数据时，切换到流式状态
              if (!fullContent) {
                setIsStreaming(true)
                setStreamingTimestamp(Date.now())
              }
              // 实时更新流式内容
              fullContent += chunk
              setCurrentStreamingMessage(fullContent)
            },
            () => {
              // 流式完成
              setIsStreaming(false)
              setStreamingTimestamp(null)
              if (fullContent) {
                addAssistantMessage(fullContent)
              }
              setCurrentStreamingMessage('')
            }
          )
        } else {
          // 非流式请求
          const response = await aiChat(requestData)
          const content = response.choices[0]?.message?.content || ''
          addAssistantMessage(content)
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // 请求被取消，不显示错误
          return
        }

        console.error('发送消息失败:', error)
        addAssistantMessage('抱歉，发生了错误，请稍后重试。')
      } finally {
        setIsLoading(false)
        setIsStreaming(false)
        setStreamingTimestamp(null)
        setCurrentStreamingMessage('')
        abortControllerRef.current = null
      }
    },
    [messages, useStream, addUserMessage, addAssistantMessage, isLoading]
  )

  // 停止生成
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsLoading(false)
    setIsStreaming(false)
    setStreamingTimestamp(null)

    // 如果有正在流式的消息，添加到消息列表
    if (currentStreamingMessage) {
      addAssistantMessage(currentStreamingMessage)
      setCurrentStreamingMessage('')
    }
  }, [currentStreamingMessage, addAssistantMessage])

  // 切换流式模式
  const toggleStream = useCallback(() => {
    setUseStream(prev => !prev)
  }, [])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    messages,
    isLoading,
    isStreaming,
    useStream,
    currentStreamingMessage,
    streamingTimestamp,
    sendMessage,
    stopGeneration,
    toggleStream,
  }
}
