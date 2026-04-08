import { NextRequest, NextResponse } from 'next/server'
import { getPromptsForAdmin, getTags, createPrompt, updatePrompt, deletePrompt } from '@/lib/supabase'

export async function GET() {
  try {
    const [promptsResult, tagsResult] = await Promise.all([
      getPromptsForAdmin(),
      getTags()
    ])

    return NextResponse.json({
      prompts: promptsResult.data || [],
      tags: tagsResult.data || [],
      error: promptsResult.error || tagsResult.error
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await createPrompt(body)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    const result = await updatePrompt(id, updates)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }
    const result = await deletePrompt(parseInt(id, 10))
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 })
  }
}
