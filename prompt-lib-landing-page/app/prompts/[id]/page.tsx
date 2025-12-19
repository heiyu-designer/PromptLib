"use client"

import { useState } from "react"
import { ChevronRight, Copy, Check, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

const PROMPT_DATA = {
  id: "1",
  title: "代码审查助手",
  description: "获得全面的代码审查，包含最佳实践和优化建议。",
  lastUpdated: "2024-03-15",
  author: {
    name: "陈晓明",
    avatar: "/developer-working.png",
    role: "高级开发工程师",
  },
  tags: ["编程", "ChatGPT", "审查"],
  modelVersion: "GPT-4",
  category: "编程",
  content: `你是一位专业的代码审查专家，精通软件工程最佳实践、设计模式和现代编程范式。

## 你的任务

全面审查提供的代码，并提供建设性反馈，重点关注：

1. **代码质量**：可读性、可维护性和对最佳实践的遵循
2. **性能**：潜在瓶颈和优化机会
3. **安全性**：漏洞和安全最佳实践
4. **架构**：设计模式和结构改进
5. **测试**：测试覆盖率和质量

## 审查指南

- 在反馈中具体且具有建设性
- 在建议改进时提供代码示例
- 解释推荐背后的原因
- 将关键问题优先于次要样式偏好
- 考虑项目背景和约束

## 输出格式

按以下方式组织你的审查：

### 总结
代码质量和主要发现的简要概述。

### 关键问题
应立即解决的高优先级问题。

### 建议
带代码示例的改进建议。

### 优点
突出做得好的地方。

## 使用示例

\`\`\`javascript
// 原始代码
function getData(id) {
  return fetch('/api/data/' + id)
    .then(res => res.json())
}

// 改进建议
async function getData(id: string): Promise<Data> {
  try {
    const response = await fetch(\`/api/data/\${id}\`);
    if (!response.ok) {
      throw new Error(\`HTTP 错误！状态：\${response.status}\`);
    }
    return await response.json();
  } catch (error) {
    console.error('获取数据失败：', error);
    throw error;
  }
}
\`\`\`

现在，请提供你想让我审查的代码。`,
}

export default function PromptDetailPage() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(PROMPT_DATA.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <span className="text-sm font-bold text-white">P</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">PromptLib</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="ghost">登录</Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <nav aria-label="面包屑导航" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="transition-colors hover:text-foreground">
                首页
              </Link>
            </li>
            <ChevronRight className="h-4 w-4" />
            <li>
              <Link href={`/?tag=${PROMPT_DATA.category}`} className="transition-colors hover:text-foreground">
                {PROMPT_DATA.category}
              </Link>
            </li>
            <ChevronRight className="h-4 w-4" />
            <li className="line-clamp-1 text-foreground">{PROMPT_DATA.title}</li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Main Content Area */}
          <div className="min-w-0">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1 space-y-3">
                <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{PROMPT_DATA.title}</h1>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={PROMPT_DATA.author.avatar || "/placeholder.svg"} alt={PROMPT_DATA.author.name} />
                    <AvatarFallback>{PROMPT_DATA.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-medium">{PROMPT_DATA.author.name}</p>
                    <p className="text-muted-foreground">
                      更新于{" "}
                      {new Date(PROMPT_DATA.lastUpdated).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Desktop Copy Button */}
              <Button onClick={handleCopy} size="lg" className="hidden shrink-0 sm:flex">
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    已复制！
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    复制提示词
                  </>
                )}
              </Button>
            </div>

            {/* Content Body */}
            <Card>
              <CardContent className="prose prose-slate max-w-none p-6 dark:prose-invert sm:p-8">
                <div className="space-y-6">
                  {PROMPT_DATA.content.split("\n\n").map((paragraph, idx) => {
                    // Check if it's a heading
                    if (paragraph.startsWith("## ")) {
                      return (
                        <h2 key={idx} className="mt-8 text-2xl font-bold tracking-tight first:mt-0">
                          {paragraph.replace("## ", "")}
                        </h2>
                      )
                    }
                    // Check if it's a code block
                    if (paragraph.startsWith("```")) {
                      const codeContent = paragraph.replace(/```\w*\n?/g, "").trim()
                      return (
                        <pre key={idx} className="overflow-x-auto rounded-lg bg-muted p-4">
                          <code className="text-sm">{codeContent}</code>
                        </pre>
                      )
                    }
                    // Check if it's a list
                    if (paragraph.match(/^\d+\./m)) {
                      const items = paragraph.split("\n").filter((line) => line.trim())
                      return (
                        <ol key={idx} className="list-decimal space-y-2 pl-6">
                          {items.map((item, i) => (
                            <li key={i}>
                              {item.replace(/^\d+\.\s/, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}
                            </li>
                          ))}
                        </ol>
                      )
                    }
                    // Check if it's a bullet list
                    if (paragraph.startsWith("- ")) {
                      const items = paragraph.split("\n").filter((line) => line.trim())
                      return (
                        <ul key={idx} className="list-disc space-y-2 pl-6">
                          {items.map((item, i) => (
                            <li key={i}>{item.replace(/^-\s/, "")}</li>
                          ))}
                        </ul>
                      )
                    }
                    // Regular paragraph with bold text support
                    const boldText = paragraph.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    return (
                      <p
                        key={idx}
                        className="leading-relaxed text-foreground"
                        dangerouslySetInnerHTML={{ __html: boldText }}
                      />
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-8 border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/30">
              <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
                <div>
                  <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">
                    想要获得此提示词的自动化 Coze 工作流？
                  </h3>
                  <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-300">通过微信即刻获取</p>
                </div>
                <Button variant="default" size="lg" className="shrink-0 bg-indigo-600 hover:bg-indigo-700">
                  微信获取
                </Button>
              </CardContent>
            </Card>

            {/* Mobile Sidebar Content */}
            <div className="mt-8 space-y-6 lg:hidden">
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 font-semibold">关于</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-sm text-muted-foreground">标签</p>
                      <div className="flex flex-wrap gap-2">
                        {PROMPT_DATA.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-sm text-muted-foreground">模型版本</p>
                      <p className="font-medium">{PROMPT_DATA.modelVersion}</p>
                    </div>
                    <div>
                      <p className="mb-2 text-sm text-muted-foreground">作者</p>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={PROMPT_DATA.author.avatar || "/placeholder.svg"}
                            alt={PROMPT_DATA.author.name}
                          />
                          <AvatarFallback>{PROMPT_DATA.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{PROMPT_DATA.author.name}</p>
                          <p className="text-sm text-muted-foreground">{PROMPT_DATA.author.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 font-semibold">关于</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-sm text-muted-foreground">标签</p>
                      <div className="flex flex-wrap gap-2">
                        {PROMPT_DATA.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-sm text-muted-foreground">模型版本</p>
                      <p className="font-medium">{PROMPT_DATA.modelVersion}</p>
                    </div>
                    <div>
                      <p className="mb-2 text-sm text-muted-foreground">作者</p>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={PROMPT_DATA.author.avatar || "/placeholder.svg"}
                            alt={PROMPT_DATA.author.name}
                          />
                          <AvatarFallback>{PROMPT_DATA.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{PROMPT_DATA.author.name}</p>
                          <p className="text-sm text-muted-foreground">{PROMPT_DATA.author.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background p-4 sm:hidden">
        <Button onClick={handleCopy} size="lg" className="w-full">
          {copied ? (
            <>
              <Check className="mr-2 h-5 w-5" />
              已复制！
            </>
          ) : (
            <>
              <Copy className="mr-2 h-5 w-5" />
              复制提示词
            </>
          )}
        </Button>
      </div>

      <div className="h-20 sm:hidden" />
    </div>
  )
}
