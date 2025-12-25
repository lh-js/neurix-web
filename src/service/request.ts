import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios'
import { toast } from 'sonner'
import { ApiResponse, ErrorResponseData } from './types'
import { clearAuth, getToken, getRefreshToken, setTokens } from '@/utils/auth.util'
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

// 刷新 token 的锁，防止多个请求同时触发刷新
let isRefreshing = false
// 存储等待刷新完成的请求队列
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

// 处理等待队列中的请求
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
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

      // 401 特殊处理：尝试刷新 token
      if (status === 401) {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        // 如果是刷新 token 的请求失败，直接清除认证信息并显示弹窗
        if (originalRequest?.url?.includes('/auth/refresh')) {
          clearAuth()
          if (isClient) {
            window.dispatchEvent(new CustomEvent('auth:expired'))
          }
          return Promise.reject(new Error(errorMessage))
        }

        // 如果已经在刷新中，将请求加入队列等待
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then(token => {
              // 刷新成功后，使用新 token 重试原请求
              if (originalRequest && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`
              }
              return request(originalRequest)
            })
            .catch(err => {
              return Promise.reject(err)
            })
        }

        // 尝试刷新 token
        const refreshTokenValue = isClient ? getRefreshToken() : null
        if (refreshTokenValue && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true
          isRefreshing = true

          // 使用原始 axios 实例调用刷新接口，避免经过拦截器
          return axios
            .post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
              `${process.env.NEXT_PUBLIC_API_BASE_URL || '/api'}/auth/refresh`,
              { refreshToken: refreshTokenValue },
              {
                headers: {
                  'Content-Type': 'application/json;charset=UTF-8',
                },
              }
            )
            .then(axiosResponse => {
              // 处理响应数据结构
              const responseData = axiosResponse.data as unknown
              let refreshResponse: { accessToken: string; refreshToken: string }

              // 根据后端返回的数据结构处理
              if (
                typeof responseData === 'object' &&
                responseData !== null &&
                'status' in responseData &&
                (responseData as { status?: number }).status !== undefined &&
                (responseData as { status: number }).status >= 200 &&
                (responseData as { status: number }).status < 300
              ) {
                refreshResponse = (
                  responseData as unknown as { data: { accessToken: string; refreshToken: string } }
                ).data
              } else {
                refreshResponse = responseData as unknown as {
                  accessToken: string
                  refreshToken: string
                }
              }

              // 保存新的 tokens
              if (isClient) {
                // 判断使用 localStorage 还是 sessionStorage
                const rememberMe =
                  !!localStorage.getItem('token') || !!localStorage.getItem('refreshToken')
                setTokens(refreshResponse.accessToken, refreshResponse.refreshToken, rememberMe)
              }

              // 处理等待队列
              processQueue(null, refreshResponse.accessToken)

              // 使用新 token 重试原请求
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${refreshResponse.accessToken}`
              }
              isRefreshing = false
              return request(originalRequest)
            })
            .catch(refreshError => {
              // 刷新失败，清除认证信息并显示弹窗
              processQueue(refreshError as Error, null)
              clearAuth()
              if (isClient) {
                window.dispatchEvent(new CustomEvent('auth:expired'))
              }
              isRefreshing = false
              return Promise.reject(refreshError)
            })
        } else {
          // 没有 refreshToken 或已经重试过，直接清除认证信息并显示弹窗
          clearAuth()
          if (isClient) {
            window.dispatchEvent(new CustomEvent('auth:expired'))
          }
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
