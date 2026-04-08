'use server'

// Server-side database module
// Functions exported from this file are Server Actions

import { query, queryOne } from '@/lib/server-db'
import { revalidatePath } from 'next/cache'

// Database helper functions
export async function getTags() {
  return query<{
    id: number
    name: string
    slug: string
    color: string
    created_at: string
  }>('SELECT * FROM tags ORDER BY name')
}

export async function getPromptsForAdmin() {
  const result = await query<any>(`
    SELECT
      p.*,
      pr.username as author_username,
      pr.avatar_url as author_avatar_url
    FROM prompts p
    LEFT JOIN profiles pr ON p.author_id = pr.id
    ORDER BY p.created_at DESC
  `)

  if (result.error) return { data: [], error: result.error }

  const prompts = await Promise.all(
    (result.data || []).map(async (p) => {
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

  return { data: prompts, error: null }
}

export async function getUsers() {
  return query<{
    id: string
    username: string | null
    avatar_url: string | null
    role: string
    status: string
    must_change_password: boolean
    created_at: string
  }>('SELECT * FROM profiles ORDER BY created_at DESC')
}

export async function getProfiles() {
  return query<{ id: string; username: string }>(
    'SELECT id, username FROM profiles ORDER BY username'
  )
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
  const insertResult = await queryOne<{ id: number }>(`
    INSERT INTO prompts (title, description, content, cover_image_url, is_public, author_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `, [
    prompt.title,
    prompt.description,
    prompt.content,
    prompt.cover_image_url,
    prompt.is_public ?? true,
    prompt.author_id
  ])

  if (insertResult.error) return { error: insertResult.error }

  const promptId = insertResult.data?.id

  if (prompt.tag_ids && prompt.tag_ids.length > 0) {
    for (const tagId of prompt.tag_ids) {
      await query(
        'INSERT INTO prompt_tags (prompt_id, tag_id) VALUES ($1, $2)',
        [promptId, tagId]
      )
    }
  }

  revalidatePath('/admin/prompts')
  revalidatePath('/')

  return { data: { id: promptId }, error: null }
}

export async function updatePrompt(id: number, updates: {
  title?: string
  description?: string
  content?: string
  cover_image_url?: string
  is_public?: boolean
  tag_ids?: number[]
}) {
  const updateParts: string[] = []
  const values: any[] = []
  let i = 1

  if (updates.title !== undefined) {
    updateParts.push(`title = $${i++}`)
    values.push(updates.title)
  }
  if (updates.description !== undefined) {
    updateParts.push(`description = $${i++}`)
    values.push(updates.description)
  }
  if (updates.content !== undefined) {
    updateParts.push(`content = $${i++}`)
    values.push(updates.content)
  }
  if (updates.cover_image_url !== undefined) {
    updateParts.push(`cover_image_url = $${i++}`)
    values.push(updates.cover_image_url)
  }
  if (updates.is_public !== undefined) {
    updateParts.push(`is_public = $${i++}`)
    values.push(updates.is_public)
  }

  if (updateParts.length > 0) {
    values.push(id)
    const result = await query(
      `UPDATE prompts SET ${updateParts.join(', ')} WHERE id = $${i}`,
      values
    )
    if (result.error) return { error: result.error }
  }

  if (updates.tag_ids !== undefined) {
    await query('DELETE FROM prompt_tags WHERE prompt_id = $1', [id])
    for (const tagId of updates.tag_ids) {
      await query(
        'INSERT INTO prompt_tags (prompt_id, tag_id) VALUES ($1, $2)',
        [id, tagId]
      )
    }
  }

  revalidatePath('/admin/prompts')
  revalidatePath(`/prompts/${id}`)
  revalidatePath('/')

  return { data: { id }, error: null }
}

export async function deletePrompt(id: number) {
  const result = await query('DELETE FROM prompts WHERE id = $1', [id])
  revalidatePath('/admin/prompts')
  revalidatePath('/')
  return result
}

export async function updateProfile(id: string, updates: {
  username?: string
  role?: string
  status?: string
}) {
  const updateParts: string[] = []
  const values: any[] = []
  let i = 1

  if (updates.username !== undefined) {
    updateParts.push(`username = $${i++}`)
    values.push(updates.username)
  }
  if (updates.role !== undefined) {
    updateParts.push(`role = $${i++}`)
    values.push(updates.role)
  }
  if (updates.status !== undefined) {
    updateParts.push(`status = $${i++}`)
    values.push(updates.status)
  }

  if (updateParts.length === 0) return { data: null, error: null }

  values.push(id)
  const result = await query(
    `UPDATE profiles SET ${updateParts.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  )

  revalidatePath('/admin/users')

  return result
}

export async function createProfile(profile: {
  username: string
  role: 'admin' | 'user'
}) {
  const userId = crypto.randomUUID()
  const result = await query<{ id: string }>(
    'INSERT INTO profiles (id, username, role, status) VALUES ($1, $2, $3, $4) RETURNING id',
    [userId, profile.username, profile.role, 'active']
  )

  revalidatePath('/admin/users')

  return result
}

// 兼容导出 - 供客户端组件使用（但不包含任何实际功能）
export const supabase = {}
export const supabaseAdmin = {}
