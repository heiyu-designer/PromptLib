"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Tag, Users, Activity, Plus, TrendingUp, Eye } from "lucide-react"
import { getPrompts, getTags, getUsers, supabase } from "@/lib/supabase"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPrompts: 0,
    totalTags: 0,
    totalUsers: 0,
    totalCopies: 0,
    weeklyViews: 0,
    weeklyCopies: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // 并行获取所有数据
      const [promptsResult, tagsResult, usersResult, copiesResult] = await Promise.all([
        getPrompts(),
        getTags(),
        getUsers(),
        supabase.from('copy_events').select('*')
      ])

      // 计算统计数据
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const weeklyViews = (promptsResult.data || []).reduce((sum, prompt) => {
        const createdAt = new Date(prompt.created_at)
        return createdAt >= weekAgo ? sum + (prompt.view_count || 0) : sum
      }, 0)

      const weeklyCopies = (copiesResult.data || []).filter(copy => {
        const createdAt = new Date(copy.created_at)
        return createdAt >= weekAgo
      }).length

      setStats({
        totalPrompts: promptsResult.data?.length || 0,
        totalTags: tagsResult.data?.length || 0,
        totalUsers: usersResult.data?.length || 0,
        totalCopies: copiesResult.data?.length || 0,
        weeklyViews,
        weeklyCopies
      })

      // 获取最近活动
      const recentPrompts = (promptsResult.data || [])
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

      const recentCopies = (copiesResult.data || [])
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

      setRecentActivity([
        ...recentPrompts.map(prompt => ({
          type: 'prompt',
          title: prompt.title,
          timestamp: prompt.created_at,
          id: prompt.id
        })),
        ...recentCopies.map(copy => ({
          type: 'copy',
          title: `复制事件 #${copy.id}`,
          timestamp: copy.created_at,
          id: copy.id
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8))

    } catch (error) {
      console.error('加载仪表盘数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: "添加新提示词",
      description: "创建一个新的AI提示词",
      icon: Plus,
      href: "/admin/prompts",
      color: "text-blue-600"
    },
    {
      title: "管理标签",
      description: "组织和分类提示词",
      icon: Tag,
      href: "/admin/tags",
      color: "text-green-600"
    },
    {
      title: "查看日志",
      description: "分析用户行为和复制记录",
      icon: Activity,
      href: "/admin/logs",
      color: "text-orange-600"
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
          <p className="mt-1 text-sm text-muted-foreground">欢迎来到 PromptLib 管理后台。</p>
        </div>
        <div className="text-center py-12">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
        <p className="mt-1 text-sm text-muted-foreground">欢迎来到 PromptLib 管理后台。</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">提示词总数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrompts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">标签总数</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTags}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">用户总数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总复制次数</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCopies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本周浏览</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weeklyViews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本周复制</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weeklyCopies}</div>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>常用的管理操作</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link key={index} href={action.href}>
                  <div className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-accent transition-colors cursor-pointer">
                    <Icon className={`h-6 w-6 ${action.color}`} />
                    <div>
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-muted-foreground">{action.description}</div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </CardContent>
        </Card>

        {/* 最近活动 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
            <CardDescription>系统最近的操作记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">暂无活动记录</p>
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'prompt' ? 'bg-blue-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.type === 'prompt' ? '提示词' : '复制'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}