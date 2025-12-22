'use client'

import { useState } from 'react'
import { useLogList } from '@/hooks/admin/log/use-log'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileText, Search, Eye } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import type { Log } from '@/service/types/log'

export default function LogPage() {
  const { data, loading, error, handlePageChange, fetchList } = useLogList()
  const [selectedLog, setSelectedLog] = useState<Log | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const handleViewDetail = (log: Log) => {
    setSelectedLog(log)
    setIsDetailDialogOpen(true)
  }

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
            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${colorClass}`}
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
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {item.logCreateTime ? new Date(item.logCreateTime).toLocaleString('zh-CN') : '-'}
        </span>
      ),
    },
    {
      key: 'createTime',
      header: '创建时间',
      render: item => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {item.createTime ? new Date(item.createTime).toLocaleString('zh-CN') : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '操作',
      className: 'text-right',
      render: item => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetail(item)}
            className="whitespace-nowrap"
          >
            <Eye className="h-4 w-4 mr-1" />
            查看详情
          </Button>
        </div>
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

      {/* 日志详情对话框 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>日志详情</DialogTitle>
            <DialogDescription>查看日志的完整信息</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID</label>
                  <p className="mt-1 text-sm">{selectedLog.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">级别</label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        selectedLog.level === 'error'
                          ? 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                          : selectedLog.level === 'warn'
                          ? 'bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                          : selectedLog.level === 'info'
                          ? 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                          : 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                      }`}
                    >
                      {selectedLog.level.toUpperCase()}
                    </span>
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">上下文</label>
                  <p className="mt-1 text-sm">{selectedLog.context}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">消息</label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <p className="text-sm whitespace-pre-wrap break-words">{selectedLog.message}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">日志时间</label>
                  <p className="mt-1 text-sm">
                    {selectedLog.logCreateTime
                      ? new Date(selectedLog.logCreateTime).toLocaleString('zh-CN')
                      : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">创建时间</label>
                  <p className="mt-1 text-sm">
                    {selectedLog.createTime
                      ? new Date(selectedLog.createTime).toLocaleString('zh-CN')
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
