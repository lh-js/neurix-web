'use client'

import { useRolePage } from '@/hooks/admin/role-page/use-role-page'
import { useRolePageForm } from '@/hooks/admin/role-page/use-role-page-form'
import { useDeleteDialog } from '@/hooks/common/use-delete-dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { DataTable, type DataTableColumn } from '@/components/common/data-table'
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { RolePageFormDialog } from './components/role-page-form-dialog'
import { BooleanFilter } from '@/components/common/boolean-filter'
import {
  CreatePermissionButton,
  EditPermissionButton,
  DeletePermissionButton,
} from '@/components/common/permission-button'
import { useAuth } from '@/hooks/common/use-auth'
import type { RolePage } from '@/service/types/role-page'

export default function RolePagePage() {
  const { accessibleElements, pagesLoading } = useAuth()
  const canEditElements = accessibleElements?.includes('admin-edit-button') ?? false
  const canDeleteElements = accessibleElements?.includes('admin-delete-button') ?? false
  const showActionColumn = pagesLoading || canEditElements || canDeleteElements

  const columns: DataTableColumn<RolePage>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (item: RolePage) => <span className="text-muted-foreground">{item.id}</span>,
    },
    {
      key: 'url',
      header: 'URL',
      render: (item: RolePage) => <span className="font-medium">{item.url}</span>,
    },
    {
      key: 'description',
      header: '描述',
      render: (item: RolePage) => item.description,
    },
    {
      key: 'isPublic',
      header: '是否公开',
      render: (item: RolePage) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            item.isPublic
              ? 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400'
              : 'bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400'
          }`}
        >
          {item.isPublic ? '是' : '否'}
        </span>
      ),
    },
    {
      key: 'createTime',
      header: '创建时间',
      render: (item: RolePage) => (
        <span className="text-sm text-muted-foreground">
          {item.createTime ? new Date(item.createTime).toLocaleString('zh-CN') : '-'}
        </span>
      ),
    },
  ]

  if (showActionColumn) {
    columns.push({
      key: 'actions',
      header: '操作',
      className: 'text-right',
      render: item => (
        <div className="flex items-center justify-end gap-2">
          <EditPermissionButton variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
            <Pencil className="h-4 w-4" />
          </EditPermissionButton>
          <DeletePermissionButton
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(item.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </DeletePermissionButton>
        </div>
      ),
    })
  }
  const {
    data,
    loading,
    error,
    handlePageChange,
    handleCreate,
    handleUpdate,
    handleDelete,
    fetchRolePageById,
    fetchList,
    filterIsPublic,
    handleIsPublicFilterChange,
  } = useRolePage()

  const {
    isDialogOpen,
    setIsDialogOpen,
    editingItem,
    formData,
    setFormData,
    dialogLoading,
    submitting,
    openCreateDialog,
    openEditDialog,
    handleSubmit,
  } = useRolePageForm({
    fetchRolePageById,
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
        icon={Shield}
        title="页面权限管理"
        actions={
          <>
            <Button onClick={fetchList} variant="outline" disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              查询
            </Button>
            <CreatePermissionButton onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              新增
            </CreatePermissionButton>
          </>
        }
      />

      {/* 筛选区域 */}
      <div className="flex items-center gap-4">
        <BooleanFilter
          label="是否公开："
          value={filterIsPublic}
          onChange={handleIsPublicFilterChange}
        />
      </div>

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
        emptyMessage="暂无数据"
        emptyIcon={<Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />}
      />

      <RolePageFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editing={!!editingItem}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        loading={dialogLoading}
        submitting={submitting}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={handleOpenChange}
        title="确认删除"
        description="确定要删除这条页面权限记录吗？此操作无法撤销。"
        deleting={deleting}
        onConfirm={confirmDelete}
        onCancel={handleCancel}
      />
    </div>
  )
}
