import { NextRequest, NextResponse } from 'next/server'
import { getPrompts } from '@/app/actions/prompts'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG: Testing getPrompts function ===')

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '12', 10)
    const tagId = searchParams.get('tagId')
    const search = searchParams.get('search')

    console.log('API Parameters:', { page, limit, tagId, search })

    const result = await getPrompts({
      page,
      limit,
      isPublic: true,
      ...(tagId && { tagId: parseInt(tagId, 10) }),
      ...(search && { search })
    })

    console.log('getPrompts result:', {
      error: result.error,
      promptsLength: result.prompts?.length,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      prompts: result.prompts?.map(p => ({
        id: p.id,
        title: p.title,
        is_public: p.is_public,
        tags: p.tags?.length || 0
      }))
    })

    return NextResponse.json({
      success: !result.error,
      debug: {
        error: result.error,
        promptsLength: result.prompts?.length,
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.currentPage
      },
      prompts: result.prompts || [],
      total: result.total || 0,
      currentPage: result.currentPage || 1,
      totalPages: result.totalPages || 0
    })
  } catch (error) {
    console.error('DEBUG API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}