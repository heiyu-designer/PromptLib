'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, Github, Copy, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import UserMenu from '@/components/auth/user-menu'
import { useAuth } from '@/components/auth/auth-provider'
import { getPrompts, incrementViewCount } from '@/app/actions/prompts'
import { getTags } from '@/lib/supabase'
import { trackCopy, getSettings } from '@/app/actions/copy'
import { PromptWithRelations } from '@/lib/database'
import SimpleSearch from '@/components/search/simple-search'
import { getCurrentUser } from '@/lib/simple-auth'

export default function HomePage() {
  const [prompts, setPrompts] = useState<PromptWithRelations[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [selectedTag, setSelectedTag] = useState<number | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPrompts, setTotalPrompts] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const { user } = useAuth()

  const loadPrompts = useCallback(async (reset = false) => {
    try {
      setLoading(true)
      setError(null)

      const currentPage = reset ? 1 : page

      const result = await getPrompts({
        page: currentPage,
        limit: 12,
        tagId: selectedTag || undefined,
        search: searchQuery || undefined,
        sortBy: 'created_at',
        sortOrder: 'desc',
        isPublic: true
      })

      if (result.error) {
        // Check if error is related to database connection
        if (result.error.includes('supabase') || result.error.includes('connection') || result.error.includes('URL')) {
          // Use mock data when database is not configured
          const mockPrompts = [
            {
              id: 1,
              title: "代码审查助手",
              description: "帮助进行全面的代码审查，检查代码质量、性能和安全性问题。",
              content: "请审查以下代码，重点关注：\\n1. 代码质量和可读性\\n2. 性能优化机会\\n3. 潜在的安全漏洞\\n4. 最佳实践遵循情况\\n5. 测试覆盖率建议",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              view_count: 0,
              copy_count: 0,
              is_public: true,
              is_featured: true,
              cover_image_url: null,
              author_id: null,
              tags: [
                { id: 1, name: "编程", slug: "programming", color: "blue" },
                { id: 2, name: "代码审查", slug: "code-review", color: "green" }
              ]
            },
            {
              id: 2,
              title: "API文档生成器",
              description: "自动生成清晰的API文档，包括请求参数、响应格式和示例代码。",
              content: "为以下API生成详细的文档：\\n1. 接口描述和用途\\n2. 请求参数说明（类型、必需性、默认值）\\n3. 响应格式和状态码\\n4. 请求和响应示例\\n5. 错误处理说明",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              view_count: 0,
              copy_count: 0,
              is_public: true,
              is_featured: false,
              cover_image_url: null,
              author_id: null,
              tags: [
                { id: 1, name: "编程", slug: "programming", color: "blue" },
                { id: 3, name: "文档", slug: "documentation", color: "purple" }
              ]
            },
            {
              id: 3,
              title: "博客文章大纲",
              description: "为技术博客创建结构化的大纲，确保内容逻辑清晰、易于阅读。",
              content: "为以下主题创建博客文章大纲：\\n1. 吸引人的标题\\n2. 引言（问题背景）\\n3. 核心概念解释\\n4. 实践步骤和代码示例\\n5. 常见问题和解决方案\\n6. 总结和后续建议",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              view_count: 0,
              copy_count: 0,
              is_public: true,
              is_featured: true,
              cover_image_url: null,
              author_id: null,
              tags: [
                { id: 4, name: "写作", slug: "writing", color: "orange" },
                { id: 5, name: "博客", slug: "blog", color: "red" }
              ]
            }
          ]

          if (reset) {
            setPrompts(mockPrompts)
            setPage(1)
          } else {
            setPrompts(prev => [...prev, ...mockPrompts])
          }
          setTotalPrompts(3)
          setHasMore(false)
          return
        }
        setError(result.error)
        return
      }

      if (reset) {
        setPrompts(result.prompts)
        setPage(1)
      } else {
        setPrompts(prev => [...prev, ...result.prompts])
      }

      setTotalPrompts(result.total)
      setHasMore(result.currentPage < result.totalPages)
    } catch (err) {
      // If there's a network error, also use mock data
      const mockPrompts = [
        {
          id: 1,
          title: "代码审查助手",
          description: "帮助进行全面的代码审查，检查代码质量、性能和安全性问题。",
          content: "请审查以下代码，重点关注代码质量、性能优化、安全漏洞和最佳实践。",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          view_count: 0,
          copy_count: 0,
          is_public: true,
          is_featured: true,
          cover_image_url: null,
          author_id: null,
          tags: [
            { id: 1, name: "编程", slug: "programming", color: "blue" }
          ]
        }
      ]

      if (reset) {
        setPrompts(mockPrompts)
        setPage(1)
      } else {
        setPrompts(prev => [...prev, ...mockPrompts])
      }
      setTotalPrompts(1)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [selectedTag, searchQuery, page])

  const loadTags = async () => {
    try {
      const { data, error } = await getTags()
      if (error) {
        console.error('Failed to load tags:', error)
        // Use mock tags when database is not available
        const mockTags = [
          { id: 1, name: "编程", slug: "programming", color: "#3B82F6" },
          { id: 2, name: "代码审查", slug: "code-review", color: "#10B981" },
          { id: 3, name: "文档", slug: "documentation", color: "#8B5CF6" },
          { id: 4, name: "写作", slug: "writing", color: "#F59E0B" },
          { id: 5, name: "博客", slug: "blog", color: "#EF4444" }
        ]
        setTags(mockTags)
        return
      }
      setTags(data || [])
    } catch (err) {
      console.error('Failed to load tags:', err)
      // Use mock tags when there's a network error
      const mockTags = [
        { id: 1, name: "编程", slug: "programming", color: "#3B82F6" },
        { id: 2, name: "写作", slug: "writing", color: "#F59E0B" }
      ]
      setTags(mockTags)
    }
  }

  // 使用防抖来延迟搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      loadPrompts(true)
    }, 300) // 300ms 防抖延迟

    return () => clearTimeout(timer)
  }, [selectedTag, searchQuery])

  useEffect(() => {
    loadTags()
  }, [])

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
      loadPrompts(false)
    }
  }

  const handleTagFilter = (tagId: number) => {
    const newSelectedTag = selectedTag === tagId ? null : tagId
    setSelectedTag(newSelectedTag)
    // 立即重置页面并加载新的提示词
    setPage(1)
    setTimeout(() => loadPrompts(true), 0)
  }

  const handleCopy = async (promptId: number, content: string) => {
    // 检查用户是否已登录
    const simpleUser = getCurrentUser()
    const currentUser = simpleUser || user

    if (!currentUser) {
      // 未登录用户显示友好提示
      alert("🔒 请先登录后才能复制提示词哦～\n\n登录后即可解锁全部功能，享受完整的 AI 提示词库体验！")
      return
    }

    try {
      // Copy content to clipboard
      await navigator.clipboard.writeText(content)
      setCopiedId(promptId)

      // Track copy event
      await trackCopy({
        prompt_id: promptId,
        user_id: currentUser.id,
        user_agent: navigator.userAgent,
        referrer: document.referrer
      })

      // Show success message (optional - can be enhanced with toast)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = content
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedId(promptId)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const handlePromptClick = async (promptId: number) => {
    // Increment view count
    await incrementViewCount(promptId)
  }

  const filteredTags = tags.map(tag => ({
    ...tag,
    isActive: selectedTag === tag.id
  }))

  if (error && prompts.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <span className="text-sm font-bold text-white">P</span>
              </div>
              <span className="text-xl font-semibold tracking-tight">PromptLib</span>
            </div>
            <UserMenu />
          </div>
        </nav>

        <div className="flex items-center justify-center min-h-[50vh]">
          <Alert variant="destructive" className="max-w-md">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 dark:bg-slate-900/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
              <span className="text-sm font-bold text-white">P</span>
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">PromptLib</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
            </Button>
            <UserMenu />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="text-center">
          {/* 装饰性元素 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="h-72 w-72 rounded-full bg-gradient-to-r from-blue-400 to-purple-600 blur-3xl"></div>
            </div>
            <div className="relative">
              <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl">
                释放 AI 潜能，创作无限可能
              </h1>
            </div>
          </div>
          <p className="mt-8 text-pretty text-lg text-slate-600 dark:text-slate-300 sm:mt-10 sm:text-xl max-w-3xl mx-auto leading-relaxed">
            汇聚全球顶尖开发者智慧，提供高质量的编程、创意写作和效率提升提示词，让 AI 成为你的超级助手
          </p>

          {/* Search Component */}
          <div className="mx-auto mt-12 max-w-2xl sm:mt-14">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-25"></div>
              <div className="relative">
                <SimpleSearch
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSearch={(query) => setSearchQuery(query)}
                  placeholder="搜索提示词..."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tag Filter Section */}
      <section className="border-b border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide sm:flex-wrap sm:justify-center">
            <Button
              variant={selectedTag === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(null)}
              className={`shrink-0 rounded-full transition-all duration-200 hover:scale-105 ${
                selectedTag === null
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-white/80 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-600"
              }`}
            >
              全部
            </Button>
            {filteredTags.map((tag) => (
              <Button
                key={tag.id}
                variant={tag.isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleTagFilter(tag.id)}
                className={`shrink-0 rounded-full transition-all duration-200 hover:scale-105 ${
                  tag.isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-white/80 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-600"
                }`}
                style={
                  !tag.isActive && tag.color ? {
                    borderColor: tag.color,
                    color: tag.color,
                    backgroundColor: tag.color + "10"
                  } : {}
                }
              >
                {tag.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Prompt List */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <Card
              key={prompt.id}
              className="group overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer bg-white/80 backdrop-blur-sm border-slate-200/60 hover:border-blue-200/60 dark:bg-slate-800/80 dark:border-slate-700/60 dark:hover:border-blue-500/30"
              onClick={() => handlePromptClick(prompt.id)}
            >
              <CardContent className="p-6">
                <h3 className="line-clamp-1 text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {prompt.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {prompt.description}
                </p>
              </CardContent>
              <CardFooter className="flex items-center justify-between p-6 pt-0">
                <div className="flex flex-wrap gap-2">
                  {prompt.tags?.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-200 hover:scale-105"
                      style={{
                        backgroundColor: tag.color + "15",
                        color: tag.color,
                        borderColor: tag.color + "30",
                        borderWidth: "1px"
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopy(prompt.id, prompt.content)
                  }}
                  className="h-10 w-10 shrink-0 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 group-hover:scale-110"
                  aria-label="复制提示词"
                >
                  {copiedId === prompt.id ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {loading && prompts.length === 0 && (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-600 blur-xl opacity-20 animate-pulse"></div>
                </div>
                <Loader2 className="relative h-8 w-8 animate-spin text-blue-600" />
              </div>
              <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">正在加载精彩内容...</p>
            </div>
          </div>
        )}

        {!loading && prompts.length === 0 && !error && (
          <div className="py-20 text-center">
            <div className="max-w-md mx-auto">
              <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                <Search className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {searchQuery || selectedTag ? '未找到匹配的提示词' : '还没有提示词'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {searchQuery || selectedTag
                  ? '请尝试其他搜索条件或标签，或许会有新的发现。'
                  : '快来添加第一个提示词，开启AI创作之旅吧！'}
              </p>
            </div>
          </div>
        )}

        {hasMore && !loading && prompts.length > 0 && (
          <div className="flex justify-center mt-12">
            <Button
              onClick={handleLoadMore}
              variant="outline"
              className="rounded-full px-8 py-3 bg-white/80 hover:bg-slate-50 border-slate-200 hover:border-blue-300 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:border-slate-600 dark:hover:border-blue-500 transition-all duration-200 hover:scale-105"
            >
              加载更多精彩内容
            </Button>
          </div>
        )}

        {loading && prompts.length > 0 && (
          <div className="flex justify-center mt-12">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">正在加载更多...</p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}