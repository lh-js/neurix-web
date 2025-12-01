'use client'

import { useState, useEffect, useRef } from 'react'
import { Role, CreateRoleRequest } from '@/service/types/role'
import { useRole } from '@/hooks/admin/role/use-role'
import { getAllRoleUrls } from '@/service/api/role-url'
import { RoleUrl } from '@/service/types/role-url'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import { Shield, Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function RolePage() {
  const {
    data,
    loading,
    error,
    page,
    handlePageChange,
    handleCreate,
    handleUpdate,
    handleDelete,
    fetchRoleById,
    getPageNumbers,
  } = useRole()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingItem, setEditingItem] = useState<Role | null>(null)
  const [formData, setFormData] = useState<CreateRoleRequest>({
    name: '',
    description: '',
    level: 0,
    accessible_pages: [],
    accessible_apis: [],
  })
  const [dialogLoading, setDialogLoading] = useState(false)
  const [roleUrls, setRoleUrls] = useState<RoleUrl[]>([])
  const [roleUrlsLoading, setRoleUrlsLoading] = useState(false)
  const fetchingRoleUrlsRef = useRef(false)

  // 获取所有权限URL
  useEffect(() => {
    // 防止重复请求
    if (fetchingRoleUrlsRef.current) {
      return
    }

    fetchingRoleUrlsRef.current = true

    const fetchRoleUrls = async () => {
      setRoleUrlsLoading(true)
      try {
        const urls = await getAllRoleUrls()
        setRoleUrls(urls)
      } catch (err) {
        console.error('获取权限URL列表失败:', err)
      } finally {
        setRoleUrlsLoading(false)
        fetchingRoleUrlsRef.current = false
      }
    }
    fetchRoleUrls()
  }, [])

  // 获取页面类型的URL
  const pageUrls = roleUrls.filter(url => url.type === 0)
  // 获取接口类型的URL
  const apiUrls = roleUrls.filter(url => url.type === 1)

  const openCreateDialog = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      description: '',
      level: 0,
      accessible_pages: [],
      accessible_apis: [],
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = async (item: Role) => {
    setEditingItem(item)
    setDialogLoading(true)
    setIsDialogOpen(true)

    try {
      // 通过接口获取最新的数据
      const role = await fetchRoleById(item.id)
      setFormData({
        name: role.name,
        description: role.description,
        level: role.level,
        accessible_pages: role.accessible_pages || [],
        accessible_apis: role.accessible_apis || [],
      })
      setEditingItem(role)
    } catch {
      // 如果获取失败，使用列表中的数据
      setFormData({
        name: item.name,
        description: item.description,
        level: item.level,
        accessible_pages: item.accessible_pages || [],
        accessible_apis: item.accessible_apis || [],
      })
      toast.error('获取详情失败，使用列表数据')
    } finally {
      setDialogLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
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
    }
  }

  const handleDeleteClick = (id: number) => {
    setDeletingId(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (deletingId === null) return

    try {
      await handleDelete(deletingId)
      toast.success('删除成功')
      setIsDeleteDialogOpen(false)
      setDeletingId(null)
    } catch {
      // 错误已在 hook 中处理
    }
  }

  // 切换页面权限
  const togglePageUrl = (url: string) => {
    setFormData(prev => {
      const pages = prev.accessible_pages.includes(url)
        ? prev.accessible_pages.filter(u => u !== url)
        : [...prev.accessible_pages, url]
      return { ...prev, accessible_pages: pages }
    })
  }

  // 切换接口权限
  const toggleApiUrl = (url: string) => {
    setFormData(prev => {
      const apis = prev.accessible_apis.includes(url)
        ? prev.accessible_apis.filter(u => u !== url)
        : [...prev.accessible_apis, url]
      return { ...prev, accessible_apis: apis }
    })
  }

  // 格式化时间
  const formatTime = (time: string) => {
    return new Date(time).toLocaleString('zh-CN')
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">用户权限管理</h1>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          新增
        </Button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
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
                  <TableHead>名称</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>等级</TableHead>
                  <TableHead>可访问页面</TableHead>
                  <TableHead>可访问接口</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.list.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">{item.id}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.level}</TableCell>
                    <TableCell>
                      {item.accessible_pages && item.accessible_pages.length > 0
                        ? `${item.accessible_pages.length} 个`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {item.accessible_apis && item.accessible_apis.length > 0
                        ? `${item.accessible_apis.length} 个`
                        : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatTime(item.create_time)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? '编辑角色' : '新增角色'}</DialogTitle>
            <DialogDescription>
              {editingItem ? '修改角色信息' : '创建一个新的角色'}
            </DialogDescription>
          </DialogHeader>
          {dialogLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入角色名称"
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
                <Label htmlFor="level">等级</Label>
                <Input
                  id="level"
                  type="number"
                  value={formData.level}
                  onChange={e => setFormData({ ...formData, level: parseInt(e.target.value) || 0 })}
                  placeholder="请输入等级"
                  disabled={dialogLoading}
                />
              </div>
              <div className="space-y-2">
                <Label>可访问页面</Label>
                <div className="border rounded-md p-4 max-h-48 overflow-y-auto space-y-2">
                  {roleUrlsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : pageUrls.length > 0 ? (
                    pageUrls.map(url => (
                      <div key={url.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`page-${url.id}`}
                          checked={formData.accessible_pages.includes(url.url)}
                          onCheckedChange={() => togglePageUrl(url.url)}
                          disabled={dialogLoading}
                        />
                        <Label
                          htmlFor={`page-${url.id}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          <div>
                            <div className="font-medium">{url.url}</div>
                            {url.description && (
                              <div className="text-xs text-muted-foreground">{url.description}</div>
                            )}
                          </div>
                        </Label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">暂无页面权限</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>可访问接口</Label>
                <div className="border rounded-md p-4 max-h-48 overflow-y-auto space-y-2">
                  {roleUrlsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : apiUrls.length > 0 ? (
                    apiUrls.map(url => (
                      <div key={url.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`api-${url.id}`}
                          checked={formData.accessible_apis.includes(url.url)}
                          onCheckedChange={() => toggleApiUrl(url.url)}
                          disabled={dialogLoading}
                        />
                        <Label
                          htmlFor={`api-${url.id}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          <div>
                            <div className="font-medium">{url.url}</div>
                            {url.description && (
                              <div className="text-xs text-muted-foreground">{url.description}</div>
                            )}
                          </div>
                        </Label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">暂无接口权限</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={dialogLoading}
            >
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={dialogLoading}>
              {editingItem ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这条角色记录吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingId(null)}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
