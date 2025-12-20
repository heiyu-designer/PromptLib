"use client"

import { useState, useEffect } from "react"
import { Search, Trash2, Download, Eye, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database"

type CopyEvent = Database['public']['Tables']['copy_events']['Row'] & {
  prompt?: {
    title: string
    slug: string
  }
  profile?: {
    username: string
  }
}

export default function LogsPage() {
  const [logs, setLogs] = useState<CopyEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [promptFilter, setPromptFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")
  const [error, setError] = useState<string | null>(null)
  const [prompts, setPrompts] = useState<Array<{ id: number; title: string }>>([])
  const [users, setUsers] = useState<Array<{ id: string; username: string }>>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 获取copy events数据
      let query = supabase
        .from('copy_events')
        .select(`
          *,
          prompt:prompts(title, slug),
          profile:profiles(username)
        `)
        .order('created_at', { ascending: false })
        .limit(1000) // 限制获取最近的1000条记录

      const { data, error: fetchError } = await query

      if (fetchError) {
        setError(`加载日志失败: ${fetchError.message}`)
      } else {
        setLogs(data || [])

        // 提取唯一的提示词和用户用于筛选
        const uniquePrompts = Array.from(
          new Map(
            (data || []).map(log => log.prompt ? [log.prompt.id, {
              id: log.prompt.id,
              title: log.prompt.title
            }] : [])
          ).values()
        )
        setPrompts(uniquePrompts)

        const uniqueUsers = Array.from(
          new Map(
            (data || []).map(log => log.profile ? [log.profile.id, {
              id: log.profile.id,
              username: log.profile.username
            }] : [])
          ).values()
        )
        setUsers(uniqueUsers)
      }
    } catch (err: any) {
      setError(`加载数据失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.prompt?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_agent?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDate = (() => {
      if (dateFilter === "all") return true
      const logDate = new Date(log.created_at)
      const now = new Date()

      switch (dateFilter) {
        case "today":
          return logDate.toDateString() === now.toDateString()
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return logDate >= weekAgo
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return logDate >= monthAgo
        default:
          return true
      }
    })()

    const matchesPrompt = promptFilter === "all" || log.prompt_id === Number(promptFilter)
    const matchesUser = userFilter === "all" || log.user_id === userFilter

    return matchesSearch && matchesDate && matchesPrompt && matchesUser
  })

  const handleClearLogs = async () => {
    if (!confirm("确定要清空所有日志吗？此操作不可恢复。")) return

    try {
      setError(null)
      const { error } = await supabase
        .from('copy_events')
        .delete()
        .gte('created_at', '1970-01-01') // 删除所有记录

      if (error) {
        setError(`清空日志失败: ${error.message}`)
      } else {
        await loadData()
        alert("所有日志已成功清空！")
      }
    } catch (err: any) {
      setError(`清空日志失败: ${err.message}`)
    }
  }

  const handleExportLogs = () => {
    const csvContent = [
      ['ID', '提示词', '用户', 'IP地址', 'User Agent', '复制时间'].join(','),
      ...filteredLogs.map(log => [
        log.id,
        log.prompt?.title || 'Unknown',
        log.profile?.username || 'Anonymous',
        log.ip_address || '',
        log.user_agent || '',
        new Date(log.created_at).toLocaleString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `copy-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    alert(`已成功导出 ${filteredLogs.length} 条日志记录！`)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">日志管理</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">日志管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">查看和管理提示词复制日志。</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportLogs}>
            <Download className="h-4 w-4 mr-2" />
            导出日志
          </Button>
          <Button variant="destructive" onClick={handleClearLogs}>
            <Trash2 className="h-4 w-4 mr-2" />
            清空日志
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">总复制次数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">今日复制</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter(log => {
                const logDate = new Date(log.created_at)
                const today = new Date()
                return logDate.toDateString() === today.toDateString()
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">本周复制</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter(log => {
                const logDate = new Date(log.created_at)
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                return logDate >= weekAgo
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">唯一用户</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(logs.map(log => log.user_id).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索提示词、IP地址..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="日期筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部时间</SelectItem>
              <SelectItem value="today">今天</SelectItem>
              <SelectItem value="week">本周</SelectItem>
              <SelectItem value="month">本月</SelectItem>
            </SelectContent>
          </Select>
          <Select value={promptFilter} onValueChange={setPromptFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="筛选提示词" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部提示词</SelectItem>
              {prompts.map(prompt => (
                <SelectItem key={prompt.id} value={prompt.id.toString()}>
                  {prompt.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="筛选用户" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部用户</SelectItem>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          显示 {filteredLogs.length} 条记录
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>提示词</TableHead>
              <TableHead className="w-[120px]">用户</TableHead>
              <TableHead className="w-[150px]">IP地址</TableHead>
              <TableHead className="w-[180px]">浏览器</TableHead>
              <TableHead className="w-[160px]">复制时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">#{log.id}</TableCell>
                <TableCell className="font-medium">
                  {log.prompt ? (
                    <a
                      href={`/prompts/${log.prompt.slug}`}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {log.prompt.title}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Unknown Prompt</span>
                  )}
                </TableCell>
                <TableCell>
                  {log.profile ? (
                    <Badge variant="outline">{log.profile.username}</Badge>
                  ) : (
                    <Badge variant="secondary">Anonymous</Badge>
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {log.ip_address || 'N/A'}
                </TableCell>
                <TableCell className="max-w-[180px] truncate text-sm">
                  {log.user_agent || 'N/A'}
                </TableCell>
                <TableCell className="text-sm">
                  {new Date(log.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredLogs.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchQuery || dateFilter !== "all" || promptFilter !== "all" || userFilter !== "all"
              ? "没有找到匹配的日志记录。"
              : "还没有日志记录。"}
          </p>
        </div>
      )}
    </div>
  )
}