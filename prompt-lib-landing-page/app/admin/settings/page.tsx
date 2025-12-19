'use client'

import { useState, useEffect } from 'react'
import { Save, Settings as SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth, useIsAdmin } from '@/components/auth/auth-provider'
import { getSettings, updateSettings } from '@/app/actions/copy'

export default function SettingsPage() {
  const isAdmin = useIsAdmin()
  const [settings, setSettings] = useState({
    copy_success_message: '',
    site_name: '',
    site_description: '',
    allow_public_submissions: false,
    require_approval: false
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin) {
      return
    }

    loadSettings()
  }, [isAdmin])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const result = await getSettings()
      if (result.error) {
        setError(result.error)
      } else {
        setSettings(result.settings)
      }
    } catch (err) {
      setError('加载设置时发生错误')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const result = await updateSettings(settings)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('设置已成功保存')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError('保存设置时发生错误')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            您没有权限访问此页面
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <SettingsIcon className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">加载设置中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">系统设置</h1>
        <p className="text-muted-foreground">管理网站的配置和功能设置</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* 基本设置 */}
        <Card>
          <CardHeader>
            <CardTitle>基本设置</CardTitle>
            <CardDescription>
              配置网站的基本信息和显示选项
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site_name">网站名称</Label>
              <Input
                id="site_name"
                value={settings.site_name}
                onChange={(e) => handleInputChange('site_name', e.target.value)}
                placeholder="PromptLib"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_description">网站描述</Label>
              <Textarea
                id="site_description"
                value={settings.site_description}
                onChange={(e) => handleInputChange('site_description', e.target.value)}
                placeholder="发现高质量 AI 提示词"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* 复制功能设置 */}
        <Card>
          <CardHeader>
            <CardTitle>复制功能设置</CardTitle>
            <CardDescription>
              配置复制成功时显示的消息和提示
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="copy_success_message">复制成功消息</Label>
              <Textarea
                id="copy_success_message"
                value={settings.copy_success_message}
                onChange={(e) => handleInputChange('copy_success_message', e.target.value)}
                placeholder="✅ 复制成功！关注公众号回复[Coze]获取自动化版"
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                用户复制提示词成功后显示的消息，支持 Markdown 格式
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 用户提交设置 */}
        <Card>
          <CardHeader>
            <CardTitle>用户提交设置</CardTitle>
            <CardDescription>
              控制用户是否可以提交提示词以及审核流程
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>允许公开提交</Label>
                <p className="text-sm text-muted-foreground">
                  允许普通用户提交提示词到网站
                </p>
              </div>
              <Switch
                checked={settings.allow_public_submissions}
                onCheckedChange={(checked) => handleInputChange('allow_public_submissions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>需要审核</Label>
                <p className="text-sm text-muted-foreground">
                  用户提交的提示词需要管理员审核后才能公开显示
                </p>
              </div>
              <Switch
                checked={settings.require_approval}
                onCheckedChange={(checked) => handleInputChange('require_approval', checked)}
                disabled={!settings.allow_public_submissions}
              />
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <SettingsIcon className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存设置
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}