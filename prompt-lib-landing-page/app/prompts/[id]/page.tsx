"use client"

import { useState, useEffect } from "react"
import { ChevronRight, Copy, Check, Github, Eye, ArrowLeft, Sparkles, BookOpen, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import type { Database } from "@/lib/database"
import PromptCopyButton from "@/components/prompt/copy-button"
import { useAuth } from "@/components/auth/auth-provider"
import UserMenu from "@/components/auth/user-menu"
import { getCurrentUser } from "@/lib/simple-auth"
import ContentRenderer from "@/lib/content-renderer"

type Prompt = Database['public']['Tables']['prompts']['Row'] & {
  tags?: Array<{ id: number; name: string; slug: string; color: string }>
  profiles?: { username: string | null; role: string | null }
}

export default function PromptDetailPage() {
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (params.id) {
      loadPrompt(params.id as string)
    }
  }, [params.id])

  const loadPrompt = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const promptId = parseInt(id)
      if (isNaN(promptId)) {
        setError('无效的提示词ID')
        return
      }

      const response = await fetch(`/api/prompts/${promptId}`)
      const result = await response.json()

      if (result.error || !result.data) {
        console.error('获取提示词失败:', result.error)
        setError(result.error || '提示词不存在或未公开')
        return
      }

      const promptData = result.data
      const transformedPrompt: Prompt = {
        ...promptData,
        tags: promptData.tags || [],
        profiles: promptData.profiles || undefined
      }

      setPrompt(transformedPrompt)

    } catch (err) {
      console.error('获取提示词详情失败:', err)
      setError('加载提示词详情失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
            <Sparkles className="animate-pulse h-6 w-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-600 font-medium">正在加载提示词详情...</p>
          <p className="text-slate-400 text-sm mt-1">即将为您呈现精彩内容</p>
        </div>
      </div>
    )
  }

  if (error || !prompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-8xl mb-6">🔍</div>
          <h1 className="text-3xl font-bold text-slate-800 mb-3">提示词未找到</h1>
          <p className="text-slate-500 mb-8">{error || '您请求的提示词不存在或已下架'}</p>
          <Button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回首页探索更多
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-200/20 to-indigo-200/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/50 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
                <span className="text-lg font-bold text-white">P</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">PromptLib</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="hover:bg-indigo-50">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
            </Button>
            {user || getCurrentUser() ? (
              <UserMenu />
            ) : (
              <Button variant="ghost" asChild className="hover:bg-indigo-50 hover:text-indigo-600">
                <Link href="/login">登录</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 relative">
        {/* Breadcrumb */}
        <nav aria-label="面包屑导航" className="mb-8">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-slate-500 hover:text-indigo-600 transition-colors">
                首页
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-slate-300" />
            <li>
              <Link href="/" className="text-slate-500 hover:text-indigo-600 transition-colors">
                提示词库
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-slate-300" />
            <li className="line-clamp-1 text-indigo-600 font-medium">{prompt.title}</li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main Content Area */}
          <div className="min-w-0">
            {/* Hero Header Card */}
            <Card className="mb-6 border-0 shadow-xl shadow-indigo-500/5 overflow-hidden bg-gradient-to-br from-white to-indigo-50/50">
              <CardContent className="p-6 sm:p-8">
                {/* Tags */}
                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {prompt.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        className="px-3 py-1 text-sm font-medium"
                        style={{
                          backgroundColor: `${tag.color}15`,
                          color: tag.color,
                          borderColor: `${tag.color}30`
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent mb-4 leading-tight">
                  {prompt.title}
                </h1>

                {/* Description */}
                {prompt.description && (
                  <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                    {prompt.description}
                  </p>
                )}

                {/* Stats Bar */}
                <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="p-2 rounded-lg bg-indigo-50">
                      <Eye className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span className="font-medium">{prompt.view_count || 0}</span>
                    <span className="text-slate-400">次浏览</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="p-2 rounded-lg bg-purple-50">
                      <Copy className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="font-medium">{prompt.copy_count || 0}</span>
                    <span className="text-slate-400">次复制</span>
                  </div>
                  {prompt.created_at && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="p-2 rounded-lg bg-emerald-50">
                        <Clock className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span>{new Date(prompt.created_at).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}</span>
                    </div>
                  )}
                </div>

                {/* Author Info */}
                {prompt.profiles?.username && (
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                    <Avatar className="h-10 w-10 border-2 border-indigo-100">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">
                        {prompt.profiles.username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-800">{prompt.profiles.username}</p>
                      <p className="text-sm text-slate-400">
                        {prompt.profiles.role === 'admin' ? '管理员' : '用户'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Desktop Copy Button */}
            <div className="hidden sm:block mb-6">
              <PromptCopyButton
                content={prompt.content}
                promptId={prompt.id}
                className="w-full"
                size="lg"
              />
            </div>

            {/* Content Body */}
            <Card className="border-0 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 px-6 py-3">
                <div className="flex items-center gap-2 text-white">
                  <BookOpen className="h-5 w-5" />
                  <span className="font-semibold">提示词内容</span>
                  <Sparkles className="h-4 w-4 ml-auto animate-pulse" />
                </div>
              </div>
              <CardContent className="p-6 sm:p-8 bg-white">
                <div className="prose prose-slate max-w-none">
                  <ContentRenderer content={prompt.content} />
                </div>
              </CardContent>
            </Card>

            {/* CTA Card */}
            <Card className="mt-8 border-0 shadow-xl overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-600">
              <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
                <div className="text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start text-white/90 mb-1">
                    <Sparkles className="h-5 w-5" />
                    <span className="text-sm font-medium">升级体验</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    想要获得此提示词的自动化 Coze 工作流？
                  </h3>
                  <p className="text-white/70 mt-1">通过微信即刻获取，更高效的 AI 体验</p>
                </div>
                <Button size="lg" className="shrink-0 bg-white text-indigo-600 hover:bg-white/90 shadow-lg font-semibold">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.006-.27-.02-.406-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.969-.982z"/>
                  </svg>
                  微信获取
                </Button>
              </CardContent>
            </Card>

            {/* Mobile Sidebar */}
            <div className="mt-8 space-y-6 lg:hidden">
              <SidebarContent prompt={prompt} />
            </div>
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <SidebarContent prompt={prompt} />
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/50 bg-white/95 backdrop-blur-xl p-4 sm:hidden">
        <PromptCopyButton
          content={prompt.content}
          promptId={prompt.id}
          className="w-full"
          size="lg"
        />
      </div>

      <div className="h-24 sm:hidden" />
    </div>
  )
}

function SidebarContent({ prompt }: { prompt: Prompt }) {
  return (
    <Card className="border-0 shadow-xl shadow-slate-200/50 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          关于此提示词
        </h3>
      </div>
      <CardContent className="p-6 space-y-6 bg-white">
        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
              <div className="p-1.5 rounded-lg bg-indigo-50">
                <svg className="h-3.5 w-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <span className="font-medium">标签</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {prompt.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  className="px-3 py-1.5 text-sm font-medium"
                  style={{
                    backgroundColor: `${tag.color}15`,
                    color: tag.color,
                    borderColor: `${tag.color}30`
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <div className="p-1.5 rounded-lg bg-purple-50">
              <svg className="h-3.5 w-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-medium">数据统计</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-indigo-500" />
                <span className="text-xs text-indigo-600 font-medium">浏览</span>
              </div>
              <p className="text-xl font-bold text-indigo-700 mt-1">{prompt.view_count || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-100">
              <div className="flex items-center gap-2">
                <Copy className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-purple-600 font-medium">复制</span>
              </div>
              <p className="text-xl font-bold text-purple-700 mt-1">{prompt.copy_count || 0}</p>
            </div>
          </div>
        </div>

        {/* Time */}
        {prompt.created_at && (
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
              <div className="p-1.5 rounded-lg bg-emerald-50">
                <Clock className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <span className="font-medium">创建时间</span>
            </div>
            <p className="text-slate-700 font-medium">
              {new Date(prompt.created_at).toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}

        {/* Author */}
        {prompt.profiles?.username && (
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
              <div className="p-1.5 rounded-lg bg-amber-50">
                <Users className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <span className="font-medium">作者</span>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-slate-100">
                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-sm">
                  {prompt.profiles.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-slate-800">{prompt.profiles.username}</p>
                <p className="text-xs text-slate-400">
                  {prompt.profiles.role === 'admin' ? '管理员' : '用户'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
