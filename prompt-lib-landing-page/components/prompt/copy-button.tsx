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
    try {
      // Copy content to clipboard
      await navigator.clipboard.writeText(content)
      setCopied(true)

      // Get current user info (can be null for anonymous users)
      const simpleUser = getCurrentUser()
      const currentUser = simpleUser || user

      // Track copy event (user_id can be null for anonymous users)
      await trackCopy({
        prompt_id: promptId,
        user_id: currentUser?.id,
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
        const simpleUser = getCurrentUser()
        const currentUser = simpleUser || user

        trackCopy({
          prompt_id: promptId,
          user_id: currentUser?.id,
          user_agent: navigator.userAgent,
          referrer: document.referrer
        }).catch(console.error)
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