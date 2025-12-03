'use client'

import { useUserList } from '@/hooks/admin/user/use-user'
import { useUserForm } from '@/hooks/admin/user/use-user-form'
import { useDeleteDialog } from '@/hooks/common/use-delete-dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { UserFormDialog } from './components/user-form-dialog'
import { UserRoleBadge } from './components/user-role-badge'

export default function UserPage() {
  const {
    data,
    loading,
    error,
    handlePageChange,
    fetchUserById,
    handleCreate,
    handleUpdate,
    handleDelete,
    fetchList,
  } = useUserList()

  const {
    isDialogOpen,
    setIsDialogOpen,
    editingItem,
    formData,
    setFormData,
    dialogLoading,
    submitting,
    roles,
    rolesLoading,
    openCreateDialog,
    openEditDialog,
    handleSubmit,
  } = useUserForm({
    fetchUserById,
    handleCreate,
    handleUpdate,
  })

  const {
    isDeleteDialogOpen,
    deleting,
    handleDeleteClick,
    confirmDelete,
    handleCancel,
    handleOpenChange,
  } = useDeleteDialog({
    onDelete: handleDelete,
    successMessage: '删除成功',
  })

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="用户管理"
        actions={
          <>
            <Button onClick={fetchList} variant="outline" disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              查询
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              新增
            </Button>
          </>
        }
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <DataTable
        columns={[
          {
            key: 'id',
            header: 'ID',
            render: item => <span className="text-muted-foreground">{item.id}</span>,
          },
          {
            key: 'email',
            header: '邮箱',
            render: item => <span className="font-medium">{item.email}</span>,
          },
          {
            key: 'nickname',
            header: '昵称',
            render: item => item.nickname,
          },
          {
            key: 'role',
            header: '角色',
            render: item => <UserRoleBadge roleId={item.role} roles={roles} />,
          },
          {
            key: 'tokens',
            header: 'Token',
            render: item => item.tokens,
          },
          {
            key: 'usage',
            header: '使用量',
            render: item => item.usage,
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
            render: item => (
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
            ),
          },
        ]}
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
        emptyMessage="暂无用户数据"
        emptyIcon={<Users className="mx-auto h-12 w-12 text-muted-foreground/50" />}
      />

      <UserFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editing={!!editingItem}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        loading={dialogLoading}
        submitting={submitting}
        roles={roles}
        rolesLoading={rolesLoading}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={handleOpenChange}
        title="确定要删除吗？"
        description="此操作无法撤销。这将永久删除该用户。"
        deleting={deleting}
        onConfirm={confirmDelete}
        onCancel={handleCancel}
      />
    </div>
  )
}
