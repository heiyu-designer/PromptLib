'use client'

import { useState, useEffect } from 'react'

export default function HomePageSimple() {
  const [prompts, setPrompts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [debug, setDebug] = useState<string>('')

  useEffect(() => {
    console.log('=== HomePageSimple useEffect triggered ===')
    setDebug('开始加载数据...')

    const loadData = async () => {
      try {
        console.log('=== 发起API请求 ===')
        const response = await fetch('/api/debug-prompts')
        console.log('=== API响应状态:', response.status)

        const result = await response.json()
        console.log('=== API响应数据:', result)

        setDebug(`成功加载 ${result.prompts?.length || 0} 个提示词`)
        setPrompts(result.prompts || [])
        setLoading(false)
      } catch (error) {
        console.error('=== 加载失败:', error)
        setDebug(`加载失败: ${error}`)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  console.log('=== HomePageSimple 渲染 ===', { loading, promptsLength: prompts.length })

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">简化版首页</h1>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">调试信息</h2>
          <p>状态: {debug}</p>
          <p>加载中: {loading ? '是' : '否'}</p>
          <p>提示词数量: {prompts.length}</p>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>正在加载...</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {prompts.slice(0, 4).map((prompt) => (
            <div key={prompt.id} className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">{prompt.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{prompt.description}</p>
              <div className="text-xs text-muted-foreground">
                ID: {prompt.id} | 浏览: {prompt.view_count || 0} | 复制: {prompt.copy_count || 0}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}