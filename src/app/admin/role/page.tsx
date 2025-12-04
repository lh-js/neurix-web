'use client'

import { useRole } from '@/hooks/admin/role/use-role'
import { useRolePermissions } from '@/hooks/admin/role/use-role-permissions'
import { useRoleForm } from '@/hooks/admin/role/use-role-form'
import { useRolePermissionSelectors } from '@/hooks/admin/role/use-role-permission-selectors'
import { useDeleteDialog } from '@/hooks/common/use-delete-dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { RoleFormDialog } from './components/role-form-dialog'

export default function RolePage() {
  const {
    data,
    loading,
    error,
    handlePageChange,
    handleCreate,
    handleUpdate,
    handleDelete,
    fetchRoleById,
    fetchList,
  } = useRole()

  // 权限数据管理
  const {
    rolePages,
    roleApis,
    roleElements,
    publicPages,
    publicApis,
    rolePagesLoading,
    roleApisLoading,
    roleElementsLoading,
  } = useRolePermissions()

  // 表单管理
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
  } = useRoleForm({
    fetchRoleById,
    handleCreate,
    handleUpdate,
    publicPages,
    publicApis,
  })

  // 权限选择逻辑
  const {
    togglePageUrl,
    toggleApiUrl,
    toggleApiMethod,
    toggleAllPages,
    toggleAllApis,
    toggleAllCrudOperation,
    toggleElementKey,
    toggleAllElements,
  } = useRolePermissionSelectors({
    setFormData,
    editingItem,
    rolePages,
    roleApis,
    roleElements,
    publicPages,
    publicApis,
  })

  // 删除对话框管理
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

  // 格式化时间
  const formatTime = (time: string) => {
    return new Date(time).toLocaleString('zh-CN')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Shield}
        title="用户权限管理"
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

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 数据表格 */}
      <DataTable
        columns={[
          {
            key: 'id',
            header: 'ID',
            render: item => <span className="text-muted-foreground">{item.id}</span>,
          },
          {
            key: 'name',
            header: '名称',
            render: item => <span className="font-medium">{item.name}</span>,
          },
          {
            key: 'description',
            header: '描述',
            render: item => item.description,
          },
          {
            key: 'level',
            header: '等级',
            render: item => item.level,
          },
          {
            key: 'accessiblePages',
            header: '可访问页面',
            render: item =>
              item.accessiblePages && item.accessiblePages.length > 0
                ? `${item.accessiblePages.length} 个`
                : '-',
          },
          {
            key: 'accessibleApis',
            header: '可访问接口',
            render: item =>
              item.accessibleApis && item.accessibleApis.length > 0
                ? `${item.accessibleApis.length} 个`
                : '-',
          },
          {
            key: 'accessibleElements',
            header: '可访问元素',
            render: item =>
              item.accessibleElements && item.accessibleElements.length > 0
                ? `${item.accessibleElements.length} 个`
                : '-',
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

      {/* 新增/编辑对话框 */}
      <RoleFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editing={!!editingItem}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        loading={dialogLoading}
        submitting={submitting}
        rolePages={rolePages}
        publicPages={publicPages}
        pagesLoading={rolePagesLoading}
        onTogglePage={togglePageUrl}
        onToggleAllPages={toggleAllPages}
        roleApis={roleApis}
        publicApis={publicApis}
        apisLoading={roleApisLoading}
        onToggleApi={toggleApiUrl}
        onToggleMethod={toggleApiMethod}
        onToggleAllApis={toggleAllApis}
        onCrudOperationChange={toggleAllCrudOperation}
        roleElements={roleElements}
        elementsLoading={roleElementsLoading}
        onToggleElement={toggleElementKey}
        onToggleAllElements={toggleAllElements}
      />

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={handleOpenChange}
        title="确认删除"
        description="确定要删除这条角色记录吗？此操作无法撤销。"
        deleting={deleting}
        onConfirm={confirmDelete}
        onCancel={handleCancel}
      />
    </div>
  )
}
