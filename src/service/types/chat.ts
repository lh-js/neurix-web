import { ChatMessage } from './auth'

/**
 * 聊天会话
 */
export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}
