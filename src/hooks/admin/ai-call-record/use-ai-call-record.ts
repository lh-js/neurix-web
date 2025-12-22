import { useState, useEffect, useRef } from 'react'
import { getAiCallRecordList } from '@/service/api/ai-call-record'
import { AiCallRecordListResponse, AiCallRecordListParams } from '@/service/types/ai-call-record'

export function useAiCallRecordList() {
  const [data, setData] = useState<AiCallRecordListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [status, setStatus] = useState<number | undefined>(undefined)
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
      const params: AiCallRecordListParams = {
        page,
        pageSize,
      }
      if (status) {
        params.status = status
      }
      const response = await getAiCallRecordList(params)
      setData(response)
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取AI调用记录失败'
      setError(errorMessage)
      console.error('获取AI调用记录失败:', err)
      throw err
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }

  useEffect(() => {
    fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, status])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (data?.totalPages || 1)) {
      setPage(newPage)
    }
  }

  const handleFilterChange = (newStatus: number | undefined) => {
    setStatus(newStatus)
    setPage(1)
  }

  return {
    data,
    loading,
    error,
    page,
    pageSize,
    status,
    handlePageChange,
    handleFilterChange,
    fetchList,
  }
}
