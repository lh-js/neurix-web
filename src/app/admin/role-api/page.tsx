'use client'

import { useRoleApi } from '@/hooks/admin/role-api/use-role-api'
import { useRoleApiForm } from '@/hooks/admin/role-api/use-role-api-form'
import { useDeleteDialog } from '@/hooks/common/use-delete-dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Plus, Pencil, Trash2, Search, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { DataTable, type DataTableColumn } from '@/components/common/data-table'
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { RoleApiFormDialog } from './components/role-api-form-dialog'
import { SyncDialog } from './components/sync-dialog'
import { BooleanFilter } from '@/components/common/boolean-filter'
import { useRoleApiSync } from '@/hooks/admin/role-api/use-role-api-sync'
import {
  CreatePermissionButton,
  EditPermissionButton,
  DeletePermissionButton,
} from '@/components/common/permission-button'
import { useAuth } from '@/hooks/common/use-auth'
import type { RoleApi } from '@/service/types/role-api'
import { useState, useEffect } from 'react'

export default function RoleApiPage() {
  const { accessibleElements, pagesLoading } = useAuth()
  const canEditElements = accessibleElements?.includes('admin-edit-button') ?? false
  const canDeleteElements = accessibleElements?.includes('admin-delete-button') ?? false
  const showActionColumn = pagesLoading || canEditElements || canDeleteElements

  const columns: DataTableColumn<RoleApi>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (item: RoleApi) => <span className="text-muted-foreground">{item.id}</span>,
    },
    {
      key: 'url',
      header: 'URL',
      render: (item: RoleApi) => <span className="font-medium">{item.url}</span>,
    },
    {
      key: 'description',
      header: '描述',
      render: (item: RoleApi) => item.description,
    },
    {
      key: 'methods',
      header: 'HTTP 方法',
      render: (item: RoleApi) => (
        <div className="flex flex-wrap gap-1">
          {item.methods && item.methods.length > 0 ? (
            item.methods.map((method: string) => (
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
      render: (item: RoleApi) => (
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
      render: (item: RoleApi) => (
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
      render: (item: RoleApi) => (
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
    availableRoutes,
    routesLoading,
    handleRouteSelect,
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

  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false)
  const {
    syncing,
    checking,
    progress,
    currentItem,
    total,
    completed,
    syncDiff,
    checkDiff,
    sync,
    reset,
  } = useRoleApiSync()

  // 对话框打开时重置状态（仅在首次打开时重置，避免检查完成后重置）
  useEffect(() => {
    if (isSyncDialogOpen && !syncing && !checking && !syncDiff) {
      reset()
    }
  }, [isSyncDialogOpen, syncing, checking, syncDiff, reset])

  const handleCheck = async (defaultIsPublic: boolean, checkExisting: boolean) => {
    const diff = await checkDiff(defaultIsPublic, checkExisting)
    console.log('[RoleApiPage] 检查完成，syncDiff:', {
      toCreate: diff.toCreate.length,
      toUpdate: diff.toUpdate.length,
      toDelete: diff.toDelete.length,
      diff,
    })
  }

  const handleSync = async () => {
    if (!syncDiff) return
    await sync(syncDiff, () => {
      setIsSyncDialogOpen(false)
      fetchList() // 同步完成后刷新列表
    })
  }

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
            <Button
              onClick={() => setIsSyncDialogOpen(true)}
              variant="outline"
              disabled={loading || syncing}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              一键同步
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
        availableRoutes={availableRoutes}
        routesLoading={routesLoading}
        onRouteSelect={handleRouteSelect}
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

      <SyncDialog
        open={isSyncDialogOpen}
        onOpenChange={setIsSyncDialogOpen}
        onCheck={handleCheck}
        onConfirm={handleSync}
        checking={checking}
        syncing={syncing}
        progress={progress}
        currentItem={currentItem}
        total={total}
        completed={completed}
        syncDiff={
          syncDiff
            ? (() => {
                const converted = {
                  toCreate: syncDiff.toCreate.map(item => ({
                    url: item.url,
                    methods: item.methods,
                  })),
                  toUpdate: syncDiff.toUpdate.map(item => ({
                    url: item.api.url,
                    methods: item.newMethods,
                  })),
                  toDelete: syncDiff.toDelete.map(item => ({
                    url: item.url,
                    id: item.id,
                  })),
                }
                console.log('[RoleApiPage] 转换后的 syncDiff:', {
                  toCreate: converted.toCreate.length,
                  toUpdate: converted.toUpdate.length,
                  toDelete: converted.toDelete.length,
                  converted,
                })
                return converted
              })()
            : null
        }
      />
    </div>
  )
}
