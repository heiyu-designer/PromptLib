'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trackCopy } from '@/app/actions/copy'
import { getCurrentUser } from '@/lib/simple-auth'
import { useAuth } from '@/components/auth/auth-provider'

interface PromptCopyButtonProps {
  content: string
  promptId: number
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export default function PromptCopyButton({
  content,
  promptId,
  className = '',
  size = 'default'
}: PromptCopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const { user } = useAuth()

  const handleCopy = async () => {
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
      setCopied(true)

      // Track copy event
      await trackCopy({
        prompt_id: promptId,
        user_id: currentUser.id,
        user_agent: navigator.userAgent,
        referrer: document.referrer
      })

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = content
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)

        // Still try to track even if clipboard API failed
        if (currentUser) {
          trackCopy({
            prompt_id: promptId,
            user_id: currentUser.id,
            user_agent: navigator.userAgent,
            referrer: document.referrer
          }).catch(console.error)
        }
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr)
        alert('复制失败，请手动复制内容')
      }
      document.body.removeChild(textArea)
    }
  }

  return (
    <Button
      onClick={handleCopy}
      className={`${className} ${copied ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"} text-white border-0`}
      size={size}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          {size !== 'icon' && <span className="ml-2">已复制！</span>}
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          {size !== 'icon' && <span className="ml-2">复制提示词</span>}
        </>
      )}
    </Button>
  )
}