'use client'

import { useLoginRecordList } from '@/hooks/admin/login-record/use-login-record'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LogIn, Search, CheckCircle2, XCircle, Key, Mail } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import type { LoginRecord } from '@/service/types/login-record'

export default function LoginRecordPage() {
  const { data, loading, error, handlePageChange, fetchList } = useLoginRecordList()

  const columns: Array<{
    key: string
    header: string
    render: (item: LoginRecord) => React.ReactNode
    className?: string
  }> = [
    {
      key: 'id',
      header: 'ID',
      render: item => <span className="text-muted-foreground">{item.id}</span>,
    },
    {
      key: 'userId',
      header: '用户ID',
      render: item => <span className="text-sm">{item.userId}</span>,
    },
    {
      key: 'email',
      header: '邮箱',
      render: item => (
        <span className="text-sm" title={item.email}>
          {item.email}
        </span>
      ),
    },
    {
      key: 'ipAddress',
      header: 'IP地址',
      render: item => (
        <span className="text-sm font-mono text-muted-foreground">{item.ipAddress}</span>
      ),
    },
    {
      key: 'location',
      header: '地理位置',
      render: item => (
        <span className="text-sm text-muted-foreground">
          {item.country} {item.province} {item.city}
        </span>
      ),
    },
    {
      key: 'loginType',
      header: '登录方式',
      render: item => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
            item.loginType === 'password'
              ? 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/50'
              : 'bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-500/50'
          }`}
        >
          {item.loginType === 'password' ? (
            <>
              <Key className="h-3 w-3 mr-1" />
              密码登录
            </>
          ) : (
            <>
              <Mail className="h-3 w-3 mr-1" />
              验证码登录
            </>
          )}
        </span>
      ),
    },
    {
      key: 'status',
      header: '登录状态',
      render: item => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
          <span className="text-sm text-red-600 dark:text-red-400" title={item.failureReason}>
            {item.failureReason}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        ),
    },
    {
      key: 'userAgent',
      header: 'User Agent',
      render: item => (
        <span
          className="text-xs text-muted-foreground max-w-xs truncate block"
          title={item.userAgent}
        >
          {item.userAgent}
        </span>
      ),
    },
    {
      key: 'loginTime',
      header: '登录时间',
      render: item => (
        <span className="text-sm text-muted-foreground">
          {item.loginTime ? new Date(item.loginTime).toLocaleString('zh-CN') : '-'}
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
        icon={LogIn}
        title="登录记录"
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
        emptyMessage="暂无登录记录"
        emptyIcon={<LogIn className="mx-auto h-12 w-12 text-muted-foreground/50" />}
      />
    </div>
  )
}
