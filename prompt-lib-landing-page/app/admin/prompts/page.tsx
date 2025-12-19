"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
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

const MOCK_PROMPTS = [
  {
    id: 1,
    title: "代码审查助手",
    slug: "code-review-assistant",
    status: "active",
    coverImage: "/code-review-on-screen.jpg",
    tags: ["编程", "ChatGPT"],
  },
  {
    id: 2,
    title: "博客文章生成器",
    slug: "blog-post-generator",
    status: "draft",
    coverImage: "/writing-blog-on-laptop.jpg",
    tags: ["写作", "Claude"],
  },
  {
    id: 3,
    title: "Midjourney 场景构建器",
    slug: "midjourney-scene-builder",
    status: "active",
    coverImage: "/artistic-digital-scene.jpg",
    tags: ["Midjourney"],
  },
]

const ALL_TAGS = ["写作", "编程", "Coze", "Midjourney", "ChatGPT", "Claude", "自动化"]

export default function PromptsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<any>(null)

  const filteredPrompts = MOCK_PROMPTS.filter((prompt) =>
    prompt.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleEdit = (prompt: any) => {
    setEditingPrompt(prompt)
    setIsDialogOpen(true)
  }

  const handleAddNew = () => {
    setEditingPrompt(null)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("确定要删除这个提示词吗？")) {
      console.log("Delete prompt:", id)
    }
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
            <PromptForm prompt={editingPrompt} onClose={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

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
              <TableHead className="w-[120px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrompts.map((prompt) => (
              <TableRow key={prompt.id}>
                <TableCell className="font-medium">#{prompt.id}</TableCell>
                <TableCell>
                  <img
                    src={prompt.coverImage || "/placeholder.svg"}
                    alt={prompt.title}
                    className="h-12 w-16 rounded object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{prompt.title}</TableCell>
                <TableCell>
                  <Badge variant={prompt.status === "active" ? "default" : "secondary"}>
                    {prompt.status === "active" ? "已发布" : "草稿"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {prompt.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(prompt)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(prompt.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
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
          <p className="text-muted-foreground">未找到提示词。请尝试调整搜索条件。</p>
        </div>
      )}
    </div>
  )
}

function PromptForm({ prompt, onClose }: { prompt: any; onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: prompt?.title || "",
    slug: prompt?.slug || "",
    content: prompt?.content || "",
    coverImageUrl: prompt?.coverImage || "",
    tags: prompt?.tags || [],
    isPublic: prompt?.status === "active" || false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    onClose()
  }

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">标题</Label>
        <Input
          id="title"
          placeholder="输入提示词标题"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <Label htmlFor="slug">URL 别名</Label>
        <Input
          id="slug"
          placeholder="prompt-url-slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          required
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content">内容（Markdown）</Label>
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
          {ALL_TAGS.map((tag) => (
            <Button
              key={tag}
              type="button"
              variant={formData.tags.includes(tag) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
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
        <Button type="button" variant="outline" onClick={onClose}>
          取消
        </Button>
        <Button type="submit">{prompt ? "更新提示词" : "创建提示词"}</Button>
      </div>
    </form>
  )
}
