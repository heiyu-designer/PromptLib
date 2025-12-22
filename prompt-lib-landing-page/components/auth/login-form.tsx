'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Github, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from './auth-provider'

interface LoginFormProps {
  redirectTo?: string
}

// 简单的硬编码用户验证
const VALID_USERS = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'heiyu', password: '123456', role: 'user' },
  { username: 'ziye', password: '123456', role: 'user' }
]

export default function LoginForm({ redirectTo }: LoginFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { signIn, signInWithOAuth } = useAuth()

  // 简单账号密码登录
  const handleSimpleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    // 验证用户凭据
    const validUser = VALID_USERS.find(user =>
      user.username === username && user.password === password
    )

    if (validUser) {
      // 模拟登录成功，设置localStorage
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userRole', validUser.role)
      localStorage.setItem('username', validUser.username)

      // 根据用户角色跳转到不同页面
      const redirectPath = validUser.role === 'admin' ? (redirectTo || '/admin') : '/'
      router.push(redirectPath)
    } else {
      setError('用户名或密码错误')
    }

    setLoading(false)
  }

  // GitHub OAuth登录
  const handleOAuthSignIn = async (provider: 'github') => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await signInWithOAuth(provider)

      if (error) {
        console.error('OAuth error:', error)
        let errorMessage = `OAuth登录失败: ${error.message}`

        // 添加更具体的错误说明
        if (error.message.includes('Provider token is missing')) {
          errorMessage = 'GitHub OAuth配置错误：缺少Provider token。请检查GitHub OAuth App的Client Secret配置是否正确。'
        } else if (error.message.includes('redirect_uri_mismatch')) {
          errorMessage = 'GitHub OAuth回调URL不匹配。请检查GitHub OAuth App的Authorization callback URL是否正确设置。'
        }

        setError(errorMessage)
        setLoading(false)
      }
      // OAuth成功时会自动跳转，无需额外处理
    } catch (err: any) {
      console.error('OAuth exception:', err)
      setError(`OAuth登录异常: ${err.message}`)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">登录管理后台</CardTitle>
          <CardDescription className="text-center">
            选择登录方式进入提示词管理系统
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="simple" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="simple">账号密码</TabsTrigger>
              <TabsTrigger value="oauth">GitHub登录</TabsTrigger>
            </TabsList>

            <TabsContent value="simple" className="space-y-4">
              <form onSubmit={handleSimpleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">用户名</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="请输入用户名"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="请输入密码"
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? '登录中...' : '登录'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="oauth" className="space-y-4">
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleOAuthSignIn('github')}
                  disabled={loading}
                  className="w-full"
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHub 登录
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-center text-sm text-muted-foreground w-full">
            <p>GitHub登录需要配置OAuth</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}