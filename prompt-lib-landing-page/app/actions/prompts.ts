'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { query, queryOne } from '@/lib/server-db'

// Input validation schemas
const createPromptSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200字符'),
  description: z.string().max(500, '描述不能超过500字符').optional(),
  content: z.string().min(10, '内容至少需要10字符'),
  cover_image_url: z.string().url('请输入有效的图片URL').optional().nullable(),
  is_public: z.boolean().default(true),
  tag_ids: z.array(z.number()).optional().default([]),
})

const updatePromptSchema = z.object({
  id: z.number(),
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200字符').optional(),
  description: z.string().max(500, '描述不能超过500字符').optional().nullable(),
  content: z.string().min(10, '内容至少需要10字符').optional(),
  cover_image_url: z.string().url('请输入有效的图片URL').optional().nullable(),
  is_public: z.boolean().optional(),
  tag_ids: z.array(z.number()).optional(),
})

// Types
type CreatePromptInput = z.infer<typeof createPromptSchema>
type UpdatePromptInput = z.infer<typeof updatePromptSchema>

// Get all prompts with pagination and filtering
export async function getPrompts(params?: {
  page?: number
  limit?: number
  tagId?: number
  search?: string
  sortBy?: 'created_at' | 'title' | 'view_count'
  sortOrder?: 'asc' | 'desc'
  isPublic?: boolean
}) {
  try {
    const page = params?.page || 1
    const limit = params?.limit || 20
    const offset = (page - 1) * limit

    let filteredPromptIds: number[] = []

    // If filtering by tag, get matching prompt IDs first
    if (params?.tagId) {
      const result = await query<{ prompt_id: number }>(
        'SELECT prompt_id FROM prompt_tags WHERE tag_id = $1',
        [params.tagId]
      )

      if (result.error) {
        console.error('Error fetching tag relations:', result.error)
        return { prompts: [], total: 0, error: String(result.error) }
      }

      filteredPromptIds = result.data?.map(r => r.prompt_id) || []

      if (filteredPromptIds.length === 0) {
        return {
          prompts: [],
          total: 0,
          totalPages: 0,
          currentPage: page,
          error: null
        }
      }
    }

    // Build the main query
    let whereConditions: string[] = []
    let queryParams: any[] = []
    let paramIndex = 1

    // Filter by public status
    if (params?.isPublic !== undefined) {
      whereConditions.push(`is_public = $${paramIndex}`)
      queryParams.push(params.isPublic)
      paramIndex++
    }

    // Apply tag filter if we have filtered IDs
    if (filteredPromptIds.length > 0) {
      whereConditions.push(`id = ANY($${paramIndex}::int[])`)
      queryParams.push(filteredPromptIds)
      paramIndex++
    }

    // Apply search filter
    if (params?.search) {
      whereConditions.push(`(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`)
      queryParams.push(`%${params.search}%`)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''

    // Get total count
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM prompts ${whereClause}`,
      queryParams
    )

    const total = parseInt(countResult.data?.[0]?.count || '0', 10)

    // Get prompts with related data
    const sortBy = params?.sortBy || 'created_at'
    const sortOrder = params?.sortOrder || 'DESC'
    const orderDirection = sortOrder === 'asc' ? 'ASC' : 'DESC'

    const promptsQuery = `
      SELECT
        p.*,
        pr.username as author_username,
        pr.avatar_url as author_avatar_url
      FROM prompts p
      LEFT JOIN profiles pr ON p.author_id = pr.id
      ${whereClause}
      ORDER BY p.${sortBy} ${orderDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    queryParams.push(limit, offset)

    const promptsResult = await query<any>(promptsQuery, queryParams)

    if (promptsResult.error) {
      console.error('Error fetching prompts:', promptsResult.error)
      return { prompts: [], total: 0, error: String(promptsResult.error) }
    }

    // Fetch tags for each prompt
    const prompts = await Promise.all(
      (promptsResult.data || []).map(async (p) => {
        // Get tags for this prompt
        const tagsResult = await query<{ id: number; name: string; slug: string; color: string }>(`
          SELECT t.id, t.name, t.slug, t.color
          FROM tags t
          INNER JOIN prompt_tags pt ON t.id = pt.tag_id
          WHERE pt.prompt_id = $1
        `, [p.id])

        return {
          ...p,
          tags: tagsResult.data || [],
          author: p.author_username ? {
            username: p.author_username,
            avatar_url: p.author_avatar_url
          } : null
        }
      })
    )

    return {
      prompts,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      error: null
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { prompts: [], total: 0, error: '获取提示词时发生错误' }
  }
}

// Get single prompt by ID
export async function getPromptById(id: number) {
  try {
    // Get prompt with author info
    const promptResult = await queryOne<any>(`
      SELECT
        p.*,
        pr.username as author_username,
        pr.avatar_url as author_avatar_url
      FROM prompts p
      LEFT JOIN profiles pr ON p.author_id = pr.id
      WHERE p.id = $1
    `, [id])

    if (promptResult.error || !promptResult.data) {
      console.error('Error fetching prompt:', promptResult.error)
      return { prompt: null, error: '提示词不存在' }
    }

    // Get tags for this prompt
    const tagsResult = await query<{ id: number; name: string; slug: string; color: string }>(`
      SELECT t.id, t.name, t.slug, t.color
      FROM tags t
      INNER JOIN prompt_tags pt ON t.id = pt.tag_id
      WHERE pt.prompt_id = $1
    `, [id])

    return {
      prompt: {
        ...promptResult.data,
        tags: tagsResult.data || [],
        author: promptResult.data.author_username ? {
          username: promptResult.data.author_username,
          avatar_url: promptResult.data.author_avatar_url
        } : null
      },
      error: null
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { prompt: null, error: '获取提示词时发生错误' }
  }
}

// Create new prompt
export async function createPrompt(input: CreatePromptInput, authorId: string) {
  try {
    // Validate input
    const validatedData = createPromptSchema.parse(input)

    // Create the prompt
    const insertResult = await queryOne<{ id: number }>(`
      INSERT INTO prompts (title, description, content, cover_image_url, is_public, author_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [
      validatedData.title,
      validatedData.description,
      validatedData.content,
      validatedData.cover_image_url,
      validatedData.is_public,
      authorId
    ])

    if (insertResult.error) {
      console.error('Error creating prompt:', insertResult.error)
      return { success: false, error: String(insertResult.error) }
    }

    const promptId = insertResult.data?.id

    // Create tag relationships if any
    if (validatedData.tag_ids && validatedData.tag_ids.length > 0) {
      for (const tagId of validatedData.tag_ids) {
        await query(
          'INSERT INTO prompt_tags (prompt_id, tag_id) VALUES ($1, $2)',
          [promptId, tagId]
        )
      }
    }

    // Revalidate the prompts page cache
    revalidatePath('/')
    revalidatePath('/admin/prompts')

    return { success: true, data: { id: promptId }, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: '输入验证失败: ' + error.errors[0].message }
    }
    console.error('Unexpected error:', error)
    return { success: false, error: '创建提示词时发生错误' }
  }
}

// Update existing prompt
export async function updatePrompt(input: UpdatePromptInput) {
  try {
    // Validate input
    const validatedData = updatePromptSchema.parse(input)
    const { id, tag_ids, ...updateFields } = validatedData

    // Build update query
    const updateParts: string[] = []
    const updateValues: any[] = []
    let paramIndex = 1

    if (updateFields.title !== undefined) {
      updateParts.push(`title = $${paramIndex}`)
      updateValues.push(updateFields.title)
      paramIndex++
    }
    if (updateFields.description !== undefined) {
      updateParts.push(`description = $${paramIndex}`)
      updateValues.push(updateFields.description)
      paramIndex++
    }
    if (updateFields.content !== undefined) {
      updateParts.push(`content = $${paramIndex}`)
      updateValues.push(updateFields.content)
      paramIndex++
    }
    if (updateFields.cover_image_url !== undefined) {
      updateParts.push(`cover_image_url = $${paramIndex}`)
      updateValues.push(updateFields.cover_image_url)
      paramIndex++
    }
    if (updateFields.is_public !== undefined) {
      updateParts.push(`is_public = $${paramIndex}`)
      updateValues.push(updateFields.is_public)
      paramIndex++
    }

    if (updateParts.length > 0) {
      updateValues.push(id)
      const updateResult = await query(
        `UPDATE prompts SET ${updateParts.join(', ')} WHERE id = $${paramIndex}`,
        updateValues
      )

      if (updateResult.error) {
        console.error('Error updating prompt:', updateResult.error)
        return { success: false, error: String(updateResult.error) }
      }
    }

    // Update tag relationships if provided
    if (tag_ids !== undefined) {
      // Delete existing tag relationships
      await query('DELETE FROM prompt_tags WHERE prompt_id = $1', [id])

      // Create new tag relationships if any
      if (tag_ids.length > 0) {
        for (const tagId of tag_ids) {
          await query(
            'INSERT INTO prompt_tags (prompt_id, tag_id) VALUES ($1, $2)',
            [id, tagId]
          )
        }
      }
    }

    // Revalidate cache
    revalidatePath('/')
    revalidatePath(`/prompts/${id}`)
    revalidatePath('/admin/prompts')

    return { success: true, data: { id }, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: '输入验证失败: ' + error.errors[0].message }
    }
    console.error('Unexpected error:', error)
    return { success: false, error: '更新提示词时发生错误' }
  }
}

// Delete prompt
export async function deletePrompt(id: number) {
  try {
    const result = await query('DELETE FROM prompts WHERE id = $1', [id])

    if (result.error) {
      console.error('Error deleting prompt:', result.error)
      return { success: false, error: String(result.error) }
    }

    // Revalidate cache
    revalidatePath('/')
    revalidatePath('/admin/prompts')

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: '删除提示词时发生错误' }
  }
}

// Increment view count
export async function incrementViewCount(id: number) {
  try {
    // Try RPC function first, fallback to manual update
    const result = await query(
      'UPDATE prompts SET view_count = view_count + 1 WHERE id = $1',
      [id]
    )

    if (result.error) {
      console.error('Error incrementing view count:', result.error)
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: '更新浏览量时发生错误' }
  }
}

// Toggle prompt public status
export async function togglePromptStatus(id: number, isPublic: boolean) {
  try {
    const result = await query(
      'UPDATE prompts SET is_public = $1 WHERE id = $2',
      [!isPublic, id]
    )

    if (result.error) {
      console.error('Error toggling prompt status:', result.error)
      return { success: false, error: String(result.error) }
    }

    // Revalidate cache
    revalidatePath('/')
    revalidatePath('/admin/prompts')

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: '更新提示词状态时发生错误' }
  }
}
