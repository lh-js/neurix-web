'use client'

import { useState, useEffect, useRef } from 'react'
import { User, CreateUserRequest } from '@/service/types/user'
import { useUserList } from '@/hooks/admin/user/use-user'
import { getAllRoles } from '@/service/api/role'
import { Role } from '@/service/types/role'
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import { Users, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'

export default function UserPage() {
  const {
    data,
    loading,
    error,
    page,
    handlePageChange,
    fetchUserById,
    handleCreate,
    handleUpdate,
    handleDelete,
    fetchList,
    getRoleBadgeClass,
    getPageNumbers,
  } = useUserList()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingItem, setEditingItem] = useState<User | null>(null)
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: '',
    nickname: '',
    password: '',
    role: 0,
  })
  const [dialogLoading, setDialogLoading] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const fetchingRolesRef = useRef(false)

  // 获取所有角色
  useEffect(() => {
    if (fetchingRolesRef.current) {
      return
    }

    fetchingRolesRef.current = true

    const fetchRoles = async () => {
      setRolesLoading(true)
      try {
        const roleList = await getAllRoles()
        setRoles(roleList)
      } catch {
        console.error('获取角色列表失败')
      } finally {
        setRolesLoading(false)
        fetchingRolesRef.current = false
      }
    }
    fetchRoles()
  }, [])

  // 根据角色 id 获取角色 name
  const getRoleName = (roleId: number): string => {
    const role = roles.find(r => r.id === roleId)
    return role?.name || `角色 ${roleId}`
  }

  const openCreateDialog = () => {
    setEditingItem(null)
    setFormData({
      email: '',
      nickname: '',
      password: '',
      role: 0,
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = async (item: User) => {
    setEditingItem(item)
    setDialogLoading(true)
    setIsDialogOpen(true)

    try {
      // 通过接口获取最新的数据
      const user = await fetchUserById(item.id)
      setFormData({
        email: user.email,
        nickname: user.nickname,
        password: '', // 编辑时不设置密码
        role: user.role,
      })
      setEditingItem(user)
    } catch {
      // 如果获取失败，使用列表中的数据
      setFormData({
        email: item.email,
        nickname: item.nickname,
        password: '', // 编辑时不设置密码
        role: item.role,
      })
      toast.error('获取详情失败，使用列表数据')
    } finally {
      setDialogLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        // 更新时不需要密码字段
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...updateData } = formData
        await handleUpdate(editingItem.id, updateData)
        toast.success('更新成功')
      } else {
        // 创建时必须包含密码
        if (!formData.password) {
          toast.error('请输入密码')
          return
        }
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

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">用户管理</h1>
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
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr:last-child]:border-b">
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
                        {getRoleName(user.role)}
                      </span>
                    </TableCell>
                    <TableCell>{user.tokens}</TableCell>
                    <TableCell>{user.usage}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.createTime ? new Date(user.createTime).toLocaleString('zh-CN') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(user.id)}
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
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">暂无用户数据</p>
          </div>
        )}
      </div>

      {/* 新增/编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? '编辑用户' : '新增用户'}</DialogTitle>
            <DialogDescription>
              {editingItem ? '修改用户信息' : '创建一个新的用户'}
            </DialogDescription>
          </DialogHeader>
          {dialogLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="请输入邮箱"
                  disabled={dialogLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">昵称</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                  placeholder="请输入昵称"
                  disabled={dialogLoading}
                />
              </div>
              {!editingItem && (
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="请输入密码"
                    disabled={dialogLoading}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="role">角色</Label>
                <Select
                  value={formData.role.toString()}
                  onValueChange={value => setFormData({ ...formData, role: parseInt(value) })}
                  disabled={dialogLoading || rolesLoading}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="请选择角色" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesLoading ? (
                      <div className="p-2 text-sm text-muted-foreground">加载中...</div>
                    ) : roles.length > 0 ? (
                      roles.map(role => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">暂无角色</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
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
            <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
            <AlertDialogDescription>此操作无法撤销。这将永久删除该用户。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
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
