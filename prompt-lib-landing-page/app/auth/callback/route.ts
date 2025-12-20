import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // 详细日志记录所有回调参数
  const allParams = Object.fromEntries(requestUrl.searchParams.entries())
  console.log('=== Auth Callback Debug ===')
  console.log('Full URL:', request.url)
  console.log('All params:', allParams)
  console.log('Code present:', !!code)
  console.log('Code value:', code)
  console.log('Error:', error)
  console.log('Error description:', errorDescription)
  console.log('Environment check:', {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_KEY
  })

  const cookieStore = cookies()

  // 创建Supabase客户端，使用服务器端cookie处理
  const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  })

  // 如果有错误参数，记录并重定向到登录页面
  if (error) {
    console.error('OAuth error returned:', error, errorDescription)
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${error}&error_description=${errorDescription}`)
  }

  // 如果没有code参数，也没有error参数，说明是直接访问
  if (!code) {
    console.log('No code parameter found in callback')
    return NextResponse.redirect(`${requestUrl.origin}/login?error=no_code`)
  }

  try {
    console.log('Attempting to exchange code for session...')

    // 使用code换取session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Failed to exchange code for session:', exchangeError)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=exchange_failed&details=${encodeURIComponent(exchangeError.message)}`)
    }

    console.log('Successfully exchanged code for session:', data.session?.user?.email)

    if (data.user) {
      // 检查用户profile是否存在
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      console.log('Profile check result:', { profile, profileError })

      if (profileError || !profile) {
        console.log('Creating new profile for user:', data.user.email)
        // 为新用户创建profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
            avatar_url: data.user.user_metadata?.avatar_url,
            role: 'user', // OAuth登录默认角色
            status: 'active',
            must_change_password: false
          })

        if (insertError) {
          console.error('Failed to create profile:', insertError)
        } else {
          console.log('Profile created successfully')
        }
      }
    }

    // 获取重定向目标
    const redirectTo = requestUrl.searchParams.get('redirect_to') || '/'
    const redirectUrl = `${requestUrl.origin}${redirectTo}`

    console.log('Redirecting to:', redirectUrl)
    return NextResponse.redirect(redirectUrl)

  } catch (error: any) {
    console.error('Unexpected error in auth callback:', error)
    return NextResponse.redirect(`${requestUrl.origin}/login?error=unexpected_error&details=${encodeURIComponent(error.message)}`)
  }
}