'use client'

import { useState } from 'react'
import { useRegisterRecordList } from '@/hooks/admin/register-record/use-register-record'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UserPlus, Search, CheckCircle2, XCircle, Eye } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import type { RegisterRecord } from '@/service/types/register-record'

export default function RegisterRecordPage() {
  const { data, loading, error, handlePageChange, fetchList } = useRegisterRecordList()
  const [selectedRecord, setSelectedRecord] = useState<RegisterRecord | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleViewDetails = (record: RegisterRecord) => {
    setSelectedRecord(record)
    setIsDialogOpen(true)
  }

  const columns: Array<{
    key: string
    header: string
    render: (item: RegisterRecord) => React.ReactNode
    className?: string
  }> = [
    {
      key: 'id',
      header: 'ID',
      render: item => <span className="text-muted-foreground whitespace-nowrap">{item.id}</span>,
    },
    {
      key: 'userId',
      header: '用户ID',
      render: item => <span className="text-sm whitespace-nowrap">{item.userId || '-'}</span>,
    },
    {
      key: 'email',
      header: '邮箱',
      render: item => (
        <span className="text-sm whitespace-nowrap" title={item.email}>
          {item.email}
        </span>
      ),
    },
    {
      key: 'status',
      header: '注册状态',
      render: item => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${
            item.status === 1
              ? 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400'
              : 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400'
          }`}
        >
          {item.status === 1 ? (
            <>
              <CheckCircle2 className="h-3 w-3 mr-1" />
              成功
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 mr-1" />
              失败
            </>
          )}
        </span>
      ),
    },
    {
      key: 'failureReason',
      header: '失败原因',
      render: item =>
        item.failureReason ? (
          <span
            className="text-sm text-red-600 dark:text-red-400 whitespace-nowrap"
            title={item.failureReason}
          >
            {item.failureReason}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        ),
    },
    {
      key: 'registerTime',
      header: '注册时间',
      render: item => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {item.registerTime ? new Date(item.registerTime).toLocaleString('zh-CN') : '-'}
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
      render: (item: RegisterRecord) => (
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
          icon={UserPlus}
          title="注册日志"
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
          emptyMessage="暂无注册记录"
          emptyIcon={<UserPlus className="mx-auto h-12 w-12 text-muted-foreground/50" />}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>注册详情</DialogTitle>
              <DialogDescription>查看注册记录的完整信息</DialogDescription>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">ID</label>
                    <p className="text-sm mt-1">{selectedRecord.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">用户ID</label>
                    <p className="text-sm mt-1">{selectedRecord.userId || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">邮箱</label>
                    <p className="text-sm mt-1">{selectedRecord.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">注册状态</label>
                    <p className="text-sm mt-1">{selectedRecord.status === 1 ? '成功' : '失败'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">IP 地址</label>
                    <p className="text-sm mt-1 font-mono">{selectedRecord.ipAddress}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">地理位置</label>
                    <p className="text-sm mt-1">
                      {selectedRecord.country} {selectedRecord.province} {selectedRecord.city}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">注册时间</label>
                    <p className="text-sm mt-1">
                      {selectedRecord.registerTime
                        ? new Date(selectedRecord.registerTime).toLocaleString('zh-CN')
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">创建时间</label>
                    <p className="text-sm mt-1">
                      {selectedRecord.createTime
                        ? new Date(selectedRecord.createTime).toLocaleString('zh-CN')
                        : '-'}
                    </p>
                  </div>
                </div>

                {selectedRecord.failureReason && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">失败原因</label>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{selectedRecord.failureReason}</p>
                    </div>
                  </div>
                )}

                {selectedRecord.userAgent && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">User Agent</label>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <p className="text-xs font-mono break-all whitespace-pre-wrap">
                        {selectedRecord.userAgent}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
