import { useState, useEffect, useCallback, useRef } from 'react'
import { getConversationList } from '@/service/api/chat-conversation'
import { getMessages } from '@/service/api/chat-message'
import type {
  ConversationListParams,
  ConversationListResponse,
} from '@/service/types/chat-conversation'
import type { ChatMessage } from '@/service/types/chat-message'

interface UseChatConversationListReturn {
  data: ConversationListResponse | null
  loading: boolean
  error: Error | null
  handlePageChange: (page: number) => void
  fetchList: (options?: { force?: boolean }) => Promise<void>
}

export function useChatConversationList(): UseChatConversationListReturn {
  const [data, setData] = useState<ConversationListResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [params, setParams] = useState<ConversationListParams>({
    page: 1,
    pageSize: 10,
  })
  const lastFetchedKeyRef = useRef<string | null>(null)

  const fetchList = useCallback(
    async (options: { force?: boolean } = {}) => {
      const { force = false } = options
      const key = `${params.page}-${params.pageSize}`

      // 避免相同参数在 StrictMode 下重复请求
      if (!force && lastFetchedKeyRef.current === key) {
        return
      }
      lastFetchedKeyRef.current = key

    setLoading(true)
    setError(null)
    try {
      const response = await getConversationList(params)
      setData(response)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('获取聊天会话列表失败'))
    } finally {
      setLoading(false)
    }
    },
    [params]
  )

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const handlePageChange = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }))
  }, [])

  return {
    data,
    loading,
    error,
    handlePageChange,
    fetchList,
  }
}

/**
 * 获取会话消息
 */
export function useConversationMessages(conversationId: number | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await getMessages({ conversationId })
      // 确保返回的是数组
      setMessages(Array.isArray(response) ? response : [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('获取消息失败'))
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages,
  }
}
