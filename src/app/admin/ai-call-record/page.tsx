'use client'

import { useState } from 'react'
import { useAiCallRecordList } from '@/hooks/admin/ai-call-record/use-ai-call-record'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Bot, Eye, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import type { AiCallRecord } from '@/service/types/ai-call-record'

export default function AiCallRecordPage() {
  const { data, loading, error, status, handlePageChange, handleFilterChange, fetchList } =
    useAiCallRecordList()
  const [selectedRecord, setSelectedRecord] = useState<AiCallRecord | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const handleViewDetail = (record: AiCallRecord) => {
    setSelectedRecord(record)
    setIsDetailDialogOpen(true)
  }

  const getStatusBadge = (status: number) => {
    const isSuccess = status === 1
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
          isSuccess
            ? 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400'
            : 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400'
        }`}
      >
        {isSuccess ? '成功' : '失败'}
      </span>
    )
  }

  const columns: Array<{
    key: string
    header: string
    render: (item: AiCallRecord) => React.ReactNode
    className?: string
  }> = [
    {
      key: 'id',
      header: 'ID',
      render: item => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">{item.id}</span>
      ),
    },
    {
      key: 'userId',
      header: '用户ID',
      render: item => <span className="text-sm whitespace-nowrap">{item.userId || '-'}</span>,
    },
    {
      key: 'email',
      header: '用户邮箱',
      render: item => <span className="text-sm whitespace-nowrap">{item.email || '-'}</span>,
    },
    {
      key: 'status',
      header: '状态',
      render: item => getStatusBadge(item.status),
    },
    {
      key: 'model',
      header: '模型',
      render: item => <span className="text-sm whitespace-nowrap">{item.model || '-'}</span>,
    },
    {
      key: 'totalTokens',
      header: 'Token数',
      render: item => (
        <span className="text-sm whitespace-nowrap">
          {item.totalTokens?.toLocaleString() || '-'}
        </span>
      ),
    },
    {
      key: 'isStream',
      header: '流式',
      render: item => (
        <span className="text-sm whitespace-nowrap">{item.isStream ? '是' : '否'}</span>
      ),
    },
    {
      key: 'callTime',
      header: '调用时间',
      render: item => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {item.callTime ? new Date(item.callTime).toLocaleString('zh-CN') : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '操作',
      className: 'text-right sticky right-0 bg-card shadow-left z-10',
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
        icon={Bot}
        title="AI调用记录"
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={status !== undefined ? status.toString() : 'all'}
              onValueChange={value =>
                handleFilterChange(value === 'all' ? undefined : Number.parseInt(value, 10))
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="success">成功</SelectItem>
                <SelectItem value="error">失败</SelectItem>
                <SelectItem value="timeout">超时</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchList} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>
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
        emptyMessage="暂无AI调用记录"
        emptyIcon={<Bot className="mx-auto h-12 w-12 text-muted-foreground/50" />}
      />

      {/* 详情对话框 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI调用记录详情</DialogTitle>
            <DialogDescription>查看AI调用的完整信息</DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-right font-medium">ID</Label>
                  <div className="mt-1 text-sm">{selectedRecord.id}</div>
                </div>
                <div>
                  <Label className="text-right font-medium">用户ID</Label>
                  <div className="mt-1 text-sm">{selectedRecord.userId || '-'}</div>
                </div>
                <div>
                  <Label className="text-right font-medium">用户邮箱</Label>
                  <div className="mt-1 text-sm">{selectedRecord.email || '-'}</div>
                </div>
                <div>
                  <Label className="text-right font-medium">状态</Label>
                  <div className="mt-1">{getStatusBadge(selectedRecord.status)}</div>
                </div>
                <div>
                  <Label className="text-right font-medium">模型</Label>
                  <div className="mt-1 text-sm">{selectedRecord.model || '-'}</div>
                </div>
                <div>
                  <Label className="text-right font-medium">流式</Label>
                  <div className="mt-1 text-sm">{selectedRecord.isStream ? '是' : '否'}</div>
                </div>
                <div>
                  <Label className="text-right font-medium">Token统计</Label>
                  <div className="mt-1 text-sm">
                    <div>Prompt: {selectedRecord.promptTokens?.toLocaleString() || '-'}</div>
                    <div>
                      Completion: {selectedRecord.completionTokens?.toLocaleString() || '-'}
                    </div>
                    <div>Total: {selectedRecord.totalTokens?.toLocaleString() || '-'}</div>
                  </div>
                </div>
                <div>
                  <Label className="text-right font-medium">IP地址</Label>
                  <div className="mt-1 text-sm">{selectedRecord.ipAddress || '-'}</div>
                </div>
                <div>
                  <Label className="text-right font-medium">位置</Label>
                  <div className="mt-1 text-sm">
                    {selectedRecord.country || '-'}
                    {selectedRecord.province &&
                      selectedRecord.province !== selectedRecord.country && (
                        <> / {selectedRecord.province}</>
                      )}
                    {selectedRecord.city && selectedRecord.city !== selectedRecord.province && (
                      <> / {selectedRecord.city}</>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-right font-medium">调用时间</Label>
                  <div className="mt-1 text-sm">
                    {selectedRecord.callTime
                      ? new Date(selectedRecord.callTime).toLocaleString('zh-CN')
                      : '-'}
                  </div>
                </div>
                <div>
                  <Label className="text-right font-medium">创建时间</Label>
                  <div className="mt-1 text-sm">
                    {selectedRecord.createTime
                      ? new Date(selectedRecord.createTime).toLocaleString('zh-CN')
                      : '-'}
                  </div>
                </div>
                <div className="col-span-2">
                  <Label className="text-right font-medium">User Agent</Label>
                  <div className="mt-1 text-sm break-all">{selectedRecord.userAgent || '-'}</div>
                </div>
              </div>
              <div className="grid gap-4">
                <div>
                  <Label className="text-right font-medium">请求消息</Label>
                  <div className="mt-1 bg-muted p-3 rounded-md text-sm break-all whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {selectedRecord.requestMessages && selectedRecord.requestMessages.length > 0
                      ? selectedRecord.requestMessages
                          .map(msg => `[${msg.role}]: ${msg.content}`)
                          .join('\n\n')
                      : '-'}
                  </div>
                </div>
                <div>
                  <Label className="text-right font-medium">响应内容</Label>
                  <div className="mt-1 bg-muted p-3 rounded-md text-sm break-all whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {selectedRecord.responseContent || '-'}
                  </div>
                </div>
                {selectedRecord.failureReason && (
                  <div>
                    <Label className="text-right font-medium text-destructive">失败原因</Label>
                    <div className="mt-1 bg-destructive/10 p-3 rounded-md text-sm break-all whitespace-pre-wrap max-h-40 overflow-y-auto text-destructive">
                      {selectedRecord.failureReason}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
