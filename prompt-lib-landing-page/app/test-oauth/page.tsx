'use client'

import { useState } from 'react'

export default function TestOAuth() {
  const [result, setResult] = useState<string>('')

  const testDirectOAuth = () => {
    // 手动构建GitHub OAuth URL
    const clientId = 'Iv1.58f2c9b45a91c3e9d' // 从你的截图中看到的Client ID
    const redirectUri = encodeURIComponent('https://upoplrsvarlwhkqknbnq.supabase.co/auth/v1/callback')
    const scope = 'user:email'
    const state = Math.random().toString(36).substring(7)

    const githubOAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`

    console.log('Direct GitHub OAuth URL:', githubOAuthUrl)
    setResult(`直接GitHub OAuth URL已生成，请查看控制台\n\n${githubOAuthUrl}`)

    // 直接跳转测试
    window.location.href = githubOAuthUrl
  }

  const testSupabaseOAuth = async () => {
    try {
      const response = await fetch('/api/test-oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error: any) {
      setResult(`Error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">OAuth 测试页面</h1>

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">OAuth 配置信息</h2>
          <div className="space-y-2 text-sm">
            <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            <p>当前域名: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
            <p>预期回调URL: https://upoplrsvarlwhkqknbnq.supabase.co/auth/v1/callback</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">测试选项</h2>

          <button
            onClick={testDirectOAuth}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            直接测试GitHub OAuth
          </button>

          <button
            onClick={testSupabaseOAuth}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-4"
          >
            通过Supabase测试OAuth
          </button>
        </div>

        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">测试结果</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {result}
            </pre>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">检查清单</h2>
          <div className="space-y-2 text-sm">
            <p>✅ Supabase GitHub Provider已启用</p>
            <p>✅ Client ID已配置</p>
            <p>✅ Client Secret已配置</p>
            <p>❓ GitHub OAuth App回调URL是否正确设置？</p>
            <p>❓ GitHub OAuth App Homepage URL是否设置？</p>
          </div>
        </div>
      </div>
    </div>
  )
}