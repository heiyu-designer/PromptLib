"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Menu, X, LayoutDashboard, FileText, Tag, Users, Activity, Settings, LogOut, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth, useIsAdmin } from "@/components/auth/auth-provider"
import { isCurrentUserAdmin, setDevAdmin } from "@/lib/simple-auth"

const NAVIGATION_ITEMS = [
  { label: "仪表盘", href: "/admin", icon: LayoutDashboard },
  { label: "提示词", href: "/admin/prompts", icon: FileText },
  { label: "标签", href: "/admin/tags", icon: Tag },
  { label: "日志", href: "/admin/logs", icon: Activity },
  { label: "用户", href: "/admin/users", icon: Users },
  { label: "设置", href: "/admin/settings", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSimpleAdmin, setIsSimpleAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  const isAdmin = useIsAdmin()

  useEffect(() => {
    // 客户端环境下检查简单登录状态
    let isAdminUser = isCurrentUserAdmin()

    // 开发环境下如果没有管理员权限，自动设置
    if (!isAdminUser && process.env.NODE_ENV === 'development') {
      setDevAdmin()
      isAdminUser = true
    }

    setIsSimpleAdmin(isAdminUser)
    setLoading(false)
  }, [])

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-600 blur-xl opacity-20 animate-pulse"></div>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600"></div>
          </div>
          <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">验证登录状态中...</p>
        </div>
      </div>
    )
  }

  // 如果不是管理员，显示访问受限页面
  if (!isAdmin && !isSimpleAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-8">
            <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
              <LayoutDashboard className="h-10 w-10 text-slate-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">访问受限</h1>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              您没有访问管理后台的权限，请联系管理员获取相应权限。
            </p>
          </div>
          <Link href="/">
            <Button className="rounded-full px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 transition-all duration-200 hover:scale-105">
              返回首页
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl transition-all duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-slate-200/60 dark:border-slate-800/60 px-6 bg-white/50 dark:bg-slate-800/50">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
            <span className="text-lg font-bold text-white">P</span>
          </div>
          <div>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">PromptLib</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">管理控制台</p>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-white" : ""}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto">
                    <ChevronRight className="h-4 w-4 text-white/80" />
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">管理面板</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">版本 1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl px-4 sm:px-6">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Breadcrumb */}
          <div className="flex flex-1 items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Link
              href="/admin"
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-200 font-medium"
            >
              管理后台
            </Link>
            {pathname !== "/admin" && (
              <>
                <ChevronRight className="h-4 w-4 text-slate-400" />
                <span className="text-slate-900 dark:text-slate-100 font-medium">
                  {NAVIGATION_ITEMS.find((item) => item.href === pathname)?.label || "页面"}
                </span>
              </>
            )}
          </div>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-auto gap-3 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 rounded-xl"
              >
                <Avatar className="h-9 w-9 border-2 border-slate-200 dark:border-slate-700">
                  <AvatarImage src={profile?.avatar_url || ""} alt={profile?.username || "用户"} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium">
                    {profile?.username?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {profile?.username || "管理员"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {profile?.role === 'admin' ? '系统管理员' : '用户'}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-slate-200 dark:border-slate-700 shadow-xl">
              <DropdownMenuLabel className="border-b border-slate-200 dark:border-slate-700 pb-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {profile?.username || "管理员"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user?.email}
                  </p>
                  <Badge
                    variant="outline"
                    className="w-fit mt-2 border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300"
                  >
                    {profile?.role === 'admin' ? '系统管理员' : '用户'}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200">
                <Link href="/" className="w-full flex items-center">
                  返回首页
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={signOut}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
              >
                <LogOut className="mr-2 h-4 w-4" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="p-6 sm:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
