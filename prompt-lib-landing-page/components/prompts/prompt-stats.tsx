'use client'

import { Eye, Copy, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PromptStatsProps {
  viewCount: number
  copyCount: number
  isFeatured?: boolean
  compact?: boolean
  className?: string
}

// 格式化数字显示（例如：1234 → 1.2k）
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

export default function PromptStats({
  viewCount,
  copyCount,
  isFeatured = false,
  compact = false,
  className = ""
}: PromptStatsProps) {
  const textSize = compact ? "text-[10px]" : "text-xs"
  const iconSize = compact ? "h-2.5 w-2.5" : "h-3 w-3"
  const gap = compact ? "gap-1" : "gap-1.5"

  return (
    <div className={`flex items-center ${compact ? 'justify-start' : 'justify-between'} ${gap} ${textSize} text-slate-500 dark:text-slate-400 ${className}`}>
      {isFeatured && !compact && (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700 text-[10px] px-1.5 py-0.5">
          <Star className="h-2.5 w-2.5 mr-1" />
          精选
        </Badge>
      )}

      {isFeatured && compact && (
        <Star className="h-2.5 w-2.5 text-yellow-500 mr-1" />
      )}

      <div className={`flex items-center ${gap}`}>
        <div className={`flex items-center gap-0.5 ${compact ? 'text-[10px]' : ''}`}>
          <Eye className={iconSize} />
          <span>{formatNumber(viewCount)}</span>
        </div>

        <div className={`flex items-center gap-0.5 ${compact ? 'text-[10px]' : ''}`}>
          <Copy className={iconSize} />
          <span>{formatNumber(copyCount)}</span>
        </div>
      </div>
    </div>
  )
}