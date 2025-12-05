import { useState, useEffect, useRef } from 'react'
import { getUserList, getUserById, createUser, updateUser, deleteUser } from '@/service/api/user'
import { User, UserListResponse, CreateUserRequest, UpdateUserRequest } from '@/service/types/user'

export function useUserList() {
  const [data, setData] = useState<UserListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const fetchingRef = useRef(false)

  // 获取列表
  const fetchList = async () => {
    if (fetchingRef.current) {
      return
    }

    fetchingRef.current = true
    setLoading(true)
    setError(null)

    try {
      const response = await getUserList({ page, pageSize })
      setData(response)
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取用户列表失败'
      setError(errorMessage)
      console.error('获取用户列表失败:', err)
      throw err
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }

  useEffect(() => {
    fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (data?.totalPages || 1)) {
      setPage(newPage)
    }
  }

  // 获取单个用户
  const fetchUserById = async (id: number): Promise<User> => {
    try {
      const user = await getUserById(id)
      return user
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取用户详情失败'
      setError(errorMessage)
      throw err
    }
  }

  // 创建
  const handleCreate = async (createData: CreateUserRequest) => {
    try {
      await createUser(createData)
      await fetchList()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建用户失败'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // 更新
  const handleUpdate = async (id: number, updateData: UpdateUserRequest) => {
    try {
      await updateUser(id, updateData)
      await fetchList()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新用户失败'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // 删除
  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id)

      // 先获取当前页的最新数据，检查是否还有数据
      const response = await getUserList({ page, pageSize })

      // 如果当前页没有数据且不是第一页，跳转到上一页
      if (response.list.length === 0 && page > 1) {
        setPage(page - 1)
      } else {
        // 否则更新当前页数据
        setData(response)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除用户失败'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const getRoleLabel = (role: number): string => {
    return role === 1 ? '管理员' : '普通用户'
  }

  const getRoleBadgeClass = (role: number): string => {
    // 为不同角色ID设置不同的颜色方案
    // 使用预定义的颜色数组，确保在明暗主题下都有良好的对比度
    const roleColors: Record<number, string> = {
      1: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400', // 管理员 - 蓝色
      2: 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400', // 绿色
      3: 'bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400', // 紫色
      4: 'bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400', // 橙色
      5: 'bg-pink-500/10 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400', // 粉色
      6: 'bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400', // 青色
      7: 'bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400', // 靛蓝色
      8: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400', // 琥珀色
      9: 'bg-teal-500/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400', // 蓝绿色
      10: 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400', // 红色
    }

    // 如果角色ID在预定义的颜色中，使用预定义颜色
    if (roleColors[role]) {
      return roleColors[role]
    }

    // 对于其他角色ID，使用颜色数组循环分配
    const colorPalette = [
      'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
      'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400',
      'bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
      'bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
      'bg-pink-500/10 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400',
      'bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400',
      'bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
      'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
      'bg-teal-500/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400',
      'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    ]

    // 使用角色ID取模来循环使用颜色
    const colorIndex = (role - 1) % colorPalette.length
    return colorPalette[colorIndex]
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
    fetchList,
    fetchUserById,
    handleCreate,
    handleUpdate,
    handleDelete,
    getRoleLabel,
    getRoleBadgeClass,
    getPageNumbers,
  }
}
