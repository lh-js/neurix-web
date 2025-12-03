'use client'

import { useRoleApi } from '@/hooks/admin/role-api/use-role-api'
import { useRoleApiForm } from '@/hooks/admin/role-api/use-role-api-form'
import { useDeleteDialog } from '@/hooks/common/use-delete-dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { RoleApiFormDialog } from './components/role-api-form-dialog'
import { BooleanFilter } from '@/components/common/boolean-filter'

export default function RoleApiPage() {
  const {
    data,
    loading,
    error,
    handlePageChange,
    handleCreate,
    handleUpdate,
    handleDelete,
    fetchRoleApiById,
    fetchList,
    filterIsPublic,
    handleIsPublicFilterChange,
  } = useRoleApi()

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
    toggleMethod,
    toggleAllMethods,
    HTTP_METHODS,
  } = useRoleApiForm({
    fetchRoleApiById,
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
        title="接口权限管理"
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
        columns={[
          {
            key: 'id',
            header: 'ID',
            render: item => <span className="text-muted-foreground">{item.id}</span>,
          },
          {
            key: 'url',
            header: 'URL',
            render: item => <span className="font-medium">{item.url}</span>,
          },
          {
            key: 'description',
            header: '描述',
            render: item => item.description,
          },
          {
            key: 'method',
            header: 'HTTP 方法',
            render: item => (
              <div className="flex flex-wrap gap-1">
                {item.method && item.method.length > 0 ? (
                  item.method.map(method => (
                    <span
                      key={method}
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                    >
                      {method}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>
            ),
          },
          {
            key: 'isPublic',
            header: '是否公开',
            render: item => (
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
        emptyMessage="暂无数据"
        emptyIcon={<Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />}
      />

      <RoleApiFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editing={!!editingItem}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        loading={dialogLoading}
        submitting={submitting}
        onToggleMethod={toggleMethod}
        onToggleAllMethods={toggleAllMethods}
        httpMethods={HTTP_METHODS}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={handleOpenChange}
        title="确认删除"
        description="确定要删除这条接口权限记录吗？此操作无法撤销。"
        deleting={deleting}
        onConfirm={confirmDelete}
        onCancel={handleCancel}
      />
    </div>
  )
}
