import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios'
import { toast } from 'sonner'
import { ApiResponse, ErrorResponseData } from './types'
import { buildLoginRedirectUrl, clearAuth, getToken } from '@/utils/auth.util'
import { isClient, isDevelopment, isServer } from '@/utils/env.util'

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
})

// 辅助函数：显示错误提示
const showErrorToast = (message: string) => {
  if (isServer) {
    console.error(message)
    return
  }
  toast.error(message)
}

// 辅助函数：获取错误消息
const getErrorMessage = (data: unknown, defaultMessage: string): string => {
  const errorData = data as ErrorResponseData
  return errorData?.message || defaultMessage
}

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从存储中获取 token 并添加到请求头
    if (isClient) {
      const token = getToken()
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    // 添加请求头
    if (config.headers) {
      config.headers['X-Requested-With'] = 'XMLHttpRequest'
    }

    return config
  },
  (error: AxiosError) => {
    if (isDevelopment) {
      console.error('请求错误:', error)
    }
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const { data } = response

    // 根据后端返回的数据结构处理
    // 支持格式：{ status, message, data }
    const statusCode = data.status

    if (statusCode !== undefined && statusCode >= 200 && statusCode < 300) {
      return data.data // 直接返回 data 字段
    }

    // 如果后端直接返回数据，不做处理
    return response
  },
  (error: AxiosError<ErrorResponseData>) => {
    if (error.response) {
      // 服务器返回了错误状态码
      const { status, data } = error.response

      // 错误消息映射
      const errorMessages: Record<number, string> = {
        400: '请求参数错误',
        401: '未授权，请重新登录',
        403: '拒绝访问',
        404: '请求地址不存在',
        500: '服务器内部错误',
        502: '网关错误',
        503: '服务不可用',
        504: '网关超时',
      }

      const defaultMessage = errorMessages[status] || `连接错误: ${status}`
      const errorMessage = getErrorMessage(data, defaultMessage)

      // 401 特殊处理：清除 token 并跳转
      if (status === 401) {
        clearAuth()
        showErrorToast(errorMessage)
        if (isClient) {
          window.location.href = buildLoginRedirectUrl()
        }
      } else {
        showErrorToast(errorMessage)
      }

      return Promise.reject(new Error(errorMessage))
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      const errorMessage = '网络错误，请检查网络连接'
      if (isDevelopment) {
        console.error(errorMessage)
      }
      showErrorToast(errorMessage)
      return Promise.reject(new Error(errorMessage))
    } else {
      // 发送请求时出了点问题
      const errorMessage = error.message || '请求配置错误'
      if (isDevelopment) {
        console.error('请求配置错误:', errorMessage)
      }
      showErrorToast(errorMessage)
      return Promise.reject(error)
    }
  }
)

// 导出常用的请求方法
export default request

// 封装 GET 请求
export const get = <T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<T> => {
  return request.get(url, { params, ...config })
}

// 封装 POST 请求
// 注意：响应拦截器已经处理了数据，返回的是 data.data 字段
export const post = <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  return request.post<ApiResponse<T>>(url, data, config) as Promise<T>
}

// 封装 PUT 请求
export const put = <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  return request.put(url, data, config)
}

// 封装 DELETE 请求
export const del = <T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<T> => {
  return request.delete(url, { params, ...config })
}

// 封装 PATCH 请求
export const patch = <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  return request.patch(url, data, config)
}
