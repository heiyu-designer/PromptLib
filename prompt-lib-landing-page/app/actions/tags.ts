'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { query } from '@/lib/server-db'

// Input validation schemas
const createTagSchema = z.object({
  name: z.string().min(1, '标签名称不能为空').max(50, '标签名称不能超过50字符'),
  slug: z.string().min(1, 'URL别名不能为空').max(50, 'URL别名不能超过50字符')
    .regex(/^[a-z0-9-]+$/, 'URL别名只能包含小写字母、数字和连字符'),
  color: z.string().optional(),
})

const updateTagSchema = z.object({
  id: z.number(),
  name: z.string().min(1, '标签名称不能为空').max(50, '标签名称不能超过50字符').optional(),
  slug: z.string().min(1, 'URL别名不能为空').max(50, 'URL别名不能超过50字符')
    .regex(/^[a-z0-9-]+$/, 'URL别名只能包含小写字母、数字和连字符').optional(),
  color: z.string().optional(),
})

// Types
type CreateTagInput = z.infer<typeof createTagSchema>
type UpdateTagInput = z.infer<typeof updateTagSchema>

// Get all tags
export async function getTags() {
  try {
    const result = await query<{
      id: number
      name: string
      slug: string
      color: string
      created_at: string
    }>('SELECT * FROM tags ORDER BY name')

    if (result.error) {
      console.error('Error fetching tags:', result.error)
      return { tags: [], error: String(result.error) }
    }

    return { tags: result.data || [], error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { tags: [], error: '获取标签时发生错误' }
  }
}

// Get single tag by ID
export async function getTagById(id: number) {
  try {
    const result = await query<{
      id: number
      name: string
      slug: string
      color: string
      created_at: string
    }>('SELECT * FROM tags WHERE id = $1', [id])

    if (result.error) {
      console.error('Error fetching tag:', result.error)
      return { tag: null, error: String(result.error) }
    }

    return { tag: result.data?.[0] || null, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { tag: null, error: '获取标签时发生错误' }
  }
}

// Get tag by slug
export async function getTagBySlug(slug: string) {
  try {
    const result = await query<{
      id: number
      name: string
      slug: string
      color: string
      created_at: string
    }>('SELECT * FROM tags WHERE slug = $1', [slug])

    if (result.error) {
      console.error('Error fetching tag by slug:', result.error)
      return { tag: null, error: String(result.error) }
    }

    return { tag: result.data?.[0] || null, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { tag: null, error: '获取标签时发生错误' }
  }
}

// Create new tag
export async function createTag(input: CreateTagInput) {
  try {
    const validatedData = createTagSchema.parse(input)

    // Check if slug already exists
    const existingSlug = await query('SELECT id FROM tags WHERE slug = $1', [validatedData.slug])
    if (existingSlug.data && existingSlug.data.length > 0) {
      return { success: false, error: 'URL别名已存在' }
    }

    // Check if name already exists
    const existingName = await query('SELECT id FROM tags WHERE name = $1', [validatedData.name])
    if (existingName.data && existingName.data.length > 0) {
      return { success: false, error: '标签名称已存在' }
    }

    const result = await query<{ id: number }>(
      'INSERT INTO tags (name, slug, color) VALUES ($1, $2, $3) RETURNING *',
      [validatedData.name, validatedData.slug, validatedData.color || 'blue']
    )

    if (result.error) {
      console.error('Error creating tag:', result.error)
      return { success: false, error: String(result.error) }
    }

    revalidatePath('/admin/tags')
    revalidatePath('/')

    return { success: true, data: result.data?.[0], error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: '输入验证失败: ' + error.errors[0].message }
    }
    console.error('Unexpected error:', error)
    return { success: false, error: '创建标签时发生错误' }
  }
}

// Update existing tag
export async function updateTag(input: UpdateTagInput) {
  try {
    const validatedData = updateTagSchema.parse(input)
    const { id, ...updateFields } = validatedData

    // Check if slug already exists (and it's not the current tag)
    if (updateFields.slug) {
      const existingSlug = await query(
        'SELECT id FROM tags WHERE slug = $1 AND id != $2',
        [updateFields.slug, id]
      )
      if (existingSlug.data && existingSlug.data.length > 0) {
        return { success: false, error: 'URL别名已存在' }
      }
    }

    // Check if name already exists (and it's not the current tag)
    if (updateFields.name) {
      const existingName = await query(
        'SELECT id FROM tags WHERE name = $1 AND id != $2',
        [updateFields.name, id]
      )
      if (existingName.data && existingName.data.length > 0) {
        return { success: false, error: '标签名称已存在' }
      }
    }

    const updateParts: string[] = []
    const values: any[] = []
    let i = 1

    if (updateFields.name) {
      updateParts.push(`name = $${i++}`)
      values.push(updateFields.name)
    }
    if (updateFields.slug) {
      updateParts.push(`slug = $${i++}`)
      values.push(updateFields.slug)
    }
    if (updateFields.color) {
      updateParts.push(`color = $${i++}`)
      values.push(updateFields.color)
    }

    if (updateParts.length === 0) {
      return { success: true, data: null, error: null }
    }

    values.push(id)
    const result = await query(
      `UPDATE tags SET ${updateParts.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    )

    if (result.error) {
      console.error('Error updating tag:', result.error)
      return { success: false, error: String(result.error) }
    }

    revalidatePath('/admin/tags')
    revalidatePath('/')

    return { success: true, data: result.data?.[0], error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: '输入验证失败: ' + error.errors[0].message }
    }
    console.error('Unexpected error:', error)
    return { success: false, error: '更新标签时发生错误' }
  }
}

// Delete tag
export async function deleteTag(id: number) {
  try {
    // Check if tag is being used
    const usage = await query('SELECT prompt_id FROM prompt_tags WHERE tag_id = $1 LIMIT 1', [id])
    if (usage.data && usage.data.length > 0) {
      return { success: false, error: '无法删除正在被使用的标签' }
    }

    const result = await query('DELETE FROM tags WHERE id = $1', [id])

    if (result.error) {
      console.error('Error deleting tag:', result.error)
      return { success: false, error: String(result.error) }
    }

    revalidatePath('/admin/tags')
    revalidatePath('/')

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: '删除标签时发生错误' }
  }
}

// Get tags with prompt count
export async function getTagsWithStats() {
  try {
    const tagsResult = await query<{
      id: number
      name: string
      slug: string
      color: string
      created_at: string
    }>('SELECT * FROM tags ORDER BY name')

    if (tagsResult.error) {
      console.error('Error fetching tags:', tagsResult.error)
      return { tags: [], error: String(tagsResult.error) }
    }

    const tagsWithCounts = await Promise.all(
      (tagsResult.data || []).map(async (tag) => {
        const countResult = await query<{ count: string }>(
          'SELECT COUNT(*) as count FROM prompt_tags WHERE tag_id = $1',
          [tag.id]
        )
        return {
          ...tag,
          prompt_count: parseInt(countResult.data?.[0]?.count || '0', 10)
        }
      })
    )

    return { tags: tagsWithCounts, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { tags: [], error: '获取标签统计时发生错误' }
  }
}

// Popular tags (by usage)
export async function getPopularTags(limit = 10) {
  try {
    const { tags, error } = await getTagsWithStats()

    if (error) {
      return { tags: [], error }
    }

    const sortedTags = tags
      .sort((a, b) => b.prompt_count - a.prompt_count)
      .slice(0, limit)

    return { tags: sortedTags, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { tags: [], error: '获取热门标签时发生错误' }
  }
}
