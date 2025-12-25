'use client'

import { useState } from 'react'
import { useRouterRecordList } from '@/hooks/admin/router/use-router'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Route, Search, Eye } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import type { RouterRecord } from '@/service/types/router'

export default function RouterRecordPage() {
  const { data, loading, error, handlePageChange, fetchList } = useRouterRecordList()
  const [selectedRecord, setSelectedRecord] = useState<RouterRecord | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleViewDetails = (record: RouterRecord) => {
    setSelectedRecord(record)
    setIsDialogOpen(true)
  }

  const getMethodColor = (method: string) => {
    const methodUpper = method.toUpperCase()
    switch (methodUpper) {
      case 'GET':
        return 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/50'
      case 'POST':
        return 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-500/50'
      case 'PUT':
        return 'bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-500/50'
      case 'DELETE':
        return 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-500/50'
      case 'PATCH':
        return 'bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-500/50'
      default:
        return 'bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-500/50'
    }
  }

  const columns: Array<{
    key: string
    header: string
    render: (item: RouterRecord) => React.ReactNode
    className?: string
  }> = [
    {
      key: 'id',
      header: 'ID',
      render: item => <span className="text-muted-foreground">{item.id}</span>,
    },
    {
      key: 'url',
      header: '路径',
      render: item => (
        <span className="text-sm font-mono" title={item.url}>
          {item.url}
        </span>
      ),
    },
    {
      key: 'methods',
      header: '请求方法',
      render: item => (
        <div className="flex flex-wrap gap-1">
          {item.methods && item.methods.length > 0 ? (
            item.methods.map((method: string) => (
              <span
                key={method}
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getMethodColor(
                  method
                )}`}
              >
                {method.toUpperCase()}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '操作',
      className: 'text-right',
      render: (item: RouterRecord) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(item)}>
            <Eye className="h-4 w-4 mr-1" />
            查看详情
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          icon={Route}
          title="路由记录"
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
          emptyMessage="暂无路由记录"
          emptyIcon={<Route className="mx-auto h-12 w-12 text-muted-foreground/50" />}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>路由详情</DialogTitle>
              <DialogDescription>查看路由记录的完整信息</DialogDescription>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">ID</label>
                    <p className="text-sm mt-1">{selectedRecord.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">路径</label>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <p className="text-sm font-mono break-all">{selectedRecord.url}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">请求方法</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedRecord.methods && selectedRecord.methods.length > 0 ? (
                        selectedRecord.methods.map((method: string) => (
                          <span
                            key={method}
                            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border ${getMethodColor(
                              method
                            )}`}
                          >
                            {method.toUpperCase()}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
