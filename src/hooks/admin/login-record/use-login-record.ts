import { useState, useEffect, useRef } from 'react'
import { getLoginRecordList } from '@/service/api/login-record'
import { LoginRecordListResponse } from '@/service/types/login-record'

export function useLoginRecordList() {
  const [data, setData] = useState<LoginRecordListResponse | null>(null)
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
      const response = await getLoginRecordList({ page, pageSize })
      setData(response)
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取登录记录列表失败'
      setError(errorMessage)
      console.error('获取登录记录列表失败:', err)
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

  return {
    data,
    loading,
    error,
    page,
    pageSize,
    handlePageChange,
    fetchList,
  }
}
