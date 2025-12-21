'use client'

import { Grid, List, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type ViewMode = 'grid' | 'list' | 'compact'

interface ViewModeToggleProps {
  currentMode: ViewMode
  onModeChange: (mode: ViewMode) => void
  className?: string
}

const viewModes = [
  { mode: 'grid' as ViewMode, icon: Grid, label: '网格视图' },
  { mode: 'list' as ViewMode, icon: List, label: '列表视图' },
  { mode: 'compact' as ViewMode, icon: LayoutGrid, label: '紧凑视图' }
]

export default function ViewModeToggle({
  currentMode,
  onModeChange,
  className = ""
}: ViewModeToggleProps) {
  return (
    <TooltipProvider>
      <div className={`flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg ${className}`}>
        {viewModes.map(({ mode, icon: Icon, label }) => (
          <Tooltip key={mode}>
            <TooltipTrigger asChild>
              <Button
                variant={currentMode === mode ? "default" : "ghost"}
                size="sm"
                onClick={() => onModeChange(mode)}
                className={`h-8 w-8 p-0 transition-all duration-200 ${
                  currentMode === mode
                    ? "bg-white dark:bg-slate-700 shadow-sm"
                    : "hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}