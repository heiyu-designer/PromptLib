"use client"

import { useState, useEffect } from "react"
import { ChevronRight, Copy, Check, Github, Eye, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { supabaseAdmin } from "@/lib/supabase"
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

      // 获取提示词详情，包含标签和作者信息
      const { data: promptData, error: fetchError } = await supabaseAdmin
        .from('prompts')
        .select(`
          *,
          prompt_tags(
            tags(id, name, slug, color)
          ),
          profiles(
            username,
            role
          )
        `)
        .eq('id', promptId)
        .eq('is_public', true)
        .single()

      if (fetchError || !promptData) {
        console.error('获取提示词失败:', fetchError)
        setError('提示词不存在或未公开')
        return
      }

      // 转换数据格式
      const transformedPrompt: Prompt = {
        ...promptData,
        tags: promptData.prompt_tags?.map(pt => pt.tags).filter(Boolean) || [],
        profiles: promptData.profiles || undefined
      }

      setPrompt(transformedPrompt)

      // 增加浏览次数
      try {
        const { data: currentPrompt } = await supabaseAdmin
          .from('prompts')
          .select('view_count')
          .eq('id', promptId)
          .single()

        if (currentPrompt) {
          await supabaseAdmin
            .from('prompts')
            .update({
              view_count: (currentPrompt.view_count || 0) + 1
            })
            .eq('id', promptId)
        }
      } catch (viewError) {
        console.error('更新浏览次数失败:', viewError)
        // 不影响页面正常显示
      }

    } catch (err) {
      console.error('获取提示词详情失败:', err)
      setError('加载提示词详情失败')
    } finally {
      setLoading(false)
    }
  }


if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">正在加载提示词详情...</p>
        </div>
      </div>
    )
  }

  if (error || !prompt) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2">提示词未找到</h1>
          <p className="text-muted-foreground mb-6">{error || '您请求的提示词不存在或未公开'}</p>
          <Button onClick={() => router.push('/')}>
            返回首页
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <span className="text-sm font-bold text-white">P</span>
              </div>
              <span className="text-xl font-semibold tracking-tight">PromptLib</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
            </Button>
            {user || getCurrentUser() ? (
              <UserMenu />
            ) : (
              <Button variant="ghost" asChild>
                <Link href="/login">登录</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <nav aria-label="面包屑导航" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="transition-colors hover:text-foreground">
                首页
              </Link>
            </li>
            <ChevronRight className="h-4 w-4" />
            <li>
              <Link href="/" className="transition-colors hover:text-foreground">
                提示词库
              </Link>
            </li>
            <ChevronRight className="h-4 w-4" />
            <li className="line-clamp-1 text-foreground">{prompt.title}</li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Main Content Area */}
          <div className="min-w-0">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1 space-y-3">
                <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{prompt.title}</h1>
                {prompt.description && (
                  <p className="text-lg text-muted-foreground">{prompt.description}</p>
                )}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>{prompt.view_count || 0} 次浏览</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Copy className="h-4 w-4" />
                    <span>{prompt.copy_count || 0} 次复制</span>
                  </div>
                  {prompt.profiles?.username && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          {prompt.profiles.username[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {prompt.profiles.username}
                        {prompt.profiles.role && ` (${prompt.profiles.role})`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Copy Button */}
              <div className="hidden sm:block">
                <PromptCopyButton
                  content={prompt.content}
                  promptId={prompt.id}
                  className="shrink-0"
                  size="lg"
                />
              </div>
            </div>

            {/* Content Body */}
            <Card>
              <CardContent className="p-6 sm:p-8">
                <div className="space-y-6">
                  <ContentRenderer content={prompt.content} />
                </div>
              </CardContent>
            </Card>

            <Card className="mt-8 border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/30">
              <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
                <div>
                  <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">
                    想要获得此提示词的自动化 Coze 工作流？
                  </h3>
                  <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-300">通过微信即刻获取</p>
                </div>
                <Button variant="default" size="lg" className="shrink-0 bg-indigo-600 hover:bg-indigo-700">
                  微信获取
                </Button>
              </CardContent>
            </Card>

            {/* Mobile Sidebar Content */}
            <div className="mt-8 space-y-6 lg:hidden">
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 font-semibold">关于此提示词</h3>
                  <div className="space-y-4">
                    {prompt.tags && prompt.tags.length > 0 && (
                      <div>
                        <p className="mb-2 text-sm text-muted-foreground">标签</p>
                        <div className="flex flex-wrap gap-2">
                          {prompt.tags.map((tag) => (
                            <Badge key={tag.id} variant="secondary">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="mb-2 text-sm text-muted-foreground">统计</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Eye className="h-3 w-3" />
                          <span>{prompt.view_count || 0} 次浏览</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Copy className="h-3 w-3" />
                          <span>{prompt.copy_count || 0} 次复制</span>
                        </div>
                      </div>
                    </div>
                    {prompt.created_at && (
                      <div>
                        <p className="mb-2 text-sm text-muted-foreground">创建时间</p>
                        <p className="text-sm">
                          {new Date(prompt.created_at).toLocaleDateString("zh-CN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 font-semibold">关于此提示词</h3>
                  <div className="space-y-4">
                    {prompt.tags && prompt.tags.length > 0 && (
                      <div>
                        <p className="mb-2 text-sm text-muted-foreground">标签</p>
                        <div className="flex flex-wrap gap-2">
                          {prompt.tags.map((tag) => (
                            <Badge key={tag.id} variant="secondary">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="mb-2 text-sm text-muted-foreground">统计</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Eye className="h-3 w-3" />
                          <span>{prompt.view_count || 0} 次浏览</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Copy className="h-3 w-3" />
                          <span>{prompt.copy_count || 0} 次复制</span>
                        </div>
                      </div>
                    </div>
                    {prompt.created_at && (
                      <div>
                        <p className="mb-2 text-sm text-muted-foreground">创建时间</p>
                        <p className="text-sm">
                          {new Date(prompt.created_at).toLocaleDateString("zh-CN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background p-4 sm:hidden">
        <PromptCopyButton
          content={prompt.content}
          promptId={prompt.id}
          className="w-full"
          size="lg"
        />
      </div>

      <div className="h-20 sm:hidden" />
    </div>
  )
}