'use client'

import { User } from '@/service/types/user'
import { useUserList } from '@/hooks/admin/user/use-user'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import { Users } from 'lucide-react'

export default function UserPage() {
  const {
    data,
    loading,
    error,
    page,
    handlePageChange,
    getRoleLabel,
    getRoleBadgeClass,
    getPageNumbers,
  } = useUserList()

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">用户管理</h1>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      {/* 用户列表表格 */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : data && data.list.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>昵称</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>使用量</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.list.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-muted-foreground">{user.id}</TableCell>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.nickname}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeClass(
                          user.role
                        )}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </TableCell>
                    <TableCell>{user.tokens}</TableCell>
                    <TableCell>{user.usage}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* 分页控件 */}
            <div className="flex items-center justify-between border-t px-6 py-4 gap-4 min-w-0">
              <div className="text-sm text-muted-foreground whitespace-nowrap flex-shrink-0">
                共 {data.total} 条记录，第 {data.page} / {data.totalPages} 页
              </div>
              <div className="flex-shrink-0">
                <Pagination className="w-auto mx-0">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={e => {
                          e.preventDefault()
                          if (data.hasPreviousPage && !loading) {
                            handlePageChange(page - 1)
                          }
                        }}
                        className={
                          !data.hasPreviousPage || loading
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                    {getPageNumbers().map((pageItem, index) => {
                      if (pageItem === 'ellipsis') {
                        return (
                          <PaginationItem key={`ellipsis-${index}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )
                      }

                      const pageNumber = pageItem
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            href="#"
                            onClick={e => {
                              e.preventDefault()
                              if (!loading) {
                                handlePageChange(pageNumber)
                              }
                            }}
                            isActive={pageNumber === page}
                            className={
                              loading ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                            }
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={e => {
                          e.preventDefault()
                          if (data.hasNextPage && !loading) {
                            handlePageChange(page + 1)
                          }
                        }}
                        className={
                          !data.hasNextPage || loading
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">暂无用户数据</p>
          </div>
        )}
      </div>
    </div>
  )
}
