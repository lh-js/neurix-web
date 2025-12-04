'use client'

import { Shield, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { useDeleteDialog } from '@/hooks/common/use-delete-dialog'
import { useRoleElement } from '@/hooks/admin/role-element/use-role-element'
import { useRoleElementForm } from '@/hooks/admin/role-element/use-role-element-form'
import { RoleElementFormDialog } from './components/role-element-form-dialog'

export default function RoleElementPage() {
  const {
    data,
    loading,
    error,
    handlePageChange,
    handleCreate,
    handleUpdate,
    handleDelete,
    fetchRoleElementById,
    fetchList,
  } = useRoleElement()

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
  } = useRoleElementForm({
    fetchRoleElementById,
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

  const formatTime = (time?: string) => {
    if (!time) return '-'
    return new Date(time).toLocaleString('zh-CN')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Shield}
        title="元素权限管理"
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
            key: 'name',
            header: '元素名称',
            render: item => <span className="font-medium">{item.name || '-'}</span>,
          },
          {
            key: 'key',
            header: '元素标识',
            render: item => <span className="font-mono text-sm">{item.key || '-'}</span>,
          },
          {
            key: 'description',
            header: '描述',
            render: item => item.description || '-',
          },
          {
            key: 'createTime',
            header: '创建时间',
            render: item => (
              <span className="text-sm text-muted-foreground">{formatTime(item.createTime)}</span>
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
        emptyMessage="暂无数据"
        emptyIcon={<Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />}
      />

      <RoleElementFormDialog
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
        description="确定要删除这条元素权限记录吗？此操作无法撤销。"
        deleting={deleting}
        onConfirm={confirmDelete}
        onCancel={handleCancel}
      />
    </div>
  )
}
