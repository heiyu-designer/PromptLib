'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { Database } from '@/lib/database'

// Input validation schemas
const createTagSchema = z.object({
  name: z.string().min(1, '标签名称不能为空').max(50, '标签名称不能超过50字符'),
  slug: z.string().min(1, 'URL别名不能为空').max(50, 'URL别名不能超过50字符')
    .regex(/^[a-z0-9-]+$/, 'URL别名只能包含小写字母、数字和连字符'),
  color: z.string().optional().default('blue'),
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
    const { data, error } = await supabaseAdmin
      .from('tags')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching tags:', error)
      return { tags: [], error: error.message }
    }

    return { tags: data || [], error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { tags: [], error: '获取标签时发生错误' }
  }
}

// Get single tag by ID
export async function getTagById(id: number) {
  try {
    const { data, error } = await supabaseAdmin
      .from('tags')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching tag:', error)
      return { tag: null, error: error.message }
    }

    return { tag: data, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { tag: null, error: '获取标签时发生错误' }
  }
}

// Get tag by slug
export async function getTagBySlug(slug: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('tags')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Error fetching tag by slug:', error)
      return { tag: null, error: error.message }
    }

    return { tag: data, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { tag: null, error: '获取标签时发生错误' }
  }
}

// Create new tag
export async function createTag(input: CreateTagInput) {
  try {
    // Validate input
    const validatedData = createTagSchema.parse(input)

    // Check if slug already exists
    const { data: existingTag } = await supabaseAdmin
      .from('tags')
      .select('id')
      .eq('slug', validatedData.slug)
      .single()

    if (existingTag) {
      return { success: false, error: 'URL别名已存在' }
    }

    // Check if name already exists
    const { data: existingName } = await supabaseAdmin
      .from('tags')
      .select('id')
      .eq('name', validatedData.name)
      .single()

    if (existingName) {
      return { success: false, error: '标签名称已存在' }
    }

    const { data, error } = await supabaseAdmin
      .from('tags')
      .insert(validatedData)
      .select()
      .single()

    if (error) {
      console.error('Error creating tag:', error)
      return { success: false, error: error.message }
    }

    // Revalidate cache
    revalidatePath('/admin/tags')
    revalidatePath('/')

    return { success: true, data, error: null }
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
    // Validate input
    const validatedData = updateTagSchema.parse(input)
    const { id, ...updateFields } = validatedData

    // Check if slug already exists (and it's not the current tag)
    if (updateFields.slug) {
      const { data: existingTag } = await supabaseAdmin
        .from('tags')
        .select('id')
        .eq('slug', updateFields.slug)
        .neq('id', id)
        .single()

      if (existingTag) {
        return { success: false, error: 'URL别名已存在' }
      }
    }

    // Check if name already exists (and it's not the current tag)
    if (updateFields.name) {
      const { data: existingName } = await supabaseAdmin
        .from('tags')
        .select('id')
        .eq('name', updateFields.name)
        .neq('id', id)
        .single()

      if (existingName) {
        return { success: false, error: '标签名称已存在' }
      }
    }

    const { data, error } = await supabaseAdmin
      .from('tags')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating tag:', error)
      return { success: false, error: error.message }
    }

    // Revalidate cache
    revalidatePath('/admin/tags')
    revalidatePath('/')

    return { success: true, data, error: null }
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
    // First check if tag is being used by any prompts
    const { data: usage, error: usageError } = await supabaseAdmin
      .from('prompt_tags')
      .select('prompt_id')
      .eq('tag_id', id)
      .limit(1)

    if (usageError) {
      console.error('Error checking tag usage:', usageError)
      return { success: false, error: '检查标签使用情况时发生错误' }
    }

    if (usage && usage.length > 0) {
      return { success: false, error: '无法删除正在被使用的标签' }
    }

    const { error } = await supabaseAdmin
      .from('tags')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting tag:', error)
      return { success: false, error: error.message }
    }

    // Revalidate cache
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
    // First get all tags
    const { data: tags, error: tagsError } = await supabaseAdmin
      .from('tags')
      .select('*')
      .order('name')

    if (tagsError) {
      console.error('Error fetching tags:', tagsError)
      return { tags: [], error: tagsError.message }
    }

    // Then get prompt count for each tag
    const tagsWithCounts = await Promise.all(
      (tags || []).map(async (tag) => {
        const { count, error: countError } = await supabaseAdmin
          .from('prompt_tags')
          .select('prompt_id', { count: 'exact', head: true })
          .eq('tag_id', tag.id)

        return {
          ...tag,
          prompt_count: countError ? 0 : count || 0
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
    // Get tags with stats first
    const { tags, error } = await getTagsWithStats()

    if (error) {
      console.error('Error fetching popular tags:', error)
      return { tags: [], error: error.message }
    }

    // Sort by prompt count and limit
    const sortedTags = tags
      .sort((a, b) => b.prompt_count - a.prompt_count)
      .slice(0, limit)

    return { tags: sortedTags, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { tags: [], error: '获取热门标签时发生错误' }
  }
}