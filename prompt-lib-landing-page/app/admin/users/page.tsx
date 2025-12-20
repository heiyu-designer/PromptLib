"use client"

import { useState, useEffect } from "react"
import { Search, Shield, Ban, Mail, Calendar, User as UserIcon, Plus, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getUsers, banUser, unbanUser, createUser, resetPassword } from "@/lib/supabase"
import type { Database } from "@/lib/database"

type Profile = Database['public']['Tables']['profiles']['Row']

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false)
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "user",
    password: ""
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await getUsers()

      if (error) {
        setError(`加载用户失败: ${error.message}`)
      } else {
        setUsers(data || [])
      }
    } catch (err: any) {
      setError(`加载用户失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleBanUser = async (userId: string, username: string) => {
    if (!confirm(`确定要封禁用户"${username}"吗？`)) return

    try {
      setError(null)
      const { error } = await banUser(userId)
      if (error) {
        setError(`封禁失败: ${error.message}`)
      } else {
        await loadUsers()
        alert(`用户 "${username}" 已成功封禁！`)
      }
    } catch (err: any) {
      setError(`封禁失败: ${err.message}`)
    }
  }

  const handleUnbanUser = async (userId: string, username: string) => {
    if (!confirm(`确定要解封用户"${username}"吗？`)) return

    try {
      setError(null)
      const { error } = await unbanUser(userId)
      if (error) {
        setError(`解封失败: ${error.message}`)
      } else {
        await loadUsers()
        alert(`用户 "${username}" 已成功解封！`)
      }
    } catch (err: any) {
      setError(`解封失败: ${err.message}`)
    }
  }

  const handleAddUser = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      setError("请填写完整的用户信息")
      return
    }

    try {
      setError(null)
      const { error } = await createUser({
        username: formData.username,
        email: formData.email,
        role: formData.role,
        password: formData.password
      })

      if (error) {
        setError(`添加用户失败: ${error.message}`)
      } else {
        setAddUserDialogOpen(false)
        const newUsername = formData.username
        setFormData({ username: "", email: "", role: "user", password: "" })
        await loadUsers()
        alert(`用户 "${newUsername}" 已成功创建！`)
      }
    } catch (err: any) {
      setError(`添加用户失败: ${err.message}`)
    }
  }

  const handleResetPassword = async () => {
    if (!selectedUser || !formData.password) {
      setError("请输入新密码")
      return
    }

    try {
      setError(null)
      console.log('开始重置密码，用户:', selectedUser.username, 'ID:', selectedUser.id)

      const { data, error } = await resetPassword(selectedUser.id, formData.password)

      console.log('重置密码结果:', { data, error })

      if (error) {
        console.error('重置密码失败:', error)
        setError(`重置密码失败: ${error.message}`)
      } else {
        console.log('重置密码成功:', data)
        setResetPasswordDialogOpen(false)
        setSelectedUser(null)
        setFormData(prev => ({ ...prev, password: "" }))
        // 显示成功消息
        alert(data?.message || "密码重置成功")
      }
    } catch (err: any) {
      console.error('重置密码异常:', err)
      setError(`重置密码失败: ${err.message}`)
    }
  }

  const openResetPasswordDialog = (user: Profile) => {
    setSelectedUser(user)
    setResetPasswordDialogOpen(true)
    setFormData(prev => ({ ...prev, password: "" }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">用户管理</h1>
        </div>
        <div className="text-center py-12">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">用户管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">管理系统中的所有用户账户。</p>
        </div>
        <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              添加用户
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>添加新用户</DialogTitle>
              <DialogDescription>
                创建一个新的用户账户。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  placeholder="输入用户名"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="输入邮箱地址"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">角色</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择角色" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">普通用户</SelectItem>
                    <SelectItem value="admin">管理员</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="输入密码"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddUserDialogOpen(false)}>
                取消
              </Button>
              <Button type="button" onClick={handleAddUser}>
                创建用户
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium">总用户数</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">{users.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <h3 className="text-sm font-medium">管理员</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {users.filter(user => user.role === 'admin').length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-green-500" />
            <h3 className="text-sm font-medium">普通用户</h3>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {users.filter(user => user.role === 'user').length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-500" />
            <h3 className="text-sm font-medium">已封禁</h3>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {users.filter(user => user.status === 'banned').length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="搜索用户名..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>用户名</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>注册时间</TableHead>
              <TableHead className="w-[120px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  #{user.id.slice(0, 8)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {user.username?.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{user.username || '未知用户'}</div>
                      {user.avatar_url && (
                        <div className="text-xs text-muted-foreground">
                          有头像
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' ? '管理员' : '用户'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.status === 'active' ? 'default' : 'destructive'}
                  >
                    {user.status === 'active' ? '正常' : '已封禁'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openResetPasswordDialog(user)}
                    >
                      <Key className="h-4 w-4 mr-1" />
                      重置密码
                    </Button>
                    {user.status === 'active' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBanUser(user.id, user.username || '未知用户')}
                        disabled={user.role === 'admin'}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnbanUser(user.id, user.username || '未知用户')}
                      >
                        解封
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <UserIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchQuery ? "未找到匹配的用户。" : "还没有用户注册。"}
          </p>
        </div>
      )}

      {/* 重置密码对话框 */}
      <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>重置用户密码</DialogTitle>
            <DialogDescription>
              为用户 "{selectedUser?.username}" 设置新密码。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">新密码</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="输入新密码"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setResetPasswordDialogOpen(false)}>
              取消
            </Button>
            <Button type="button" onClick={handleResetPassword}>
              重置密码
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}