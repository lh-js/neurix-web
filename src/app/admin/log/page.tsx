'use client'

import { useLogList } from '@/hooks/admin/log/use-log'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileText, Search } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import type { Log } from '@/service/types/log'

export default function LogPage() {
  const { data, loading, error, handlePageChange, fetchList } = useLogList()

  const columns: Array<{
    key: string
    header: string
    render: (item: Log) => React.ReactNode
    className?: string
  }> = [
    {
      key: 'id',
      header: 'ID',
      render: item => <span className="text-muted-foreground">{item.id}</span>,
    },
    {
      key: 'context',
      header: '上下文',
      render: item => <span className="font-medium">{item.context}</span>,
    },
    {
      key: 'message',
      header: '消息',
      render: item => (
        <span className="text-sm max-w-md truncate" title={item.message}>
          {item.message}
        </span>
      ),
    },
    {
      key: 'level',
      header: '级别',
      render: item => {
        const levelColors: Record<string, string> = {
          log: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
          info: 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400',
          warn: 'bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
          error: 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400',
          debug: 'bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400',
        }
        const colorClass = levelColors[item.level] || levelColors.log
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${colorClass}`}
          >
            {item.level.toUpperCase()}
          </span>
        )
      },
    },
    {
      key: 'logCreateTime',
      header: '日志时间',
      render: item => (
        <span className="text-sm text-muted-foreground">
          {item.logCreateTime ? new Date(item.logCreateTime).toLocaleString('zh-CN') : '-'}
        </span>
      ),
    },
    {
      key: 'createTime',
      header: '创建时间',
      render: item => (
        <span className="text-sm text-muted-foreground">
          {item.createTime ? new Date(item.createTime).toLocaleString('zh-CN') : '-'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileText}
        title="日志管理"
        actions={
          <Button onClick={fetchList} variant="outline" disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            刷新
          </Button>
        }
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <DataTable
        columns={columns}
        data={data?.list || []}
        loading={loading}
        pagination={
          data
            ? {
                total: data.total,
                page: parseInt(data.page),
                totalPages: data.totalPages,
                hasPreviousPage: data.hasPreviousPage,
                hasNextPage: data.hasNextPage,
              }
            : undefined
        }
        onPageChange={handlePageChange}
        emptyMessage="暂无日志数据"
        emptyIcon={<FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />}
      />
    </div>
  )
}
