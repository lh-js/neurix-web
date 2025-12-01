/**
 * API 响应格式
 */
export interface ApiResponse<T = unknown> {
  status: number
  message: string
  data: T
  requestPath: string
  date: string
}

// 错误响应数据类型
export interface ErrorResponseData {
  message?: string
  [key: string]: unknown
}