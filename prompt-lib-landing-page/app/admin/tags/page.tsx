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
import { getTags, createTag, updateTag, deleteTag } from "@/lib/supabase"

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
      const { data, error } = await getTags()

      if (error) {
        setError(`加载标签失败: ${error.message}`)
      } else {
        // 转换数据格式以匹配TagData接口
        const transformedTags = data?.map(tag => ({
          ...tag,
          prompt_count: 0 // TODO: 实现真实的计数统计
        })) || []
        setTags(transformedTags)
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
        const { error } = await updateTag(editingTag.id, {
          name: formData.name,
          slug: formData.slug,
          color: formData.color
        })

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
        const { error } = await createTag({
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
      const { error } = await deleteTag(id)

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">标签管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理用于分类和组织提示词的标签。
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTag(null)
              setFormData({
                name: "",
                slug: "",
                color: "#3B82F6"
              })
            }}>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium">总标签数</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">{tags.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>标签名称</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>颜色</TableHead>
              <TableHead>提示词数量</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="w-[120px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell className="font-medium">#{tag.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge
                      style={{
                        backgroundColor: tag.color,
                        color: "white"
                      }}
                    >
                      {tag.name}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted-foreground/10 px-2 py-1 rounded">
                    {tag.slug}
                  </code>
                </TableCell>
                <TableCell>
                  <div
                    className="h-6 w-6 rounded border-2 border-border"
                    style={{ backgroundColor: tag.color }}
                  />
                </TableCell>
                <TableCell>{tag.prompt_count}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(tag.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(tag)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
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
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            还没有创建任何标签。
          </p>
        </div>
      )}
    </div>
  )
}