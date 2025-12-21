'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { Database } from '@/lib/database'

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
      const { data: tagRelations, error: tagError } = await supabaseAdmin
        .from('prompt_tags')
        .select('prompt_id')
        .eq('tag_id', params.tagId)

      if (tagError) {
        console.error('Error fetching tag relations:', tagError)
        return { prompts: [], total: 0, error: tagError.message }
      }

      filteredPromptIds = tagRelations?.map(relation => relation.prompt_id) || []

      // If no prompts found for this tag, return empty result
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

    let query = supabaseAdmin
      .from('prompts')
      .select(`
        *,
        author:profiles(username, avatar_url),
        prompt_tags(
          tags(id, name, slug, color)
        )
      `, { count: 'exact' })

    // Filter by public status
    if (params?.isPublic !== undefined) {
      query = query.eq('is_public', params.isPublic)
    }

    // Apply tag filter if we have filtered IDs
    if (filteredPromptIds.length > 0) {
      query = query.in('id', filteredPromptIds)
    }

    if (params?.search) {
      query = query.or(`title.ilike.%${params.search}%,content.ilike.%${params.search}%`)
    }

    // Apply sorting
    const sortBy = params?.sortBy || 'created_at'
    const sortOrder = params?.sortOrder || 'desc'
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching prompts:', error)
      return { prompts: [], total: 0, error: error.message }
    }

    // Transform the data to match our expected format
    const transformedData = data?.map(prompt => ({
      ...prompt,
      tags: prompt.prompt_tags?.map(pt => pt.tags).filter(Boolean)
    })) || []

    return {
      prompts: transformedData,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
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
    const { data, error } = await supabaseAdmin
      .from('prompts')
      .select(`
        *,
        author:profiles(username, avatar_url),
        prompt_tags(
          tags(id, name, slug, color)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching prompt:', error)
      return { prompt: null, error: error.message }
    }

    // Transform tags to match expected format
    const transformedData = data ? {
      ...data,
      tags: data.prompt_tags?.map(pt => pt.tags).filter(Boolean)
    } : null

    return { prompt: transformedData, error: null }
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

    // First create the prompt
    const { data, error } = await supabaseAdmin
      .from('prompts')
      .insert({
        title: validatedData.title,
        description: validatedData.description,
        content: validatedData.content,
        cover_image_url: validatedData.cover_image_url,
        is_public: validatedData.is_public,
        author_id: authorId,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating prompt:', error)
      return { success: false, error: error.message }
    }

    // Then create the tag relationships if any
    if (validatedData.tag_ids && validatedData.tag_ids.length > 0) {
      const tagRelations = validatedData.tag_ids.map(tagId => ({
        prompt_id: data.id,
        tag_id: tagId
      }))

      const { error: tagError } = await supabaseAdmin
        .from('prompt_tags')
        .insert(tagRelations)

      if (tagError) {
        // Rollback the prompt creation if tag insertion fails
        await supabaseAdmin.from('prompts').delete().eq('id', data.id)
        return { success: false, error: '创建标签关联失败: ' + tagError.message }
      }
    }

    // Revalidate the prompts page cache
    revalidatePath('/')
    revalidatePath('/admin/prompts')

    return { success: true, data, error: null }
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

    // Update the prompt
    const { data, error } = await supabaseAdmin
      .from('prompts')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating prompt:', error)
      return { success: false, error: error.message }
    }

    // Update tag relationships if provided
    if (tag_ids !== undefined) {
      // Delete existing tag relationships
      await supabaseAdmin
        .from('prompt_tags')
        .delete()
        .eq('prompt_id', id)

      // Create new tag relationships if any
      if (tag_ids.length > 0) {
        const tagRelations = tag_ids.map(tagId => ({
          prompt_id: id,
          tag_id: tagId
        }))

        const { error: tagError } = await supabaseAdmin
          .from('prompt_tags')
          .insert(tagRelations)

        if (tagError) {
          return { success: false, error: '更新标签关联失败: ' + tagError.message }
        }
      }
    }

    // Revalidate cache
    revalidatePath('/')
    revalidatePath(`/prompts/${id}`)
    revalidatePath('/admin/prompts')

    return { success: true, data, error: null }
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
    const { error } = await supabaseAdmin
      .from('prompts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting prompt:', error)
      return { success: false, error: error.message }
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
    const { error } = await supabaseAdmin.rpc('increment_view_count', {
      prompt_id: id
    })

    if (error) {
      console.error('Error incrementing view count:', error)
      // Fallback to manual increment if RPC function doesn't exist
      // First fetch current count, then increment
      const { data: currentPrompt } = await supabaseAdmin
        .from('prompts')
        .select('view_count')
        .eq('id', id)
        .single()

      if (currentPrompt) {
        await supabaseAdmin
          .from('prompts')
          .update({ view_count: (currentPrompt.view_count || 0) + 1 })
          .eq('id', id)
      }
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
    const { error } = await supabaseAdmin
      .from('prompts')
      .update({ is_public: !isPublic })
      .eq('id', id)

    if (error) {
      console.error('Error toggling prompt status:', error)
      return { success: false, error: error.message }
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