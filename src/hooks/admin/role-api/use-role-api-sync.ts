import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { getAllRouterRecords } from '@/service/api/router'
import { getAllRoleApis, createRoleApi, updateRoleApi, deleteRoleApi } from '@/service/api/role-api'
import type { CreateRoleApiRequest, RoleApi } from '@/service/types/role-api'

export interface SyncDiff {
  toCreate: CreateRoleApiRequest[]
  toUpdate: Array<{ api: RoleApi; newMethods: string[] }>
  toDelete: RoleApi[]
}

export function useRoleApiSync() {
  const [syncing, setSyncing] = useState(false)
  const [checking, setChecking] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentItem, setCurrentItem] = useState<string | undefined>(undefined)
  const [total, setTotal] = useState(0)
  const [completed, setCompleted] = useState(0)
  const [syncDiff, setSyncDiff] = useState<SyncDiff | null>(null)

  // 重置状态
  const reset = useCallback(() => {
    setSyncing(false)
    setChecking(false)
    setProgress(0)
    setCurrentItem(undefined)
    setTotal(0)
    setCompleted(0)
    setSyncDiff(null)
  }, [])

  // 检查差异
  const checkDiff = useCallback(
    async (defaultIsPublic: boolean, checkExisting: boolean): Promise<SyncDiff> => {
      setChecking(true)
      try {
        // 获取所有路由和已存在的接口
        const [routes, existingApis] = await Promise.all([getAllRouterRecords(), getAllRoleApis()])

        // 调试：检查数据获取是否正常
        console.log('[检查差异] 数据获取完成:', {
          routesCount: routes.length,
          existingApisCount: existingApis.length,
          checkExisting,
        })

        if (!routes || routes.length === 0) {
          console.warn('[检查差异] 警告: 路由列表为空')
          toast.warning('路由列表为空，请检查后端接口')
        }

        if (!existingApis || existingApis.length === 0) {
          console.log('[检查差异] 提示: 数据库中暂无接口记录')
        }

        // 构建路由映射（url -> methods），合并相同 URL 的不同 methods
        const routeMethodsMap = new Map<string, string[]>()
        routes.forEach(route => {
          const routeMethods = route.methods || []
          if (routeMethods.length > 0) {
            const existing = routeMethodsMap.get(route.url)
            if (existing) {
              // 合并 methods
              routeMethodsMap.set(route.url, [...new Set([...existing, ...routeMethods])])
            } else {
              routeMethodsMap.set(route.url, [...routeMethods])
            }
          }
        })

        // 检查并处理重复的URL：直接删除后面的，保留第一个
        const toDelete: RoleApi[] = []

        // 按URL分组
        const urlGroups = new Map<string, RoleApi[]>()
        existingApis.forEach(api => {
          const group = urlGroups.get(api.url) || []
          group.push(api)
          urlGroups.set(api.url, group)
        })

        // 找出重复的URL，直接删除后面的
        urlGroups.forEach(apis => {
          if (apis.length > 1) {
            // 有重复，保留第一个，删除后面的
            const duplicates = apis.slice(1)
            toDelete.push(...duplicates)
          }
        })

        // 构建已存在接口映射（url -> api），使用去重后的第一个（不在删除列表中的）
        const existingApiMap = new Map<string, RoleApi>()
        const deleteIds = new Set(toDelete.map(d => d.id))
        existingApis.forEach(api => {
          // 如果这个接口不在删除列表中，且该URL还没有映射，就添加
          if (!deleteIds.has(api.id) && !existingApiMap.has(api.url)) {
            existingApiMap.set(api.url, api)
          }
        })

        // 找出需要更新和新增的接口
        const toUpdate: Array<{ api: RoleApi; newMethods: string[] }> = []
        const toCreate: CreateRoleApiRequest[] = []

        // 遍历路由，检查每个路由对应的接口
        routeMethodsMap.forEach((routeMethods, url) => {
          const existingApi = existingApiMap.get(url)

          if (existingApi) {
            // 接口已存在
            if (checkExisting) {
              // 检查 methods 是否一致（统一转换为大写并排序后比较）
              const apiMethods = (existingApi.methods || []).map(m => m.toUpperCase()).sort()
              const routeMethodsSorted = routeMethods.map(m => m.toUpperCase()).sort()

              // 转换为 Set 进行比较
              const apiMethodsSet = new Set(apiMethods)
              const routeMethodsSet = new Set(routeMethodsSorted)

              const methodsMatch =
                apiMethodsSet.size === routeMethodsSet.size &&
                [...apiMethodsSet].every(m => routeMethodsSet.has(m))

              if (!methodsMatch) {
                // methods 不一致，需要更新
                console.log(`[检查差异] 发现需要更新的接口: ${url}`)
                console.log(`  数据库中的 methods:`, existingApi.methods)
                console.log(`  路由中的 methods:`, routeMethods)
                toUpdate.push({
                  api: existingApi,
                  newMethods: routeMethods,
                })
              }
            }
            // 如果 checkExisting 为 false，已存在的接口不做任何处理
          } else {
            // 接口不存在，需要创建
            console.log(`[检查差异] 发现需要创建的接口: ${url}`, routeMethods)
            toCreate.push({
              url,
              description: '', // 默认空描述
              methods: routeMethods,
              isPublic: defaultIsPublic,
            })
          }
        })

        // 调试信息
        console.log('[检查差异] 检查结果:', {
          routesCount: routes.length,
          existingApisCount: existingApis.length,
          routeMethodsMapSize: routeMethodsMap.size,
          toCreateCount: toCreate.length,
          toUpdateCount: toUpdate.length,
          toDeleteCount: toDelete.length,
          checkExisting,
        })

        // 详细调试：显示所有路由 URL 和数据库接口 URL
        console.log('[检查差异] 所有路由 URL:', Array.from(routeMethodsMap.keys()))
        console.log('[检查差异] 所有数据库接口 URL:', Array.from(existingApiMap.keys()))

        // 检查是否有 URL 匹配问题
        const routeUrls = new Set(Array.from(routeMethodsMap.keys()))
        const dbUrls = new Set(Array.from(existingApiMap.keys()))
        const missingInDb = Array.from(routeUrls).filter(url => !dbUrls.has(url))
        const extraInDb = Array.from(dbUrls).filter(url => !routeUrls.has(url))

        if (missingInDb.length > 0) {
          console.log('[检查差异] 路由中存在但数据库中不存在的 URL:', missingInDb)
        }
        if (extraInDb.length > 0) {
          console.log('[检查差异] 数据库中存在但路由中不存在的 URL:', extraInDb)
        }

        const diff: SyncDiff = {
          toCreate,
          toUpdate,
          toDelete,
        }

        setSyncDiff(diff)
        return diff
      } catch (err) {
        console.error('[检查差异] 检查失败:', err)
        toast.error('检查差异失败：' + (err instanceof Error ? err.message : '未知错误'))
        // 返回空的差异结果
        const emptyDiff: SyncDiff = {
          toCreate: [],
          toUpdate: [],
          toDelete: [],
        }
        setSyncDiff(emptyDiff)
        return emptyDiff
      } finally {
        setChecking(false)
      }
    },
    []
  )

  // 执行同步
  const sync = useCallback(async (diff: SyncDiff, onComplete?: () => void) => {
    try {
      setSyncing(true)
      setProgress(0)
      setCompleted(0)
      setCurrentItem(undefined)

      const { toCreate, toUpdate, toDelete } = diff
      const totalOperations = toCreate.length + toUpdate.length + toDelete.length
      setTotal(totalOperations)

      if (totalOperations === 0) {
        toast.success('所有接口已存在且与路由一致，无需同步')
        setSyncing(false)
        if (onComplete) onComplete()
        return
      }

      // 执行同步操作
      let successCount = 0
      let failCount = 0
      let createCount = 0
      let updateCount = 0
      let deleteCount = 0

      let currentIndex = 0

      // 先删除重复的接口
      for (let i = 0; i < toDelete.length; i++) {
        const api = toDelete[i]
        setCurrentItem(`删除重复: ${api.url}`)
        setCompleted(currentIndex)
        setProgress((currentIndex / totalOperations) * 100)

        try {
          await deleteRoleApi(api.id)
          successCount++
          deleteCount++
        } catch (err) {
          console.error(`删除重复接口失败: ${api.url}`, err)
          failCount++
        }
        currentIndex++
      }

      // 再更新已存在的接口（避免后续重复处理）
      for (let i = 0; i < toUpdate.length; i++) {
        const { api, newMethods } = toUpdate[i]
        setCurrentItem(`更新: ${api.url}`)
        setCompleted(currentIndex)
        setProgress((currentIndex / totalOperations) * 100)

        try {
          await updateRoleApi(api.id, {
            methods: newMethods,
          })
          successCount++
          updateCount++
        } catch (err) {
          console.error(`更新接口失败: ${api.url}`, err)
          failCount++
        }
        currentIndex++
      }

      // 最后创建新接口
      for (let i = 0; i < toCreate.length; i++) {
        const item = toCreate[i]
        setCurrentItem(`新增: ${item.url}`)
        setCompleted(currentIndex)
        setProgress((currentIndex / totalOperations) * 100)

        try {
          await createRoleApi(item)
          successCount++
          createCount++
        } catch (err) {
          console.error(`创建接口失败: ${item.url}`, err)
          failCount++
        }
        currentIndex++
      }

      // 完成
      setCompleted(totalOperations)
      setProgress(100)
      setCurrentItem(undefined)

      // 生成提示信息
      const messages: string[] = []
      if (deleteCount > 0) {
        messages.push(`删除重复 ${deleteCount} 个`)
      }
      if (updateCount > 0) {
        messages.push(`更新 ${updateCount} 个`)
      }
      if (createCount > 0) {
        messages.push(`新增 ${createCount} 个`)
      }

      if (failCount === 0) {
        toast.success(`同步完成！${messages.join('，')}接口`)
      } else {
        toast.warning(
          `同步完成！成功 ${successCount} 个（${messages.join('，')}），失败 ${failCount} 个`
        )
      }

      if (onComplete) onComplete()
    } catch (err) {
      console.error('同步失败:', err)
      toast.error('同步失败：' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setSyncing(false)
    }
  }, [])

  return {
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
  }
}
