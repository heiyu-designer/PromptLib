'use client'

import React from 'react'

interface ContentRendererProps {
  content: string
  className?: string
}

// 检测内容类型
function detectContentType(content: string): 'markdown' | 'json' | 'yaml' | 'code' | 'text' {
  const trimmed = content.trim()

  // JSON 检测
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed)
      return 'json'
    } catch {
      // 不是有效的JSON，继续检测
    }
  }

  // YAML 检测
  if (/^[\w\-]+:\s*\w+/.test(trimmed) ||
      trimmed.startsWith('---') ||
      /^[\w\-]+:\s*\n(\s{2,}[\w\-]+:|\s*-\s+)/.test(trimmed)) {
    return 'yaml'
  }

  // Markdown 检测
  if (/^#{1,6}\s+/.test(trimmed) ||
      /\*\*.*?\*\*/.test(trimmed) ||
      /\*.*?\*/.test(trimmed) ||
      /\[.*?\]\(.*?\)/.test(trimmed) ||
      /```/.test(trimmed) ||
      /^[-*+]\s+/.test(trimmed) ||
      /^\d+\.\s+/.test(trimmed)) {
    return 'markdown'
  }

  // 代码检测
  if (/```[\w]*\n/.test(trimmed) ||
      trimmed.includes('function') ||
      trimmed.includes('const ') ||
      trimmed.includes('let ') ||
      trimmed.includes('var ') ||
      trimmed.includes('class ') ||
      trimmed.includes('def ') ||
      trimmed.includes('import ')) {
    return 'code'
  }

  return 'text'
}

// JSON 格式化组件
function JsonRenderer({ content }: { content: string }) {
  try {
    const parsed = JSON.parse(content)
    const formatted = JSON.stringify(parsed, null, 2)

    return (
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm font-medium">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            JSON
          </div>
          <span className="text-sm text-muted-foreground">
            {Object.keys(parsed).length} 个属性
          </span>
        </div>
        <div className="rounded-lg overflow-hidden border bg-muted/50">
          <pre className="p-4 text-sm font-mono overflow-x-auto">
            <code className="text-foreground">{formatted}</code>
          </pre>
        </div>
      </div>
    )
  } catch (error) {
    return <TextRenderer content={content} />
  }
}

// YAML 格式化组件
function YamlRenderer({ content }: { content: string }) {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-sm font-medium">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          YAML
        </div>
        <span className="text-sm text-muted-foreground">
          配置文件格式
        </span>
      </div>
      <div className="rounded-lg overflow-hidden border bg-muted/50">
        <pre className="p-4 text-sm font-mono overflow-x-auto">
          <code className="text-foreground">{content}</code>
        </pre>
      </div>
    </div>
  )
}

// 代码格式化组件
function CodeRenderer({ content }: { content: string }) {
  // 检测代码语言
  const match = content.match(/```(\w+)?\n([\s\S]*?)```/)
  if (match) {
    const language = match[1] || 'plaintext'
    const code = match[2]

    return (
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-sm font-medium">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            {language.toUpperCase()}
          </div>
        </div>
        <div className="rounded-lg overflow-hidden border bg-muted/50">
          <pre className="p-4 text-sm font-mono overflow-x-auto">
            <code className="text-foreground">{code}</code>
          </pre>
        </div>
      </div>
    )
  }

  // 如果没有代码块标记，当作纯代码处理
  return (
    <div className="rounded-lg overflow-hidden border bg-muted/50">
      <pre className="p-4 text-sm font-mono overflow-x-auto">
        <code className="text-foreground">{content}</code>
      </pre>
    </div>
  )
}

// Markdown 渲染组件
function MarkdownRenderer({ content }: { content: string }) {
  // 简化的 Markdown 渲染，专注于常见的格式
  const processedContent = content
    // 处理代码块
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm font-mono">${code}</code></pre>`
    })
    // 处理行内代码
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    // 处理标题
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3 mt-5">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 mt-6">$1</h1>')
    // 处理粗体
    .replace(/\*\*([^\*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // 处理斜体
    .replace(/\*([^\*]+)\*/g, '<em class="italic">$1</em>')
    // 处理链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline transition-colors">$1</a>')
    // 处理无序列表
    .replace(/^- (.+)$/gim, '<li class="ml-4 list-disc">• $1</li>')
    // 处理有序列表
    .replace(/^\d+\. (.+)$/gim, '<li class="ml-4 list-decimal">$1</li>')
    // 处理换行
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/\n/g, '<br />')

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-sm font-medium">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          Markdown
        </div>
      </div>
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <div className="mb-4" dangerouslySetInnerHTML={{ __html: `<p class="mb-4">${processedContent}</p>` }} />
      </div>
    </div>
  )
}

// 纯文本渲染组件
function TextRenderer({ content }: { content: string }) {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 rounded text-sm font-medium">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          纯文本
        </div>
      </div>
      <div className="whitespace-pre-wrap text-sm leading-relaxed font-mono bg-muted/30 p-4 rounded-lg border">
        {content}
      </div>
    </div>
  )
}

export default function ContentRenderer({ content, className = '' }: ContentRendererProps) {
  if (!content) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        暂无内容
      </div>
    )
  }

  const contentType = detectContentType(content)

  const renderers = {
    markdown: MarkdownRenderer,
    json: JsonRenderer,
    yaml: YamlRenderer,
    code: CodeRenderer,
    text: TextRenderer,
  }

  const Renderer = renderers[contentType]

  return (
    <div className={`content-renderer ${className}`}>
      <Renderer content={content} />
    </div>
  )
}