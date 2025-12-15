'use client'

import { useState } from 'react'
import { useEmailRecordList } from '@/hooks/admin/email-record/use-email-record'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Mail, Search, Eye } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import type { EmailRecord } from '@/service/types/email-record'

export default function EmailRecordPage() {
  const { data, loading, error, handlePageChange, fetchList } = useEmailRecordList()
  const [selectedRecord, setSelectedRecord] = useState<EmailRecord | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleViewDetails = (record: EmailRecord) => {
    setSelectedRecord(record)
    setIsDialogOpen(true)
  }

  const columns: Array<{
    key: string
    header: string
    render: (item: EmailRecord) => React.ReactNode
    className?: string
  }> = [
    {
      key: 'id',
      header: 'ID',
      render: item => <span className="text-muted-foreground">{item.id}</span>,
    },
    {
      key: 'from',
      header: '发件人',
      render: item => (
        <span className="font-medium text-sm" title={item.from}>
          {item.from}
        </span>
      ),
    },
    {
      key: 'to',
      header: '收件人',
      render: item => (
        <span className="text-sm" title={item.to}>
          {item.to}
        </span>
      ),
    },
    {
      key: 'subject',
      header: '主题',
      render: item => (
        <span className="text-sm max-w-md truncate" title={item.subject}>
          {item.subject}
        </span>
      ),
    },
    {
      key: 'emailSendTime',
      header: '发送时间',
      render: item => (
        <span className="text-sm text-muted-foreground">
          {item.emailSendTime ? new Date(item.emailSendTime).toLocaleString('zh-CN') : '-'}
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
    {
      key: 'actions',
      header: '操作',
      className: 'text-right',
      render: (item: EmailRecord) => (
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
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .email-html-content * {
          color: hsl(var(--foreground)) !important;
        }
        .email-html-content p,
        .email-html-content div,
        .email-html-content span,
        .email-html-content {
          color: hsl(var(--foreground)) !important;
        }
      `,
        }}
      />
      <div className="space-y-6">
        <PageHeader
          icon={Mail}
          title="邮件管理"
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
          emptyMessage="暂无邮件记录"
          emptyIcon={<Mail className="mx-auto h-12 w-12 text-muted-foreground/50" />}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>邮件详情</DialogTitle>
              <DialogDescription>查看邮件记录的完整信息</DialogDescription>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">ID</label>
                    <p className="text-sm mt-1">{selectedRecord.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">主题</label>
                    <p className="text-sm mt-1">{selectedRecord.subject}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">发件人</label>
                    <p className="text-sm mt-1">{selectedRecord.from}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">收件人</label>
                    <p className="text-sm mt-1">{selectedRecord.to}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">发送时间</label>
                    <p className="text-sm mt-1">
                      {selectedRecord.emailSendTime
                        ? new Date(selectedRecord.emailSendTime).toLocaleString('zh-CN')
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

                {selectedRecord.text && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">文本内容</label>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{selectedRecord.text}</p>
                    </div>
                  </div>
                )}

                {selectedRecord.html && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">HTML 内容</label>
                    <div className="mt-1 p-3 bg-muted rounded-md border overflow-auto">
                      <div
                        className="email-html-content text-sm"
                        style={{
                          color: 'hsl(var(--foreground))',
                        }}
                        dangerouslySetInnerHTML={{ __html: selectedRecord.html }}
                      />
                    </div>
                  </div>
                )}

                {selectedRecord.attachments && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">附件</label>
                    <p className="text-sm mt-1">{selectedRecord.attachments}</p>
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
