import { useState, useEffect, useRef } from 'react'
import {
  getRoleUrlList,
  getRoleUrlById,
  createRoleUrl,
  updateRoleUrl,
  deleteRoleUrl,
} from '@/service/api/role-url'
import {
  RoleUrl,
  CreateRoleUrlRequest,
  UpdateRoleUrlRequest,
  RoleUrlType,
  RoleUrlListResponse,
} from '@/service/types/role-url'

type RoleUrlFilterTab = 'all' | 'page' | 'api'
type RoleUrlPublicFilter = 'all' | 'true' | 'false'

export function useRoleUrl() {
  const [data, setData] = useState<RoleUrlListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [filterType, setFilterType] = useState<RoleUrlFilterTab>('all')
  const [filterIsPublic, setFilterIsPublic] = useState<RoleUrlPublicFilter>('all')
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
      let typeParam: RoleUrlType | undefined
      if (filterType === 'page') typeParam = 0
      if (filterType === 'api') typeParam = 1

      let isPublicParam: boolean | undefined
      if (filterIsPublic === 'true') isPublicParam = true
      if (filterIsPublic === 'false') isPublicParam = false

      const response = await getRoleUrlList({
        page,
        pageSize,
        type: typeParam,
        isPublic: isPublicParam,
      })
      setData(response)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取权限URL列表失败'
      setError(errorMessage)
      console.error('获取权限URL列表失败:', err)
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }

  // 分页处理
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (data?.totalPages || 1)) {
      setPage(newPage)
    }
  }

  // 切换筛选类型
  const handleFilterChange = (tab: RoleUrlFilterTab) => {
    setFilterType(tab)
    setPage(1)
  }

  // 切换是否公开筛选
  const handleIsPublicFilterChange = (value: RoleUrlPublicFilter) => {
    setFilterIsPublic(value)
    setPage(1)
  }

  // 创建
  const handleCreate = async (createData: CreateRoleUrlRequest) => {
    try {
      await createRoleUrl(createData)
      // 创建成功后刷新列表
      await fetchList()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建权限URL失败'
      setError(errorMessage)
      throw err
    }
  }

  // 更新
  const handleUpdate = async (id: number, updateData: UpdateRoleUrlRequest) => {
    try {
      await updateRoleUrl(id, updateData)
      // 更新成功后刷新列表
      await fetchList()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新权限URL失败'
      setError(errorMessage)
      throw err
    }
  }

  // 删除
  const handleDelete = async (id: number) => {
    try {
      await deleteRoleUrl(id)
      // 删除成功后刷新列表
      await fetchList()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除权限URL失败'
      setError(errorMessage)
      throw err
    }
  }

  // 获取单个权限URL详情
  const fetchRoleUrlById = async (id: number): Promise<RoleUrl> => {
    try {
      const response = await getRoleUrlById(id)
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取权限URL详情失败'
      setError(errorMessage)
      throw err
    }
  }

  // 获取类型标签
  const getTypeLabel = (type: RoleUrlType): string => {
    return type === 0 ? '页面' : '接口'
  }

  // 获取类型样式类
  const getTypeBadgeClass = (type: RoleUrlType): string => {
    // 为页面和接口类型设置不同的颜色，确保在明暗主题下都有良好的对比度
    return type === 0
      ? 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' // 页面 - 蓝色
      : 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400' // 接口 - 绿色
  }

  useEffect(() => {
    fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterType, filterIsPublic])

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
    filterType,
    filterIsPublic,
    handlePageChange,
    handleFilterChange,
    handleIsPublicFilterChange,
    fetchList,
    fetchRoleUrlById,
    handleCreate,
    handleUpdate,
    handleDelete,
    getTypeLabel,
    getTypeBadgeClass,
    getPageNumbers,
  }
}
