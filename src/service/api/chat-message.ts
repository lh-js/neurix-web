import { get, post } from '../request'
import {
  CreateMessageRequest,
  BatchCreateMessageRequest,
  GetMessagesParams,
  ChatMessage,
} from '../types/chat-message'

/**
 * 创建单条消息
 */
export async function createMessage(data: CreateMessageRequest): Promise<ChatMessage> {
  const response = await post<ChatMessage>('/chat-message', data)
  return response
}

/**
 * 批量创建消息
 */
export async function batchCreateMessages(data: BatchCreateMessageRequest): Promise<ChatMessage[]> {
  const response = await post<ChatMessage[]>('/chat-message/batch', data)
  return response
}

/**
 * 获取会话的所有消息
 */
export async function getMessages(params: GetMessagesParams): Promise<ChatMessage[]> {
  const response = await get<ChatMessage[]>('/chat-message', {
    conversationId: params.conversationId.toString(),
  })
  return response
}

