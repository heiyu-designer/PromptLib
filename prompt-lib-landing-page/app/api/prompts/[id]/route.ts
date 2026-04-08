import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/server-db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const promptId = parseInt(id, 10)

    if (isNaN(promptId)) {
      return NextResponse.json({ error: '无效的提示词ID' }, { status: 400 })
    }

    // 获取提示词详情
    const promptResult = await queryOne<any>(`
      SELECT
        p.*,
        pr.username as author_username,
        pr.role as author_role
      FROM prompts p
      LEFT JOIN profiles pr ON p.author_id = pr.id
      WHERE p.id = $1 AND p.is_public = true
    `, [promptId])

    if (promptResult.error || !promptResult.data) {
      return NextResponse.json({ error: '提示词不存在或未公开' }, { status: 404 })
    }

    // 获取标签
    const tagsResult = await query<{ id: number; name: string; slug: string; color: string }>(`
      SELECT t.id, t.name, t.slug, t.color
      FROM tags t
      INNER JOIN prompt_tags pt ON t.id = pt.tag_id
      WHERE pt.prompt_id = $1
    `, [promptId])

    const prompt = {
      ...promptResult.data,
      tags: tagsResult.data || [],
      profiles: promptResult.data.author_username ? {
        username: promptResult.data.author_username,
        role: promptResult.data.author_role
      } : null
    }

    // 增加浏览次数
    await query(
      'UPDATE prompts SET view_count = COALESCE(view_count, 0) + 1 WHERE id = $1',
      [promptId]
    )

    return NextResponse.json({ data: prompt, error: null })
  } catch (error) {
    console.error('获取提示词详情失败:', error)
    return NextResponse.json({ error: '获取提示词详情失败' }, { status: 500 })
  }
}
