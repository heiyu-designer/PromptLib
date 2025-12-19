'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Github, Copy, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import UserMenu from '@/components/auth/user-menu'
import { useAuth } from '@/components/auth/auth-provider'
import { getPrompts, incrementViewCount } from '@/app/actions/prompts'
import { getTags } from '@/app/actions/tags'
import { trackCopy, getSettings } from '@/app/actions/copy'
import { PromptWithRelations } from '@/lib/database'
import SimpleSearch from '@/components/search/simple-search'

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
      const result = await getTags()
      if (result.error) {
        console.error('Failed to load tags:', result.error)
        // Use mock tags when database is not available
        const mockTags = [
          { id: 1, name: "编程", slug: "programming", color: "blue" },
          { id: 2, name: "代码审查", slug: "code-review", color: "green" },
          { id: 3, name: "文档", slug: "documentation", color: "purple" },
          { id: 4, name: "写作", slug: "writing", color: "orange" },
          { id: 5, name: "博客", slug: "blog", color: "red" }
        ]
        setTags(mockTags)
        return
      }
      setTags(result.tags || [])
    } catch (err) {
      console.error('Failed to load tags:', err)
      // Use mock tags when there's a network error
      const mockTags = [
        { id: 1, name: "编程", slug: "programming", color: "blue" },
        { id: 2, name: "写作", slug: "writing", color: "orange" }
      ]
      setTags(mockTags)
    }
  }

  useEffect(() => {
    loadPrompts(true)
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
    setSelectedTag(prev => prev === tagId ? null : tagId)
  }

  const handleCopy = async (promptId: number, content: string) => {
    try {
      // Copy content to clipboard
      await navigator.clipboard.writeText(content)
      setCopiedId(promptId)

      // Track copy event
      await trackCopy({
        prompt_id: promptId,
        user_id: user?.id,
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
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <span className="text-sm font-bold text-white">P</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">PromptLib</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
            </Button>
            <UserMenu />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            发现高质量 AI 提示词
          </h1>
          <p className="mt-4 text-pretty text-lg text-muted-foreground sm:mt-6 sm:text-xl">
            精选编程、写作和自动化提示词库
          </p>

          {/* Search Component */}
          <div className="mx-auto mt-8 max-w-2xl sm:mt-10">
            <SimpleSearch
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={(query) => setSearchQuery(query)}
              placeholder="搜索提示词..."
            />
          </div>
        </div>
      </section>

      {/* Tag Filter Section */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide sm:flex-wrap sm:justify-center">
            <Button
              variant={selectedTag === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(null)}
              className="shrink-0 rounded-full"
            >
              全部
            </Button>
            {filteredTags.map((tag) => (
              <Button
                key={tag.id}
                variant={tag.isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleTagFilter(tag.id)}
                className="shrink-0 rounded-full"
              >
                {tag.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Prompt List */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <Card
              key={prompt.id}
              className="group overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer"
              onClick={() => handlePromptClick(prompt.id)}
            >
              <CardHeader className="p-0">
                {prompt.cover_image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={prompt.cover_image_url}
                      alt={prompt.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        // Hide image on error
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="line-clamp-1 text-lg font-semibold">{prompt.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {prompt.description}
                </p>
              </CardContent>
              <CardFooter className="flex items-center justify-between p-4 pt-0">
                <div className="flex flex-wrap gap-1.5">
                  {prompt.tags?.map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="text-xs">
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
                  className="h-8 w-8 shrink-0"
                  aria-label="复制提示词"
                >
                  {copiedId === prompt.id ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {loading && prompts.length === 0 && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && prompts.length === 0 && !error && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery || selectedTag
                ? '未找到匹配的提示词，请尝试其他搜索条件或标签。'
                : '还没有提示词，请先添加一些内容。'}
            </p>
          </div>
        )}

        {hasMore && !loading && prompts.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button onClick={handleLoadMore} variant="outline">
              加载更多
            </Button>
          </div>
        )}

        {loading && prompts.length > 0 && (
          <div className="flex justify-center mt-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </section>
    </div>
  )
}