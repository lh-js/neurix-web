import { useState, useCallback, useEffect } from 'react'
import { ChatSession } from '@/service/types/chat'
import { ChatMessage } from '@/service/types/auth'

const STORAGE_KEY = 'chat-sessions'
const MAX_SESSIONS = 50 // 最多保存50个会话

/**
 * 管理多个聊天会话
 */
export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  // 从 localStorage 加载会话
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as ChatSession[]
        setSessions(parsed)
        // 如果有会话，默认选择第一个
        if (parsed.length > 0) {
          setCurrentSessionId(parsed[0].id)
        }
      }
    } catch (error) {
      console.error('加载会话失败:', error)
    }
  }, [])

  // 保存会话到 localStorage
  const saveSessions = useCallback((newSessions: ChatSession[]) => {
    try {
      // 限制会话数量，保留最新的
      const sessionsToSave = newSessions.slice(-MAX_SESSIONS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionsToSave))
      setSessions(sessionsToSave)
    } catch (error) {
      console.error('保存会话失败:', error)
    }
  }, [])

  // 创建新会话
  const createSession = useCallback(() => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: '新对话',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    const newSessions = [newSession, ...sessions]
    saveSessions(newSessions)
    setCurrentSessionId(newSession.id)
    return newSession.id
  }, [sessions, saveSessions])

  // 删除会话
  const deleteSession = useCallback(
    (sessionId: string) => {
      const newSessions = sessions.filter(s => s.id !== sessionId)
      saveSessions(newSessions)
      // 如果删除的是当前会话，切换到其他会话或创建新会话
      if (currentSessionId === sessionId) {
        if (newSessions.length > 0) {
          setCurrentSessionId(newSessions[0].id)
        } else {
          setCurrentSessionId(null)
        }
      }
    },
    [sessions, currentSessionId, saveSessions]
  )

  // 更新会话消息
  const updateSessionMessages = useCallback(
    (sessionId: string, messages: ChatMessage[]) => {
      // 确保 messages 是数组
      const safeMessages = Array.isArray(messages) ? messages : []
      
      // 使用函数式更新，确保基于最新的 sessions 状态
      setSessions(prevSessions => {
        const newSessions = prevSessions.map(session => {
          if (session.id === sessionId) {
            // 自动生成标题（基于第一条用户消息）
            let title = session.title
            if (session.title === '新对话' && safeMessages.length > 0) {
              const firstUserMessage = safeMessages.find(m => m?.role === 'user')
              if (firstUserMessage?.content) {
                title = firstUserMessage.content.slice(0, 30) || '新对话'
                if (firstUserMessage.content.length > 30) {
                  title += '...'
                }
              }
            }
            return {
              ...session,
              messages: safeMessages,
              title,
              updatedAt: Date.now(),
            }
          }
          return session
        })
        // 保存到 localStorage
        try {
          const sessionsToSave = newSessions.slice(-MAX_SESSIONS)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionsToSave))
        } catch (error) {
          console.error('保存会话失败:', error)
        }
        return newSessions
      })
    },
    []
  )

  // 更新会话标题
  const updateSessionTitle = useCallback(
    (sessionId: string, title: string) => {
      setSessions(prevSessions => {
        const newSessions = prevSessions.map(session =>
          session.id === sessionId ? { ...session, title, updatedAt: Date.now() } : session
        )
        // 保存到 localStorage
        try {
          const sessionsToSave = newSessions.slice(-MAX_SESSIONS)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionsToSave))
        } catch (error) {
          console.error('保存会话失败:', error)
        }
        return newSessions
      })
    },
    []
  )

  // 获取当前会话
  const currentSession = sessions.find(s => s.id === currentSessionId) || null

  // 切换会话
  const switchSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId)
  }, [])

  return {
    sessions,
    currentSession,
    currentSessionId,
    createSession,
    deleteSession,
    switchSession,
    updateSessionMessages,
    updateSessionTitle,
  }
}

