import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { User, CreateUserRequest } from '@/service/types/user'
import { getAllRoles } from '@/service/api/role'
import { Role } from '@/service/types/role'

interface UseUserFormProps {
  fetchUserById: (id: number) => Promise<User>
  handleCreate: (data: CreateUserRequest) => Promise<void>
  handleUpdate: (id: number, data: Partial<CreateUserRequest>) => Promise<void>
}

export function useUserForm({
  fetchUserById,
  handleCreate,
  handleUpdate,
}: UseUserFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<User | null>(null)
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: '',
    nickname: '',
    password: '',
    role: 0,
  })
  const [dialogLoading, setDialogLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const fetchingRolesRef = useRef(false)

  const fetchRoles = async () => {
    if (fetchingRolesRef.current || roles.length > 0) {
      return
    }

    fetchingRolesRef.current = true
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

  useEffect(() => {
    fetchRoles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openCreateDialog = () => {
    setEditingItem(null)
    setFormData({
      email: '',
      nickname: '',
      password: '',
      role: 0,
    })
    setIsDialogOpen(true)
    fetchRoles()
  }

  const openEditDialog = async (item: User) => {
    setEditingItem(item)
    setDialogLoading(true)
    setIsDialogOpen(true)
    fetchRoles()

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
    if (submitting) return

    try {
      setSubmitting(true)
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
    } finally {
      setSubmitting(false)
    }
  }

  return {
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
  }
}

