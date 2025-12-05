import { useEffect, useRef, useState } from 'react'
import {
  getRoleElementList,
  getRoleElementById,
  createRoleElement,
  updateRoleElement,
  deleteRoleElement,
} from '@/service/api/role-element'
import type {
  RoleElement,
  CreateRoleElementRequest,
  UpdateRoleElementRequest,
  RoleElementListResponse,
} from '@/service/types/role-element'

export function useRoleElement() {
  const [data, setData] = useState<RoleElementListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const fetchingRef = useRef(false)

  const fetchList = async () => {
    if (fetchingRef.current) {
      return
    }

    fetchingRef.current = true
    setLoading(true)
    setError(null)

    try {
      const response = await getRoleElementList({
        page,
        pageSize,
      })
      setData(response)
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取元素权限列表失败'
      setError(errorMessage)
      console.error('获取元素权限列表失败:', err)
      throw err
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (data?.totalPages || 1)) {
      setPage(newPage)
    }
  }

  const handleCreate = async (createData: CreateRoleElementRequest) => {
    try {
      await createRoleElement(createData)
      await fetchList()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建元素权限失败'
      setError(errorMessage)
      throw err
    }
  }

  const handleUpdate = async (id: number, updateData: UpdateRoleElementRequest) => {
    try {
      await updateRoleElement(id, updateData)
      await fetchList()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新元素权限失败'
      setError(errorMessage)
      throw err
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteRoleElement(id)

      // 先获取当前页的最新数据，检查是否还有数据
      const response = await getRoleElementList({
        page,
        pageSize,
      })

      // 如果当前页没有数据且不是第一页，跳转到上一页
      if (response.list.length === 0 && page > 1) {
        setPage(page - 1)
      } else {
        // 否则更新当前页数据
        setData(response)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除元素权限失败'
      setError(errorMessage)
      throw err
    }
  }

  const fetchRoleElementById = async (id: number): Promise<RoleElement> => {
    try {
      const response = await getRoleElementById(id)
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取元素权限详情失败'
      setError(errorMessage)
      throw err
    }
  }

  useEffect(() => {
    fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (!data || data.totalPages === 0) return []

    const pages: (number | 'ellipsis')[] = []
    const totalPages = data.totalPages
    const currentPage = page

    pages.push(1)

    if (totalPages <= 7) {
      for (let i = 2; i <= totalPages; i++) {
        pages.push(i)
      }
      return pages
    }

    const start = Math.max(2, currentPage - 2)
    const end = Math.min(totalPages - 1, currentPage + 2)

    if (start > 2) {
      pages.push('ellipsis')
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (end < totalPages - 1) {
      pages.push('ellipsis')
    }

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
    fetchRoleElementById,
    handleCreate,
    handleUpdate,
    handleDelete,
    getPageNumbers,
  }
}
