/**
 * 检查是否为生产环境
 */
export const isProduction = process.env.NODE_ENV === 'production'

/**
 * 检查是否为开发环境
 */
export const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * 检查是否为客户端
 */
export const isClient = typeof window !== 'undefined'

/**
 * 检查是否为服务器端
 */
export const isServer = typeof window === 'undefined'