import { useState, useEffect, useRef } from 'react'
import {
  getRolePageList,
  getRolePageById,
  createRolePage,
  updateRolePage,
  deleteRolePage,
} from '@/service/api/role-page'
import {
  RolePage,
  CreateRolePageRequest,
  UpdateRolePageRequest,
  RolePageListResponse,
} from '@/service/types/role-page'

type RolePagePublicFilter = 'all' | 'true' | 'false'

export function useRolePage() {
  const [data, setData] = useState<RolePageListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [filterIsPublic, setFilterIsPublic] = useState<RolePagePublicFilter>('all')
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
      let isPublicParam: boolean | undefined
      if (filterIsPublic === 'true') isPublicParam = true
      if (filterIsPublic === 'false') isPublicParam = false

      const response = await getRolePageList({
        page,
        pageSize,
        isPublic: isPublicParam,
      })
      setData(response)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取页面权限列表失败'
      setError(errorMessage)
      console.error('获取页面权限列表失败:', err)
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

  // 切换是否公开筛选
  const handleIsPublicFilterChange = (value: RolePagePublicFilter) => {
    setFilterIsPublic(value)
    setPage(1)
  }

  // 创建
  const handleCreate = async (createData: CreateRolePageRequest) => {
    try {
      await createRolePage(createData)
      // 创建成功后刷新列表
      await fetchList()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建页面权限失败'
      setError(errorMessage)
      throw err
    }
  }

  // 更新
  const handleUpdate = async (id: number, updateData: UpdateRolePageRequest) => {
    try {
      await updateRolePage(id, updateData)
      // 更新成功后刷新列表
      await fetchList()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新页面权限失败'
      setError(errorMessage)
      throw err
    }
  }

  // 删除
  const handleDelete = async (id: number) => {
    try {
      await deleteRolePage(id)
      // 删除成功后刷新列表
      await fetchList()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除页面权限失败'
      setError(errorMessage)
      throw err
    }
  }

  // 获取单个页面权限详情
  const fetchRolePageById = async (id: number): Promise<RolePage> => {
    try {
      const response = await getRolePageById(id)
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取页面权限详情失败'
      setError(errorMessage)
      throw err
    }
  }

  useEffect(() => {
    fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterIsPublic])

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
    filterIsPublic,
    handlePageChange,
    handleIsPublicFilterChange,
    fetchList,
    fetchRolePageById,
    handleCreate,
    handleUpdate,
    handleDelete,
    getPageNumbers,
  }
}

