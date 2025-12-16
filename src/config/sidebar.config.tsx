import { Home, User, Shield, Settings, FileText, Mail, Key, LogIn } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

/**
 * 菜单项类型
 */
export type MenuItemType = 'link' | 'group'

/**
 * 基础菜单项
 */
export interface BaseMenuItem {
  id: string
  label: string
  icon: LucideIcon
  href?: string
  defaultOpen?: boolean
}

/**
 * 链接菜单项
 */
export interface LinkMenuItem extends BaseMenuItem {
  type: 'link'
  href: string
}

/**
 * 分组菜单项（可折叠）
 */
export interface GroupMenuItem extends BaseMenuItem {
  type: 'group'
  children: LinkMenuItem[]
  // 用于判断分组是否激活（当子菜单项激活时，分组也显示为激活状态）
  activePaths?: string[]
}

/**
 * 菜单项
 */
export type MenuItem = LinkMenuItem | GroupMenuItem

/**
 * 侧边栏菜单配置
 */
export const sidebarMenuConfig: MenuItem[] = [
  {
    id: 'admin-home',
    type: 'link',
    label: '管理员首页',
    icon: Home,
    href: '/admin',
  },
  {
    id: 'permission-management',
    type: 'group',
    label: '用户权限管理',
    icon: Shield,
    defaultOpen: true,
    activePaths: [
      '/admin/user',
      '/admin/role',
      '/admin/role-page',
      '/admin/role-api',
      '/admin/role-element',
    ],
    children: [
      {
        id: 'user-management',
        type: 'link',
        label: '用户管理',
        icon: User,
        href: '/admin/user',
      },
      {
        id: 'role-management',
        type: 'link',
        label: '角色权限管理',
        icon: Shield,
        href: '/admin/role',
      },
      {
        id: 'role-page-management',
        type: 'link',
        label: '页面权限管理',
        icon: Shield,
        href: '/admin/role-page',
      },
      {
        id: 'role-api-management',
        type: 'link',
        label: '接口权限管理',
        icon: Shield,
        href: '/admin/role-api',
      },
      {
        id: 'role-element-management',
        type: 'link',
        label: '元素权限管理',
        icon: Shield,
        href: '/admin/role-element',
      },
    ],
  },
  {
    id: 'email-code-management',
    type: 'group',
    label: '验证码管理',
    icon: Key,
    defaultOpen: false,
    activePaths: ['/admin/email-code'],
    children: [
      {
        id: 'email-code-management-link',
        type: 'link',
        label: '验证码管理',
        icon: Key,
        href: '/admin/email-code',
      },
    ],
  },
  {
    id: 'system-management',
    type: 'group',
    label: '系统管理',
    icon: Settings,
    defaultOpen: false,
    activePaths: ['/admin/log', '/admin/email-record', '/admin/login-record'],
    children: [
      {
        id: 'log-management',
        type: 'link',
        label: '日志管理',
        icon: FileText,
        href: '/admin/log',
      },
      {
        id: 'email-record-management',
        type: 'link',
        label: '邮件管理',
        icon: Mail,
        href: '/admin/email-record',
      },
      {
        id: 'login-record-management',
        type: 'link',
        label: '登录记录',
        icon: LogIn,
        href: '/admin/login-record',
      },
    ],
  },
]
