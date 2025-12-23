/**
 * 聊天消息
 */
export interface ChatMessage {
  id: number
  conversationId: number
  role: 'user' | 'assistant'
  content: string
  createTime: string
}

/**
 * 创建消息请求参数
 */
export interface CreateMessageRequest {
  conversationId: number
  role: 'user' | 'assistant'
  content: string
}

/**
 * 批量创建消息请求参数
 */
export interface BatchCreateMessageRequest {
  conversationId: number
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

/**
 * 查询消息参数
 */
export interface GetMessagesParams {
  conversationId: number
}
