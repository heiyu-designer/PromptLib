'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function OAuthDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [sessionInfo, setSessionInfo] = useState<any>(null)

  useEffect(() => {
    // 获取当前session信息
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionInfo(session)
    })

    // 监听auth状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setDebugInfo(prev => ({
          ...prev,
          lastEvent: event,
          lastSession: session
        }))
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const testGitHubOAuth = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      console.log('OAuth test result:', { data, error })
      setDebugInfo({ data, error })
    } catch (err: any) {
      console.error('OAuth test error:', err)
      setDebugInfo(prev => ({ ...prev, testError: err.message }))
    }
  }

  const getCurrentUrl = () => {
    if (typeof window === 'undefined') {
      return {
        error: 'Window object not available on server',
        message: 'This function only works on the client side'
      }
    }

    return {
      origin: window.location.origin,
      href: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">OAuth Debug Page</h1>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">URL Information</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(getCurrentUrl(), null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Current Session</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(sessionInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test OAuth</h2>
          <button
            onClick={testGitHubOAuth}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Test GitHub OAuth
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
          <div className="space-y-2">
            <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set'}</p>
            <p>NEXT_PUBLIC_SUPABASE_KEY: {process.env.NEXT_PUBLIC_SUPABASE_KEY ? '✅ Set' : '❌ Not set'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}