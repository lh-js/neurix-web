/**
 * 聊天会话
 */
export interface ChatConversation {
  id: number
  userId: number
  email: string
  title: string
  createTime: string
  updateTime: string
}

/**
 * 创建会话请求参数
 */
export interface CreateConversationRequest {
  title?: string
}

/**
 * 会话列表查询参数
 */
export interface ConversationListParams {
  page?: number
  pageSize?: number
}

/**
 * 会话列表响应数据
 */
export interface ConversationListResponse {
  list: ChatConversation[]
  total: number
  page: number
  pageSize: number
}

/**
 * 更新会话请求参数
 */
export interface UpdateConversationRequest {
  title: string
}

