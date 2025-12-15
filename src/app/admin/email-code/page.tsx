'use client'

import { useEmailCodeList } from '@/hooks/admin/email-code/use-email-code'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Search, CheckCircle2, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import type { EmailCode } from '@/service/types/email-code'

export default function EmailCodePage() {
  const { data, loading, error, handlePageChange, fetchList } = useEmailCodeList()

  const columns: Array<{
    key: string
    header: string
    render: (item: EmailCode) => React.ReactNode
    className?: string
  }> = [
    {
      key: 'id',
      header: 'ID',
      render: item => <span className="text-muted-foreground">{item.id}</span>,
    },
    {
      key: 'code',
      header: '验证码',
      render: item => (
        <span className="font-mono font-medium text-sm" title={item.code}>
          {item.code}
        </span>
      ),
    },
    {
      key: 'to',
      header: '收件邮箱',
      render: item => (
        <span className="text-sm" title={item.to}>
          {item.to}
        </span>
      ),
    },
    {
      key: 'isUsed',
      header: '使用状态',
      render: item => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            item.isUsed
              ? 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400'
              : 'bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400'
          }`}
        >
          {item.isUsed ? (
            <>
              <CheckCircle2 className="h-3 w-3 mr-1" />
              已使用
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 mr-1" />
              未使用
            </>
          )}
        </span>
      ),
    },
    {
      key: 'codeSendTime',
      header: '发送时间',
      render: item => (
        <span className="text-sm text-muted-foreground">
          {item.codeSendTime ? new Date(item.codeSendTime).toLocaleString('zh-CN') : '-'}
        </span>
      ),
    },
    {
      key: 'codeExpiredTime',
      header: '过期时间',
      render: item => (
        <span className="text-sm text-muted-foreground">
          {item.codeExpiredTime ? new Date(item.codeExpiredTime).toLocaleString('zh-CN') : '-'}
        </span>
      ),
    },
    {
      key: 'codeUsedTime',
      header: '使用时间',
      render: item => (
        <span className="text-sm text-muted-foreground">
          {item.codeUsedTime ? new Date(item.codeUsedTime).toLocaleString('zh-CN') : '-'}
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
        icon={Mail}
        title="验证码管理"
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
        emptyMessage="暂无验证码记录"
        emptyIcon={<Mail className="mx-auto h-12 w-12 text-muted-foreground/50" />}
      />
    </div>
  )
}
