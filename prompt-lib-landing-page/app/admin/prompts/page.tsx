"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Search, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabaseAdmin } from "@/lib/supabase"
import type { Database } from "@/lib/database"
import { getCurrentUser } from "@/lib/simple-auth"

type Prompt = Database['public']['Tables']['prompts']['Row'] & {
  tags?: Array<{ id: number; name: string; slug: string; color: string }>
}
type Tag = Database['public']['Tables']['tags']['Row']

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 使用直接的 Supabase 查询，避免 Server Action 哈希问题
      const [promptsResult, tagsResult] = await Promise.all([
        supabaseAdmin.from('prompts').select(`
          *,
          prompt_tags(
            tags(id, name, slug, color)
          )
        `),
        supabaseAdmin.from('tags').select('*')
      ])

      if (promptsResult.error) {
        setError(`加载提示词失败: ${promptsResult.error.message}`)
      } else {
        // 转换数据格式，添加 tags 数组
        const transformedPrompts = (promptsResult.data || []).map(prompt => ({
          ...prompt,
          tags: prompt.prompt_tags?.map(pt => pt.tags).filter(Boolean)
        }))
        setPrompts(transformedPrompts)
      }

      if (tagsResult.error) {
        console.error('加载标签失败:', tagsResult.error)
      } else {
        setTags(tagsResult.data || [])
      }
    } catch (err: any) {
      setError(`加载数据失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const filteredPrompts = prompts.filter((prompt) =>
    prompt.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt)
    setIsDialogOpen(true)
  }

  const handleAddNew = () => {
    setEditingPrompt(null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个提示词吗？")) return

    try {
      setError(null)
      // 使用直接的 Supabase 查询
      const { error } = await supabaseAdmin
        .from('prompts')
        .delete()
        .eq('id', id)

      if (error) {
        setError(`删除失败: ${error.message}`)
      } else {
        await loadData()
        alert("提示词已成功删除！")
      }
    } catch (err: any) {
      setError(`删除失败: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">提示词管理</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">提示词管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">在一个地方管理所有的 AI 提示词。</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4" />
              添加新提示词
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPrompt ? "编辑提示词" : "添加新提示词"}</DialogTitle>
              <DialogDescription>
                {editingPrompt ? "更新提示词的详细信息。" : "为你的库创建一个新的提示词。"}
              </DialogDescription>
            </DialogHeader>
            <PromptForm
              prompt={editingPrompt}
              tags={tags}
              onClose={() => setIsDialogOpen(false)}
              onSave={loadData}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="搜索提示词..."
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
              <TableHead className="w-[100px]">封面</TableHead>
              <TableHead>标题</TableHead>
              <TableHead className="w-[120px]">状态</TableHead>
              <TableHead>标签</TableHead>
              <TableHead>浏览次数</TableHead>
              <TableHead className="w-[120px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrompts.map((prompt) => (
              <TableRow key={prompt.id}>
                <TableCell className="font-medium">#{prompt.id}</TableCell>
                <TableCell>
                  {prompt.cover_image_url ? (
                    <img
                      src={prompt.cover_image_url}
                      alt={prompt.title}
                      className="h-12 w-16 rounded object-cover"
                    />
                  ) : (
                    <div className="h-12 w-16 rounded bg-gray-200 flex items-center justify-center">
                      <Eye className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{prompt.title}</TableCell>
                <TableCell>
                  <Badge variant={prompt.is_public ? "default" : "secondary"}>
                    {prompt.is_public ? "已发布" : "草稿"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {prompt.tags?.map((tag) => (
                      <Badge key={tag.id} variant="outline" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{prompt.view_count || 0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(prompt)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(prompt.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredPrompts.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            {searchQuery ? "未找到匹配的提示词。" : "还没有提示词，点击上方按钮创建第一个。"}
          </p>
        </div>
      )}
    </div>
  )
}

function PromptForm({
  prompt,
  tags,
  onClose,
  onSave
}: {
  prompt: Prompt | null
  tags: Tag[]
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    title: prompt?.title || "",
    description: prompt?.description || "",
    content: prompt?.content || "",
    coverImageUrl: prompt?.cover_image_url || "",
    isPublic: prompt?.is_public || false,
    selectedTags: prompt?.tags?.map(tag => tag.id) || []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 使用固定的admin用户ID，确保对应的用户档案存在
      const DEFAULT_ADMIN_UUID = '00000000-0000-0000-0000-000000000001'

      // 确保默认admin用户档案存在
      const { error: checkError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', DEFAULT_ADMIN_UUID)
        .single()

      if (checkError) {
        // 如果admin用户不存在，创建一个
        console.log('创建默认admin用户档案')
        const { error: createError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: DEFAULT_ADMIN_UUID,
            username: 'admin',
            role: 'admin',
            status: 'active'
          })

        if (createError) {
          console.error('创建默认admin用户档案失败:', createError)
        }
      }

      const currentUser = getCurrentUser()
      let authorId: string

      // 使用简单逻辑：如果有当前用户是admin，使用admin ID，否则使用admin ID
      // 这样确保所有创建的提示词都有一个有效的author_id
      authorId = DEFAULT_ADMIN_UUID

      let result
      if (prompt) {
        // 更新提示词
        result = await supabaseAdmin
          .from('prompts')
          .update({
            title: formData.title,
            description: formData.description,
            content: formData.content,
            cover_image_url: formData.coverImageUrl || null,
            is_public: formData.isPublic
          })
          .eq('id', prompt.id)
          .select()
          .single()

        // 更新标签关系
        if (formData.selectedTags.length > 0) {
          // 删除现有标签关系
          await supabaseAdmin
            .from('prompt_tags')
            .delete()
            .eq('prompt_id', prompt.id)

          // 创建新标签关系
          const tagRelations = formData.selectedTags.map(tagId => ({
            prompt_id: prompt.id,
            tag_id: tagId
          }))

          await supabaseAdmin
            .from('prompt_tags')
            .insert(tagRelations)
        }
      } else {
        // 创建新提示词
        result = await supabaseAdmin
          .from('prompts')
          .insert({
            title: formData.title,
            description: formData.description,
            content: formData.content,
            cover_image_url: formData.coverImageUrl || null,
            is_public: formData.isPublic,
            author_id: authorId
          })
          .select()
          .single()

        // 创建标签关系
        if (formData.selectedTags.length > 0 && result.data) {
          const tagRelations = formData.selectedTags.map(tagId => ({
            prompt_id: result.data.id,
            tag_id: tagId
          }))

          await supabaseAdmin
            .from('prompt_tags')
            .insert(tagRelations)
        }
      }

      if (result.error) {
        setError(result.error.message)
      } else {
        const action = prompt ? "更新" : "创建"
        alert(`提示词"${formData.title}"已成功${action}！`)
        onClose()
        onSave()
      }
    } catch (err: any) {
      setError(`保存失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (tagId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter((t) => t !== tagId)
        : [...prev.selectedTags, tagId],
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">标题 *</Label>
        <Input
          id="title"
          placeholder="输入提示词标题"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">描述</Label>
        <Input
          id="description"
          placeholder="简短描述这个提示词的用途"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content">内容（Markdown） *</Label>
        <Textarea
          id="content"
          placeholder="使用 Markdown 编写提示词内容..."
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="min-h-[200px] font-mono text-sm"
          required
        />
      </div>

      {/* Cover Image URL */}
      <div className="space-y-2">
        <Label htmlFor="coverImage">封面图片 URL</Label>
        <Input
          id="coverImage"
          type="url"
          placeholder="https://example.com/image.jpg"
          value={formData.coverImageUrl}
          onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>标签</Label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Button
              key={tag.id}
              type="button"
              variant={formData.selectedTags.includes(tag.id) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleTag(tag.id)}
              style={{
                backgroundColor: formData.selectedTags.includes(tag.id) ? tag.color : undefined
              }}
            >
              {tag.name}
            </Button>
          ))}
        </div>
        {tags.length === 0 && (
          <p className="text-sm text-muted-foreground">还没有标签，请先在标签管理中创建标签。</p>
        )}
      </div>

      {/* Public Status */}
      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="public-status">公开状态</Label>
          <p className="text-sm text-muted-foreground">让所有用户都能看到此提示词</p>
        </div>
        <Switch
          id="public-status"
          checked={formData.isPublic}
          onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          取消
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? '保存中...' : (prompt ? "更新提示词" : "创建提示词")}
        </Button>
      </div>
    </form>
  )
}