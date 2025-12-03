'use client'

import { useState } from 'react'
import { RoleUrl, CreateRoleUrlRequest, RoleUrlType } from '@/service/types/role-url'
import { useRoleUrl } from '@/hooks/admin/role-url/use-role-url'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import { Shield, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

export default function RoleUrlPage() {
  const {
    data,
    loading,
    error,
    page,
    handlePageChange,
    handleCreate,
    handleUpdate,
    handleDelete,
    fetchRoleUrlById,
    fetchList,
    getTypeLabel,
    getTypeBadgeClass,
    getPageNumbers,
    filterType,
    filterIsPublic,
    handleFilterChange,
    handleIsPublicFilterChange,
  } = useRoleUrl()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editingItem, setEditingItem] = useState<RoleUrl | null>(null)
  const [formData, setFormData] = useState<CreateRoleUrlRequest>({
    url: '',
    description: '',
    type: 0,
    isPublic: false,
  })
  const [dialogLoading, setDialogLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const openCreateDialog = () => {
    setEditingItem(null)
    // 根据当前选中的 tab 设置默认类型
    let defaultType: RoleUrlType = 0 // 默认为页面
    if (filterType === 'page') {
      defaultType = 0 // 页面
    } else if (filterType === 'api') {
      defaultType = 1 // 接口
    }
    setFormData({
      url: '',
      description: '',
      type: defaultType,
      isPublic: false,
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = async (item: RoleUrl) => {
    setEditingItem(item)
    setDialogLoading(true)
    setIsDialogOpen(true)

    try {
      // 通过接口获取最新的数据
      const roleUrl = await fetchRoleUrlById(item.id)
      setFormData({
        url: roleUrl.url,
        description: roleUrl.description,
        type: roleUrl.type,
        isPublic: roleUrl.isPublic,
      })
      setEditingItem(roleUrl)
    } catch {
      // 如果获取失败，使用列表中的数据
      setFormData({
        url: item.url,
        description: item.description,
        type: item.type,
        isPublic: item.isPublic,
      })
      toast.error('获取详情失败，使用列表数据')
    } finally {
      setDialogLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (submitting) return

    try {
      setSubmitting(true)
      if (editingItem) {
        await handleUpdate(editingItem.id, formData)
        toast.success('更新成功')
      } else {
        await handleCreate(formData)
        toast.success('创建成功')
      }
      setIsDialogOpen(false)
    } catch {
      // 错误已在 hook 中处理
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClick = (id: number) => {
    setDeletingId(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (deletingId === null || deleting) return

    try {
      setDeleting(true)
      await handleDelete(deletingId)
      toast.success('删除成功')
      setDeletingId(null)
      setIsDeleteDialogOpen(false)
    } catch {
      // 错误已在 hook 中处理
      // 删除失败时保持对话框打开，让用户可以看到错误信息
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">权限URL管理</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchList} variant="outline" disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            查询
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            新增
          </Button>
        </div>
      </div>

      {/* 筛选区域 */}
      <div className="flex items-center gap-4">
        {/* 类型筛选 Tabs */}
        <Tabs className="flex-1">
          <TabsList>
            <TabsTrigger
              data-state={filterType === 'all' ? 'active' : 'inactive'}
              onClick={() => handleFilterChange('all')}
            >
              全部
            </TabsTrigger>
            <TabsTrigger
              data-state={filterType === 'page' ? 'active' : 'inactive'}
              onClick={() => handleFilterChange('page')}
            >
              页面
            </TabsTrigger>
            <TabsTrigger
              data-state={filterType === 'api' ? 'active' : 'inactive'}
              onClick={() => handleFilterChange('api')}
            >
              接口
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 是否公开筛选 */}
        <div className="flex items-center gap-2">
          <Label htmlFor="isPublic-filter" className="text-sm whitespace-nowrap">
            是否公开：
          </Label>
          <Select
            value={filterIsPublic}
            onValueChange={value => handleIsPublicFilterChange(value as 'all' | 'true' | 'false')}
          >
            <SelectTrigger id="isPublic-filter" className="w-[120px]">
              <SelectValue placeholder="全部" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="true">是</SelectItem>
              <SelectItem value="false">否</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 数据表格 */}
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
                  <TableHead>URL</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>是否公开</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.list.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">{item.id}</TableCell>
                    <TableCell className="font-medium">{item.url}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeBadgeClass(
                          item.type
                        )}`}
                      >
                        {getTypeLabel(item.type)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.isPublic
                            ? 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                            : 'bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400'
                        }`}
                      >
                        {item.isPublic ? '是' : '否'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.createTime ? new Date(item.createTime).toLocaleString('zh-CN') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
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
            <Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">暂无数据</p>
          </div>
        )}
      </div>

      {/* 新增/编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? '编辑权限URL' : '新增权限URL'}</DialogTitle>
            <DialogDescription>
              {editingItem ? '修改权限URL信息' : '创建一个新的权限URL'}
            </DialogDescription>
          </DialogHeader>
          {dialogLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  placeholder="请输入URL"
                  disabled={dialogLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="请输入描述"
                  disabled={dialogLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">类型</Label>
                <Select
                  value={formData.type.toString()}
                  onValueChange={value =>
                    setFormData({ ...formData, type: parseInt(value) as RoleUrlType })
                  }
                  disabled={dialogLoading}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="请选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">页面</SelectItem>
                    <SelectItem value="1">接口</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="isPublic">是否公开</Label>
                <Select
                  value={formData.isPublic.toString()}
                  onValueChange={value => setFormData({ ...formData, isPublic: value === 'true' })}
                  disabled={dialogLoading}
                >
                  <SelectTrigger id="isPublic">
                    <SelectValue placeholder="请选择是否公开" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">是</SelectItem>
                    <SelectItem value="false">否</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={submitting || dialogLoading}
            >
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || dialogLoading}>
              {submitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  处理中...
                </>
              ) : editingItem ? (
                '更新'
              ) : (
                '创建'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={open => {
          // 删除过程中不允许关闭对话框
          if (!open && deleting) {
            return
          }
          setIsDeleteDialogOpen(open)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这条权限URL记录吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingId(null)} disabled={deleting}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async e => {
                // 阻止 AlertDialogAction 的默认关闭行为
                e.preventDefault()
                // 如果正在删除，直接返回
                if (deleting) {
                  return
                }
                await confirmDelete()
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  删除中...
                </>
              ) : (
                '删除'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
