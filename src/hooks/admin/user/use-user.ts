import { useState, useEffect, useRef } from 'react'
import { getUserList } from '@/service/api/user'
import { UserListResponse } from '@/service/types/user'

export function useUserList() {
  const [data, setData] = useState<UserListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const fetchingRef = useRef(false)

  useEffect(() => {
    // 防止重复请求
    if (fetchingRef.current) {
      return
    }

    fetchingRef.current = true

    const fetchUsers = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await getUserList({ page, pageSize })
        setData(response)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '获取用户列表失败'
        setError(errorMessage)
        console.error('获取用户列表失败:', err)
      } finally {
        setLoading(false)
        fetchingRef.current = false
      }
    }

    fetchUsers()
  }, [page, pageSize])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (data?.totalPages || 1)) {
      setPage(newPage)
    }
  }

  const getRoleLabel = (role: number): string => {
    return role === 1 ? '管理员' : '普通用户'
  }

  const getRoleBadgeClass = (role: number): string => {
    return role === 1
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }

  // 生成分页页码数组（智能显示）
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (!data || data.totalPages === 0) return []

    const pages: (number | 'ellipsis')[] = []
    const totalPages = data.totalPages
    const currentPage = page

    // 总是显示第一页
    pages.push(1)

    // 如果总页数 <= 7，显示所有页码
    if (totalPages <= 7) {
      for (let i = 2; i <= totalPages; i++) {
        pages.push(i)
      }
      return pages
    }

    // 显示当前页前后各2页
    const start = Math.max(2, currentPage - 2)
    const end = Math.min(totalPages - 1, currentPage + 2)

    // 如果第一页和开始页之间有间隔，添加省略号
    if (start > 2) {
      pages.push('ellipsis')
    }

    // 添加当前页附近的页码
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // 如果结束页和最后一页之间有间隔，添加省略号
    if (end < totalPages - 1) {
      pages.push('ellipsis')
    }

    // 总是显示最后一页
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  return {
    data,
    loading,
    error,
    page,
    pageSize,
    handlePageChange,
    getRoleLabel,
    getRoleBadgeClass,
    getPageNumbers,
  }
}

