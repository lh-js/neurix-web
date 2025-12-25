import { get, post, put, del } from '../request'
import {
  CreateConversationRequest,
  ConversationListParams,
  ConversationListResponse,
  UpdateConversationRequest,
  ChatConversation,
} from '../types/chat-conversation'

/**
 * 创建聊天会话
 */
export async function createConversation(
  data: CreateConversationRequest
): Promise<ChatConversation> {
  const response = await post<ChatConversation>('/chat-conversation', data)
  return response
}

/**
 * 获取会话列表
 */
export async function getConversationList(
  params?: ConversationListParams
): Promise<ConversationListResponse> {
  const queryParams: Record<string, string> = {}
  if (params?.page) {
    queryParams.page = params.page.toString()
  }
  if (params?.pageSize) {
    queryParams.pageSize = params.pageSize.toString()
  }
  const response = await get<ConversationListResponse>('/chat-conversation', queryParams)
  return response
}

/**
 * 获取会话详情
 */
export async function getConversationById(id: number): Promise<ChatConversation> {
  const response = await get<ChatConversation>(`/chat-conversation/${id}`)
  return response
}

/**
 * 更新会话
 */
export async function updateConversation(
  id: number,
  data: UpdateConversationRequest
): Promise<ChatConversation> {
  const response = await put<ChatConversation>(`/chat-conversation/${id}`, data)
  return response
}

/**
 * 删除会话
 */
export async function deleteConversation(id: number): Promise<void> {
  await del(`/chat-conversation/${id}`)
}

/**
 * 获取管理端会话列表
 */
export async function getAdminConversationList(
  params?: ConversationListParams
): Promise<ConversationListResponse> {
  const queryParams: Record<string, string> = {}
  if (params?.page) {
    queryParams.page = params.page.toString()
  }
  if (params?.pageSize) {
    queryParams.pageSize = params.pageSize.toString()
  }
  const response = await get<ConversationListResponse>('/chat-conversation/admin', queryParams)
  return response
}
