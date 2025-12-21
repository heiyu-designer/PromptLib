"use client"

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Copy, Eye, ExternalLink, Calendar, User, Tag } from 'lucide-react'
import PromptStats from '@/components/prompts/prompt-stats'
import { trackCopy } from '@/app/actions/copy'
import { useAuth } from '@/components/auth/auth-provider'
import { toast } from 'sonner'

interface PromptPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prompt: {
    id: number
    title: string
    description: string
    content: string
    created_at: string
    view_count: number
    copy_count: number
    is_featured?: boolean
    tags?: Array<{
      id: number
      name: string
      slug: string
      color: string
    }>
    author?: {
      username: string
      avatar_url?: string
    }
  } | null
}

export function PromptPreviewModal({
  open,
  onOpenChange,
  prompt
}: PromptPreviewModalProps) {
  const { user } = useAuth()
  const [isCopying, setIsCopying] = React.useState(false)
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null)

  if (!prompt) {
    return null
  }

  const handleCopy = async (content: string, section: string) => {
    if (!user) {
      toast.error('请先登录后再复制内容')
      return
    }

    try {
      setIsCopying(true)
      setCopiedSection(section)

      await navigator.clipboard.writeText(content)

      // Track copy event
      await trackCopy({
        prompt_id: prompt.id,
        user_id: user.id,
        ip_address: null, // Will be set on server
        user_agent: navigator.userAgent,
        referrer: window.location.origin
      })

      toast.success('内容已复制到剪贴板')

      // Reset copied section after 2 seconds
      setTimeout(() => setCopiedSection(null), 2000)
    } catch (error) {
      toast.error('复制失败，请重试')
      console.error('Copy error:', error)
    } finally {
      setIsCopying(false)
    }
  }

  const handleViewDetails = () => {
    // Navigate to details page
    window.open(`/prompts/${prompt.id}`, '_blank')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold leading-7">
                {prompt.title}
                {prompt.is_featured && (
                  <Badge className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                    精选
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                {prompt.description}
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <PromptStats
                viewCount={prompt.view_count}
                copyCount={prompt.copy_count}
                isFeatured={prompt.is_featured}
                compact
              />
            </div>
          </div>

          {/* Tags */}
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {prompt.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: tag.color + '20',
                    color: tag.color,
                    borderColor: tag.color + '30'
                  }}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Prompt Content */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">提示词内容</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(prompt.content, 'full')}
                disabled={isCopying || !user}
                className="text-xs"
              >
                <Copy className="w-3 h-3 mr-1" />
                {copiedSection === 'full' ? '已复制' : user ? '复制全文' : '登录后复制'}
              </Button>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
              {prompt.content}
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                创建于 {formatDate(prompt.created_at)}
              </div>
              {prompt.author && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  作者: {prompt.author.username}
                </div>
              )}
            </div>

            <Separator />

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <Eye className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-medium">{prompt.view_count.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">浏览次数</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <Copy className="w-4 h-4 text-green-600" />
                <div>
                  <div className="font-medium">{prompt.copy_count.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">复制次数</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            ID: #{prompt.id}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              关闭
            </Button>
            {user ? (
              <Button
                size="sm"
                onClick={handleViewDetails}
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                查看详情
              </Button>
            ) : (
              <Button
                size="sm"
                disabled
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                需要登录查看详情
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PromptPreviewModal