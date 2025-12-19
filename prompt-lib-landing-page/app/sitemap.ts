import { MetadataRoute } from 'next'
import { getPrompts } from '@/app/actions/prompts'
import { getTags } from '@/app/actions/tags'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'http://localhost:30001'

  // Get all prompts and tags
  const promptsResult = await getPrompts({ limit: 1000, isPublic: true })
  const tagsResult = await getTags()

  const prompts = promptsResult.prompts || []
  const tags = tagsResult.tags || []

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // Prompt pages
  const promptPages = prompts.map((prompt) => ({
    url: `${baseUrl}/prompts/${prompt.id}`,
    lastModified: new Date(prompt.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Tag pages (if you have tag-specific pages)
  const tagPages = tags.map((tag) => ({
    url: `${baseUrl}/tag/${tag.slug}`,
    lastModified: new Date(tag.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...promptPages, ...tagPages]
}