import { useState, useCallback, useEffect, useRef } from 'react'
import {
  createConversation,
  getConversationList,
  updateConversation,
  deleteConversation,
} from '@/service/api/chat-conversation'
import { getMessages } from '@/service/api/chat-message'
import { ChatSession, conversationToSession } from '@/service/types/chat'
import { ChatMessage } from '@/service/types/chat-message'
import { toast } from 'sonner'

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState<Set<number>>(new Set())
  const [deletingSessionId, setDeletingSessionId] = useState<number | null>(null)
  const [creatingSession, setCreatingSession] = useState(false)
  const [updatingTitleSessionId, setUpdatingTitleSessionId] = useState<number | null>(null)

  // 使用 ref 防止重复调用
  const loadingSessionsRef = useRef(false)
  const loadingMessagesRef = useRef<Set<number>>(new Set())
  const loadedMessagesRef = useRef<Set<number>>(new Set())
  const previousSessionIdRef = useRef<number | null>(null)

  // 加载会话列表（使用 ref 防止重复调用）
  const loadSessions = useCallback(async () => {
    // 如果正在加载，跳过
    if (loadingSessionsRef.current) {
      return
    }
    loadingSessionsRef.current = true
    try {
      setLoading(true)
      const response = await getConversationList({ page: 1, pageSize: 100 })
      const sessionList = response.list.map(conv => conversationToSession(conv))
      setSessions(sessionList)
      // 如果有会话且没有当前会话，选择第一个
      if (sessionList.length > 0) {
        setCurrentSessionId(prev => prev || sessionList[0].id)
      }
    } catch (error) {
      console.error('加载会话列表失败:', error)
      toast.error('加载会话列表失败')
    } finally {
      setLoading(false)
      loadingSessionsRef.current = false
    }
  }, [])

  // 加载会话的消息（使用 ref 防止重复调用）
  const loadSessionMessages = useCallback(async (sessionId: number) => {
    // 如果正在加载，跳过
    if (loadingMessagesRef.current.has(sessionId)) {
      return
    }
    loadingMessagesRef.current.add(sessionId)
    setLoadingMessages(prev => new Set(prev).add(sessionId))
    try {
      const messages = await getMessages({ conversationId: sessionId })
      setSessions(prevSessions =>
        prevSessions.map(session => {
          if (session.id === sessionId) {
            // 合并本地临时消息（id为0）和从后端加载的消息
            // 保留本地临时消息，避免覆盖正在发送的消息
            const localTemporaryMessages = session.messages.filter(msg => msg.id === 0)
            // 合并消息：先添加后端消息，然后添加本地临时消息
            // 这样可以确保临时消息显示在最后
            const mergedMessages = [...messages, ...localTemporaryMessages]
            return {
              ...session,
              messages: mergedMessages,
            }
          }
          return session
        })
      )
      // 标记为已加载
      loadedMessagesRef.current.add(sessionId)
    } catch (error) {
      console.error('加载消息失败:', error)
      toast.error('加载消息失败')
      // 加载失败时，移除标记以便重试
      loadedMessagesRef.current.delete(sessionId)
    } finally {
      loadingMessagesRef.current.delete(sessionId)
      setLoadingMessages(prev => {
        const newSet = new Set(prev)
        newSet.delete(sessionId)
        return newSet
      })
    }
  }, [])

  // 初始化加载
  useEffect(() => {
    loadSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 当切换会话时，加载该会话的消息
  useEffect(() => {
    if (currentSessionId && currentSessionId !== previousSessionIdRef.current) {
      previousSessionIdRef.current = currentSessionId
      const currentSession = sessions.find(s => s.id === currentSessionId)
      // 如果会话存在但没有消息，且未加载过，则加载消息
      if (
        currentSession &&
        currentSession.messages.length === 0 &&
        !loadedMessagesRef.current.has(currentSessionId)
      ) {
        loadedMessagesRef.current.add(currentSessionId)
        loadSessionMessages(currentSessionId)
      }
    }
  }, [currentSessionId, sessions, loadSessionMessages])

  // 创建新会话
  const createSession = useCallback(async () => {
    try {
      setCreatingSession(true)
      const conversation = await createConversation({ title: '新对话' })
      const newSession = conversationToSession(conversation)
      setSessions(prev => [newSession, ...prev])
      setCurrentSessionId(newSession.id)
      return newSession.id
    } catch (error) {
      console.error('创建会话失败:', error)
      toast.error('创建会话失败')
      throw error
    } finally {
      setCreatingSession(false)
    }
  }, [])

  // 删除会话
  const deleteSession = useCallback(
    async (sessionId: number) => {
      try {
        setDeletingSessionId(sessionId)
        await deleteConversation(sessionId)
        setSessions(prev => prev.filter(s => s.id !== sessionId))
        // 如果删除的是当前会话，切换到其他会话或创建新会话
        if (currentSessionId === sessionId) {
          const remainingSessions = sessions.filter(s => s.id !== sessionId)
          if (remainingSessions.length > 0) {
            setCurrentSessionId(remainingSessions[0].id)
          } else {
            setCurrentSessionId(null)
          }
        }
        toast.success('删除成功')
      } catch (error) {
        console.error('删除会话失败:', error)
        toast.error('删除会话失败')
      } finally {
        setDeletingSessionId(null)
      }
    },
    [sessions, currentSessionId]
  )

  // 更新会话消息（只更新本地状态，不触发后端刷新）
  // 由于使用了自动保存功能，后端会自动保存消息
  // 我们只在切换会话或首次加载时从后端加载消息
  const updateSessionMessages = useCallback(
    async (sessionId: number, messages: ChatMessage[]) => {
      // 只更新本地状态以立即显示，不触发后端刷新
      setSessions(prevSessions =>
        prevSessions.map(session => {
          if (session.id === sessionId) {
            return {
              ...session,
              messages,
              updatedAt: Date.now(),
            }
          }
          return session
        })
      )
      // 不再自动刷新，因为：
      // 1. 用户消息和AI响应已经通过本地状态显示
      // 2. 后端会自动保存，不需要立即刷新
      // 3. 只有在切换会话或首次加载时才需要从后端加载
    },
    []
  )

  // 更新会话标题
  const updateSessionTitle = useCallback(async (sessionId: number, title: string) => {
    try {
      setUpdatingTitleSessionId(sessionId)
      await updateConversation(sessionId, { title })
      setSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === sessionId
            ? { ...session, title, updatedAt: Date.now() }
            : session
        )
      )
      toast.success('更新成功')
    } catch (error) {
      console.error('更新会话标题失败:', error)
      toast.error('更新会话标题失败')
    } finally {
      setUpdatingTitleSessionId(null)
    }
  }, [])

  // 刷新会话列表
  const refreshSessions = useCallback(() => {
    loadSessions()
  }, [loadSessions])

  // 获取当前会话
  const currentSession = sessions.find(s => s.id === currentSessionId) || null

  // 切换会话
  const switchSession = useCallback((sessionId: number) => {
    setCurrentSessionId(sessionId)
  }, [])

  return {
    sessions,
    currentSession,
    currentSessionId,
    loading,
    loadingMessages,
    deletingSessionId,
    creatingSession,
    updatingTitleSessionId,
    createSession,
    deleteSession,
    switchSession,
    updateSessionMessages,
    updateSessionTitle,
    refreshSessions,
  }
}
