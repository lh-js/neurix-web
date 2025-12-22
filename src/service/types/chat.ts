import { ChatConversation } from './chat-conversation'
import { ChatMessage as BackendChatMessage } from './chat-message'

/**
 * 前端使用的聊天会话（包含消息）
 */
export interface ChatSession {
  id: number // 使用后端返回的数字ID
  title: string
  messages: BackendChatMessage[]
  createdAt: number
  updatedAt: number
}

/**
 * 从后端会话转换为前端会话
 */
export function conversationToSession(
  conversation: ChatConversation,
  messages: BackendChatMessage[] = []
): ChatSession {
  return {
    id: conversation.id,
    title: conversation.title,
    messages,
    createdAt: new Date(conversation.createTime).getTime(),
    updatedAt: new Date(conversation.updateTime).getTime(),
  }
}
