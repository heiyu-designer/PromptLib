import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!

export async function POST(request: NextRequest) {
  try {
    console.log('=== API OAuth Test ===')
    console.log('Environment:', {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_KEY,
      keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_KEY?.substring(0, 20)
    })

    const supabase = createClient<Database>(supabaseUrl, supabaseKey)

    // 测试获取OAuth URL
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('supabase.co', 'localhost:30001')}/auth/callback`,
        skipBrowserRedirect: true,
      },
    })

    console.log('OAuth URL result:', { data, error })

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      })
    }

    return NextResponse.json({
      success: true,
      data: data,
      url: data.url,
      message: 'OAuth URL generated successfully'
    })

  } catch (error: any) {
    console.error('API OAuth test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    })
  }
}