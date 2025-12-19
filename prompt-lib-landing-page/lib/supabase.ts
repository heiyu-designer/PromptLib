import { createClient } from '@supabase/supabase-js'
import { createServerComponentClient } from '@supabase/ssr'
import { Database } from './database'

// Create a single Supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!

// Single client for all requests (v3 simplification)
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Admin client with elevated permissions (use service_role key if needed)
export const supabaseAdmin = supabase

// Helper functions for common database operations

// User profile operations
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  // Fetch user profile with role information
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { ...user, profile }
}

export async function updateUserProfile(userId: string, updates: Partial<Database['public']['Tables']['profiles']['Update']>) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  return { data, error }
}

// Prompt operations
export async function getPrompts(params?: {
  limit?: number
  offset?: number
  tagId?: number
  search?: string
  sortBy?: 'created_at' | 'title' | 'view_count'
  sortOrder?: 'asc' | 'desc'
}) {
  let query = supabase
    .from('prompts')
    .select(`
      *,
      author:profiles(username, avatar_url),
      prompt_tags(
        tags(id, name, slug, color)
      )
    `)
    .eq('is_public', true)

  // Apply filters
  if (params?.tagId) {
    query = query.eq('prompt_tags.tag_id', params.tagId)
  }

  if (params?.search) {
    query = query.or(`title.ilike.%${params.search}%,content.ilike.%${params.search}%`)
  }

  // Apply sorting
  const sortBy = params?.sortBy || 'created_at'
  const sortOrder = params?.sortOrder || 'desc'
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // Apply pagination
  if (params?.limit) {
    query = query.limit(params.limit)
  }
  if (params?.offset) {
    query = query.offset(params.offset)
  }

  const { data, error } = await query

  // Transform the data to match our expected format
  const transformedData = data?.map(prompt => ({
    ...prompt,
    tags: prompt.prompt_tags?.map(pt => pt.tags).filter(Boolean)
  }))

  return { data: transformedData, error }
}

export async function getPromptById(id: number) {
  const { data, error } = await supabase
    .from('prompts')
    .select(`
      *,
      author:profiles(username, avatar_url),
      prompt_tags(
        tags(id, name, slug, color)
      )
    `)
    .eq('id', id)
    .eq('is_public', true)
    .single()

  if (data) {
    // Transform tags to match expected format
    const transformedData = {
      ...data,
      tags: data.prompt_tags?.map(pt => pt.tags).filter(Boolean)
    }
    return { data: transformedData, error }
  }

  return { data, error }
}

export async function createPrompt(prompt: {
  title: string
  description?: string
  content: string
  cover_image_url?: string
  is_public?: boolean
  author_id: string
  tag_ids?: number[]
}) {
  // First create the prompt
  const { data, error } = await supabaseAdmin
    .from('prompts')
    .insert({
      title: prompt.title,
      description: prompt.description,
      content: prompt.content,
      cover_image_url: prompt.cover_image_url,
      is_public: prompt.is_public ?? true,
      author_id: prompt.author_id,
    })
    .select()
    .single()

  if (error || !data || !prompt.tag_ids?.length) {
    return { data, error }
  }

  // Then create the tag relationships
  const tagRelations = prompt.tag_ids.map(tagId => ({
    prompt_id: data.id,
    tag_id: tagId
  }))

  const { error: tagError } = await supabaseAdmin
    .from('prompt_tags')
    .insert(tagRelations)

  if (tagError) {
    // Rollback the prompt creation if tag insertion fails
    await supabaseAdmin.from('prompts').delete().eq('id', data.id)
    return { data: null, error: tagError }
  }

  return { data, error: null }
}

export async function updatePrompt(id: number, updates: {
  title?: string
  description?: string
  content?: string
  cover_image_url?: string
  is_public?: boolean
  tag_ids?: number[]
}) {
  // Update the prompt
  const { data, error } = await supabaseAdmin
    .from('prompts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { data, error }
  }

  // Update tag relationships if provided
  if (updates.tag_ids) {
    // Delete existing tag relationships
    await supabaseAdmin
      .from('prompt_tags')
      .delete()
      .eq('prompt_id', id)

    // Create new tag relationships
    if (updates.tag_ids.length > 0) {
      const tagRelations = updates.tag_ids.map(tagId => ({
        prompt_id: id,
        tag_id: tagId
      }))

      const { error: tagError } = await supabaseAdmin
        .from('prompt_tags')
        .insert(tagRelations)

      if (tagError) {
        return { data: null, error: tagError }
      }
    }
  }

  return { data, error: null }
}

export async function deletePrompt(id: number) {
  const { error } = await supabaseAdmin
    .from('prompts')
    .delete()
    .eq('id', id)

  return { error }
}

// Tag operations
export async function getTags() {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name')

  return { data, error }
}

export async function createTag(tag: {
  name: string
  slug: string
  color?: string
}) {
  const { data, error } = await supabaseAdmin
    .from('tags')
    .insert(tag)
    .select()
    .single()

  return { data, error }
}

export async function updateTag(id: number, updates: Partial<Database['public']['Tables']['tags']['Update']>) {
  const { data, error } = await supabaseAdmin
    .from('tags')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

export async function deleteTag(id: number) {
  // First check if tag is being used by any prompts
  const { data: usage } = await supabaseAdmin
    .from('prompt_tags')
    .select('prompt_id')
    .eq('tag_id', id)
    .limit(1)

  if (usage && usage.length > 0) {
    return { error: new Error('Cannot delete tag that is in use by prompts') }
  }

  const { error } = await supabaseAdmin
    .from('tags')
    .delete()
    .eq('id', id)

  return { error }
}

// Analytics operations
export async function incrementViewCount(promptId: number) {
  const { error } = await supabase.rpc('increment_view_count', {
    prompt_id: promptId
  })

  return { error }
}

// User management (admin only)
export async function getUsers() {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function banUser(userId: string) {
  return updateUserProfile(userId, { status: 'banned' })
}

export async function unbanUser(userId: string) {
  return updateUserProfile(userId, { status: 'active' })
}

export async function resetUserPassword(userId: string) {
  // This would typically involve sending a password reset email
  // For now, we'll just set the must_change_password flag
  return updateUserProfile(userId, {
    must_change_password: true
  })
}