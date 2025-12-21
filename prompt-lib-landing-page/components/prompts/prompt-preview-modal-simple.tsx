"use client"

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface SimplePromptPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prompt: {
    id: number
    title: string
    description: string
    content: string
  } | null
}

export function SimplePromptPreviewModal({
  open,
  onOpenChange,
  prompt
}: SimplePromptPreviewModalProps) {
  if (!prompt) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{prompt.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{prompt.description}</p>
          <div className="bg-muted p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">{prompt.content}</pre>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>关闭</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}