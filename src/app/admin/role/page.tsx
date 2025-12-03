'use client'

import { useState, useEffect, useRef } from 'react'
import { Role, CreateRoleRequest } from '@/service/types/role'
import { useRole } from '@/hooks/admin/role/use-role'
import { getAllRolePages } from '@/service/api/role-page'
import { getAllRoleApis } from '@/service/api/role-api'
import type { RolePage } from '@/service/types/role-page'
import type { RoleApi } from '@/service/types/role-api'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
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
    fetchList,
    getPageNumbers,
  } = useRole()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editingItem, setEditingItem] = useState<Role | null>(null)
  const [formData, setFormData] = useState<CreateRoleRequest>({
    name: '',
    description: '',
    level: 0,
    accessiblePages: [],
    accessibleApis: [],
  })
  const [dialogLoading, setDialogLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [rolePages, setRolePages] = useState<RolePage[]>([])
  const [roleApis, setRoleApis] = useState<RoleApi[]>([])
  const [rolePagesLoading, setRolePagesLoading] = useState(false)
  const [roleApisLoading, setRoleApisLoading] = useState(false)
  const fetchingRolePagesRef = useRef(false)
  const fetchingRoleApisRef = useRef(false)

  // 获取所有页面权限
  useEffect(() => {
    if (fetchingRolePagesRef.current) {
      return
    }

    fetchingRolePagesRef.current = true

    const fetchRolePages = async () => {
      setRolePagesLoading(true)
      try {
        const pages = await getAllRolePages()
        setRolePages(pages)
      } catch (err) {
        console.error('获取页面权限列表失败:', err)
      } finally {
        setRolePagesLoading(false)
        fetchingRolePagesRef.current = false
      }
    }
    fetchRolePages()
  }, [])

  // 获取所有接口权限
  useEffect(() => {
    if (fetchingRoleApisRef.current) {
      return
    }

    fetchingRoleApisRef.current = true

    const fetchRoleApis = async () => {
      setRoleApisLoading(true)
      try {
        const apis = await getAllRoleApis()
        setRoleApis(apis)
      } catch (err) {
        console.error('获取接口权限列表失败:', err)
      } finally {
        setRoleApisLoading(false)
        fetchingRoleApisRef.current = false
      }
    }
    fetchRoleApis()
  }, [])

  // 获取公共页面
  const publicPages = rolePages.filter(page => page.isPublic).map(page => page.url)
  const permissionsLoading = rolePagesLoading || roleApisLoading

  const openCreateDialog = () => {
    setEditingItem(null)
    // 新增时，公共页面默认选中
    setFormData({
      name: '',
      description: '',
      level: 0,
      accessiblePages: [...publicPages],
      accessibleApis: [],
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
        accessiblePages: role.accessiblePages || [],
        accessibleApis: role.accessibleApis || [],
      })
      setEditingItem(role)
    } catch {
      // 如果获取失败，使用列表中的数据
      setFormData({
        name: item.name,
        description: item.description,
        level: item.level,
        accessiblePages: item.accessiblePages || [],
        accessibleApis: item.accessibleApis || [],
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
      // 新增时，确保公共页面始终在提交的数据中
      const submitData = editingItem
        ? formData
        : {
            ...formData,
            accessiblePages: [...new Set([...publicPages, ...formData.accessiblePages])],
          }
      if (editingItem) {
        await handleUpdate(editingItem.id, submitData)
        toast.success('更新成功')
      } else {
        await handleCreate(submitData)
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

  // 切换页面权限
  const togglePageUrl = (url: string) => {
    // 新增时，公共页面不允许取消选择
    if (!editingItem && publicPages.includes(url)) {
      return
    }
    setFormData(prev => {
      const pages = prev.accessiblePages.includes(url)
        ? prev.accessiblePages.filter(u => u !== url)
        : [...prev.accessiblePages, url]
      return { ...prev, accessiblePages: pages }
    })
  }

  // 切换接口权限
  const toggleApiUrl = (url: string) => {
    setFormData(prev => {
      const apis = prev.accessibleApis.includes(url)
        ? prev.accessibleApis.filter(u => u !== url)
        : [...prev.accessibleApis, url]
      return { ...prev, accessibleApis: apis }
    })
  }

  // 全选/取消全选页面权限
  const toggleAllPages = () => {
    setFormData(prev => {
      const allPageUrls = rolePages.map(page => page.url)
      if (!editingItem) {
        // 新增时：全选时包含公共页面，取消全选时只取消非公共页面
        const nonPublicPages = allPageUrls.filter(url => !publicPages.includes(url))
        const allNonPublicSelected = nonPublicPages.every(url => prev.accessiblePages.includes(url))
        return {
          ...prev,
          accessiblePages: allNonPublicSelected
            ? [...publicPages] // 取消全选：只保留公共页面
            : [...publicPages, ...nonPublicPages], // 全选：公共页面 + 所有非公共页面
        }
      } else {
        // 编辑时：正常全选/取消全选
        const allSelected = allPageUrls.every(url => prev.accessiblePages.includes(url))
        return {
          ...prev,
          accessiblePages: allSelected ? [] : allPageUrls,
        }
      }
    })
  }

  // 全选/取消全选接口权限
  const toggleAllApis = () => {
    setFormData(prev => {
      const allApiUrls = roleApis.map(api => api.url)
      const allSelected = allApiUrls.every(url => prev.accessibleApis.includes(url))
      return {
        ...prev,
        accessibleApis: allSelected ? [] : allApiUrls,
      }
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
                      {item.accessiblePages && item.accessiblePages.length > 0
                        ? `${item.accessiblePages.length} 个`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {item.accessibleApis && item.accessibleApis.length > 0
                        ? `${item.accessibleApis.length} 个`
                        : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatTime(item.createTime)}
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
                <div className="flex items-center justify-between">
                  <Label>可访问页面</Label>
                  {!permissionsLoading && rolePages.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={toggleAllPages}
                      disabled={dialogLoading}
                      className="h-7 text-xs"
                    >
                      {editingItem
                        ? rolePages.every(page => formData.accessiblePages.includes(page.url))
                          ? '取消全选'
                          : '全选'
                        : rolePages
                              .filter(page => !page.isPublic)
                              .every(page => formData.accessiblePages.includes(page.url))
                          ? '取消全选'
                          : '全选'}
                    </Button>
                  )}
                </div>
                <div className="border rounded-md p-4 max-h-48 overflow-y-auto space-y-2">
                  {permissionsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : rolePages.length > 0 ? (
                    rolePages.map(page => {
                      const isPublic = page.isPublic
                      const isChecked = formData.accessiblePages.includes(page.url)
                      // 新增时，公共页面禁用；编辑时，公共页面不禁用
                      const isDisabled = dialogLoading || (!editingItem && isPublic)
                      return (
                        <div key={page.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`page-${page.id}`}
                            checked={isChecked}
                            onCheckedChange={() => togglePageUrl(page.url)}
                            disabled={isDisabled}
                          />
                          <Label
                            htmlFor={`page-${page.id}`}
                            className={`text-sm font-normal flex-1 ${
                              isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                            }`}
                          >
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {page.url}
                                {isPublic && (
                                  <span className="text-xs text-muted-foreground">(公共页面)</span>
                                )}
                              </div>
                              {page.description && (
                                <div className="text-xs text-muted-foreground">
                                  {page.description}
                                </div>
                              )}
                            </div>
                          </Label>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">暂无页面权限</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>可访问接口</Label>
                  {!permissionsLoading && roleApis.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={toggleAllApis}
                      disabled={dialogLoading}
                      className="h-7 text-xs"
                    >
                      {roleApis.every(api => formData.accessibleApis.includes(api.url))
                        ? '取消全选'
                        : '全选'}
                    </Button>
                  )}
                </div>
                <div className="border rounded-md p-4 max-h-48 overflow-y-auto space-y-2">
                  {permissionsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : roleApis.length > 0 ? (
                    roleApis.map(api => (
                      <div key={api.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`api-${api.id}`}
                          checked={formData.accessibleApis.includes(api.url)}
                          onCheckedChange={() => toggleApiUrl(api.url)}
                          disabled={dialogLoading}
                        />
                        <Label
                          htmlFor={`api-${api.id}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          <div>
                            <div className="font-medium">{api.url}</div>
                            {api.description && (
                              <div className="text-xs text-muted-foreground">{api.description}</div>
                            )}
                            {api.method && api.method.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                方法: {api.method.join(', ')}
                              </div>
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
              确定要删除这条角色记录吗？此操作无法撤销。
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
