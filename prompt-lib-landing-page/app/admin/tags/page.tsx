"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { supabaseAdmin } from "@/lib/supabase"

interface TagData {
  id: number
  name: string
  slug: string
  color: string
  description?: string
  prompt_count: number
  created_at: string
}

export default function TagsPage() {
  const [tags, setTags] = useState<TagData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<TagData | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    color: "#3B82F6"
  })

  const COLORS = [
    "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16",
    "#22C55E", "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9",
    "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7", "#D946EF",
    "#EC4899", "#F43F5E"
  ]

  const loadTags = async () => {
    try {
      setLoading(true)
      setError(null)

      // 使用直接的 Supabase 查询
      const { data: tags, error: tagsError } = await supabaseAdmin
        .from('tags')
        .select('*')
        .order('name')

      if (tagsError) {
        setError(`加载标签失败: ${tagsError.message}`)
      } else {
        // 为每个标签计算关联的提示词数量
        const tagsWithStats = await Promise.all(
          (tags || []).map(async (tag) => {
            const { count } = await supabaseAdmin
              .from('prompt_tags')
              .select('*', { count: 'exact' })
              .eq('tag_id', tag.id)

            return {
              ...tag,
              prompt_count: count || 0
            }
          })
        )
        setTags(tagsWithStats)
      }
    } catch (err: any) {
      setError(`加载标签失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTags()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)

      if (editingTag) {
        // 更新现有标签
        const { error } = await supabaseAdmin
          .from('tags')
          .update({
            name: formData.name,
            slug: formData.slug,
            color: formData.color
          })
          .eq('id', editingTag.id)

        if (error) {
          setError(`更新标签失败: ${error.message}`)
        } else {
          alert("标签更新成功！")
          setDialogOpen(false)
          setEditingTag(null)
          setFormData({ name: "", slug: "", color: "#3B82F6" })
          await loadTags()
        }
      } else {
        // 创建新标签
        const { error } = await supabaseAdmin
          .from('tags')
          .insert({
            name: formData.name,
            slug: formData.slug,
            color: formData.color
          })

        if (error) {
          setError(`创建标签失败: ${error.message}`)
        } else {
          alert("标签创建成功！")
          setDialogOpen(false)
          setEditingTag(null)
          setFormData({ name: "", slug: "", color: "#3B82F6" })
          await loadTags()
        }
      }
    } catch (err: any) {
      setError(`保存失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (tag: TagData) => {
    setEditingTag(tag)
    setFormData({
      name: tag.name,
      slug: tag.slug,
      color: tag.color
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个标签吗？")) return
    try {
      // 先检查标签是否被使用
      const { data: usage } = await supabaseAdmin
        .from('prompt_tags')
        .select('prompt_id')
        .eq('tag_id', id)
        .limit(1)

      if (usage && usage.length > 0) {
        setError('无法删除正在使用的标签')
        return
      }

      const { error } = await supabaseAdmin
        .from('tags')
        .delete()
        .eq('id', id)

      if (error) {
        setError(`删除失败: ${error.message}`)
      } else {
        alert("标签删除成功！")
        await loadTags()
      }
    } catch (err: any) {
      setError(`删除失败: ${err.message}`)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .replace(/^-|-$/g, "")
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">标签管理</h1>
        </div>
        <div className="text-center py-12">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">标签管理</h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            管理用于分类和组织提示词的标签
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="rounded-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 transition-all duration-200 hover:scale-105 shadow-lg"
              onClick={() => {
                setEditingTag(null)
                setFormData({
                  name: "",
                  slug: "",
                  color: "#3B82F6"
                })
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              添加标签
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingTag ? "编辑标签" : "创建标签"}</DialogTitle>
              <DialogDescription>
                创建或编辑标签来组织您的提示词。
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">标签名称</Label>
                <Input
                  id="name"
                  placeholder="例如：编程"
                  value={formData.name}
                  onChange={(e) => {
                    const newName = e.target.value
                    setFormData({
                      ...formData,
                      name: newName,
                      slug: formData.slug || generateSlug(newName) // 只有当slug为空时才自动生成
                    })
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL 别名 (Slug)</Label>
                <Input
                  id="slug"
                  placeholder="例如：programming (用于URL)"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  用于生成友好的URL地址，只能包含小写字母、数字和连字符
                </p>
              </div>
              <div className="space-y-2">
                <Label>颜色</Label>
                <div className="grid grid-cols-6 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`h-8 rounded-md border-2 transition-all ${
                        formData.color === color
                          ? "border-primary scale-110"
                          : "border-border hover:border-primary/50"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>预览</Label>
                <div className="flex items-center gap-2">
                  <Badge
                    style={{
                      backgroundColor: formData.color,
                      color: "white"
                    }}
                  >
                    {formData.name || "标签名称"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {generateSlug(formData.name)}
                  </span>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  取消
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "保存中..." : (editingTag ? "更新" : "创建")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-200/60 dark:hover:border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">总标签数</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tags.length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Tag className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-700/60">
            <TableRow>
              <TableHead className="w-[100px] text-slate-700 dark:text-slate-300 font-semibold">ID</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">标签名称</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Slug</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">颜色</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">提示词数量</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">创建时间</TableHead>
              <TableHead className="w-[120px] text-right text-slate-700 dark:text-slate-300 font-semibold">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag.id} className="border-b border-slate-200/30 dark:border-slate-700/30 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors duration-150">
                <TableCell className="font-medium text-slate-900 dark:text-slate-100">#{tag.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-lg border-2 border-white dark:border-slate-800 shadow-sm"
                      style={{ backgroundColor: tag.color }}
                    />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{tag.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{tag.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                    {tag.slug}
                  </code>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-8 w-8 rounded-lg border-2 border-slate-200 dark:border-slate-700 shadow-sm"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {tag.color}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {tag.prompt_count}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      个提示词
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                  {new Date(tag.created_at).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 rounded-lg"
                      onClick={() => handleEdit(tag)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 rounded-lg"
                      onClick={() => handleDelete(tag.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {tags.length === 0 && (
        <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-16 text-center">
          <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
            <Tag className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
            还没有创建任何标签
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
            开始创建标签来更好地组织和分类您的提示词内容。
          </p>
          <div className="mt-8">
            <Button
              className="rounded-full px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 transition-all duration-200 hover:scale-105 shadow-lg"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              创建第一个标签
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}