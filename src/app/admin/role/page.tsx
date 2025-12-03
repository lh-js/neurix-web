'use client'

import { useState, useEffect, useRef } from 'react'
import type { Role, CreateRoleRequest } from '@/service/types/role'
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
  // 获取公共接口（包含所有 method）
  const publicApis = roleApis
    .filter(api => api.isPublic)
    .map(api => ({
      url: api.url,
      method: api.method || [],
    }))
  const permissionsLoading = rolePagesLoading || roleApisLoading

  const openCreateDialog = () => {
    setEditingItem(null)
    // 新增时，公共页面和公共接口默认选中
    setFormData({
      name: '',
      description: '',
      level: 0,
      accessiblePages: [...publicPages],
      accessibleApis: [...publicApis], // 默认选中所有公共接口（包含所有 method）
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = async (item: Role) => {
    setEditingItem(item)
    setDialogLoading(true)
    setIsDialogOpen(true)

    // 处理 accessibleApis：如果是旧格式（string[]），转换为新格式
    const convertAccessibleApis = (
      apis: Role['accessibleApis']
    ): CreateRoleRequest['accessibleApis'] => {
      if (!apis || apis.length === 0) return []
      // 检查第一个元素是否是字符串（旧格式）
      if (typeof apis[0] === 'string') {
        // 旧格式：string[]，需要转换为新格式
        const oldApis = apis as unknown as string[]
        return oldApis.map(url => {
          // 查找对应的 API 定义，获取默认的 method
          const apiDef = roleApis.find(api => api.url === url)
          return {
            url,
            method: apiDef?.method || [],
          }
        })
      } else {
        // 新格式：AccessibleApi[]
        return apis as CreateRoleRequest['accessibleApis']
      }
    }

    try {
      // 通过接口获取最新的数据
      const role = await fetchRoleById(item.id)
      setFormData({
        name: role.name,
        description: role.description,
        level: role.level,
        accessiblePages: role.accessiblePages || [],
        accessibleApis: convertAccessibleApis(role.accessibleApis),
      })
      setEditingItem(role)
    } catch {
      // 如果获取失败，使用列表中的数据
      setFormData({
        name: item.name,
        description: item.description,
        level: item.level,
        accessiblePages: item.accessiblePages || [],
        accessibleApis: convertAccessibleApis(item.accessibleApis),
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
      // 新增时，确保公共页面和公共接口始终在提交的数据中
      const submitData = editingItem
        ? formData
        : {
            ...formData,
            accessiblePages: [...new Set([...publicPages, ...formData.accessiblePages])],
            // 合并公共接口，确保公共接口的所有 method 都在
            accessibleApis: [
              ...publicApis,
              ...formData.accessibleApis.filter(
                api => !publicApis.some(publicApi => publicApi.url === api.url)
              ),
            ],
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

  // 切换接口权限（添加或移除整个接口）
  const toggleApiUrl = (url: string) => {
    // 在新增模式下，公共接口不允许取消选择
    if (!editingItem && publicApis.some(api => api.url === url)) {
      return
    }
    setFormData(prev => {
      const existingIndex = prev.accessibleApis.findIndex(api => api.url === url)
      if (existingIndex >= 0) {
        // 如果已存在，移除
        return {
          ...prev,
          accessibleApis: prev.accessibleApis.filter(api => api.url !== url),
        }
      } else {
        // 如果不存在，添加（使用接口定义中的默认 method）
        const apiDef = roleApis.find(api => api.url === url)
        return {
          ...prev,
          accessibleApis: [
            ...prev.accessibleApis,
            {
              url,
              method: apiDef?.method || [],
            },
          ],
        }
      }
    })
  }

  // 批量快捷选择：增删改查（针对所有接口）
  const toggleAllCrudOperation = (operation: 'create' | 'read' | 'update' | 'delete') => {
    // 定义操作对应的 method
    const operationMethods: Record<string, string[]> = {
      create: ['POST'],
      read: ['GET'],
      update: ['PUT', 'PATCH'],
      delete: ['DELETE'],
    }

    const targetMethods = operationMethods[operation]

    setFormData(prev => {
      // 检查所有接口是否都已选中该操作的所有 method
      const allSelected = roleApis.every(api => {
        const supportedMethods = targetMethods.filter(method => api.method?.includes(method))
        if (supportedMethods.length === 0) return true // 不支持该操作的接口，视为已选中

        const selectedApi = prev.accessibleApis.find(a => a.url === api.url)
        if (!selectedApi) return false
        return supportedMethods.every(method => selectedApi.method.includes(method))
      })

      if (allSelected) {
        // 取消选择：从所有接口中移除该操作的方法
        return {
          ...prev,
          accessibleApis: prev.accessibleApis
            .map(api => {
              const apiDef = roleApis.find(a => a.url === api.url)
              if (!apiDef) return api

              const supportedMethods = targetMethods.filter(method =>
                apiDef.method?.includes(method)
              )
              if (supportedMethods.length === 0) return api

              // 移除目标方法，但保留公共接口的 method（新增模式）
              const newMethods = api.method.filter(m => {
                if (!editingItem) {
                  const publicApi = publicApis.find(pa => pa.url === api.url)
                  if (publicApi && publicApi.method.includes(m)) {
                    return true
                  }
                }
                return !supportedMethods.includes(m)
              })

              if (newMethods.length === 0) {
                return null // 标记为删除
              }
              return { ...api, method: newMethods }
            })
            .filter((api): api is typeof api & { url: string; method: string[] } => api !== null),
        }
      } else {
        // 选择：为所有接口添加该操作的方法
        const updatedApis = [...prev.accessibleApis]

        roleApis.forEach(apiDef => {
          const supportedMethods = targetMethods.filter(method => apiDef.method?.includes(method))
          if (supportedMethods.length === 0) return

          const existingIndex = updatedApis.findIndex(a => a.url === apiDef.url)
          if (existingIndex >= 0) {
            // 更新现有接口
            const currentMethods = updatedApis[existingIndex].method
            const newMethods = [...new Set([...currentMethods, ...supportedMethods])]
            updatedApis[existingIndex] = { ...updatedApis[existingIndex], method: newMethods }
          } else {
            // 添加新接口
            updatedApis.push({
              url: apiDef.url,
              method: supportedMethods,
            })
          }
        })

        return { ...prev, accessibleApis: updatedApis }
      }
    })
  }

  // 切换接口的某个 method
  const toggleApiMethod = (url: string, method: string) => {
    // 在新增模式下，公共接口的 method 不允许取消选择
    if (!editingItem) {
      const publicApi = publicApis.find(api => api.url === url)
      if (publicApi && publicApi.method.includes(method)) {
        return
      }
    }
    setFormData(prev => {
      const existingIndex = prev.accessibleApis.findIndex(api => api.url === url)
      if (existingIndex >= 0) {
        // 如果接口已存在，更新 method
        const api = prev.accessibleApis[existingIndex]
        const newMethods = api.method.includes(method)
          ? api.method.filter(m => m !== method)
          : [...api.method, method]

        // 如果所有 method 都被移除了，移除整个接口
        if (newMethods.length === 0) {
          return {
            ...prev,
            accessibleApis: prev.accessibleApis.filter(api => api.url !== url),
          }
        }

        // 更新 method
        const newApis = [...prev.accessibleApis]
        newApis[existingIndex] = { ...api, method: newMethods }
        return { ...prev, accessibleApis: newApis }
      } else {
        // 如果接口不存在，添加接口和 method
        return {
          ...prev,
          accessibleApis: [
            ...prev.accessibleApis,
            {
              url,
              method: [method],
            },
          ],
        }
      }
    })
  }

  // 全选/取消全选页面权限
  const toggleAllPages = (checked: boolean | 'indeterminate') => {
    if (checked === 'indeterminate') return

    setFormData(prev => {
      const allPageUrls = rolePages.map(page => page.url)
      if (!editingItem) {
        // 新增时：全选时包含公共页面，取消全选时只取消非公共页面
        const nonPublicPages = allPageUrls.filter(url => !publicPages.includes(url))
        return {
          ...prev,
          accessiblePages: checked
            ? [...publicPages, ...nonPublicPages] // 全选：公共页面 + 所有非公共页面
            : [...publicPages], // 取消全选：只保留公共页面
        }
      } else {
        // 编辑时：正常全选/取消全选
        return {
          ...prev,
          accessiblePages: checked ? allPageUrls : [],
        }
      }
    })
  }

  // 全选/取消全选接口权限
  const toggleAllApis = (checked: boolean | 'indeterminate') => {
    if (checked === 'indeterminate') return

    setFormData(prev => {
      if (!editingItem) {
        // 新增模式：全选时包含公共接口，取消全选时只取消非公共接口
        const nonPublicApis = roleApis
          .filter(api => !api.isPublic)
          .map(api => ({
            url: api.url,
            method: api.method || [],
          }))
        return {
          ...prev,
          accessibleApis: checked
            ? [...publicApis, ...nonPublicApis] // 全选：公共接口 + 所有非公共接口
            : [...publicApis], // 取消全选：只保留公共接口
        }
      } else {
        // 编辑模式：正常全选/取消全选
        if (checked) {
          // 全选：添加所有接口，使用接口定义中的 method
          return {
            ...prev,
            accessibleApis: roleApis.map(api => ({
              url: api.url,
              method: api.method || [],
            })),
          }
        } else {
          // 取消全选：移除所有接口
          return {
            ...prev,
            accessibleApis: [],
          }
        }
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
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all-pages"
                        checked={
                          editingItem
                            ? rolePages.every(page => formData.accessiblePages.includes(page.url))
                            : rolePages
                                .filter(page => !page.isPublic)
                                .every(page => formData.accessiblePages.includes(page.url))
                        }
                        onCheckedChange={toggleAllPages}
                        disabled={dialogLoading}
                      />
                      <Label
                        htmlFor="select-all-pages"
                        className="text-sm font-normal cursor-pointer"
                      >
                        全选
                      </Label>
                    </div>
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
                    <div className="flex items-center gap-4">
                      {/* 增删改查快捷选择 */}
                      <div className="flex items-center gap-3">
                        {(['read', 'create', 'update', 'delete'] as const).map(operation => {
                          const operationLabels = {
                            read: '查',
                            create: '增',
                            update: '改',
                            delete: '删',
                          }
                          const operationMethods: Record<string, string[]> = {
                            create: ['POST'],
                            read: ['GET'],
                            update: ['PUT', 'PATCH'],
                            delete: ['DELETE'],
                          }
                          const targetMethods = operationMethods[operation]

                          // 检查所有接口是否都已选中该操作的所有 method
                          const allSelected = roleApis.every(api => {
                            const supportedMethods = targetMethods.filter(method =>
                              api.method?.includes(method)
                            )
                            if (supportedMethods.length === 0) return true

                            const selectedApi = formData.accessibleApis.find(a => a.url === api.url)
                            if (!selectedApi) return false
                            return supportedMethods.every(method =>
                              selectedApi.method.includes(method)
                            )
                          })

                          const hasSupportedApis = roleApis.some(api => {
                            const supportedMethods = targetMethods.filter(method =>
                              api.method?.includes(method)
                            )
                            return supportedMethods.length > 0
                          })

                          if (!hasSupportedApis) return null

                          return (
                            <div key={operation} className="flex items-center space-x-2">
                              <Checkbox
                                id={`crud-${operation}`}
                                checked={allSelected}
                                onCheckedChange={() => toggleAllCrudOperation(operation)}
                                disabled={dialogLoading}
                              />
                              <Label
                                htmlFor={`crud-${operation}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {operationLabels[operation]}
                              </Label>
                            </div>
                          )
                        })}
                      </div>
                      {/* 全选复选框 */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="select-all-apis"
                          checked={roleApis.every(api => {
                            const selectedApi = formData.accessibleApis.find(a => a.url === api.url)
                            if (!selectedApi) return false
                            // 检查该接口的所有 method 是否都被选中
                            const apiMethods = api.method || []
                            return apiMethods.every(method => selectedApi.method.includes(method))
                          })}
                          onCheckedChange={toggleAllApis}
                          disabled={dialogLoading}
                        />
                        <Label
                          htmlFor="select-all-apis"
                          className="text-sm font-normal cursor-pointer"
                        >
                          全选
                        </Label>
                      </div>
                    </div>
                  )}
                </div>
                <div className="border rounded-md p-4 max-h-96 overflow-y-auto space-y-4">
                  {permissionsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : roleApis.length > 0 ? (
                    roleApis.map(api => {
                      const selectedApi = formData.accessibleApis.find(a => a.url === api.url)
                      const isApiSelected = !!selectedApi
                      const availableMethods = api.method || []
                      const isPublic = api.isPublic
                      // 新增时，公共接口禁用；编辑时，公共接口不禁用
                      const isApiDisabled = dialogLoading || (!editingItem && isPublic)

                      return (
                        <div
                          key={api.id}
                          className="space-y-2 border-b last:border-b-0 pb-3 last:pb-0"
                        >
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`api-${api.id}`}
                              checked={isApiSelected}
                              onCheckedChange={() => toggleApiUrl(api.url)}
                              disabled={isApiDisabled}
                            />
                            <Label
                              htmlFor={`api-${api.id}`}
                              className={`text-sm font-normal flex-1 ${
                                isApiDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                              }`}
                            >
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {api.url}
                                  {isPublic && (
                                    <span className="text-xs text-muted-foreground">
                                      (公共接口)
                                    </span>
                                  )}
                                </div>
                                {api.description && (
                                  <div className="text-xs text-muted-foreground">
                                    {api.description}
                                  </div>
                                )}
                              </div>
                            </Label>
                          </div>
                          {isApiSelected && availableMethods.length > 0 && (
                            <div className="pl-6 space-y-2">
                              <div className="text-xs text-muted-foreground">选择 HTTP 方法：</div>
                              <div className="flex flex-wrap gap-2">
                                {availableMethods.map(method => {
                                  const isMethodSelected =
                                    selectedApi?.method.includes(method) || false
                                  // 新增时，公共接口的 method 禁用；编辑时，公共接口的 method 不禁用
                                  const isMethodDisabled =
                                    dialogLoading ||
                                    (!editingItem &&
                                      isPublic &&
                                      publicApis.some(
                                        pa => pa.url === api.url && pa.method.includes(method)
                                      ))
                                  return (
                                    <div key={method} className="flex items-center space-x-1">
                                      <Checkbox
                                        id={`api-${api.id}-method-${method}`}
                                        checked={isMethodSelected}
                                        onCheckedChange={() => toggleApiMethod(api.url, method)}
                                        disabled={isMethodDisabled}
                                      />
                                      <Label
                                        htmlFor={`api-${api.id}-method-${method}`}
                                        className={`text-xs font-normal ${
                                          isMethodDisabled
                                            ? 'cursor-not-allowed opacity-60'
                                            : 'cursor-pointer'
                                        }`}
                                      >
                                        {method}
                                      </Label>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })
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
