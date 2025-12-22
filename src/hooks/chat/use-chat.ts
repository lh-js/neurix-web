import { useState, useCallback, useRef, useEffect } from 'react'
import { aiChat, aiChatStream } from '@/service/api/auth'
import { AIChatRequest } from '@/service/types/auth'
import { ChatMessage } from '@/service/types/chat-message'

interface UseChatProps {
  messages: ChatMessage[]
  conversationId?: number // 会话ID，用于自动保存
  onMessagesChange: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void
  onMessageSaved?: () => void // 消息保存完成后的回调（用于刷新消息列表）
}

export function useChat({
  messages,
  conversationId,
  onMessagesChange,
  onMessageSaved,
}: UseChatProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [useStream, setUseStream] = useState(true)
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<string>('')
  const [streamingTimestamp, setStreamingTimestamp] = useState<number | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const previousMessagesRef = useRef<ChatMessage[]>([])

  // 当消息列表变化时（可能是切换会话），清理流式状态
  useEffect(() => {
    // 如果消息列表完全改变（不是追加），说明切换了会话
    // 通过 conversationId 来判断，因为不同会话的消息 conversationId 不同
    if (
      previousMessagesRef.current.length > 0 &&
      messages.length > 0 &&
      previousMessagesRef.current[0]?.conversationId !== messages[0]?.conversationId
    ) {
      // 切换会话时，停止当前请求并清理状态
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
      setIsLoading(false)
      setIsStreaming(false)
      setCurrentStreamingMessage('')
      setStreamingTimestamp(null)
    }
    previousMessagesRef.current = messages
  }, [messages])

  // 添加用户消息（临时消息，等待后端保存后替换）
  const addUserMessage = useCallback(
    (content: string) => {
      const userMessage: ChatMessage = {
        id: 0, // 临时ID，后端保存后会更新
        conversationId: conversationId || 0,
        role: 'user',
        content,
        createTime: new Date().toISOString(),
      }
      // 使用函数式更新，确保基于最新状态
      onMessagesChange(prev => [...prev, userMessage])
      return userMessage
    },
    [onMessagesChange, conversationId]
  )

  // 添加助手消息（临时消息，等待后端保存后替换）
  const addAssistantMessage = useCallback(
    (content: string) => {
      const assistantMessage: ChatMessage = {
        id: 0, // 临时ID，后端保存后会更新
        conversationId: conversationId || 0,
        role: 'assistant',
        content,
        createTime: new Date().toISOString(),
      }
      // 使用函数式更新，确保基于最新状态
      onMessagesChange(prev => [...prev, assistantMessage])
      return assistantMessage
    },
    [onMessagesChange, conversationId]
  )

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
      const userMessage = addUserMessage(content)

      setIsLoading(true)
      setCurrentStreamingMessage('')

      try {
        // 构建请求数据 - 使用当前消息列表加上新添加的用户消息
        const chatMessages = [...messages, userMessage]

        const requestData: AIChatRequest = {
          messages: chatMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          stream: useStream,
          conversationId, // 传递会话ID，后端会自动保存消息
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
                // 延迟刷新消息列表，确保后端已保存
                if (onMessageSaved) {
                  setTimeout(() => {
                    onMessageSaved()
                  }, 500)
                }
              }
              setCurrentStreamingMessage('')
            }
          )
        } else {
          // 非流式请求
          const response = await aiChat(requestData)
          const content = response.choices[0]?.message?.content || ''
          addAssistantMessage(content)
          // 延迟刷新消息列表，确保后端已保存
          if (onMessageSaved) {
            setTimeout(() => {
              onMessageSaved()
            }, 500)
          }
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
    [messages, useStream, addUserMessage, addAssistantMessage, isLoading, conversationId, onMessageSaved]
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
      const assistantMessage: ChatMessage = {
        id: 0, // 临时ID，后端保存后会更新
        conversationId: conversationId || 0,
        role: 'assistant',
        content: currentStreamingMessage,
        createTime: new Date().toISOString(),
      }
      // 使用函数式更新，确保基于最新状态
      onMessagesChange(prev => [...prev, assistantMessage])
      setCurrentStreamingMessage('')
    }
  }, [currentStreamingMessage, onMessagesChange, conversationId])

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
