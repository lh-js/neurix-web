'use client'

import { ReactNode } from 'react'
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

interface DataTableColumn<T> {
  key: string
  header: string
  render: (item: T) => ReactNode
  className?: string
}

interface PaginationInfo {
  total: number
  page: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  loading?: boolean
  pagination?: PaginationInfo
  onPageChange?: (page: number) => void
  emptyMessage?: string
  emptyIcon?: ReactNode
  loadingRows?: number
}

export function DataTable<T extends { id: number | string }>({
  columns,
  data,
  loading = false,
  pagination,
  onPageChange,
  emptyMessage = '暂无数据',
  emptyIcon,
  loadingRows = 5,
}: DataTableProps<T>) {
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (!pagination || pagination.totalPages === 0) return []

    const pages: (number | 'ellipsis')[] = []
    const totalPages = pagination.totalPages
    const currentPage = pagination.page

    // 总是显示第一页
    pages.push(1)

    // 如果总页数 <= 7，显示所有页码
    if (totalPages <= 7) {
      for (let i = 2; i <= totalPages; i++) {
        pages.push(i)
      }
      return pages
    }

    // 显示当前页前后各2页
    const start = Math.max(2, currentPage - 2)
    const end = Math.min(totalPages - 1, currentPage + 2)

    // 如果第一页和开始页之间有间隔，添加省略号
    if (start > 2) {
      pages.push('ellipsis')
    }

    // 添加当前页附近的页码
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // 如果结束页和最后一页之间有间隔，添加省略号
    if (end < totalPages - 1) {
      pages.push('ellipsis')
    }

    // 总是显示最后一页
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  if (loading) {
    return (
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="p-6 space-y-4">
          {[...Array(loadingRows)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="p-12 text-center">
          {emptyIcon}
          <p className="mt-4 text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(column => (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(item => (
            <TableRow key={item.id}>
              {columns.map(column => (
                <TableCell key={column.key} className={column.className}>
                  {column.render(item)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination && onPageChange && (
        <div className="flex items-center justify-between border-t px-6 py-4 gap-4 min-w-0">
          <div className="text-sm text-muted-foreground whitespace-nowrap flex-shrink-0">
            共 {pagination.total} 条记录，第 {pagination.page} / {pagination.totalPages} 页
          </div>
          <div className="flex-shrink-0">
            <Pagination className="w-auto mx-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={e => {
                      e.preventDefault()
                      if (pagination.hasPreviousPage && !loading) {
                        onPageChange(pagination.page - 1)
                      }
                    }}
                    className={
                      !pagination.hasPreviousPage || loading
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
                            onPageChange(pageNumber)
                          }
                        }}
                        isActive={pageNumber === pagination.page}
                        className={loading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
                      if (pagination.hasNextPage && !loading) {
                        onPageChange(pagination.page + 1)
                      }
                    }}
                    className={
                      !pagination.hasNextPage || loading
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  )
}
